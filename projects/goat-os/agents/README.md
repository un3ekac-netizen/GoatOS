# GoatOS Agent Architecture

## Current Status
All task delegation currently runs through the **main agent** (Kimi K2.6). This is a temporary setup while we build out the agent team.

## Future Agent Team

### Phase 1: Direct Reports to Goat (Executive Assistant)
Each agent gets their own SKILL.md, persona, and workspace.

| Agent | Role | Handles Task Types | Reports To |
|-------|------|-------------------|------------|
| **jd-writer** | Chief People Officer | Writing (JDs, proposals, docs) | Goat |
| **analyst** | Chief Strategy Officer | Research/Analysis | Goat |
| **marketer** | Chief Marketing Officer | Marketing, Copy | Goat |
| **coder** | Chief Technology Officer | Code | Goat |
| **ops** | Chief Operating Officer | Operational (SOPs, checklists) | Goat |

### Phase 2: Agent Collaboration
Agents work together on cross-functional tasks:
- **Marketing + Ops**: Event planning → marketer creates campaign, ops creates SOPs
- **Analyst + Marketing**: Market research → analyst produces data, marketer creates strategy
- **Coder + Analyst**: Product feature → analyst defines requirements, coder builds it

### Phase 3: Sub-Agent Hierarchies
Each C-level agent gets their own sub-agents:
- CMO → Content Writer, Designer, Social Media Manager
- CTO → Frontend Dev, Backend Dev, DevOps
- COO → Process Analyst, QA, Trainer

## Implementation Checklist
- [ ] Create `/home/ubuntu/projects/goat-os/agents/<agent-id>/SKILL.md` for each
- [ ] Create `/home/ubuntu/projects/goat-os/agents/<agent-id>/PERSONA.md` for each
- [ ] Configure agent-specific model overrides (e.g., Opus for analyst, Kimi for ops)
- [ ] Build agent-to-agent messaging protocol
- [ ] Update delegation cron to route by task type instead of spawning generic sub-agents
- [ ] Test cross-agent collaboration workflows

## Notes
- Each agent should have a unique voice/persona
- SKILL.md defines their tools, workflows, and boundaries
- PERSONA.md defines their personality, communication style, and decision-making framework
- Agents should be able to hand off work to each other via a shared task queue
