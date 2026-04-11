#!/usr/bin/env node

const fs = require("fs/promises");
const path = require("path");

const ROOT = process.cwd();
const DEFAULT_REPORT = null;

const FILES = {
  package: "package.json",
  readme: "README.md",
  colors: "constants/Colors.ts",
  rootLayout: "app/_layout.tsx",
  tabsLayout: "app/tabs/_layout.tsx",
  header: "components/Header.tsx",
  home: "app/tabs/home/index.tsx",
  homeContainer: "containers/HomeContainer.tsx",
  homeView: "components/views/HomeView.tsx",
  favorites: "app/tabs/favorites/index.tsx",
  favoritesContainer: "containers/FavoritesContainer.tsx",
  favoritesView: "components/views/FavoritesView.tsx",
  search: "app/home/search/query.tsx",
  searchContainer: "containers/SearchContainer.tsx",
  masonry: "components/Masonry.tsx",
  masonryItem: "components/MasonryItem.tsx",
  favoriteMutations: "hooks/useFavoriteMutations.ts",
};

function compact(value) {
  return value.replace(/\s+/g, " ").trim();
}

function contains(source, fragment) {
  return compact(source).includes(compact(fragment));
}

function parseArgs(argv) {
  let report = DEFAULT_REPORT;

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--report") {
      report = argv[i + 1];
      i += 1;
    }
  }

  return { report };
}

async function readText(relativeFilePath) {
  return fs.readFile(path.join(ROOT, relativeFilePath), "utf8");
}

async function loadSources() {
  const entries = await Promise.all(
    Object.entries(FILES).map(async ([key, relativePath]) => [key, await readText(relativePath)]),
  );

  return Object.fromEntries(entries);
}

function makeResult(id, name, evidence, passed, details) {
  return { id, name, evidence, passed, details };
}

function scenario(id, name, evidence, check) {
  return { id, name, evidence, check };
}

function toMarkdown(results, passed, total) {
  return [
    "# Stitch phase 1 UI compliance harness",
    `- Overall: ${passed === total ? "PASS" : "FAIL"}`,
    `- Passed: ${passed}/${total}`,
    "",
    "| Scenario | Status | Evidence | Details |",
    "|---|---|---|---|",
    ...results.map(
      (result) =>
        `| ${result.id} ${result.name} | ${result.passed ? "PASS" : "FAIL"} | ${result.evidence.join(", ")} | ${result.details} |`,
    ),
  ].join("\n");
}

