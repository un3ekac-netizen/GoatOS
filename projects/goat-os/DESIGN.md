# GoatOS Design System

## Fonts

| Role | Font | Source |
|------|------|--------|
| Titles, subheaders, labels, UI text | **Ubuntu** | Google Fonts |
| Mono content, biotext, walls of text, code | **Ubuntu Mono** | Google Fonts |

## Module Color Palettes

### Ops (Amber / Matrix-terminal)
- Primary: `#f59e0b` (amber-500)
- Glow/neon: `rgba(245, 158, 11, 0.6)` — applied to icons, tabs, titles
- Muted: `rgba(245, 158, 11, 0.15)` — card borders, subtle backgrounds
- Text accent: `#fbbf24` (amber-400)

### Brain (Sky Blue)
- Primary: `#38bdf8` (sky-400)
- Glow: `rgba(56, 189, 248, 0.5)`
- Muted: `rgba(56, 189, 248, 0.12)`
- Text accent: `#7dd3fc` (sky-300)

### Lab (Matrix Green)
- Primary: `#22c55e` (green-500)
- Glow: `rgba(34, 197, 94, 0.6)`
- Muted: `rgba(34, 197, 94, 0.12)`
- Text accent: `#4ade80` (green-400)

## Base Theme

- Background: `#0a0a0a` (near-black)
- Surface glass: `rgba(255, 255, 255, 0.04)` with `backdrop-filter: blur(20px)`
- Borders: `rgba(255, 255, 255, 0.08)`
- Body text: `rgba(255, 255, 255, 0.70)`
- Muted text: `rgba(255, 255, 255, 0.40)`

## Icons

- Library: **Lucide** (unpkg CDN)
- No emojis anywhere in the system
- Default stroke-width: 1.5

## Dock

- Horizontal layout, glass-morphic container
- Icons expand slightly on hover but never overflow the dock container
- Active module indicated by border glow in module color

## Interactive Patterns

- Session cards: clickable, expand to 75% screen width centered overlay
- Tabs: static (no close button), draggable to reorder
- Dashboard cards: clickable, navigate to full tab view

## Status Indicators

- Online: `#4ade80` with subtle glow
- Offline: `#ef4444`
- Warning: `#fbbf24`
