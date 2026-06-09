# Workflow: Rank Tracking & Reporting

## Trigger
Weekly (Monday 9:00 AM) or manual request

## Steps
1. **Analyst** — Pulls ranking data for all tracked keywords
2. **Analyst** — Compares to previous week's rankings
3. **Analyst** — Identifies: new rankings, improvements, drops, lost rankings
4. **Analyst** — Pulls traffic data from GA4 and Search Console
5. **Analyst** — Calculates: total organic traffic, conversion rate, top pages
6. **Writer** — Drafts narrative summary of performance
7. **Analyst** — Generates charts (traffic trend, ranking distribution, keyword movements)
8. **Reviewer** — Verifies data accuracy and narrative quality
9. **COO** — Approves weekly report
10. **Analyst** — Archives report to /campaigns/{client}/reports/

## Token Budget
- Analyst: 40K
- Writer: 20K
- Reviewer: 10K
- COO: 5K
- **Total: ~75K per report**

## Output
- Weekly ranking report (markdown)
- Traffic summary chart
- Keyword movement report
- Recommendations for next week

## Alert Thresholds
- Ranking drop > 5 positions → immediate alert to COO
- Traffic drop > 20% → immediate alert to COO
- New keyword in top 10 → positive alert to COO
