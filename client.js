window.__ModuleLoader__.load({
  id: 'dsh-token-usage',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    /** Locale namespace owned by this plugin. */
    const NS = 'tokenUsageOverview'
    /** The id shared by the sidebar entry and the main panel it opens. */
    const PANEL_ID = 'token-usage'
    /** Host projection keys registered by this package's Host half. */
    const DAILY_PROJECTION_KEY = 'tokenUsageDaily'
    const MODEL_PROJECTION_KEY = 'tokenUsageByModel'
    /** Rows per page in the session table. */
    const SESSIONS_PAGE_SIZE = 20
    /** Provider-reported usage buckets shared by every fold shape. */
    const BUCKET_KEYS = ['uncachedInputTokens', 'outputTokens', 'cacheReadTokens', 'cacheWriteTokens']

    const zh = {
      entry: 'Token 用量',
      'page.title': 'Token 用量总览',
      'page.subtitle': '自动汇总本机所有会话的 token 消耗；打开面板时重新读取，运行中的会话实时更新。',
      refresh: '刷新',
      'tabs.overview': '总览',
      'tabs.models': '模型排行',
      'tabs.sessions': '按会话',
      'card.overview': '总览',
      'stats.allTime': '累计总量',
      'stats.today': '今日',
      'stats.week': '近 7 天',
      'stats.prev': '较前 7 天',
      'stats.sessions': '有用量会话',
      'stats.models': '使用模型数',
      'trend.title': '每日趋势',
      'trend.caption': '按本机日期汇总',
      'trend.empty': '当前时间范围内没有用量',
      'trend.tip': '{day}：合计 {total} tokens',
      'models.title': '模型排行',
      'models.caption': '按 token 合计排序，共 {count} 个模型',
      'models.empty': '当前筛选条件下没有模型用量数据。',
      'col.model': '模型',
      'col.provider': 'Provider',
      'col.input': '输入',
      'col.cacheRead': '缓存读',
      'col.cacheWrite': '缓存写',
      'col.output': '输出',
      'col.total': '合计',
      'col.share': '占比',
      'col.sessions': '会话数',
      'sessions.title': '按会话',
      'sessions.caption': '按合计用量排序，共 {count} 个会话',
      'sessions.empty': '还没有会话产生 token 用量。',
      loading: '正在读取用量数据…',
      error: '读取会话列表失败，请重试。',
      'col.session': '会话',
      'col.input': '输入',
      'col.cacheRead': '缓存读',
      'col.cacheWrite': '缓存写',
      'col.output': '输出',
      'col.total': '合计',
      'col.recent': '最近活动',
      'sessions.sort.total': '按总消耗',
      'sessions.sort.recent': '按最近活动',
      'sessions.search': '搜索会话',
      'sessions.searchPlaceholder': '搜索会话标题或路径…',
      'sessions.page': '第 {page} 页，共 {total} 页',
      'sessions.prev': '上一页',
      'sessions.next': '下一页',
      'breakdown': '输入 {input} · 缓存读 {read} · 缓存写 {write} · 输出 {output}',
      'filter.title': '筛选',
      'filter.search': '搜索会话',
      'filter.searchPlaceholder': '输入会话标题或路径关键词…',
      'filter.range': '时间范围',
      'filter.range.today': '今日',
      'filter.range.7d': '近 7 天',
      'filter.range.14d': '近 14 天',
      'filter.range.30d': '近 30 天',
      'filter.range.all': '全部',
      'filter.range.custom': '自定义',
      'filter.customStart': '开始日期',
      'filter.customEnd': '结束日期',
      'filter.apply': '应用',
      'filter.reset': '重置',
      export: '导出 CSV',
      exportTitle: 'Token usage export',
      exportDate: 'Date',
      exportModel: 'Model',
      exportProvider: 'Provider',
      exportSession: 'Session',
      exportInput: 'Input',
      exportCacheRead: 'Cache read',
      exportCacheWrite: 'Cache write',
      exportOutput: 'Output',
      exportTotal: 'Total',
    }

    const en = {
      entry: 'Token usage',
      'page.title': 'Token usage overview',
      'page.subtitle': 'Token usage aggregated across every local session; re-read when the panel opens and live for running sessions.',
      refresh: 'Refresh',
      'tabs.overview': 'Overview',
      'tabs.models': 'By model',
      'tabs.sessions': 'By session',
      'card.overview': 'Overview',
      'stats.allTime': 'All-time total',
      'stats.today': 'Today',
      'stats.week': 'Last 7 days',
      'stats.prev': 'vs previous 7 days',
      'stats.sessions': 'Sessions with usage',
      'stats.models': 'Models used',
      'trend.title': 'Daily trend',
      'trend.caption': 'Grouped by local date',
      'trend.empty': 'No usage in the selected range',
      'trend.tip': '{day}: {total} tokens total',
      'models.title': 'Model leaderboard',
      'models.caption': 'Ranked by total token usage, {count} models',
      'models.empty': 'No model usage for the current filter.',
      'col.model': 'Model',
      'col.provider': 'Provider',
      'col.input': 'Input',
      'col.cacheRead': 'Cache read',
      'col.cacheWrite': 'Cache write',
      'col.output': 'Output',
      'col.total': 'Total',
      'col.share': 'Share',
      'col.sessions': 'Sessions',
      'sessions.title': 'By session',
      'sessions.caption': 'Sorted by total usage, {count} sessions',
      'sessions.empty': 'No session has used tokens yet.',
      loading: 'Reading usage data…',
      error: 'Failed to read the session list. Please retry.',
      'col.session': 'Session',
      'col.recent': 'Last active',
      'sessions.sort.total': 'Sort by total',
      'sessions.sort.recent': 'Sort by recent',
      'sessions.search': 'Search sessions',
      'sessions.searchPlaceholder': 'Search by session title or path…',
      'sessions.page': 'Page {page} of {total}',
      'sessions.prev': 'Previous',
      'sessions.next': 'Next',
      breakdown: 'Input {input} · Cache read {read} · Cache write {write} · Output {output}',
      'filter.title': 'Filters',
      'filter.search': 'Search sessions',
      'filter.searchPlaceholder': 'Search by session title or path…',
      'filter.range': 'Range',
      'filter.range.today': 'Today',
      'filter.range.7d': 'Last 7 days',
      'filter.range.14d': 'Last 14 days',
      'filter.range.30d': 'Last 30 days',
      'filter.range.all': 'All time',
      'filter.range.custom': 'Custom',
      'filter.customStart': 'Start date',
      'filter.customEnd': 'End date',
      'filter.apply': 'Apply',
      'filter.reset': 'Reset',
      export: 'Export CSV',
      exportTitle: 'Token usage export',
      'exportDate': 'Date',
      exportModel: 'Model',
      exportProvider: 'Provider',
      'exportSession': 'Session',
      exportInput: 'Input',
      'exportCacheRead': 'Cache read',
      'exportCacheWrite': 'Cache write',
      exportOutput: 'Output',
      exportTotal: 'Total',
    }

    /* ------------------------------------------------------------------ *
     * Value helpers
     * ------------------------------------------------------------------ */

    const isCount = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0

    const zeroTotals = () => ({
      uncachedInputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
    })

    const totalOf = (totals) => totals.uncachedInputTokens + totals.outputTokens
      + totals.cacheReadTokens + totals.cacheWriteTokens

    function addInto(target, buckets) {
      for (const key of BUCKET_KEYS) if (isCount(buckets?.[key])) target[key] += buckets[key]
    }

    /** The per-day fold value the Host serves for one session, or undefined. */
    function dailyOf(list, sessionId) {
      const values = list.projectionsBySession?.[sessionId]?.values
        ?? list.byId?.[sessionId]?.projectionValues
      const daily = values?.[DAILY_PROJECTION_KEY]
      if (daily === null || typeof daily !== 'object' || !Array.isArray(daily.days)) return undefined
      return daily
    }

    /** The per-model fold value the Host serves for one session, or undefined. */
    function modelsOf(list, sessionId) {
      const values = list.projectionsBySession?.[sessionId]?.values
        ?? list.byId?.[sessionId]?.projectionValues
      const byModel = values?.[MODEL_PROJECTION_KEY]
      if (!Array.isArray(byModel)) return undefined
      return byModel
    }

    function splitModelKey(modelKey) {
      if (typeof modelKey !== 'string') return { provider: '', model: modelKey ?? '' }
      const index = modelKey.indexOf(':')
      if (index === -1) return { provider: '', model: modelKey }
      return { provider: modelKey.slice(0, index), model: modelKey.slice(index + 1) }
    }

    /* ------------------------------------------------------------------ *
     * Filtering helpers
     * ------------------------------------------------------------------ */

    function dayKeyOfTime(time) {
      const date = new Date(time)
      const month = `${date.getMonth() + 1}`.padStart(2, '0')
      const day = `${date.getDate()}`.padStart(2, '0')
      return `${date.getFullYear()}-${month}-${day}`
    }

    function todayKey() {
      return dayKeyOfTime(Date.now())
    }

    function shiftDay(day, offset) {
      const [year, month, date] = day.split('-').map(Number)
      return new Date(Date.UTC(year, month - 1, date + offset)).toISOString().slice(0, 10)
    }

    const dayLabel = (day) => day.slice(5)

    /** Resolve a range preset into inclusive day bounds; null means unbounded. */
    function rangeBounds(range, today) {
      if (range === 'all') return { fromDay: null, toDay: null }
      if (range === 'today') return { fromDay: today, toDay: today }
      const days = daySpanOf(range)
      if (days === null) return { fromDay: null, toDay: null }
      return { fromDay: shiftDay(today, -(days - 1)), toDay: today }
    }

    /**
     * Day span of a `Nd` preset, or null for a preset that carries no span.
     * The presets arrive as `'7d'`/`'14d'`/`'30d'`, so `Number(range)` alone is
     * NaN; the suffix has to be stripped before the count is read.
     */
    function daySpanOf(range) {
      if (typeof range !== 'string' || !/^\d+d$/u.test(range)) return null
      const days = Number(range.slice(0, -1))
      return Number.isInteger(days) && days > 0 ? days : null
    }

    /** Keep the day entries inside the inclusive bounds; null means unbounded. */
    function filterDays(days, fromDay, toDay) {
      if (fromDay === null && toDay === null) return days
      return days.filter((entry) => (fromDay === null || entry.day >= fromDay)
        && (toDay === null || entry.day <= toDay))
    }

    /** Sum day entries into one bucket set. */
    function sumDays(days) {
      const totals = zeroTotals()
      for (const entry of days) addInto(totals, entry)
      return totals
    }

    /* ------------------------------------------------------------------ *
     * Aggregation models
     * ------------------------------------------------------------------ */

    function buildOverview(list, fromDay, toDay) {
      const rows = []
      const byDay = new Map()
      const allTime = zeroTotals()
      let withUsage = 0
      for (const sessionId of list.ids) {
        const daily = dailyOf(list, sessionId)
        if (daily === undefined) continue
        const filteredDays = filterDays(daily.days, fromDay, toDay)
        const totals = sumDays(filteredDays)
        if (totalOf(totals) === 0) continue
        withUsage += 1
        for (const entry of filteredDays) {
          const bucket = byDay.get(entry.day) ?? zeroTotals()
          addInto(bucket, entry)
          byDay.set(entry.day, bucket)
        }
        addInto(allTime, totals)
        const summary = list.byId[sessionId]
        rows.push({
          id: sessionId,
          title: summary?.displayTitle ?? sessionId,
          cwd: summary?.cwd,
          running: summary?.running === true,
          updatedAt: isCount(summary?.updatedAt) ? summary.updatedAt : 0,
          totals,
          days: filteredDays,
        })
      }
      rows.sort((left, right) => totalOf(right.totals) - totalOf(left.totals)
        || right.updatedAt - left.updatedAt)
      const days = [...byDay.entries()]
        .map(([day, totals]) => ({ day, ...totals }))
        .sort((left, right) => (left.day < right.day ? -1 : left.day > right.day ? 1 : 0))
      return { rows, days, allTime, withUsage, sessionCount: list.ids.length }
    }

    function buildModelLeaderboard(list, fromDay, toDay) {
      const byModel = new Map()
      for (const sessionId of list.ids) {
        const models = modelsOf(list, sessionId)
        if (!models) continue
        for (const entry of models) {
          if (!entry || !Array.isArray(entry.days)) continue
          const days = filterDays(entry.days, fromDay, toDay)
          if (days.length === 0) continue
          const current = byModel.get(entry.modelKey) ?? {
            modelKey: entry.modelKey,
            totals: zeroTotals(),
            days: [],
            sessionIds: new Set(),
          }
          addInto(current.totals, entry.totals)
          current.days.push(...days)
          current.sessionIds.add(sessionId)
          byModel.set(entry.modelKey, current)
        }
      }
      const results = [...byModel.values()]
        .map((item) => {
          const dayMap = new Map()
          for (const entry of item.days) {
            const bucket = dayMap.get(entry.day) ?? zeroTotals()
            addInto(bucket, entry)
            dayMap.set(entry.day, bucket)
          }
          const days = [...dayMap.entries()]
            .map(([day, totals]) => ({ day, ...totals }))
            .sort((left, right) => (left.day < right.day ? -1 : left.day > right.day ? 1 : 0))
          return { ...item, days, sessionCount: item.sessionIds.size }
        })
        .sort((left, right) => totalOf(right.totals) - totalOf(left.totals))
      return results
    }

    /* ------------------------------------------------------------------ *
     * Formatting helpers
     * ------------------------------------------------------------------ */

    function formatCount(value) {
      return value.toLocaleString()
    }

    function trim1(value) {
      const rounded = Math.round(value * 10) / 10
      return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
    }

    /** Compact figure for headline cells; exact values ride the tooltips. */
    function formatCompact(value) {
      if (value >= 1e7) return `${trim1(value / 1e6)}M`
      if (value >= 1e4) return `${trim1(value / 1e3)}K`
      return formatCount(value)
    }

    function formatDelta(previous, current) {
      if (previous <= 0) return null
      const percent = ((current - previous) / previous) * 100
      const rounded = Math.round(Math.abs(percent))
      if (rounded === 0) return { text: '0%', up: false }
      return { text: `${percent > 0 ? '+' : '−'}${rounded}%`, up: percent > 0 }
    }

    function formatActivity(time) {
      if (time <= 0) return '—'
      const date = new Date(time)
      const hours = `${date.getHours()}`.padStart(2, '0')
      const minutes = `${date.getMinutes()}`.padStart(2, '0')
      return dayKeyOfTime(time) === todayKey()
        ? `${hours}:${minutes}`
        : `${dayLabel(dayKeyOfTime(time))} ${hours}:${minutes}`
    }

    function formatShare(part, total) {
      if (total <= 0) return '0%'
      const percent = (part / total) * 100
      const rounded = Math.round(percent)
      return `${rounded}%`
    }

    function escapeCsv(value) {
      const text = String(value ?? '')
      if (text.includes('"') || text.includes(',') || text.includes('\n') || text.includes('\r')) {
        return `"${text.replace(/"/g, '""')}"`
      }
      return text
    }

    function downloadCsv(rows, filename, t) {
      const header = [
        t('exportDate'),
        t('exportModel'),
        t('exportProvider'),
        t('exportSession'),
        t('exportInput'),
        t('exportCacheRead'),
        t('exportCacheWrite'),
        t('exportOutput'),
        t('exportTotal'),
      ]
      const lines = [header.map(escapeCsv).join(',')]
      for (const row of rows) {
        const { provider, model } = splitModelKey(row.modelKey)
        lines.push([
          row.day,
          escapeCsv(model),
          escapeCsv(provider),
          escapeCsv(row.title),
          row.uncachedInputTokens,
          row.cacheReadTokens,
          row.cacheWriteTokens,
          row.outputTokens,
          row.total,
        ].join(','))
      }
      const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }

    /* ------------------------------------------------------------------ *
     * Styles — theme tokens only, plugin-prefixed classes
     * ------------------------------------------------------------------ */

    const CSS = `
.tuov-root{box-sizing:border-box;height:100%;min-width:0;display:flex;flex-direction:column;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-family,inherit);font-size:14px;line-height:20px}
.tuov-header{box-sizing:border-box;flex:none;border-bottom:.5px solid var(--dsw-alias-border-l3);padding:10px 28px 12px 20px;display:flex;flex-direction:column;gap:2px}
.tuov-titleRow{display:flex;align-items:center;gap:10px;min-height:30px;padding-inline-start:max(0px,calc(var(--dsh-frame-leading-clearance,0px) - 20px))}
.tuov-title{margin:0;font-size:18px;font-weight:500;line-height:26px;color:var(--dsw-alias-label-primary)}
.tuov-refresh{margin-left:auto;flex:none;width:28px;height:28px;border-radius:var(--dsw-radius-sm);border:none;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0}
@media (hover:hover){.tuov-refresh:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}}
.tuov-refresh:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
.tuov-subtitle{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}
.tuov-body{flex:1;min-height:0;overflow:hidden auto;display:flex;flex-direction:column;align-items:center;padding:24px 28px 48px}
.tuov-content{width:100%;max-width:960px;display:flex;flex-direction:column;gap:20px}
.tuov-card{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-module-platform);padding:16px 20px;display:flex;flex-direction:column;gap:14px}
.tuov-cardHead{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.tuov-cardTitle{margin:0;font-size:13px;font-weight:500;line-height:20px;color:var(--dsw-alias-label-secondary)}
.tuov-cardCaption{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}
.tuov-stats{display:flex;flex-wrap:wrap;gap:14px 36px}
.tuov-stat{display:flex;flex-direction:column;gap:2px;min-width:104px}
.tuov-statValue{font-size:22px;font-weight:500;line-height:28px;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary)}
.tuov-statLabel{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}
.tuov-statHint{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.tuov-trend{display:flex;align-items:flex-end;gap:6px}
.tuov-trendCol{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}
.tuov-trendTrack{height:96px;display:flex;align-items:flex-end}
.tuov-trendBar{width:100%;max-width:26px;margin:0 auto;border-radius:4px 4px 0 0;background:var(--dsw-alias-state-business-primary);opacity:.72;min-height:2px}
.tuov-trendCol[data-today="true"] .tuov-trendBar{opacity:1}
.tuov-trendLabel{font-size:10px;line-height:14px;text-align:center;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden}
.tuov-trendCol[data-today="true"] .tuov-trendLabel{color:var(--dsw-alias-label-secondary)}
.tuov-tableWrap{overflow-x:auto}
.tuov-table{width:100%;border-collapse:collapse;font-size:13px}
.tuov-th{text-align:right;font-weight:400;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);padding:6px 8px;border-bottom:.5px solid var(--dsw-alias-border-l2);white-space:nowrap}
.tuov-th:first-child{text-align:left}
.tuov-td{padding:8px;border-bottom:.5px solid var(--dsw-alias-border-l2);text-align:right;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.tuov-td:first-child{text-align:left}
.tuov-tr:last-child .tuov-td{border-bottom:none}
.tuov-sessionCell{display:flex;flex-direction:column;gap:1px;min-width:0;max-width:360px}
.tuov-sessionTitle{color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;align-items:center;gap:6px}
.tuov-sessionMeta{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tuov-running{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-business-primary);flex:none}
.tuov-total{color:var(--dsw-alias-label-primary);font-weight:500}
.tuov-note{display:flex;flex-direction:column;align-items:center;gap:8px;padding:56px 0;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
.tuov-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px}
.tuov-tabBar{display:flex;gap:2px;border-bottom:.5px solid var(--dsw-alias-border-l2)}
.tuov-tab{appearance:none;border:none;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;padding:8px 12px;font-size:13px;line-height:20px;border-radius:var(--dsw-radius-sm) var(--dsw-radius-sm) 0 0}
.tuov-tab[aria-selected="true"]{color:var(--dsw-alias-label-primary);font-weight:500;box-shadow:inset 0 -2px 0 var(--dsw-alias-state-business-primary)}
@media (hover:hover){.tuov-tab:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.tuov-tab:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
.tuov-input{border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);padding:6px 10px;font-size:13px;line-height:18px;min-width:220px}
.tuov-input:focus{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
.tuov-select{border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);padding:6px 10px;font-size:13px;line-height:18px}
.tuov-secondaryButton{appearance:none;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);padding:6px 12px;font-size:13px;line-height:18px;cursor:pointer}
@media (hover:hover){.tuov-secondaryButton:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.tuov-secondaryButton:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
.tuov-modelBarTrack{height:10px;border-radius:999px;background:var(--dsw-alias-bg-base);overflow:hidden;display:flex}
.tuov-modelBarFill{height:100%;background:var(--dsw-alias-state-business-primary);opacity:.75;min-width:2px}
.tuov-modelBarFill:nth-child(2n){background:var(--dsw-alias-state-business-success)}
.tuov-modelBarFill:nth-child(3n){background:var(--dsw-alias-state-business-warning)}
.tuov-modelBarFill:nth-child(4n){background:var(--dsw-alias-state-business-danger)}
.tuov-modelCell{min-width:0;max-width:420px}
.tuov-modelName{color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tuov-modelMeta{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tuov-share{font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.tuov-barCell{min-width:140px;max-width:260px}
.tuov-barHint{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:4px}
.tuov-badge{display:inline-flex;align-items:center;gap:6px;border:.5px solid var(--dsw-alias-border-l2);border-radius:999px;background:var(--dsw-alias-bg-module-platform);padding:2px 8px;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.tuov-badgeDot{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-business-primary)}
.tuov-sessionsToolbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px}
.tuov-pageInfo{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}
`

    /* ------------------------------------------------------------------ *
     * Icons (original artwork, currentColor so they follow the host theme)
     * ------------------------------------------------------------------ */

    function UsageIcon({ size }) {
      return h('svg', {
        viewBox: '0 0 20 20',
        width: size,
        height: size,
        'aria-hidden': true,
        style: { display: 'block' },
      },
      h('rect', {
        x: 2.25, y: 2.25, width: 15.5, height: 15.5, rx: 4,
        fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, opacity: 0.45,
      }),
      h('path', {
        d: 'M6.5 13.2V10M10 13.2V7.4M13.5 13.2V9',
        stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', fill: 'none',
      }))
    }

    function RefreshIcon({ size = 16 }) {
      return h('svg', {
        viewBox: '0 0 20 20',
        width: size,
        height: size,
        'aria-hidden': true,
        style: { display: 'block' },
      },
      h('path', {
        d: 'M16.2 10a6.2 6.2 0 1 1-1.9-4.5M16.4 3.6v3.1h-3.1',
        fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round',
      }))
    }

    function ExportIcon({ size = 16 }) {
      return h('svg', {
        viewBox: '0 0 20 20',
        width: size,
        height: size,
        'aria-hidden': true,
        style: { display: 'block' },
      },
      h('path', {
        d: 'M10 3v9m0 0L7 8m3 4l3-4M4 15h12',
        fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round',
      }))
    }

    /* ------------------------------------------------------------------ *
     * Page sections
     * ------------------------------------------------------------------ */

    function Stat({ label, value, hint }) {
      return h('div', { className: 'tuov-stat' },
        h('div', { className: 'tuov-statValue' }, value),
        h('div', { className: 'tuov-statLabel' }, label),
        hint === undefined ? null : h('div', { className: 'tuov-statHint' }, hint))
    }

    /** One column per local day in the selected range; `all` draws the last 14 days. */
    function trendColumns(buckets, range, today) {
      const days = daySpanOf(range)
      const span = days === null ? 14 : days
      const columns = []
      for (let index = span - 1; index >= 0; index -= 1) {
        const day = shiftDay(today, -index)
        const entry = buckets.find((item) => item.day === day)
        columns.push({ key: day, label: dayLabel(day), total: entry === undefined ? 0 : totalOf(entry), now: index === 0 })
      }
      return columns
    }

    function TrendChart({ buckets, range, today, t }) {
      const columns = trendColumns(buckets, range, today)
      const peak = columns.reduce((max, column) => Math.max(max, column.total), 0)
      return h('div', { className: 'tuov-trend' }, columns.map((column) => {
        const percent = peak === 0 ? 0 : Math.round((column.total / peak) * 100)
        return h('div', {
          key: column.key,
          className: 'tuov-trendCol',
          'data-today': column.now ? 'true' : undefined,
          title: t('trend.tip', { day: column.key, total: formatCount(column.total) }),
        },
        h('div', { className: 'tuov-trendTrack' },
          h('div', {
            className: 'tuov-trendBar',
            style: { height: `${percent === 0 ? 2 : Math.max(2, percent)}%` },
          })),
        h('div', { className: 'tuov-trendLabel' }, column.label))
      }))
    }

    function SummaryCard({ model, today, t }) {
      const week = sumDays(filterDays(model.days, shiftDay(today, -6), today))
      const previous = sumDays(filterDays(model.days, shiftDay(today, -13), shiftDay(today, -7)))
      const delta = formatDelta(totalOf(previous), totalOf(week))
      const todayEntry = model.days.find((entry) => entry.day === today)
      const todayTotals = todayEntry ?? zeroTotals()
      return h('section', { className: 'tuov-card' },
        h('div', { className: 'tuov-cardHead' },
          h('h2', { className: 'tuov-cardTitle' }, t('card.overview'))),
        h('div', { className: 'tuov-stats' },
          h(Stat, {
            label: t('stats.allTime'),
            value: formatCompact(totalOf(model.allTime)),
            hint: t('breakdown', {
              input: formatCount(model.allTime.uncachedInputTokens),
              read: formatCount(model.allTime.cacheReadTokens),
              write: formatCount(model.allTime.cacheWriteTokens),
              output: formatCount(model.allTime.outputTokens),
            }),
          }),
          h(Stat, { label: t('stats.today'), value: formatCompact(totalOf(todayTotals)) }),
          h(Stat, {
            label: t('stats.week'),
            value: formatCompact(totalOf(week)),
            hint: `${t('stats.prev')} ${delta === null ? '—' : delta.text}`,
          }),
          h(Stat, {
            label: t('stats.sessions'),
            value: `${model.withUsage} / ${model.sessionCount}`,
          })))
    }

    function TrendCard({ model, range, today, t }) {
      const buckets = model.days
      const hasData = buckets.length > 0
      return h('section', { className: 'tuov-card' },
        h('div', { className: 'tuov-cardHead' },
          h('h2', { className: 'tuov-cardTitle' }, t('trend.title')),
          h('span', { className: 'tuov-cardCaption' }, t('trend.caption'))),
        hasData
          ? h(TrendChart, { buckets, range, today, t })
          : h('div', { className: 'tuov-note' }, t('trend.empty')))
    }

    function ModelBar({ rows, total, t }) {
      if (total <= 0 || rows.length === 0) return null
      return h('div', { className: 'tuov-modelBarTrack' },
        rows.slice(0, 8).map((row) =>
          h('div', {
            key: row.modelKey,
            className: 'tuov-modelBarFill',
            style: { width: `${Math.max(1, (totalOf(row.totals) / total) * 100)}%` },
            title: `${row.modelKey}: ${formatCount(totalOf(row.totals))}`,
          })))
    }

    function ModelRow({ row, total, t }) {
      const { provider, model } = splitModelKey(row.modelKey)
      const totalTokens = totalOf(row.totals)
      const share = formatShare(totalTokens, total)
      return h('tr', { className: 'tuov-tr', key: row.modelKey },
        h('td', { className: 'tuov-td' },
          h('div', { className: 'tuov-modelCell' },
            h('div', { className: 'tuov-modelName', title: row.modelKey }, model || row.modelKey),
            provider ? h('div', { className: 'tuov-modelMeta' }, provider) : null)),
        h('td', { className: 'tuov-td' }, provider || '—'),
        h('td', { className: 'tuov-td', title: formatCount(row.totals.uncachedInputTokens) }, formatCompact(row.totals.uncachedInputTokens)),
        h('td', { className: 'tuov-td', title: formatCount(row.totals.cacheReadTokens) }, formatCompact(row.totals.cacheReadTokens)),
        h('td', { className: 'tuov-td', title: formatCount(row.totals.cacheWriteTokens) }, formatCompact(row.totals.cacheWriteTokens)),
        h('td', { className: 'tuov-td', title: formatCount(row.totals.outputTokens) }, formatCompact(row.totals.outputTokens)),
        h('td', { className: 'tuov-td tuov-total', title: formatCount(totalTokens) }, formatCompact(totalTokens)),
        h('td', { className: 'tuov-td' },
          h('span', { className: 'tuov-share' }, share),
          h('div', { className: 'tuov-barCell', title: share }, h(ModelBar, { rows: [row], total: totalTokens, t }))),
        h('td', { className: 'tuov-td' }, String(row.sessionCount)))
    }

    function ModelsCard({ models, total, t }) {
      return h('section', { className: 'tuov-card' },
        h('div', { className: 'tuov-cardHead' },
          h('h2', { className: 'tuov-cardTitle' }, t('models.title')),
          h('span', { className: 'tuov-cardCaption' }, t('models.caption', { count: models.length }))),
        models.length === 0
          ? h('div', { className: 'tuov-note' }, t('models.empty'))
          : h('div', { className: 'tuov-tableWrap' },
            h('table', { className: 'tuov-table' },
              h('thead', null, h('tr', null,
                h('th', { className: 'tuov-th', scope: 'col' }, t('col.model')),
                h('th', { className: 'tuov-th', scope: 'col' }, t('col.provider')),
                h('th', { className: 'tuov-th', scope: 'col' }, t('col.input')),
                h('th', { className: 'tuov-th', scope: 'col' }, t('col.cacheRead')),
                h('th', { className: 'tuov-th', scope: 'col' }, t('col.cacheWrite')),
                h('th', { className: 'tuov-th', scope: 'col' }, t('col.output')),
                h('th', { className: 'tuov-th', scope: 'col' }, t('col.total')),
                h('th', { className: 'tuov-th', scope: 'col' }, t('col.share')),
                h('th', { className: 'tuov-th', scope: 'col' }, t('col.sessions')))),
              h('tbody', null, models.map((row) => h(ModelRow, { row, total, t }))))))
    }

    function SessionTable({ rows, t }) {
      return h('div', { className: 'tuov-tableWrap' },
        h('table', { className: 'tuov-table' },
          h('thead', null, h('tr', null,
            h('th', { className: 'tuov-th', scope: 'col' }, t('col.session')),
            h('th', { className: 'tuov-th', scope: 'col' }, t('col.input')),
            h('th', { className: 'tuov-th', scope: 'col' }, t('col.cacheRead')),
            h('th', { className: 'tuov-th', scope: 'col' }, t('col.cacheWrite')),
            h('th', { className: 'tuov-th', scope: 'col' }, t('col.output')),
            h('th', { className: 'tuov-th', scope: 'col' }, t('col.total')),
            h('th', { className: 'tuov-th', scope: 'col' }, t('col.recent')))),
          h('tbody', null, rows.map((row) => h('tr', { className: 'tuov-tr', key: row.id },
            h('td', { className: 'tuov-td' },
              h('div', { className: 'tuov-sessionCell' },
                h('div', { className: 'tuov-sessionTitle', title: row.title },
                  row.running ? h('span', { className: 'tuov-running', 'aria-hidden': true }) : null,
                  h('span', null, row.title)),
                row.cwd === undefined || row.cwd === ''
                  ? null
                  : h('div', { className: 'tuov-sessionMeta', title: row.cwd }, row.cwd))),
            h('td', { className: 'tuov-td', title: formatCount(row.totals.uncachedInputTokens) }, formatCompact(row.totals.uncachedInputTokens)),
            h('td', { className: 'tuov-td', title: formatCount(row.totals.cacheReadTokens) }, formatCompact(row.totals.cacheReadTokens)),
            h('td', { className: 'tuov-td', title: formatCount(row.totals.cacheWriteTokens) }, formatCompact(row.totals.cacheWriteTokens)),
            h('td', { className: 'tuov-td', title: formatCount(row.totals.outputTokens) }, formatCompact(row.totals.outputTokens)),
            h('td', { className: 'tuov-td tuov-total', title: formatCount(totalOf(row.totals)) }, formatCompact(totalOf(row.totals))),
            h('td', { className: 'tuov-td' }, formatActivity(row.updatedAt)))))))
    }

    function SessionsCard({ model, search, onSearchChange, t }) {
      const [sort, setSort] = React.useState('total')
      const [page, setPage] = React.useState(0)
      const baseRows = React.useMemo(() => {
        const rows = model.rows.slice()
        if (sort === 'recent') rows.sort((left, right) => right.updatedAt - left.updatedAt || totalOf(right.totals) - totalOf(left.totals))
        else rows.sort((left, right) => totalOf(right.totals) - totalOf(left.totals) || right.updatedAt - left.updatedAt)
        return rows
      }, [model.rows, sort])
      const filteredRows = React.useMemo(() => {
        if (!search) return baseRows
        const query = search.toLowerCase()
        return baseRows.filter((row) => `${row.title ?? ''} ${row.cwd ?? ''}`.toLowerCase().includes(query))
      }, [baseRows, search])
      const pageCount = Math.max(1, Math.ceil(filteredRows.length / SESSIONS_PAGE_SIZE))
      const safePage = Math.min(page, pageCount - 1)
      const pageRows = filteredRows.slice(safePage * SESSIONS_PAGE_SIZE, (safePage + 1) * SESSIONS_PAGE_SIZE)
      React.useEffect(() => { setPage(0) }, [search, sort])

      return h('section', { className: 'tuov-card' },
        h('div', { className: 'tuov-cardHead' },
          h('h2', { className: 'tuov-cardTitle' }, t('sessions.title')),
          h('span', { className: 'tuov-cardCaption' }, t('sessions.caption', { count: model.withUsage }))),
        h('div', { className: 'tuov-sessionsToolbar' },
          h('input', {
            className: 'tuov-input',
            type: 'search',
            placeholder: t('sessions.searchPlaceholder'),
            value: search,
            onChange: (event) => onSearchChange(event.target.value),
          }),
          h('select', {
            className: 'tuov-select',
            value: sort,
            onChange: (event) => setSort(event.target.value),
            'aria-label': t('sessions.sort.total'),
          }, [
            { value: 'total', label: t('sessions.sort.total') },
            { value: 'recent', label: t('sessions.sort.recent') },
          ].map((item) => h('option', { key: item.value, value: item.value }, item.label)))),
        h(SessionTable, { rows: pageRows, t }),
        h('div', { className: 'tuov-toolbar', style: { justifyContent: 'flex-end' } },
          h('span', { className: 'tuov-pageInfo' }, t('sessions.page', { page: safePage + 1, total: pageCount })),
          h('button', {
            type: 'button',
            className: 'tuov-secondaryButton',
            disabled: safePage === 0,
            onClick: () => setPage((current) => Math.max(0, current - 1)),
          }, t('sessions.prev')),
          h('button', {
            type: 'button',
            className: 'tuov-secondaryButton',
            disabled: safePage + 1 >= pageCount,
            onClick: () => setPage((current) => Math.min(pageCount - 1, current + 1)),
          }, t('sessions.next'))))
    }

    function FilterToolbar({ range, onRangeChange, onReset, onExport, t }) {
      return h('div', { className: 'tuov-toolbar' },
        h('select', {
          className: 'tuov-select',
          value: range,
          onChange: (event) => onRangeChange(event.target.value),
          'aria-label': t('filter.range'),
        }, ['today', '7d', '14d', '30d', 'all'].map((value) =>
          h('option', { key: value, value }, t(`filter.range.${value}`)))),
        h('button', { type: 'button', className: 'tuov-secondaryButton', onClick: onReset }, t('filter.reset')),
        h('button', { type: 'button', className: 'tuov-secondaryButton', onClick: onExport }, t('export')))
    }

    /* ------------------------------------------------------------------ *
     * Page
     * ------------------------------------------------------------------ */

    function UsagePage(props) {
      const { t, useSessions, refresh, refreshProjections } = props
      const list = useSessions((snapshot) => snapshot)
      const [tab, setTab] = React.useState('overview')
      const [range, setRange] = React.useState('all')
      const [search, setSearch] = React.useState('')
      const today = React.useMemo(() => todayKey(), [])
      const bounds = React.useMemo(() => rangeBounds(range, today), [range, today])
      const model = React.useMemo(
        () => buildOverview(list, bounds.fromDay, bounds.toDay),
        [list, bounds],
      )
      const models = React.useMemo(
        () => buildModelLeaderboard(list, bounds.fromDay, bounds.toDay),
        [list, bounds],
      )
      const actions = React.useRef({ refresh, refreshProjections })
      actions.current = { refresh, refreshProjections }

      React.useEffect(() => {
        void actions.current.refresh()
      }, [])

      // Read the per-day and per-hour folds of every session that does not carry
      // them yet, sequentially so a large corpus cannot flood the Host.
      React.useEffect(() => {
        let cancelled = false
        const queue = list.ids.filter((sessionId) => dailyOf(list, sessionId) === undefined)
        const pump = async () => {
          for (const sessionId of queue) {
            if (cancelled) return
            try {
              await actions.current.refreshProjections(sessionId)
            } catch {
              // The row simply stays absent; the next list change retries it.
            }
          }
        }
        void pump()
        return () => { cancelled = true }
      }, [list])

      const loading = list.phase === 'pending'
      const failed = list.state === 'error' && model.rows.length === 0 && models.length === 0

      return h(React.Fragment, null,
        h('style', null, CSS),
        h('div', { className: 'tuov-root' },
          h('header', { className: 'tuov-header' },
            h('div', { className: 'tuov-titleRow' },
              h('h1', { className: 'tuov-title' }, t('page.title')),
              h('button', {
                type: 'button',
                className: 'tuov-refresh',
                title: t('refresh'),
                'aria-label': t('refresh'),
                onClick: () => { void actions.current.refresh() },
              }, h(RefreshIcon, null))),
            h('p', { className: 'tuov-subtitle' }, t('page.subtitle'))),
          h('div', { className: 'tuov-body' },
            h('div', { className: 'tuov-content' },
              h('div', { className: 'tuov-tabBar', role: 'tablist' },
                ['overview', 'models', 'sessions'].map((value) =>
                  h('button', {
                    key: value,
                    id: `tuov-tab-${value}`,
                    role: 'tab',
                    className: 'tuov-tab',
                    'aria-selected': tab === value ? 'true' : 'false',
                    'aria-controls': `tuov-panel-${value}`,
                    onClick: () => setTab(value),
                  }, t(`tabs.${value}`)))),
              h(FilterToolbar, {
                range,
                onRangeChange: setRange,
                onReset: () => { setRange('all'); setSearch('') },
                onExport: () => {
                  const date = new Date().toISOString().slice(0, 10)
                  const filename = `token-usage-${date}.csv`
                  const rows = []
                  for (const session of model.rows) {
                    const daily = dailyOf(list, session.id)
                    if (!daily) continue
                    for (const entry of daily.days) {
                      rows.push({
                        day: entry.day,
                        title: session.title,
                        modelKey: null,
                        ...splitModelKey(null),
                        totals: entry,
                        total: totalOf(entry),
                      })
                    }
                  }
                  for (const modelRow of models) {
                    const { provider, model: modelName } = splitModelKey(modelRow.modelKey)
                    for (const entry of modelRow.days) {
                      rows.push({
                        day: entry.day,
                        title: '',
                        modelKey: modelRow.modelKey,
                        provider,
                        model: modelName,
                        totals: entry,
                        total: totalOf(entry),
                      })
                    }
                  }
                  rows.sort((a, b) => a.day.localeCompare(b.day) || (b.total - a.total))
                  downloadCsv(rows, filename, t)
                },
                t,
              }),
              loading && model.rows.length === 0 && models.length === 0
                ? h('div', { className: 'tuov-note' }, t('loading'))
                : null,
              failed ? h('div', { className: 'tuov-note' }, t('error')) : null,
              !loading && !failed && model.rows.length === 0 && models.length === 0
                ? h('div', { className: 'tuov-note' }, t('sessions.empty'))
                : null,
              tab === 'overview' && model.rows.length > 0 ? h(SummaryCard, { model, today, t }) : null,
              tab === 'overview' && model.days.length > 0
                ? h(TrendCard, { model, range, today, t })
                : null,
              tab === 'models' && models.length > 0
                ? h(ModelsCard, { models, total: totalOf(model.allTime), t })
                : tab === 'models' ? h('div', { className: 'tuov-note' }, t('models.empty')) : null,
              tab === 'sessions'
                ? h(SessionsCard, { model, search, onSearchChange: setSearch, t })
                : null))))
    }

    /* ------------------------------------------------------------------ *
     * Plugin
     * ------------------------------------------------------------------ */

    /** Services required by the page, the launcher, and the session reads. */
    const inject = ['slots', 'locale', 'layout', 'sessions']

    /**
     * Contribute the left-sidebar entry and the global main-area page it opens.
     * Both registrations are released on unload; the page leaves the main
     * column only while this plugin owns the selected panel.
     */
    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'token-usage-overview: dictionaries')
      const t = ctx.locale.bind(NS)
      const disposePanel = ctx.slots.inject('main', function* () {
        yield ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
          locale: NS,
          inject: () => ({
            t,
            refresh: () => ctx.sessions.refresh(),
            refreshProjections: (sessionId) => ctx.sessions.refreshProjections(sessionId),
          }),
        }, (props) => h(UsagePage, { ...props, t }))
        // Leave the panel only when this plugin owns the current selection;
        // a different selected page is never reset.
        yield () => {
          if (ctx.layout.panelInfo.getSnapshot().activePanelId === PANEL_ID) {
            ctx.layout.selectPanel(null)
          }
        }
      })
      const disposeEntry = ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 20,
        locale: NS,
        label: () => t('entry'),
      }, UsageIcon))
      ctx.effect(() => () => {
        disposePanel()
        disposeEntry()
      }, 'token-usage-overview: registrations')
    }

    return { inject, apply }
  },
})
