const fs = require("fs");
const path = require("path");

function fixPaths(dir, extensions) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fixPaths(filePath, extensions);
    } else if (extensions.some((ext) => file.endsWith(ext))) {
      let content = fs.readFileSync(filePath, "utf8");
      const original = content;

      // Fix HTML attributes
      content = content.replace(/src="\//g, 'src="/VibeVault/');
      content = content.replace(/href="\//g, 'href="/VibeVault/');
      content = content.replace(/content="\//g, 'content="/VibeVault/');

      // Fix url() in CSS/JS
      content = content.replace(/url\(\//g, "url(/VibeVault/");
      content = content.replace(/url\("\//g, 'url("/VibeVault/');
      content = content.replace(/url\('\//g, "url('/VibeVault/");

      // Fix standalone paths
      content = content.replace(/"\/(_expo|assets)\//g, '"/VibeVault/$1/');
      content = content.replace(/'\/(_expo|assets)\//g, "'/VibeVault/$1/");

      if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed: ${filePath}`);
      }
    }
  });
}

// Add redirect script to index.html
function addRedirectScript() {
  const indexPath = path.join(__dirname, "dist", "index.html");
  let html = fs.readFileSync(indexPath, "utf8");

  const redirectScript = `
    <script>
      (function(l) {
        if (l.search[1] === '/' ) {
          var decoded = l.search.slice(1).split('&').map(function(s) {
            return s.replace(/~and~/g, '&')
          }).join('?');
          window.history.replaceState(null, null,
            l.pathname.slice(0, -1) + decoded + l.hash
          );
        }
      }(window.location))
    </script>`;

  // Insert before closing </head>
  html = html.replace("</head>", `${redirectScript}\n</head>`);
  fs.writeFileSync(indexPath, html);
  console.log("Added redirect script to index.html");
}

// Copy 404.html if it exists in public folder
function copy404() {
  const source = path.join(__dirname, "public", "404.html");
  const dest = path.join(__dirname, "dist", "404.html");

  if (fs.existsSync(source)) {
    let html = fs.readFileSync(source, "utf8");
    fs.writeFileSync(dest, html);
    console.log("Copied 404.html to dist");
  }
}

const distPath = path.join(__dirname, "dist");
fixPaths(distPath, [".html", ".js", ".css"]);
addRedirectScript();
copy404();
console.log("All files fixed!");
