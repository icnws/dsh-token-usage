/**
 * Host half of the Token usage overview bundle.
 *
 * Registers two session-projection units:
 *
 * 1. `tokenUsageDaily` folds the durable, provider-reported token usage of every
 *    session into per-local-day buckets. The fold mirrors
 *    `@deepseek-ai/dsh-token-meter`'s `tokenUsage` unit event for event — the
 *    same settlement events, the same replacement semantics on
 *    `llm/retry-started` — so the per-day buckets sum to exactly the totals the
 *    Harness itself reports for a session; only the day attribution is added. A
 *    malformed usage sample is ignored rather than folded into NaN.
 *
 * 2. `tokenUsageByModel` attributes the same durable usage samples to the model
 *    that produced them. It tracks the active model from `request/context`
 *    events and attributes each assistant settlement to that model's per-day
 *    buckets. The wire view exposes exact all-time buckets plus the most recent
 *    400 day entries per model; the fold state itself is unbounded.
 *
 * The framework owns everything else: `ctx.sessionProjections` drives the fold
 * over committed events, checkpoints it into the persisted projection cache,
 * and serves the wire view to the Web client through the live control stream
 * and the `session.projections` read, so the browser never folds session
 * events itself. Unloading the plugin releases the registrations and with them
 * the keys, their live drives, and every served value.
 *
 * Scope: the only data touched is the token usage already recorded in the local
 * session logs. No configuration, tool, prompt section, storage, network
 * access, or session mutation is added.
 */

/** Services this half requires; without the projection registry the fiber stays pending. */
export const inject = ['sessionProjections']

/** The four disjoint provider-reported usage buckets, mirroring `TokenUsageProjection`. */
const BUCKET_KEYS = [
  'uncachedInputTokens',
  'outputTokens',
  'cacheReadTokens',
  'cacheWriteTokens',
]

/** Newest days the wire view publishes per session; the fold state itself is unbounded. */
const VIEW_DAY_LIMIT = 400

const zeroBuckets = () => ({
  uncachedInputTokens: 0,
  outputTokens: 0,
  cacheReadTokens: 0,
  cacheWriteTokens: 0,
})

const sameBuckets = (left, right) => BUCKET_KEYS.every((key) => left[key] === right[key])

const isCount = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0

/**
 * Normalize one provider usage sample into the four buckets, or `undefined`
 * when the sample is not provably well formed. Absent cache buckets read 0,
 * exactly like the token meter's own fold.
 */
function bucketsOf(sample) {
  if (!isCount(sample?.inputTokens) || !isCount(sample?.outputTokens)) return undefined
  if (sample.cacheReadTokens !== undefined && !isCount(sample.cacheReadTokens)) return undefined
  if (sample.cacheWriteTokens !== undefined && !isCount(sample.cacheWriteTokens)) return undefined
  return {
    uncachedInputTokens: sample.inputTokens,
    outputTokens: sample.outputTokens,
    cacheReadTokens: sample.cacheReadTokens ?? 0,
    cacheWriteTokens: sample.cacheWriteTokens ?? 0,
  }
}

/**
 * The usage one durable assistant settlement reports for its attempt, if any.
 * `assistant/message` carries the sample on the event itself; `assistant/attempt`
 * carries it as the last `usage` chunk of its compact raw stream.
 */
function usageOf(event) {
  if (event.type === 'assistant/message' && event.data?.usage !== undefined) return event.data.usage
  if (event.type !== 'assistant/message' && event.type !== 'assistant/attempt') return undefined
  const stream = event.data?.stream
  if (!Array.isArray(stream)) return undefined
  for (let index = stream.length - 1; index >= 0; index -= 1) {
    const record = stream[index]
    if (record?.type === 'chunk' && record.chunk?.type === 'usage') return record.chunk.usage
  }
  return undefined
}

