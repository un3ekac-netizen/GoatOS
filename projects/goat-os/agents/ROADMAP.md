# GoatOS Agent Team Roadmap

## Current State (May 2026)
- Single agent (main/Kimi K2.6) handles all delegated tasks
- Workflow tested successfully with "Leane JD" task
- Jira sync, delegation queue, deliverable generation all working

## Next Steps (When Albs Is Ready)

### 1. Pick Your First Agent
Choose which agent to build first. Recommended order:
1. **jd-writer** (simplest — writing tasks are well-defined)
2. **marketer** (high volume — marketing/copy tasks are frequent)
3. **analyst** (most complex — needs Opus for deep reasoning)
4. **coder** (needs careful testing — code can break things)
5. **ops** (last — SOPs are lower priority)

### 2. For Each Agent, We'll Create:
- `SKILL.md` — what tools they use, how they work, their boundaries
- `PERSONA.md` — their voice, personality, decision-making style
- Workspace folder — their own files, templates, and outputs
- Model config — which LLM they run on (Kimi for speed, Opus for depth)

### 3. Agent Collaboration Design
When you're ready for agents to work together, we'll build:
- A shared message bus (agents can send tasks to each other)
- Handoff protocols (e.g., "marketer passes campaign brief to ops for SOP")
- Shared context (agents can read each other's outputs)

### 4. Jira Integration Updates
- Map Task Type → specific agent (not just generic sub-agent)
- Add agent assignment to Jira custom fields
- Track which agent worked on which ticket

## Mental Notes for Albs
- Each agent costs tokens/credits — start with 1-2, scale gradually
- Agents need training/examples — first few tasks might need manual review
- Cross-agent collaboration is v2 — get single-agent delegation rock-solid first
- Consider giving each agent a Slack/Discord channel for transparency
