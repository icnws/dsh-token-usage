# Changelog

All notable changes to `dsh-token-usage` are recorded here.
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] — 2026-11-21

### Added
- **Model leaderboard** (`By model` tab): token usage aggregated per
  `provider:model`, with input / cache-read / cache-write / output buckets,
  total, share bar, and session count.
- **Session sorting**: sort the session table by total usage or by most recent
  activity.
- **Session search**: filter the session table by title or working directory.
- **Session pagination**: 20 rows per page, with page indicator and prev/next.
- **Time-range filter**: Today / Last 7 days / Last 14 days / Last 30 days /
  All time, applied to the summary stats, the daily trend, the model
  leaderboard, and the CSV export.
- **CSV export**: per-day rows for every session and every model.

### Changed
- The daily trend chart now follows the selected time range instead of being
  fixed at 14 days. `All time` draws the most recent 14 days.

### Fixed
- Range presets arrived as `'7d'` / `'14d'` / `'30d'` while the resolver read
  `Number(range)`, which is `NaN`; every preset except `Today` silently fell
  back to `All time`. The suffix is now stripped by `daySpanOf()` before the
  count is parsed, and the trend chart reuses the same helper.

## [0.1.0] — 2026-11-21

### Added
- Left-sidebar entry `Token usage` opening a global main-area page.
- Host projection `tokenUsageDaily` folding durable provider-reported usage into
  per-local-day buckets, mirroring `@deepseek-ai/dsh-token-meter`'s
  settlement semantics event for event.
- Host projection `tokenUsageByModel` attributing the same samples to the model
  recorded in `request/context`.
- Overview card: all-time total with bucket breakdown, today, last 7 days and
  the delta against the previous 7 days.
- Daily trend chart for the most recent 14 local days.
- Session table with each session's four usage buckets and total.
- Bilingual dictionaries (`zh`, `en`).
