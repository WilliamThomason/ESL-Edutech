const fs = require('fs');
const html = fs.readFileSync('/home/irieb/github_project/Agentic-OS/index.html', 'utf8');
const js = html.match(/<script>([\s\S]+?)<\/script>/)[1];
try { new Function(js); console.log('JS: PASS'); } catch(e) { console.log('JS: FAIL -', e.message); }
console.log('Size:', html.length);
