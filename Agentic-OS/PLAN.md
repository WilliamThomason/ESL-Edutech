# Agentic OS — Implementation Plan

_Based on Julian Goldie's "Paperclip + Hermes" system from the YouTube transcript._

## Vision
A visual "mission control" dashboard for managing a multi-agent AI team. Drop ideas → agents classify + plan + build → you approve/reject. Everything tracked in one place.

## Core Features (from Julian Goldie's system)

### 1. Organization Chart
- Visual org chart showing all AI agents as "employees"
- Each agent has: role, title, model, token limit, status
- CEO at top, teams below (engineering, marketing, operations)
- Click into any agent to see their activity and outputs

### 2. Kanban Task Board
- Full task board with lanes: Todo → In Progress → Blocked → Done
- Tasks auto-created by agents when processing ideas
- Drag-and-drop or click to move between lanes
- Each task shows: title, assignee, priority, status, timestamp

### 3. Idea Foundry (Pipeline)
- **Capture**: Drop any idea (one line, voice note, link)
- **Classify**: Agent categorizes as project / quick task / reference / park
- **Plan**: Agent drafts approach, milestones, assignee
- **Approve**: Human reviews plan, approves or rejects (the only human step)
- **Build**: Sub-agents auto-create kanban tasks and execute
- **Deliver**: Completed work appears in Obsidian + filesystem

### 4. Scheduled Agents (Heartbeat)
- Agents wake up on a schedule (every 30 min, daily, etc.)
- Each agent checks the board, picks up work, executes
- Token limits per agent per day
- Pause/resume individual agents

### 5. Live Activity Feed
- Real-time feed of what each agent is doing
- Timestamps showing when work was completed
- Screenshots/outputs attached to tickets
- Filter by agent, status, or time

### 6. Memory Galaxy (Obsidian Integration)
- 3D star-map visualization of the Obsidian vault
- Each note = a star, links = constellations
- Recent/updated notes glow brightest
- Agents read/write to the same vault
- Shared context across all agents

### 7. Multi-Agent Teams
- Multiple departments (engineering, marketing, QA)
- Agents coordinate handoffs (e.g., CopyWriter → Designer → Coder)
- Each agent has its own profile, model, and token budget
- Agents can "hire" sub-agents for complex tasks

### 8. Approval Gates
- Nothing ships without human sign-off
- Review deliverables on the kanban ticket
- Approve → moves to Done
- Reject → goes back to agent with feedback

## Current State vs Target

### Done ✓
- [x] Basic dashboard HTML/CSS with sidebar nav
- [x] Kanban board page (reads from `hermes kanban list --json`)
- [x] Idea Foundry page (capture form + inbox view)
- [x] Live Activity page (stats + vault file list)
- [x] Agent Config page (model assignments, token limits)
- [x] Agent Fleet page (agent roster with status)
- [x] Cron jobs: Idea Foundry Inbox Monitor (30 min), Daily Standup (9am)
- [x] Obsidian vault at `/home/irieb/obsidian-vault/`
- [x] API proxy serving kanban data on port 8642

### To Build
- [ ] **Org Chart page** — visual hierarchy of agents with status indicators
- [ ] **Agent detail view** — click an agent to see their tasks, outputs, activity log
- [ ] **Idea pipeline** — full capture → classify → plan → approve → build flow
- [ ] **Approval gates** — review/approve buttons on kanban cards
- [ ] **Live activity feed** — real-time agent activity with timestamps
- [ ] **Memory Galaxy** — 3D Obsidian vault visualization (Three.js)
- [ ] **Multi-team support** — Goldie Agency, Goldie Labs, etc.
- [ ] **Token tracking** — per-agent token usage with daily limits
- [ ] **Schedule management** — set agent wake/sleep schedules
- [ ] **Output workspace** — view files created by agents

## Pages Needed
1. Dashboard (overview + metrics)
2. Org Chart (agent hierarchy)
3. Kanban Board (task management)
4. Idea Foundry (pipeline)
5. Agent Fleet (individual agent details)
6. Live Activity (real-time feed)
7. Memory Galaxy (Obsidian 3D view)
8. Output Workspace (agent-created files)
9. Settings (schedules, token limits, models)
10. Approvals (pending human decisions)

## Technical Notes
- All data flows through Hermes CLI (`hermes kanban`, `hermes cron`, `hermes api`)
- API proxy at `http://127.0.0.1:8642` serves JSON from Hermes commands
- Obsidian vault is the shared memory layer
- GitHub Pages for static UI, local proxy for live data
- No external SAAS — everything runs on Hermes + local tools
