# Agentic OS — Business Memory

## Business Overview
AI-powered SEO and digital marketing agency. We use a multi-agent system (Agentic OS) to deliver SEO content, link building, and analytics for clients.

## Active Clients
- [[clients/William Thomason English]] — ESL/Online English lessons

## Active Campaigns
- [[campaigns/WTE-SEO-2026]] — William Thomason English SEO campaign
- [[campaigns/WTE-SEO-2026-content-calendar]] — Content publishing schedule

## Agent Roster
| Agent | Role | Model | Token Budget | Status |
|-------|------|-------|-------------|--------|
| [[agents/coo]] | COO / Orchestrator | Claude Sonnet 4.6 | 100K/day | Active |
| [[agents/researcher]] | Researcher | Claude Opus 4 | 150K/day | Active |
| [[agents/writer]] | Writer | Claude Sonnet 4.6 | 150K/day | Active |
| [[agents/analyst]] | Analyst | Claude Sonnet 4.6 | 50K/day | Active |
| [[agents/outreach]] | Outreach | Claude Haiku 4.5 | 50K/day | Active |
| [[agents/reviewer]] | Reviewer | Claude Haiku 4.5 | 50K/day | Active |

**Total token budget:** 550K/day across all agents

## Token Budgets
- Global: 500K tokens/day
- COO: 100K/day
- Researcher: 150K/day
- Writer: 150K/day
- Analyst: 50K/day
- Outreach: 50K/day
- Reviewer: 50K/day

## Workflows
- [[workflows/keyword-research]] — Research → Content → Publish pipeline
- [[workflows/link-building]] — Prospect → Outreach → Follow-up
- [[workflows/monthly-report]] — Data collection → Analysis → Report

## Goals
- [[goals/2026-Q2]] — Q2 2026 business targets

## Journal
- [[journal/2026-06-08]] — Daily notes

## SEO Data
- [[keywords/wte-seo-2026]] — Keyword research and competitor analysis
- [[outreach/wte-2026-prospects]] — Link building prospect list

## Governance Policies
1. All content must pass through Reviewer before publishing
2. All outreach emails must pass through Reviewer before sending
3. PII must be anonymized in all outputs
4. External publishing requires COO approval
5. Token budget overruns trigger automatic agent throttling

## Auto-Update Rule
**[[AUTO-UPDATE-RULE]]** — When the user shares business-relevant information, ALWAYS update the corresponding markdown file in this vault BEFORE responding. This is the single source of truth.