/** Local calendar day of one event timestamp, in the Host machine's time zone. */
function dayKeyOf(time) {
  const date = new Date(time)
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** Add `buckets` into the day entry of a shallow-cloned day map. */
function addInto(days, day, buckets) {
  const current = days[day] ?? zeroBuckets()
  const next = zeroBuckets()
  for (const key of BUCKET_KEYS) next[key] = current[key] + buckets[key]
  days[day] = next
}

/** Remove `buckets` from the day entry of a shallow-cloned day map, dropping emptied days. */
function removeFrom(days, day, buckets) {
  const current = days[day]
  if (current === undefined) return
  const next = zeroBuckets()
  for (const key of BUCKET_KEYS) next[key] = current[key] - buckets[key]
  if (BUCKET_KEYS.every((key) => next[key] === 0)) delete days[day]
  else days[day] = next
}

/**
 * Pure transition. Every settlement is attributed to the local day of the event
 * that carried it; a replacement settlement for the same turn/step first
 * subtracts its predecessor from the day that recorded it, and a retried
 * attempt (signalled by `llm/retry-started` clearing the slot) adds instead of
 * replacing, matching the token meter's totals exactly.
 */
function applyDaily(state, event) {
  if (event.type === 'llm/retry-started') {
    return state.last !== null && state.last.turn === event.data.turn && state.last.step === event.data.step
      ? { ...state, last: null }
      : state
  }
  if (event.type !== 'assistant/message' && event.type !== 'assistant/attempt') return state
  const sample = usageOf(event)
  if (sample === undefined) return state
  const buckets = bucketsOf(sample)
  if (buckets === undefined) return state
  const { turn, step } = event.data
  const previous = state.last !== null && state.last.turn === turn && state.last.step === step
    ? state.last
    : undefined
  if (previous !== undefined && sameBuckets(previous.buckets, buckets)) return state
  const day = dayKeyOf(event.time)
  const days = { ...state.days }
  if (previous !== undefined) removeFrom(days, previous.day, previous.buckets)
  addInto(days, day, buckets)
  return { days, last: { turn, step, day, buckets } }
}

/**
 * Read-side projection: exact all-time buckets plus the most recent
 * {@link VIEW_DAY_LIMIT} day entries in ascending order. The client sums
 * `totals` for a session row and aggregates `days` for the daily view, so a
 * long history cannot grow the wire payload without bound.
 */
function viewOf(state) {
  const all = Object.keys(state.days).sort()
  const days = (all.length > VIEW_DAY_LIMIT ? all.slice(all.length - VIEW_DAY_LIMIT) : all)
    .map((day) => ({ day, ...state.days[day] }))
  const totals = zeroBuckets()
  for (const day of all) {
    const buckets = state.days[day]
    for (const key of BUCKET_KEYS) totals[key] += buckets[key]
  }
  return { totals, days }
}

/**
 * Minimal structural schema. The registry's only schema operations are `parse`
 * calls: the state schema validates a persisted checkpoint row before it seeds
 * a fold, and the view schema validates the wire payload before it leaves the
 * Host. Implementing `parse` directly keeps this bundle free of a schema
 * runtime dependency while preserving both guarantees.
 */
function schema(validate) {
  return {
    parse(value) {
      validate(value)
      return value
    },
  }
}

function assertBuckets(value, path) {
  if (value === null || typeof value !== 'object') {
    throw new Error(`token usage daily projection: ${path} must be an object`)
  }
  for (const key of BUCKET_KEYS) {
    if (!isCount(value[key])) {
      throw new Error(`token usage daily projection: ${path}.${key} must be a non-negative safe integer`)
    }
  }
}

const stateSchema = schema((value) => {
  if (value === null || typeof value !== 'object') {
    throw new Error('token usage daily projection: state must be an object')
  }
  const { days, last } = value
  if (days === null || typeof days !== 'object') {
    throw new Error('token usage daily projection: state.days must be an object')
  }
  for (const [day, buckets] of Object.entries(days)) {
    if (!/^\d{4}-\d{2}-\d{2}$/u.test(day)) {
      throw new Error(`token usage daily projection: state.days key "${day}" is not a calendar day`)
    }
    assertBuckets(buckets, `state.days["${day}"]`)
  }
  if (last !== null) {
    if (last === undefined || typeof last !== 'object') {
      throw new Error('token usage daily projection: state.last must be an object or null')
    }
    if (!isCount(last.turn) || !isCount(last.step) || typeof last.day !== 'string') {
      throw new Error('token usage daily projection: state.last carries an invalid settlement slot')
    }
    assertBuckets(last.buckets, 'state.last.buckets')
  }
})

const viewSchema = schema((value) => {
  if (value === null || typeof value !== 'object' || !Array.isArray(value.days)) {
    throw new Error('token usage daily projection: wire view must carry a days array')
  }
  assertBuckets(value.totals, 'wire view totals')
  for (const entry of value.days) {
    if (entry === null || typeof entry !== 'object' || typeof entry.day !== 'string') {
      throw new Error('token usage daily projection: wire view day entry is malformed')
    }
    assertBuckets(entry, `wire view days["${entry.day}"]`)
  }
})

/* ------------------------------------------------------------------ *
 * Model-aware projection
 * ------------------------------------------------------------------ */

const MODEL_KEY_SEPARATOR = ':'

function modelKeyOf(context) {
  const provider = typeof context?.provider === 'string' && context.provider.length > 0 ? context.provider : undefined
  const model = typeof context?.model === 'string' && context.model.length > 0 ? context.model : undefined
  if (provider && model) return `${provider}${MODEL_KEY_SEPARATOR}${model}`
  return undefined
}

function applyByModel(state, event) {
  if (event.type === 'llm/retry-started') {
    const last = state.last
    if (last !== null && last.turn === event.data.turn && last.step === event.data.step) {
      const models = { ...state.models }
      const entry = last.modelKey !== undefined ? models[last.modelKey] : undefined
      if (entry !== undefined) {
        const days = { ...entry.days }
        removeFrom(days, last.day, last.buckets)
        const nextTotals = zeroBuckets()
        for (const key of BUCKET_KEYS) nextTotals[key] = entry.totals[key] - last.buckets[key]
        const nextEntry = days[last.day] !== undefined
          ? { totals: nextTotals, days }
          : (Object.keys(days).length > 0 ? { totals: nextTotals, days } : undefined)
        if (nextEntry === undefined) delete models[last.modelKey]
        else models[last.modelKey] = nextEntry
        return { models, last: null }
      }
    }
    return { ...state, last: null }
  }

  if (event.type === 'request/context') {
    const modelKey = modelKeyOf(event.data)
    if (modelKey === undefined) return state
    const { turn, step } = event.data
    const previous = state.last !== null && state.last.turn === turn && state.last.step === step
      ? state.last
      : undefined
    const lastModelKey = previous?.modelKey
    const last = previous !== undefined && lastModelKey !== undefined && lastModelKey !== modelKey
      ? { turn, step, modelKey, day: previous.day, buckets: previous.buckets }
      : { turn, step, modelKey, day: null, buckets: null }
    return { ...state, last }
  }

  if (event.type !== 'assistant/message' && event.type !== 'assistant/attempt') return state
  const sample = usageOf(event)
  if (sample === undefined) return state
  const buckets = bucketsOf(sample)
  if (buckets === undefined) return state
  const { turn, step } = event.data
  const last = state.last
  const previous = last !== null && last.turn === turn && last.step === step && last.modelKey !== undefined
    ? last
    : undefined
  if (previous !== undefined && sameBuckets(previous.buckets, buckets)) return state
  const modelKey = previous?.modelKey ?? last?.modelKey
  if (modelKey === undefined) return state
  const day = dayKeyOf(event.time)
  const entry = state.models[modelKey] ?? { totals: zeroBuckets(), days: {} }
  const days = { ...entry.days }
  if (previous !== undefined && previous.day !== null) removeFrom(days, previous.day, previous.buckets)
  addInto(days, day, buckets)
  const totals = zeroBuckets()
  for (const key of BUCKET_KEYS) totals[key] = entry.totals[key] + buckets[key]
  const models = { ...state.models, [modelKey]: { totals, days } }
  return { models, last: { turn, step, day, modelKey, buckets } }
}

function viewOfModel(state) {
  const all = Object.entries(state.models)
    .map(([modelKey, entry]) => {
      const allDays = Object.keys(entry.days).sort()
      const days = (allDays.length > VIEW_DAY_LIMIT ? allDays.slice(allDays.length - VIEW_DAY_LIMIT) : allDays)
        .map((day) => ({ day, ...entry.days[day] }))
      return { modelKey, totals: entry.totals, days }
    })
    .sort((left, right) => {
      const leftTotal = left.totals.uncachedInputTokens + left.totals.outputTokens + left.totals.cacheReadTokens + left.totals.cacheWriteTokens
      const rightTotal = right.totals.uncachedInputTokens + right.totals.outputTokens + right.totals.cacheReadTokens + right.totals.cacheWriteTokens
      return rightTotal - leftTotal
    })
  return all
}

function assertModelBuckets(value, path) {
  if (value === null || typeof value !== 'object') {
    throw new Error(`token usage by model projection: ${path} must be an object`)
  }
  for (const key of BUCKET_KEYS) {
    if (!isCount(value[key])) {
      throw new Error(`token usage by model projection: ${path}.${key} must be a non-negative safe integer`)
    }
  }
}

const modelStateSchema = schema((value) => {
  if (value === null || typeof value !== 'object') {
    throw new Error('token usage by model projection: state must be an object')
  }
  const { models, last } = value
  if (models !== null && typeof models !== 'object') {
    throw new Error('token usage by model projection: state.models must be an object')
  }
  for (const [modelKey, entry] of Object.entries(models ?? {})) {
    if (typeof modelKey !== 'string' || modelKey.length === 0) {
      throw new Error(`token usage by model projection: state.models key must be a non-empty string`)
    }
    assertModelBuckets(entry.totals, `state.models["${modelKey}"].totals`)
    for (const [day, buckets] of Object.entries(entry.days)) {
      if (!/^\d{4}-\d{2}-\d{2}$/u.test(day)) {
        throw new Error(`token usage by model projection: state.models["${modelKey}"].days key "${day}" is not a calendar day`)
      }
      assertModelBuckets(buckets, `state.models["${modelKey}"].days["${day}"]`)
    }
  }
  if (last !== null) {
    if (last === undefined || typeof last !== 'object') {
      throw new Error('token usage by model projection: state.last must be an object or null')
    }
    if (typeof last.turn !== 'number' || typeof last.step !== 'number' || typeof last.modelKey !== 'string' || last.day !== null && typeof last.day !== 'string') {
      throw new Error('token usage by model projection: state.last carries an invalid settlement slot')
    }
    if (last.buckets !== null) assertModelBuckets(last.buckets, 'state.last.buckets')
  }
})

const modelViewSchema = schema((value) => {
  if (!Array.isArray(value)) {
    throw new Error('token usage by model projection: wire view must be an array')
  }
  for (const entry of value) {
    if (entry === null || typeof entry !== 'object' || typeof entry.modelKey !== 'string') {
      throw new Error('token usage by model projection: wire view entry is malformed')
    }
    assertModelBuckets(entry.totals, `wire view entry["${entry.modelKey}"].totals`)
    if (!Array.isArray(entry.days)) {
      throw new Error(`token usage by model projection: wire view entry["${entry.modelKey}"].days must be an array`)
    }
    for (const dayEntry of entry.days) {
      if (dayEntry === null || typeof dayEntry !== 'object' || typeof dayEntry.day !== 'string') {
        throw new Error('token usage by model projection: wire view day entry is malformed')
      }
      assertModelBuckets(dayEntry, `wire view entry["${entry.modelKey}"].days["${dayEntry.day}"]`)
    }
  }
})

/**
 * Activate the Host half: register the per-day and per-model token usage units.
 * The registrations are effects on this plugin's fiber, so unloading the plugin
 * removes the keys from live drives, restores, and client snapshots.
 */
export async function apply(ctx) {
  await ctx.sessionProjections.register({
    key: 'tokenUsageDaily',
    stateVersion: 1,
    stateSchema,
    init: () => ({ days: {}, last: null }),
    apply: applyDaily,
    // `summary: false` keeps the value off every Session-list row and out of
    // the list payload; the overview page reads it per session on demand and
    // receives live updates for attached Sessions through the control stream.
    wire: {
      viewSchema,
      view: viewOf,
      summary: false,
    },
  })

  await ctx.sessionProjections.register({
    key: 'tokenUsageByModel',
    stateVersion: 1,
    stateSchema: modelStateSchema,
    init: () => ({ models: {}, last: null }),
    apply: applyByModel,
    wire: {
      viewSchema: modelViewSchema,
      view: viewOfModel,
      summary: false,
    },
  })
}
