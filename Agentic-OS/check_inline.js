const fs = require('fs');
const html = fs.readFileSync('/home/irieb/github_project/Agentic-OS/index.html', 'utf8');
const js = html.match(/<script>([\s\S]+?)<\/script>/)[1];

// Check if JS uses var(--accent), var(--rose), var(--amber), var(--text-dim) in string concatenation
const jsInlineColorIssues = js.match(/var\(--(accent|rose|amber|text-dim)/g);
console.log('JS inline color var() usages:', jsInlineColorIssues ? jsInlineColorIssues.length : 0);
if (jsInlineColorIssues) jsInlineColorIssues.forEach(m => console.log('  ', m));
