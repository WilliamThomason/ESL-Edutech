# ═══ AUTO-UPDATE RULE ═══

**This file defines the convention for automatically updating the Obsidian vault (business memory) when new information is shared with any AI agent.**

## Rule: Always Update the Vault

When the user shares any business-relevant information with ANY AI agent (Hermes, Claude, etc.), the agent MUST update the corresponding markdown file in the vault.

## What Triggers an Update

| When you say... | Update this file |
|-----------------|-----------------|
| Client name, niche, goals | `memory/clients/{client-name}.md` |
| New campaign or campaign change | `memory/campaigns/{campaign-name}.md` |
| Keyword research or target keyword | `memory/keywords/{campaign}-research.md` |
| Outreach prospect or contact | `memory/outreach/{campaign}-prospects.md` |
| Workflow change or new workflow | `memory/workflows/{workflow-name}.md` |
| Agent model, role, or token limit change | `memory/agents/{agent-name}.md` |
| Business goal or KPI change | `memory/goals/{period}.md` |
| Daily work notes or decisions | `memory/journal/{date}.md` |
| Content brief or article draft | `memory/content/{article-slug}.md` |
| Tool or integration change | `memory/agents/{agent-name}.md` (tools section) |
| Governance policy change | `memory/CLAUDE.md` (governance section) |

## How to Update

1. **Read** the existing file first (if it exists)
2. **Merge** new information with existing content (don't overwrite)
3. **Write** the updated content back to the file
4. **Confirm** to the user: "Updated memory/{file}.md"

## Example Conversations

**User:** "I just signed a new client — Acme Corp, they need SEO for their SaaS product"
**Agent:** Updates `memory/clients/acme-corp.md` with client profile → "Updated memory/clients/acme-corp.md"

**User:** "Change the Writer's model to Claude Opus 4"
**Agent:** Updates `memory/agents/writer.md` model field → "Updated memory/agents/writer.md"

**User:** "We're targeting 'best CRM software' as a new keyword, volume 8,100, KD 45"
**Agent:** Updates `memory/keywords/{campaign}-research.md` with new keyword row → "Updated keyword research"

**User:** "Today I published the outreach email sequence and got 3 responses"
**Agent:** Updates `memory/journal/{today}.md` with the day's work → "Updated today's journal"

## Priority

**ALWAYS update the vault BEFORE responding to the user's next message.** The vault is the single source of truth. If the agent doesn't update it, the information is lost.

## Git Commit

After updating vault files, commit the changes:
```bash
cd /home/irieb/github_project
git add Agentic-OS/memory/
git commit -m "Memory update: {what changed}"
git push
```
