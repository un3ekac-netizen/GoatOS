# GoatOS Documentation — v0.2.0

_Last updated: Sunday, 17 May 2026_

---

## What Is GoatOS?

GoatOS is an operating system for Albs' work. Not an OS in the traditional sense — it doesn't boot a computer. It boots his day. It's a single-page web application that serves as mission control for everything Albs does as Chief of Staff at Hampr: his projects, his agents, his automations, his memory, and his pipeline.

The name is a play on "Greatest of All Time" (G.O.A.T.) — the aspiration for both the system and the assistant running it.

---

## Architecture

GoatOS follows a **four-module architecture** with a local Node.js API backend and a single HTML frontend. Everything is file-based (JSON + markdown) with no database yet — SQLite is planned when data volume justifies it.

```
┌─────────────────────────────────────────┐
│           GoatOS Frontend               │
│      (Single HTML file, Canvas)         │
├─────────────────────────────────────────┤
│           GoatOS API (api.mjs)          │
│         Port 8766, Node.js HTTP         │
├─────────────────────────────────────────┤
│  Flat Files: JSON + Markdown Storage    │
│  (Ops, Brain, Lab, Projects data)       │
└─────────────────────────────────────────┘
```

### Module Overview

| Module | Colour | Purpose | Icon |
|--------|--------|---------|------|
| **Ops** | Amber (#f59e0b) | Operational command centre — models, sessions, cron health, org chart | `cpu` |
| **Brain** | Sky blue (#38bdf8) | Intelligence & memory — daily briefs, automations, OS docs | `brain` |
| **Projects** | Violet (#a78bfa) | Project management — pipeline kanban, deliverables, Jira sync | `folder-kanban` |
| **Lab** | Matrix green (#22c55e) | Prototyping & self-improvement — builds, logs, ideas backlog | `flask-conical` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Single HTML file, Tailwind CSS (CDN), Lucide icons, vanilla JS |
| **Fonts** | Ubuntu (UI), Ubuntu Mono (code/data) |
| **API** | Node.js native `http` module (`api.mjs`), port 8766 |
| **Deploy** | File watcher (`watch.sh` + `inotifywait`) auto-copies to OpenClaw canvas on save |
| **Hot Reload** | Browser polls for `Last-Modified` header changes every 1.5s |
| **Storage** | Flat JSON files + markdown. SQLite planned. |
| **Clock** | AEST (Australia/Sydney) throughout |

---

## Design System

- **Background:** `#0a0a0a` (near-black)
- **Glass panels:** `rgba(255,255,255,0.04)` with 20px blur + 180% saturate
- **Borders:** `rgba(255,255,255,0.08)`
- **No emojis** — Lucide icons only
- **Neon text effects** on active module titles and icons
- **macOS-style scrollbars** throughout (thin, rounded, semi-transparent)
- **Module colour coding:** Ops amber, Brain sky blue, Lab green, Projects violet
- **Theme picker:** 5 themes (Midnight, Sunset Fade, Aurora, Sakura, Arctic) with persistent `localStorage`

---

## Modules (Detailed)

### Ops — The Operational Command Centre

**Colour:** Amber/neon (`#f59e0b`)

#### Dashboard
Three summary cards:
- **Models** — Claude Opus 4.6, Kimi K2.6, Codex 5.3 status with active indicator
- **Active Sessions** — Live sessions from the last 10 minutes, clickable for full history overlay
- **Cron Health** — Total/enabled/disabled job counts

#### Mission Control
- **Multi-model status grid** — Provider, ID, thinking level, online/offline status
- **Active Sessions list** — Full session preview, model, message count, channel. Click to open conversation history overlay
- **Cron Jobs table** — All jobs with schedule, status toggle dropdown, next run time

#### Org Chart
Visual hierarchy of the GoatOS agent team:
- **Tier 0:** Albs (human, Chief of Staff)
- **Tier 1:** Goat (executive assistant, active)
- **Tier 2:** 4 direct-report agents (planned):
  - **Castle** — Chief Strategy Officer (operational tasks, Jira, comms)
  - **Forge** — Chief Technology Officer (code, builds, QA)
  - **Echo** — Chief Intelligence Officer (research, analysis, AI Pulse)
  - **Vector** — Chief Marketing Officer (design, copy, SEO, visuals)
- **Tier 3:** Sub-agents under each direct report (dashed borders, purple glow)
- **Animated pulse connectors** between tiers

#### Cron Health
- **Summary bar:** Total / Enabled / Disabled counts
- **Detailed table:** Status dot, name, schedule, next run, last run, target session

---

### Brain — Intelligence & Memory

**Colour:** Sky blue (`#38bdf8`)

#### Dashboard
Preview cards for each Brain tab with live data snippets.

#### Daily Briefs
- **Left sidebar:** Date history with day-of-week icons
- **Right panel:** Markdown-rendered brief content
- **Auto-generated** every morning at 6:30 AM AEST via cron
- Briefs stored in `/brain/daily-briefs/YYYY-MM-DD.md`

#### Automations
- **Per-cron-job cards** with status dot, name, schedule, next/last run, target
- **Collapsible prompt definition** — View the full cron job message payload
- **Live health indicators** — Green "all healthy" or red "X jobs failing"

#### OS Docs
- **This documentation** — Rendered from `/brain/os-docs/latest.md`
- **Updated nightly** at midnight AEST by the Rolling OS Docs cron job
- Lightweight markdown renderer (headings, bold, italic, code, lists, paragraphs)

---

### Projects — Project Management

**Colour:** Violet (`#a78bfa`)

#### Dashboard
- **Deliverable cards** — Progress bars, SLA countdowns, status badges
- **Agent Workload** — Active task counts per assignee with avatar
- **Blocked Tasks** — Red-flagged items with blocker count
- **Upcoming SLAs** — 7-day horizon with colour-coded urgency
- **Jira Sync button** — One-click sync from Jira with toast notifications

#### Pipeline (Kanban)
- **5 columns:** New → In Progress → Pending → Albs Approval → Done
- **Drag-and-drop** cards between stages (PATCH `/api/tasks/<id>/move`)
- **Card details:** Title, task type, delegated badge, assignee avatar, due date, blockers, priority, client
- **Priority borders:** Critical (red), High (amber), Medium (blue), Low (grey)
- **Stage badges:** New, In Progress, Pending, Albs Approval, Done

#### Deliverables
- **Linked task tracking** — Each deliverable shows its associated tasks and completion %
- **Status badges:** On Track, At Risk, Overdue, Delivered
- **Click to open detail overlay** with full history

---

### Lab — Prototype & Self-Improvement Workspace

**Colour:** Matrix green (`#22c55e`). Think Dexter's Lab.

#### Dashboard
Preview cards for:
- **Prototypes** — Top 3 active prototypes with status
- **Overnight Builds** — Latest run date, total count
- **Build Logs** — Latest log status + total count
- **Self-Improvement** — Top 3 ideas with stage

#### Prototypes
- **Grid of prototype cards** — Name, status badge, description, port, last updated
- **Click to open detail overlay** (75% width, 80% height) with status, description, metadata grid, file path, entry point
- **Live preview placeholder** — Reserved for future iframe routing

#### Overnight Builds
- **Table view:** Date, job name, status (success/failed), duration, summary
- **Empty state:** Moon icon with "No overnight builds yet"

#### Build Logs
- **Left sidebar (20%):** Build list with status dot, name, date
- **Right detail (75%):** Build name, status badge, timestamp, summary, structured sections with file paths highlighted
- **Click sidebar item** to load detail view

#### Self-Improvement
- **Prioritised backlog** of planned improvements
- **Stage icons:** Planned (dashed circle), In Progress (spinner), Complete (checkmark)
- **Priority labels:** High (amber), Medium (white), Low (grey)
- **Feeds into overnight builds**

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sessions` | GET | List all active sessions with metadata |
| `/api/sessions/:id/history` | GET | Full conversation history for a session |
| `/api/briefs` | GET | List all daily briefs |
| `/api/briefs/:date` | GET | Get specific brief content |
| `/api/os-docs` | GET | Get OS documentation content |
| `/api/prototypes` | GET | List all prototypes |
| `/api/overnight-builds` | GET | List overnight build runs |
| `/api/build-logs` | GET | List build logs |
| `/api/ideas` | GET | List self-improvement ideas |
| `/api/cron` | GET | List all cron jobs with state |
| `/api/cron/:id/toggle` | PATCH | Enable/disable a cron job |
| `/api/tasks` | GET/POST | List or create tasks |
| `/api/tasks/:id/move` | PATCH | Move task to new kanban stage |
| `/api/tasks/:id/deliverables` | GET | List deliverable files for a task |
| `/api/tasks/:id/download/:file` | GET | Download a deliverable file |
| `/api/deliverables` | GET | List all deliverables |
| `/api/delegation-queue` | GET | View pending delegation queue |
| `/api/jira/sync` | POST | Trigger Jira sync |
| `/api/delegate` | POST | Trigger task delegation to agents |
| `/api/status` | GET | OpenClaw gateway status |

---

## Cron Jobs

| Job | Schedule (AEST) | Status | Purpose |
|-----|----------------|--------|---------|
| **Rolling OS Docs** | 12:00 AM | ✅ Enabled | Analyse daily changes, update this documentation |
| **Repo Backup** | 2:00 AM | ✅ Enabled | Push workspace to private Git repo (secrets excluded) |
| **Bug Check** | 2:15 AM | ✅ Enabled | Scan codebase for bugs, fix, and log |
| **Overnight Self-Improvement** | 3:00 AM | ⏸️ Disabled | Audit one module, build one improvement |
| **Daily Brief** | 6:30 AM | ✅ Enabled | Morning summary with priorities, overnight report, AI Pulse |
| **Jira Sync** | Every 15 min, 7AM–8PM, Mon–Fri | ⏸️ Disabled | Sync Jira board to GoatOS pipeline |

---

## File Structure

```
/home/ubuntu/projects/goat-os/
├── index.html                    # Main OS UI (single-page app)
├── api.mjs                       # Node.js API server (port 8766)
├── watch.sh                      # File watcher for auto-deploy
├── DESIGN.md                     # Design system documentation
│
├── ops/
│   ├── tasks.json                # Pipeline tasks (kanban data)
│   ├── deliverables.json         # Deliverables registry
│   ├── jira-sync.mjs             # Jira integration module
│   ├── delegate.mjs              # Task delegation engine
│   ├── delegation-queue.json     # Pending delegation queue
│   └── deliverables/             # Task output files
│
├── brain/
│   ├── os-docs/
│   │   └── latest.md             # This documentation
│   └── daily-briefs/
│       ├── 2026-05-07.md         # First daily brief
│       └── 2026-05-08.md         # Second daily brief
│
├── lab/
│   ├── PURPOSE.md                # Lab module vision
│   ├── prototypes/
│   │   └── manifest.json         # Prototype registry
│   ├── overnight-builds/
│   │   └── builds.json           # Build run log
│   ├── build-logs/
│   │   └── logs.json             # Detailed build logs
│   └── self-improvement/
│       └── ideas.json            # Improvement backlog
│
└── (root workspace files)
    ├── AGENTS.md                 # Agent workspace rules
    ├── SOUL.md                   # Goat's personality & vibe
    ├── IDENTITY.md               # Goat's identity & role
    ├── USER.md                   # Albs' profile & preferences
    ├── MEMORY.md                 # Long-term curated memory
    ├── TOOLS.md                  # Environment-specific notes
    └── BOOTSTRAP.md              # First-run instructions (delete after use)
```

---

## Agent Hierarchy (Planned)

GoatOS is designed around a **project-based agent hierarchy**:

```
Albs (Human)
  └── Goat (Executive Assistant) — YOU ARE HERE
      ├── Castle — Chief Strategy Officer
      │   ├── Jira Bot
      │   └── Comms Bot
      ├── Forge — Chief Technology Officer
      │   ├── Frontend Agent
      │   ├── Backend Agent
      │   └── QA Agent
      ├── Echo — Chief Intelligence Officer
      │   ├── News Scanner
      │   └── Report Writer
      └── Vector — Chief Marketing Officer
          ├── Product Designer
          ├── Copy & SEO Agent
          └── Graphic Designer
```

Each direct report handles a domain. Each has sub-agents for specialised work. Goat orchestrates. Albs approves.

---

## Self-Improvement Backlog

| Idea | Stage | Priority |
|------|-------|----------|
| Jira Board Integration | Planned | High |
| Multi-Agent Hierarchy | Planned | High |
| Daily Brief Cron Job | ✅ Complete | High |
| Cron Health Visualisation | ✅ Complete | High |

---

## Recent Changes (Build History)

### Build: GoatOS Foundation (2026-05-07)
- Initial three-module architecture (Ops, Brain, Lab)
- macOS-style dock with glass-morphic hover effects
- Mission Control with multi-model view and session overlays
- Daily Briefs with sidebar history and markdown renderer
- Local API server (api.mjs) on port 8766
- File watcher for auto-deploy
- Hot-reload polling in browser

### Build: Cron Health Visualisation (2026-05-07)
- Per-job health computation across all modules
- Colour-coded status dots (green/red/amber)
- Ops Dashboard Cron Health card with counts
- Brain Dashboard automation health indicators
- Build Log detail viewer with status badges

### Post-Build: Projects Module & Jira Integration (2026-05-08)
- **Projects module added** — Fourth module with violet theme
- **Pipeline kanban** — Drag-and-drop task management with 5 stages
- **Jira sync** — One-click sync with toast notifications
- **Task delegation** — Automatic assignment to sub-agents
- **Deliverables tracking** — Progress bars, SLA countdowns, linked tasks
- **Task/deliverable detail overlays** — Full metadata, status history, blockers, download links
- **Agent workload dashboard** — Active assignments per agent

---

## Design Principles

1. **No emojis, ever.** Lucide icons only.
2. **Glass-morphic everything.** Panels float on near-black.
3. **Module colours are sacred.** Amber = Ops, Blue = Brain, Green = Lab, Violet = Projects.
4. **AEST clock.** All times are Australia/Sydney.
5. **Persistent tab state.** Switching modules doesn't wipe content.
6. **Data before render.** API fetches happen before first paint to avoid empty states.
7. **Flat files for now.** SQLite when volume demands it.
8. **Transparency by default.** Albs sees everything that changes.

---

## Known Limitations

- **No real-time collaboration** — Single-user system for now
- **No database** — Flat JSON/markdown only. Performance will degrade with scale.
- **Jira sync disabled** — Cron job exists but is off pending API credentials
- **Overnight self-improvement disabled** — Needs more stable agent spawning
- **No authentication** — Runs on trusted local network
- **Prototype live preview missing** — Iframe routing not yet implemented

---

## How to Update This Documentation

This file is maintained automatically by the **Rolling OS Docs** cron job (midnight AEST daily). It reads the current codebase, analyses changes, and rewrites this file.

If you need to update manually:
1. Edit `/home/ubuntu/projects/goat-os/brain/os-docs/latest.md`
2. The file watcher will auto-deploy to the Canvas
3. Refresh the OS Docs tab in GoatOS

---

*GoatOS v0.2.0 — Built for Albs, by Goat. 🐐*
