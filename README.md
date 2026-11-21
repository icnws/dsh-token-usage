# dsh-token-usage

Token usage overview — a persistent left-sidebar entry that opens a global token usage overview page.

English | [中文](#中文说明)

## What it does

- Adds one entry to the left sidebar (`sidebar.panellist`, id `token-usage`) that opens a
  standalone main-area page (`main` slot, key `token-usage`). The page replaces the
  conversation area; the conversation stays reachable through the app's own navigation.
- The page shows:
  - **All-time total** with the input / cache-read / cache-write / output breakdown.
  - **Today**, **last 7 days** and the delta against the previous 7 days.
  - **Daily trend** for the last 14 local days.
  - **Per-session rows** with each session's four usage buckets and total, sorted by total.
  - **Model leaderboard** showing token usage aggregated by provider/model, with session counts.
- Data is always fresh: opening the panel re-pulls the Host session list and reads the
  per-day fold of every session that does not carry it yet; running sessions update live
  through the Session control stream.

## How it works

The Host half (`index.js`) registers two session-projection units:

1. `tokenUsageDaily` folds the durable, provider-reported token usage of every session into per-local-day
    buckets. The fold mirrors `@deepseek-ai/dsh-token-meter`'s `tokenUsage` unit event for
    event — the same settlement events, the same replacement semantics on
    `llm/retry-started` — so the per-day buckets sum to exactly the totals the Harness itself reports.

2. `tokenUsageByModel` attributes the same durable usage samples to the model that produced them.
    It tracks the active model from `request/context` events and attributes each assistant
    settlement to that model's per-day buckets.

The framework drives the fold over committed events, checkpoints it into the persisted projection
cache, and serves the wire view to the browser; the browser never folds session events itself.

The browser half (`client.js`) reads the session list store, requests the per-day fold per
session (sequentially, so a large corpus cannot flood the Host), and renders the page with
theme tokens only. Unloading the plugin removes the sidebar entry, the page, the projection
registration, and leaves the main column only while this plugin owns the selected panel.

## Scope

Read-only over one data source: the token usage already recorded in the local session logs.
No tools, prompt sections, configuration, storage, network access, or session mutation are
added, and no other plugin's UI is touched.

## Notes

- Day buckets use the Host machine's local calendar day.
- The wire view publishes exact all-time buckets plus the most recent 400 day entries per
  session; the fold state itself is unbounded.
- A session that has produced no usage is not listed. Sessions whose stored log needs
  migration contribute no row until a fuller read refolds them.

## Install

```sh
dsh plugin --profile <name> add <this-directory>
```

The bundle patch inserts one Host row (`…:host`); the browser half rides the package's
`dsh.client` manifest.

---

## 中文说明

- 在左侧边栏增加常驻入口「Token 用量」，点击后打开独立的主区域页面（不占用 Chat / Trajectory 标签页）。
- 页面展示：累计总量（输入 / 缓存读 / 缓存写 / 输出拆分）、今日、近 7 天及较前 7 天的变化、最近 14 天每日趋势、按合计排序的各会话用量明细、模型排行榜（按 token 合计排序，显示 provider/model 和会话数）。
- 数据保鲜：打开面板时重新拉取会话列表并逐会话读取按天汇总；运行中的会话通过控制流实时更新。
- Host 半场注册 `tokenUsageDaily` 和 `tokenUsageByModel` 两个会话投影单元，折叠语义与 DSH 自带的 `tokenUsage` 完全一致（仅增加按天归属和按模型归属），由框架驱动、缓存并下发；浏览器不做事件折叠。
- 仅只读使用本地会话日志中已记录的 token 用量，不新增工具、配置、存储、网络访问或任何会话写入。