async function main() {
  const { report } = parseArgs(process.argv.slice(2));
  const sources = await loadSources();
  const pkg = JSON.parse(sources.package);
  const pkgText = compact(sources.package);

  const scenarios = [
    scenario(
      "1/10",
      "Light editorial shell tokens are wired through the root shell",
      [FILES.colors, FILES.rootLayout, FILES.tabsLayout, FILES.header],
      () =>
        contains(sources.colors, "shellBackground") &&
        contains(sources.colors, "shellSurface") &&
        contains(sources.rootLayout, "Colors.light.shellBackground") &&
        contains(sources.rootLayout, "headerStyle: { backgroundColor: Colors.light.shellBackground }") &&
        contains(sources.tabsLayout, "const palette = Colors.light;") &&
        contains(sources.header, "backgroundColor: palette.shellBackground") &&
        contains(sources.header, "borderBottomColor: palette.shellBorder"),
    ),
    scenario(
      "2/10",
      "Responsive shell thresholds exist for narrow and wide layouts",
      [FILES.header, FILES.favoritesContainer, FILES.masonry],
      () =>
        contains(sources.header, "const isCompact = width < 390;") &&
        contains(sources.favoritesContainer, "const isDesktop = width >= 720;") &&
        contains(sources.masonry, "width >= 1100") &&
        contains(sources.masonry, "width >= 760") &&
        contains(sources.masonry, "width < 768"),
    ),
    scenario(
      "3/10",
      "Home renders the Stitch-style chip row above the feed",
      [FILES.home, FILES.homeView, FILES.masonry],
      () =>
        contains(sources.home, "<HomeContainer />") &&
        contains(sources.homeView, 'const categories = ["Movies", "TV", "Music", "Books"];') &&
        contains(sources.homeView, "<ScrollView horizontal showsHorizontalScrollIndicator={false}") &&
        contains(sources.homeView, "showLayoutToggle={false}"),
    ),
    scenario(
      "4/10",
      "Home content source and card hierarchy stay unchanged",
      [FILES.homeContainer],
      () =>
        contains(sources.homeContainer, "queryOptions.movies.random") &&
        contains(sources.homeContainer, "item.primaryImage?.url") &&
        contains(sources.homeContainer, "item.primaryTitle") &&
        contains(sources.homeContainer, 'item.type?.toLowerCase().includes("tv")') &&
        contains(sources.homeContainer, 'mediaType: (item.type?.toLowerCase().includes("tv")'),
    ),
    scenario(
      "5/10",
      "Favorites keeps the content-first shell and visual filters",
      [FILES.favorites, FILES.favoritesView],
      () =>
        contains(sources.favorites, "<FavoritesContainer />") &&
        contains(sources.favoritesView, "Curator") &&
        contains(sources.favoritesView, "My Favorites") &&
        contains(sources.favoritesView, "showLayoutToggle={false}") &&
        contains(sources.favoritesView, "position: \"absolute\"") &&
        contains(sources.favoritesView, "backgroundColor: palette.shellFabBackground"),
    ),
    scenario(
      "6/10",
      "Favorites content, add flow, and backup controls remain available",
      [FILES.favoritesContainer, FILES.favoritesView],
      () =>
        contains(sources.favoritesView, "Add Custom Movie") &&
        contains(sources.favoritesView, "<AddFavoriteForm onSubmit={onSubmitFavorite} />") &&
        contains(sources.favoritesView, "<BackupControls") &&
        contains(sources.favoritesContainer, "onBackup={() => data && backupFavorites(data)}") &&
        contains(sources.favoritesContainer, "onRestore={restoreFavorites}") &&
        contains(sources.favoritesView, "showLayoutToggle={false}"),
    ),
    scenario(
      "7/10",
      "Search stays visible and reachable from the shared shell",
      [FILES.rootLayout, FILES.header, FILES.search, FILES.searchContainer],
      () =>
        contains(sources.rootLayout, "Home: 'home'") &&
        contains(sources.rootLayout, "Favorites: 'favorites'") &&
        contains(sources.rootLayout, "Search: 'search'") &&
        contains(sources.header, 'navigate("Search", { query })') &&
        contains(sources.header, "{renderSearchBar()}") &&
        !contains(sources.header, 'accessibilityLabel="Open search"') &&
        contains(sources.search, "useRoute<RouteProp<RootStackParamList, \"Search\">>()") &&
        contains(sources.search, "<SearchContainer query={query} />") &&
        contains(sources.searchContainer, "queryOptions.movies.all(query)"),
    ),
    scenario(
      "8/10",
      "Favorite add/remove behavior stays intact",
      [FILES.favoritesContainer, FILES.favoriteMutations, FILES.masonryItem],
      () =>
        contains(sources.favoritesContainer, "const { addFavorite, removeFavorite } = useFavoriteMutations();") &&
        contains(sources.favoriteMutations, "queryOptions.movies.favorites") &&
        contains(sources.favoritesContainer, "onAddFavorite={(item)") &&
        contains(sources.favoritesContainer, "onRemoveFavorite={(item) => removeFavorite(item.key)}") &&
        contains(sources.masonryItem, "DoublePress") &&
        contains(sources.masonryItem, "Marked as favorite"),
    ),
    scenario(
      "9/10",
      "Extra Stitch categories stay visual-only",
      [FILES.homeView, FILES.rootLayout, FILES.search],
      () =>
        contains(sources.homeView, 'const categories = ["Movies", "TV", "Music", "Books"];') &&
        !contains(sources.rootLayout, "Music") &&
        !contains(sources.rootLayout, "Books") &&
        !contains(sources.search, "Music") &&
        !contains(sources.search, "Books"),
    ),
    scenario(
      "10/10",
      "Harness docs and dependency policy stay aligned with cmux-browser",
      [FILES.readme, FILES.package],
      () =>
        contains(sources.readme, "cmux-browser") &&
        contains(sources.readme, "npm run verify:stitch-ui-updates-phase1") &&
        contains(sources.readme, "exit code `0`") &&
        contains(sources.readme, "exit code `1`") &&
        contains(sources.readme, "BLOCKED") &&
        Boolean(pkg.scripts && pkg.scripts["verify:stitch-ui-updates-phase1"]) &&
        !pkgText.includes("playwright"),
    ),
  ];

  const results = scenarios.map((definition) => {
    try {
      const passed = Boolean(definition.check());
      return makeResult(
        definition.id,
        definition.name,
        definition.evidence,
        passed,
        passed ? "ok" : "guardrail missing",
      );
    } catch (error) {
      return makeResult(
        definition.id,
        definition.name,
        definition.evidence,
        false,
        error.message,
      );
    }
  });

  const passedCount = results.filter((result) => result.passed).length;
  const total = results.length;
  const overall = passedCount === total ? "PASS" : "FAIL";

  const output = [
    "Stitch phase 1 UI compliance harness",
    `Overall: ${overall}`,
    "",
    ...results.flatMap((result) => [
      `${result.passed ? "PASS" : "FAIL"} ${result.id} ${result.name}`,
      `  Evidence: ${result.evidence.join(", ")}`,
      `  Details: ${result.details}`,
    ]),
    "",
    `Summary: ${passedCount}/${total} scenarios passed`,
  ].join("\n");

  process.stdout.write(`${output}\n`);

  if (report) {
    const reportPath = path.resolve(ROOT, report);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, toMarkdown(results, passedCount, total), "utf8");
  }

  if (passedCount !== total) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(`Stitch phase 1 compliance harness failed: ${error.message}\n`);
  process.exitCode = 1;
});
