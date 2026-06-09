# Workflow: Content Publishing Pipeline

## Trigger
Content calendar schedule (2x/week) or manual request

## Steps
1. **COO** — Receives content brief from content calendar
2. **Researcher** — Generates keyword research and competitor analysis for the topic
3. **Researcher** — Creates content brief with: target keyword, word count, internal links, meta tags
4. **Writer** — Drafts article based on content brief (1,500-2,500 words)
5. **Reviewer** — Quality check: brand voice, SEO, accuracy, formatting
6. **Reviewer** — Checks: meta title < 60 chars, meta description < 155 chars, keyword density 1-2%, internal links ≥ 2
7. **COO** — Final approval gate
8. **Writer** — Publishes to GitHub Pages (static HTML)
9. **Analyst** — Submits URL to Google Search Console for indexing
10. **Analyst** — Tracks rankings after 7, 14, 30 days

## Token Budget
- Researcher: 40K
- Writer: 60K
- Reviewer: 15K
- COO: 5K
- Analyst: 10K
- **Total: ~130K per article**

## Output
- Published article URL
- Keyword ranking tracker entry
- Content calendar update
- Activity log entry

## Quality Gates
- Reviewer must approve before COO sees it
- COO can reject with feedback (returns to Writer)
- Max 2 revision cycles before escalation
