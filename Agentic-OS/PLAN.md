# AGENTIC OS — Development Plan

## Overview

Build a multi-agent management platform (Agentic OS) using Kanban orchestration, Obsidian memory, and Hermes agents. Then prove it works by using it to run an SEO company.

---

## PHASE 1: Agentic OS Core (Weeks 1-3)

### Task 1.1: Obsidian Vault Structure for Agentic OS
**Time: 4 hours**
**Assignee: Hermes (write/planning)**
**Tools: note-taking/obsidian**

Create the Obsidian vault structure that serves as the central memory for Agentic OS:
- `/clients/` — Client profiles, niches, goals
- `/campaigns/` — Active SEO campaigns
- `/content/` — Published articles, performance data
- `/keywords/` — Research, rankings, opportunities
- `/outreach/` — Contacts, templates, responses
- `/journal/` — Daily notes, ideas, decisions
- `/goals/` — Business targets, KPIs
- `/agents/` — Agent profiles, roles, model assignments
- `/workflows/` — Reusable workflow templates

**Prompt:** "Create an Obsidian vault structure at /home/irieb/William's Projects/AGENTIC-OS/memory/ with folders and template files for running an SEO company via AI agents. Include CLAUDE.md at the root that gives any AI agent context about the business. Create template markdown files for: client profile, campaign brief, keyword research log, outreach log, daily journal entry, agent profile."

**Verification:** All folders exist, templates are valid markdown, CLAUDE.md loads correctly in Obsidian.

---

### Task 1.2: Kanban Board Setup for Agentic OS Development
**Time: 2 hours**
**Assignee: Hermes (kanban orchestrator)**
**Tools: kanban**

Initialize kanban board for the Agentic OS development project. Create linked task graph:
- T1: Design system spec (design-md) → T2: Visual design (claude-design)
- T3: HTML/CSS scaffold → T4: JS event system → T5: Agent config page
- T6: Dashboard page → T7: Workflows page → T8: Settings page
- T9: Integration testing → T10: Bug fixes → T11: Deploy

**Prompt:** "Initialize kanban at /home/irieb/William's Projects/AGENTIC-OS/ with board slug 'agentic-os-dev'. Create 11 tasks linked in dependency order. Design tasks (T1-T2) can run in parallel with scaffold (T3). All page tasks (T4-T8) depend on T3. Testing (T9) depends on all of T4-T8."

---

### Task 1.3: Design System Specification
**Time: 3 hours**
**Assignee: Hermes using design-md skill**
**Tools: creative/design-md, popular-web-designs**

Create the DESIGN.md token spec for Agentic OS:
- Color system (dark-first, accent colors per agent role)
- Typography (Fira Code for UI, Blogger Sans for body)
- Spacing/radius/shadow tokens
- Component specs (cards, badges, buttons, inputs)
- Page layout templates

**Prompt:** "Load the design-md skill. Create a DESIGN.md token specification for Agentic OS — a purple/dark-themed multi-agent management dashboard. Colors: primary #a78bfa (purple), accent #a3e635 (lime for active/green), #fcbe6a (amber for warnings), #fb7185 (rose for errors). Font: Fira Code for headings/UI, Blogger Sans for body. Include component tokens for: agent-card, status-badge, token-display, kanban-card, workflow-node. Export to /home/irieb/William's Projects/AGENTIC-OS/DESIGN.md"

**Verification:** DESIGN.md passes `npx -y @google/design.md lint DESIGN.md` with 0 errors.

---

### Task 1.4: Visual Design (HTML/CSS)
**Time: 6 hours**
**Assignee: Hermes using claude-design skill**
**Tools: creative/claude-design**

Create the visual design mockups for all 9 pages:
1. Dashboard (agent fleet status, token usage, quick actions)
2. Agent Config (model selection, role assignment, token limits, team)
3. Kanban Board (columns, cards, drag-and-drop, filters)
4. Workflows (node editor, templates, execution history)
5. Memory/Obsidian (vault browser, note editor, search)
6. Settings (API keys, providers, permissions)
7. Analytics (token usage charts, session history, costs)
8. Output Workspace (preview generated content, files)

