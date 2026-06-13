const fs = require('fs');
const html = fs.readFileSync('/home/irieb/github_project/Agentic-OS/index.html', 'utf8');

// Extract all script content
const scriptMatch = html.match(/<script>([\s\S]+?)<\/script>/);
if (!scriptMatch) { console.log('No script found'); process.exit(1); }

const js = scriptMatch[1];
try {
  new Function(js);
  console.log('PASS: JS valid');
} catch(e) {
  console.log('FAIL:', e.message);
}

// Count pages
const pages = html.match(/class="page/g);
console.log('Pages:', pages ? pages.length : 0);

// Count nav items
const navItems = html.match(/class="nav-item/g);
console.log('Nav items:', navItems ? navItems.length : 0);

// Check for key functions
const fns = ['showPage','loadKanban','loadInbox','submitIdea','loadCron','loadStats','loadVault','loadActivityLog','showNewTaskModal','apiGet','apiPost','setApiStatus','handleSearch','renderAgentFleet','addAgent','saveConfig','resetConfig','exportConfig','selectRouter','showToast'];
fns.forEach(fn => {
  if (js.includes(fn + '(') || js.includes(fn + ' (')) {
    console.log('  OK:', fn);
  } else {
    console.log('  MISSING:', fn);
  }
});

console.log('File size:', html.length, 'bytes');
