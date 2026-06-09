---
version: alpha
name: Agentic OS
description: A purple/dark-themed multi-agent management dashboard for orchestrating AI agents, managing token budgets, and tracking workflows.
colors:
  dark-bg: "#0a0e1a"
  dark-surface: "#16213e"
  dark-card: "#1a1a2e"
  dark-border: "#2a3a5f"
  dark-border-light: "#3a4a7f"
  dark-text: "#e0f2fe"
  dark-text-muted: "#94a3b8"
  dark-text-dim: "#4a6080"
  light-bg: "#f5f5f5"
  light-surface: "#ffffff"
  light-card: "#f0f0f0"
  light-border: "#d0d0d0"
  light-border-light: "#b0b0b0"
  light-text: "#2f2f2f"
  light-text-muted: "#666666"
  light-text-dim: "#888888"
  primary: "#a78bfa"
  primary-light: "#c4b5fd"
  primary-dim: "rgba(167,139,250,.08)"
  accent: "#a3e635"
  accent-dim: "rgba(163,230,53,.08)"
  amber: "#fbbf24"
  amber-dim: "rgba(251,191,36,.08)"
  rose: "#fb7185"
  rose-dim: "rgba(251,113,133,.08)"
  cyan: "#22d3ee"
  green: "#34d399"
  violet: "#a78bfa"
  peach: "#fcbe6a"
  peach-text: "#1c1c1c"
typography:
  h1:
    fontFamily: Fira Code, monospace
    fontSize: 2.4rem
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  h2:
    fontFamily: Fira Code, monospace
    fontSize: 1.6rem
    fontWeight: 700
    lineHeight: 1.2
  h3:
    fontFamily: Fira Code, monospace
    fontSize: 1rem
    fontWeight: 700
    letterSpacing: "1px"
    textTransform: uppercase
  body:
    fontFamily: Blogger Sans, Inter, system-ui, sans-serif
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Blogger Sans, Inter, system-ui, sans-serif
    fontSize: 0.85rem
    fontWeight: 400
    lineHeight: 1.5
  mono:
    fontFamily: Fira Code, Share Tech Mono, monospace
    fontSize: 0.75rem
    fontWeight: 600
    letterSpacing: "1px"
    textTransform: uppercase
  label:
    fontFamily: Fira Code, monospace
    fontSize: 0.65rem
    fontWeight: 700
    letterSpacing: "1.5px"
    textTransform: uppercase
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 40px
shadow:
  sm: "0 1px 3px rgba(0,0,0,.2)"
  md: "0 4px 12px rgba(0,0,0,.3)"
  lg: "0 8px 30px rgba(0,0,0,.4)"
  glow: "0 0 12px rgba(167,139,250,.15)"
  glow-amber: "0 0 12px rgba(251,191,36,.15)"
  glow-rose: "0 0 12px rgba(251,113,133,.15)"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#0a0e1a"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-light}"
    textColor: "#0a0e1a"
  button-danger:
    backgroundColor: "{colors.rose}"
    textColor: "#0a0e1a"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.dark-text-muted}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-ghost-hover:
    backgroundColor: "{colors.primary-dim}"
    textColor: "{colors.primary}"
  card:
    backgroundColor: "{colors.dark-surface}"
    textColor: "{colors.dark-text}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  card-interactive:
    backgroundColor: "{colors.dark-surface}"
    textColor: "{colors.dark-text}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  card-interactive-hover:
    backgroundColor: "{colors.dark-card}"
  input:
    backgroundColor: "{colors.dark-bg}"
    textColor: "{colors.dark-text}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  input-focus:
  badge:
    backgroundColor: "{colors.primary-dim}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  badge-success:
    backgroundColor: "rgba(52,211,153,.15)"
    textColor: "{colors.green}"
  badge-warning:
    backgroundColor: "{colors.amber-dim}"
    textColor: "{colors.amber}"
  badge-error:
    backgroundColor: "{colors.rose-dim}"
    textColor: "{colors.rose}"
  badge-info:
    backgroundColor: "rgba(34,211,238,.15)"
    textColor: "{colors.cyan}"
  progress-bar:
    backgroundColor: "{colors.dark-bg}"
    rounded: "{rounded.sm}"
    height: "6px"
  progress-fill:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.sm}"
  progress-fill-warning:
    backgroundColor: "{colors.amber}"
  progress-fill-error:
    backgroundColor: "{colors.rose}"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.dark-text-muted}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  nav-item-active:
    backgroundColor: "{colors.primary-dim}"
    textColor: "{colors.primary}"
  nav-item-hover:
    backgroundColor: "rgba(167,139,250,.04)"
    textColor: "{colors.dark-text}"
  agent-card:
    backgroundColor: "{colors.dark-card}"
    textColor: "{colors.dark-text}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  agent-card-active:
  kanban-card:
    backgroundColor: "{colors.dark-card}"
    textColor: "{colors.dark-text}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  kanban-card-hover:
  token-display:
    backgroundColor: "{colors.dark-bg}"
    textColor: "{colors.amber}"
    rounded: "{rounded.md}"
    padding: "4px 8px"
  tooltip:
    backgroundColor: "{colors.dark-card}"
    textColor: "{colors.dark-text}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