**Prompt:** "Load the claude-design skill. Using the DESIGN.md tokens from /home/irieb/William's Projects/AGENTIC-OS/DESIGN.md, create HTML/CSS mockups for each of the 9 pages. Each page should be a self-contained HTML file. Use the purple/dark theme from the design system. Include proper responsive behavior. Save to /home/irieb/William's Projects/AGENTIC-OS/design-mockups/."

**Verification:** All 9 HTML files exist, no broken CSS, responsive at 375px/768px/1024px.

---

### Task 1.5: Interactive HTML Prototype
**Time: 8 hours**
**Assignee: Hermes (coding)**
**Tools: software-development/web-app-development, claude-design**

Build the working single-page application:
1. **Scaffold** — Single HTML file with embedded CSS/JS, 9 tab pages
2. **Color theme system** — ChromaSkin integration, dark/light mode, per-agent accent colors
3. **Sidebar navigation** — 9 pages, active state, badge counts
4. **Dashboard page** — Agent fleet cards (avatar, name, role, model, status, token bar), system health (CPU/memory/token budget), recent activity log

**Element-by-element approach (each built and tested individually):**
- 5a. Sidebar nav (5 items, active state, hover effects) — 1 hour
- 5b. Dashboard agent cards (avatar, name, model, status badge, token bar) — 1.5 hours
- 5c. Dashboard health bars (CPU, memory, token budget with color thresholds) — 1 hour
- 5d. Dashboard activity log (timestamped entries, color-coded levels) — 1 hour
- 5e. Agent Config page (model dropdown, role input, team selector, token limit input, tools/skills multi-select) — 2 hours
- 5f. Kanban page (columns, cards, drag-and-drop, filters) — 2 hours
- 5g. Workflows page (node editor canvas, template list, execution history) — 2 hours
- 5h. Memory page (vault browser tree, note preview, search) — 1.5 hours
- 5i. Settings page (API key inputs, provider tabs, permission matrix) — 1.5 hours
- 5j. Analytics page (token usage chart, session list, cost breakdown) — 1.5 hours
- 5k. Output workspace (file tree, preview pane, export buttons) — 1 hour

**Testing protocol per element:**
1. Write HTML for the element
2. Add CSS styling
3. Add JS event handlers
4. Run `button-tester` skill — verify all buttons click, all inputs work
5. Debug any failures with `js-rendered-html-debugging` skill
6. Mark complete in kanban

**Total: ~17 hours for Task 1.5**

---

### Task 1.6: Agent Integration
**Time: 4 hours**
**Assignee: Hermes (coding + configuration)**
**Tools: software-development, kanban-orchestrator**

Connect the HTML UI to actual Hermes agent backend:
- Agent config page → writes to Hermes profile configs
- Kanban page → reads/writes kanban.db
- Dashboard → polls agent status
- Token limits → enforced at dispatch time

**Prompt:** "Build the JS bridge between the Agentic OS HTML UI and the Hermes agent system. When user changes an agent model in the UI, it should update the corresponding Hermes profile. When user creates a kanban task in the UI, it should call `hermes kanban create`. Dashboard should poll `hermes kanban list` every 5 seconds for live updates."

**Verification:** Changing model in UI reflects in `hermes profile list`. Creating task in UI appears in `hermes kanban list`.

---

### Task 1.7: Integration Testing & Bug Fixes
**Time: 4 hours**
**Assignee: Hermes (QA)**
**Tools: software-development/button-tester, js-rendered-html-debugging, systematic-debugging**

Full integration test of all 9 pages:
- Every button click tested
- Every form submission verified
- Every navigation transition smooth
- Token display accuracy verified against actual Hermes usage
- Kanban create/update/delete all functional
- Agent config changes persist

**Prompt:** "Load button-tester skill. Test every interactive element in /home/irieb/William's Projects/AGENTIC-OS/index.html. For each failed test, load js-rendered-html-debugging skill to diagnose. Fix all issues. Re-test until 100% pass rate."

---

