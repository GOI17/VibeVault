const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(/src="\//g, 'src="/VibeVault/');
html = html.replace(/href="\//g, 'href="/VibeVault/');
fs.writeFileSync(indexPath, html);

console.log('Fixed asset paths');
