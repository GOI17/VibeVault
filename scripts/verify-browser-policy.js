#!/usr/bin/env node

const fs = require("fs/promises");
const path = require("path");

const ROOT = process.cwd();
const DOC_PATH = "docs/browser-workflow.md";
const README_PATH = "README.md";
const PACKAGE_PATH = "package.json";

const REQUIRED_CMUX_STEPS = [
  "Open the target app or route with `cmux browser open <url> --json`.",
  "Wait for `--load-state complete` before interacting.",
  "Capture an interactive snapshot for concrete refs.",
  "Take a screenshot only after the UI is stable.",
  "Record the commands, URL, surface id, and the verification result.",
];

const REQUIRED_FALLBACK_PHRASES = [
  "If no cmux surface is available, stop the visual check",
  "Do not switch to Playwright.",
  "If a browser/visual task cannot be completed with cmux-browser, the task MUST be treated as blocked rather than switching to Playwright.",
];

const SCENARIOS = [
  {
    id: "1/7",
    name: "Normal cmux validation flow is documented",
    evidence: [DOC_PATH],
    check: (docs) => REQUIRED_CMUX_STEPS.every((step) => docs.includes(step)),
  },
  {
    id: "2/7",
    name: "Multiple cmux surfaces are handled explicitly",
    evidence: [DOC_PATH],
    check: (docs) =>
      docs.includes("If multiple cmux surfaces are available") &&
      docs.includes("choose the one that matches the target app/session") &&
      docs.includes("Do not interact with an unrelated surface."),
  },
  {
    id: "3/7",
    name: "Playwright fallback is forbidden",
    evidence: [DOC_PATH, README_PATH, PACKAGE_PATH],
    check: (docs, readme, pkg) =>
      REQUIRED_FALLBACK_PHRASES.every((phrase) => docs.includes(phrase)) &&
      readme.includes("Legacy Playwright artifacts are read-only") &&
      !JSON.stringify(pkg).toLowerCase().includes("playwright"),
  },
  {
    id: "4/7",
    name: "Post-interaction evidence is required",
    evidence: [DOC_PATH],
    check: (docs) =>
      docs.includes("The evidence bundle is the preserved artifact trail for the final verified state."),
  },
  {
    id: "5/7",
    name: "cmux unavailable path blocks the task",
    evidence: [DOC_PATH],
    check: (docs) =>
      docs.includes("mark the check as `BLOCKED`") &&
      (docs.includes("Do not switch to Playwright.") || docs.includes("Do **not** switch to Playwright.")),
  },
  {
    id: "6/7",
    name: "Compliance pass criteria are documented",
    evidence: [DOC_PATH],
    check: (docs) =>
      docs.includes("A `PASS` means the evidence trail is reviewed, cmux was used, and Playwright was not used."),
  },
  {
    id: "7/7",
    name: "Violation detection is actionable and runnable",
    evidence: [README_PATH, PACKAGE_PATH],
    check: (docs, readme, pkg) =>
      readme.includes("npm run verify:browser-policy") &&
      readme.includes("Output labels: PASS / FAIL / BLOCKED.") &&
      Boolean(pkg.scripts && pkg.scripts["verify:browser-policy"]),
  },
];

function parseArgs(argv) {
  const args = { report: null };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === "--report") {
      args.report = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

async function readText(relativeFilePath) {
  return fs.readFile(path.join(ROOT, relativeFilePath), "utf8");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const [docs, readme, pkgRaw] = await Promise.all([
    readText(DOC_PATH),
    readText(README_PATH),
    readText(PACKAGE_PATH),
  ]);
  const pkg = JSON.parse(pkgRaw);

  const results = SCENARIOS.map((scenario) => ({
    ...scenario,
    passed: Boolean(scenario.check(docs, readme, pkg)),
  }));

  const passed = results.filter((result) => result.passed).length;
  const failed = results.length - passed;
  const overall = failed === 0 ? "PASS" : "FAIL";

  const lines = [
    "Browser policy compliance verification",
    `Overall: ${overall}`,
    "",
    ...results.flatMap((result) => [
      `${result.passed ? "PASS" : "FAIL"} ${result.id} ${result.name}`,
      `  Evidence: ${result.evidence.join(", ")}`,
    ]),
    "",
    `Summary: ${passed}/${results.length} scenarios passed`,
  ];

  const output = lines.join("\n");
  process.stdout.write(`${output}\n`);

  if (args.report) {
    const report = [
      "# Browser policy compliance verification",
      `- Overall: ${overall}`,
      `- Passed: ${passed}/${results.length}`,
      "",
      "| Scenario | Status | Evidence |",
      "|---|---|---|",
      ...results.map(
        (result) =>
          `| ${result.id} ${result.name} | ${result.passed ? "PASS" : "FAIL"} | ${result.evidence.join(", ")} |`
      ),
    ].join("\n");

    await fs.mkdir(path.dirname(path.resolve(ROOT, args.report)), { recursive: true });
    await fs.writeFile(path.resolve(ROOT, args.report), report, "utf8");
  }

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(`Browser policy verification failed: ${error.message}\n`);
  process.exitCode = 1;
});
