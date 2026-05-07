# GoatOS Documentation — v0.1.0

_Last updated: Thursday, 7 May 2026_

## Architecture

GoatOS is a three-module operating system for managing Albs' work as Chief of Staff at Hampr. It runs as a single-page web application served via OpenClaw's canvas, backed by a local Node.js API.

## Modules

### Ops
The operational command centre. Amber/neon colour theme.

**Tabs:**
- **Dashboard** — High-level overview cards for Mission Control, Sessions, and Cron Health
- **Mission Control** — Multi-model status (Claude Opus 4.6, Kimi K2.6, Codex 5.3), active session list with clickable history overlay, cron jobs table
- **Cron Health** — Detailed cron job monitoring (placeholder, data flows from Mission Control)

### Brain
Intelligence and memory centre. Sky blue colour theme.

**Tabs:**
- **Dashboard** — Preview cards for Daily Briefs and OS Docs
- **Daily Briefs** — Left sidebar with date history, right panel with markdown-rendered brief. Auto-generated every morning via cron.
- **OS Docs** — This documentation. Updated nightly at midnight.

### Lab
Prototype and self-improvement workspace. Matrix green colour theme. Think Dexter's Lab.

**Tabs:**
- **Dashboard** — Preview cards for Prototypes, Overnight Builds, Build Logs, Self-Improvement
- **Prototypes** — Registry of active prototypes with detail overlay (3/4 screen)
- **Overnight Builds** — Log of cron-driven overnight build runs
- **Build Logs** — Left sidebar list + right detail view of all build sessions with files created/modified, decisions made
- **Self-Improvement** — Prioritised backlog of planned improvements feeding into overnight builds

## Tech Stack

- **Frontend:** Single HTML file, Tailwind CSS (CDN), Lucide icons, Ubuntu + Ubuntu Mono fonts
- **API:** Node.js (api.mjs) on port 8766, serves session/cron/brief/lab data from flat JSON + markdown files
- **Deploy:** File watcher (inotifywait) auto-copies to OpenClaw canvas on save; browser polls for hot-reload
- **Storage:** Flat JSON files + markdown. SQLite planned when data volume warrants it.

## Design System

- **Background:** #0a0a0a (near-black)
- **Glass panels:** rgba(255,255,255,0.04) with 20px blur
- **No emojis** — Lucide icons only
- **Fonts:** Ubuntu (UI), Ubuntu Mono (data/code)
- **Module colours:** Ops amber (#f59e0b), Brain sky blue (#38bdf8), Lab green (#22c55e)
- **Neon effects** on active icons, tabs, titles per module
- **macOS-style scrollbars** throughout
- **Clock:** AEST (Australia/Sydney)

## Cron Jobs

| Job | Schedule (AEST) | Purpose |
|-----|----------------|---------|
| Rolling OS Docs | 12:00 AM | Analyse daily changes, update this documentation |
| Repo Backup | 2:00 AM | Push workspace to private Git repo (secrets excluded) |
| Bug Check | 2:15 AM | Scan codebase for bugs, fix, and log |
| Self-Improvement | 3:00 AM | Audit one module, build one improvement |
| Daily Brief | 6:30 AM | Morning summary with priorities, overnight report, AI Pulse |