---

## Overview

Agentic OS is a dark-first, purple-accented multi-agent management dashboard. It provides a single command center for orchestrating AI agents, managing token budgets, tracking kanban workflows, and monitoring production output. The design language is technical but warm — monospace headings paired with clean sans-serif body text, using a deep navy/purple palette with lime accents for active states.

## Colors

- **Primary (#a78bfa):** Purple — the brand identity. Used for active states, agent accents, and interactive highlights.
- **Accent (#a3e635):** Lime — success states, active indicators, and positive metrics.
- **Amber (#fbbf24):** Warnings, token usage alerts, and attention-drawing elements.
- **Rose (#fb7185):** Errors, destructive actions, and blocked states.
- **Cyan (#22d3ee):** Informational elements and secondary actions.
- **Dark BG (#0a0e1a):** Deep navy — the foundation. Creates depth and reduces eye strain.
- **Dark Surface (#16213e):** Card and panel backgrounds. Slightly lighter than BG for layering.
- **Peach (#fcbe6a):** CTA buttons that pop against the dark background.

## Typography

- **Fira Code** — All headings, labels, navigation, and UI elements. Monospace creates a technical, command-center feel.
- **Blogger Sans / Inter** — Body text, descriptions, and content. Clean and readable at small sizes.
- **Share Tech Mono** — Token displays, code snippets, and metrics. Reinforces the technical aesthetic.

Type scale: H1 2.4rem → H2 1.6rem → H3 1rem (uppercase, tracked) → Body 1rem → Body-sm 0.85rem → Mono 0.75rem (uppercase, tracked) → Label 0.65rem (uppercase, tracked).

## Layout

- **Sidebar:** 220px fixed left nav with agent status badges and page navigation
- **Topbar:** 48px height with page title, search, and user controls
- **Content:** Fluid main area with card-based grid layouts
- **Max content width:** 1200px centered
- **Responsive:** Sidebar collapses below 900px, single column below 600px

## Shapes

- Border radius: 4px (small elements), 8px (buttons, inputs), 12px (cards), 16px (modals), 50% (avatars, badges)
- Consistent 1px borders using border color tokens
- Subtle box-shadows for elevation (sm/md/lg)
- Glow shadows for interactive states (purple glow for focus, amber for warning, rose for error)

## Components

### Agent Card
Displays an agent's avatar (geometric initial), name, assigned model, role badge, status indicator (running/idle/error), and token usage progress bar. Active agents have a purple border glow.

### Kanban Card
Compact card showing task title, assignee avatar, priority indicator, and status. Drag-and-drop between columns. Hover reveals action buttons.

### Token Display
Monospace number showing current/max tokens with a colored progress bar. Green under 50%, amber at 50-80%, red above 80%.

### Status Badge
Small rounded pill with colored dot. Colors: green (running), amber (pending/warning), rose (error/blocked), cyan (info), purple (active).

### Progress Bar
6px height bar with rounded corners. Fill color changes based on percentage thresholds.

## Do's and Don'ts

**Do:**
- Use purple for primary interactive elements
- Show token usage visually (progress bars, color thresholds)
- Display agent status at a glance (colored dots + labels)
- Use monospace for all UI chrome (nav, headings, labels)
- Test every interactive element with button-tester before marking complete
- Build one HTML element at a time, verify, then move to next

**Don't:**
- Use emoji in buttons or labels — use SVG icons instead
- Mix more than 2 font families
- Use pure black (#000) — always use the dark-bg token (#0a0e1a)
- Create hover states without corresponding active/focus states
- Use more than 3 colors in a single component
- Skip WCAG contrast checks on text/background combinations
