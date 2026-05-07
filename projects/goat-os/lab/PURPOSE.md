# Lab Module — Purpose & Vision

Think Dexter's Lab. A private workspace for testing, building, and self-improvement.

## Core Functions

1. **Self-Improvement Engine**
   - Cron job analyses the GoatOS codebase + each module
   - Identifies improvements, builds new features, fixes issues
   - Logs all changes in the Lab for review

2. **Prototype Playground**
   - Spin up dev servers for new ideas
   - Full-screen preview (3/4 ratio overlay)
   - Track status: idea → prototype → production

3. **Overnight Builds**
   - All cron-driven builds logged here
   - Build status, duration, summary, diffs
   - Morning review alongside Daily Briefs

4. **Project Feature Factory** (future)
   - When multi-agent teams are live, Lab controls where new features are created
   - Agents propose features → Lab validates → prototype → deploy
   - Per-project isolation

## Storage Strategy

- **Current:** Flat JSON files + markdown (sufficient for now)
- **Next phase:** SQLite migration when data volume warrants it
- **Future consideration:** Convex if real-time sync / multi-client needed

## Self-Improvement Process

1. Analyse codebase and each module
2. Consider context: Albs' role, Hampr's needs, GoatOS purpose
3. Build improvements that provide value or ROI to Hampr
4. Log everything in Lab — prototypes, overnight builds, self-improvement ideas
5. Never ship without logging
