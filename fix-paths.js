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

const distPath = path.join(__dirname, "dist");
fixPaths(distPath, [".html", ".js", ".css"]);
console.log("All files fixed!");
