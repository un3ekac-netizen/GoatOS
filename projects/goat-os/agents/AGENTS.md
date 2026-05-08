# GoatOS Agent Team

## The C-Suite

| Agent | Name | Role | Avatar | Handles | Status |
|-------|------|------|--------|---------|--------|
| **Castle** | Castle | Chief Strategy Officer | `avatar-castle.png` | Research/Analysis (reports, market research) | Not configured — uses main agent |
| **Forge** | Forge | Chief Technology Officer | `avatar-forge.png` | Code tasks (.js, .py, .ts, etc.) | Not configured — uses main agent |
| **Echo** | Echo | Chief Intelligence Officer | `avatar-echo.png` | AI Pulse, market research, competitive analysis | Not configured — uses main agent |
| **Vector** | Vector | Chief Marketing Officer | `avatar-vector.png` | Marketing, Copy, Writing (JDs, campaigns, copy) | Not configured — uses main agent |

## How Delegation Works (Current)

1. Albs clicks **"Sync from Jira"** in GoatOS Projects module
2. Jira issues tagged `Goat-OS = Yes` are pulled into GoatOS
3. New tasks are added to the **delegation queue**
4. The sync button then triggers **delegation** — tasks are assigned to agents based on Task Type
5. A sub-agent spawns and does the work
6. When complete, the task moves to **"albs-approval"** stage
7. Albs reviews the deliverable (.md + .docx) and downloads from the task detail view

## Future: Agent Configuration

When Albs is ready to configure individual agents, each will get:

```
/home/ubuntu/projects/goat-os/agents/
├── castle/
│   ├── SKILL.md          # Tools, workflows, boundaries
│   ├── PERSONA.md        # Voice, personality, decision style
│   └── workspace/        # Agent's own files and templates
├── forge/
│   ├── SKILL.md
│   ├── PERSONA.md
│   └── workspace/
├── echo/
│   ├── SKILL.md
│   ├── PERSONA.md
│   └── workspace/
└── vector/
    ├── SKILL.md
    ├── PERSONA.md
    └── workspace/
```

## Future: Agent Collaboration

Agents will be able to message each other via a shared protocol:
- **Castle ↔ Vector**: Event planning → Castle creates SOPs, Vector creates campaign
- **Echo ↔ Vector**: Market research → Echo produces data, Vector creates strategy
- **Forge ↔ Echo**: Product feature → Echo defines requirements, Forge builds it

## Task Type → Agent Mapping

| Task Type | Agent | Output Format |
|-----------|-------|---------------|
| Code | Forge | Code files + README |
| Research/Analysis | Castle | Markdown report |
| Marketing | Vector | Marketing strategy doc |
| Copy | Vector | Polished copy (ads, emails, etc.) |
| Writing | Vector | Written content (JDs, proposals, etc.) |
| Operational | Castle | SOPs, checklists, process docs |
| (none) | Vector | Default to writing |
