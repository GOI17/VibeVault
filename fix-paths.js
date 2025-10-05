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

      content = content.replace(/src="\//g, 'src="/VibeVault/');
      content = content.replace(/href="\//g, 'href="/VibeVault/');
      content = content.replace(/content="\//g, 'content="/VibeVault/');
      content = content.replace(/url\(\//g, "url(/VibeVault/");
      content = content.replace(/url\("\//g, 'url("/VibeVault/');
      content = content.replace(/url\('\//g, "url('/VibeVault/");
      content = content.replace(/"\/(_expo|assets)\//g, '"/VibeVault/$1/');
      content = content.replace(/'\/(_expo|assets)\//g, "'/VibeVault/$1/");

      if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed: ${filePath}`);
      }
    }
  });
}

// Copy index.html as 404.html for SPA routing
function create404() {
  const indexPath = path.join(__dirname, "dist", "index.html");
  const notFoundPath = path.join(__dirname, "dist", "404.html");

  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, notFoundPath);
    console.log("Created 404.html from index.html");
  }
}

// Add redirect for missing trailing slash
function fixTrailingSlash() {
  const indexPath = path.join(__dirname, "dist", "index.html");
  let html = fs.readFileSync(indexPath, "utf8");

  const trailingSlashScript = `
    <script>
      // Ensure trailing slash for base path
      if (window.location.pathname === '/VibeVault') {
        window.location.replace('/VibeVault/');
      }
    </script>`;

  html = html.replace("</head>", `${trailingSlashScript}\n</head>`);
  fs.writeFileSync(indexPath, html);
  console.log("Added trailing slash redirect");
}

const distPath = path.join(__dirname, "dist");
fixPaths(distPath, [".html", ".js", ".css"]);
create404();
fixTrailingSlash();
console.log("All files fixed!");
