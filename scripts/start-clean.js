/* eslint-env node */

const path = require("path");
const { execSync, spawnSync } = require("child_process");

function killStaleProcesses() {
  const patterns = [
    "expo start",
    "expo-cli",
    "metro",
    "node .*expo",
  ];

  for (const pattern of patterns) {
    try {
      execSync(`pkill -f "${pattern}"`, { stdio: "ignore" });
    } catch (error) {
      if (error && error.status !== 1) {
        throw error;
      }
    }
  }
}

killStaleProcesses();

const args = process.argv.slice(2);
const expoCli = path.resolve(process.cwd(), "node_modules", "expo", "bin", "cli");
const result = spawnSync(process.execPath, [expoCli, "start", ...args], {
  stdio: "inherit",
  shell: false,
});

process.exit(result.status ?? 0);