### Task 1.8: Deploy Agentic OS
**Time: 1 hour**
**Assignee: Hermes**
**Tools: github/github-workflow**

Copy to GitHub Pages, verify deployment, test live URL.

---

## PHASE 2: SEO Company Proof of Concept (Weeks 4-6)

### Task 2.1: SEO Company Obsidian Setup
**Time: 2 hours**
**Tools: note-taking/obsidian**

Create Obsidian vault for the SEO company:
- Client profile template
- Keyword research database
- Content calendar
- Outreach tracking
- Performance reporting

### Task 2.2: SEO Agent Profiles
**Time: 3 hours**
**Tools: kanban, agent-create**

Create specialized agent profiles in Hermes:
- COO (Director) — routes work, manages token budget
- Researcher — keyword research, competitor analysis
- Writer — blog posts, outreach emails, ad copy
- Analyst — rankings, traffic, conversion tracking
- Outreach — link building, PR, partnerships
- Reviewer — quality check, brand voice, approval

### Task 2.3: SEO Workflows
**Time: 4 hours**
**Tools: kanban, obsidian**

Build reusable workflows in Obsidian:
- New client onboarding workflow
- Keyword research → content creation → publishing pipeline
- Link building outreach workflow
- Monthly reporting workflow

### Task 2.4: First Client Campaign
**Time: 8 hours**
**Tools: all agents via kanban**

Run a complete SEO campaign for a test client using the Agentic OS:
- Research 20 keywords
- Write 5 blog posts
- Build 10 outreach emails
- Track rankings
- Generate monthly report

---

## TIME SUMMARY

| Phase | Task | Hours | Dependencies |
|-------|------|-------|-------------|
| 1.1 | Obsidian vault | 4 | None |
| 1.2 | Kanban setup | 2 | None |
| 1.3 | Design spec | 3 | None |
| 1.4 | Visual design | 6 | 1.3 |
| 1.5 | HTML prototype | 17 | 1.4 |
| 1.6 | Agent integration | 4 | 1.5 |
| 1.7 | Testing & bugs | 4 | 1.6 |
| 1.8 | Deploy | 1 | 1.7 |
| 2.1 | SEO vault | 2 | 1.1 |
| 2.2 | Agent profiles | 3 | 1.6 |
| 2.3 | SEO workflows | 4 | 2.1 |
| 2.4 | First campaign | 8 | 2.2, 2.3 |

**Total: ~58 hours**

**Phase 1 (Agentic OS): 41 hours ≈ 5-7 days**
**Phase 2 (SEO Proof): 17 hours ≈ 2-3 days**

**Grand total: ~58 hours ≈ 8-10 working days**

---

## TOOL ASSIGNMENTS

| Tool | Purpose |
|------|---------|
| **design-md** | Color system, typography, component tokens |
| **claude-design** | Page mockups, responsive layouts |
| **web-app-development** | HTML/CSS/JS coding patterns |
| **button-tester** | Verify every interactive element |
| **js-rendered-html-debugging** | Fix broken JS-rendered elements |
| **systematic-debugging** | Incident runbook for complex bugs |
| **obsidian** | Memory vault, client data, workflows |
| **kanban** | Task orchestration, agent assignment |
| **popular-web-designs** | Design system reference |
| **excalidraw** | Architecture diagrams |

---

## KANBAN TASK GRAPH

```
T1 (design-md) ──→ T4 (mockups)
T2 (kanban setup) ──→ T3 (design spec) ──→ T4
T4 ──→ T5a (sidebar)
T5a ──→ T5b (agent cards)
T5a ──→ T5c (health bars)
T5a ──→ T5d (activity log)
T5a-T5d ──→ T5e (config page)
T5e ──→ T5f (kanban page)
T5e ──→ T5g (workflows)
T5e ──→ T5h (memory)
T5e ──→ T5i (settings)
T5e ──→ T5j (analytics)
T5e ──→ T5k (workspace)
T5f-T5k ──→ T6 (agent integration)
T6 ──→ T7 (testing)
T7 ──→ T8 (deploy)
T8 ──→ Phase 2
```
