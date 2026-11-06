const base = require("./electron-builder.config.cjs");

// Modified by Yamato Security, 2026-11-06: keep only the target's DuckDB library. The
// packaging scripts run `--linux --x64` or `--linux --arm64` and fetch that architecture's
// @duckdb/node-bindings-linux-* package first (scripts/ensure-duckdb-bindings.cjs).
const linuxArch = process.argv.includes("--arm64") ? "arm64" : "x64";
const DUCKDB_BINDINGS = ["darwin-arm64", "darwin-x64", "linux-arm64", "linux-arm64-musl", "linux-x64", "linux-x64-musl", "win32-arm64", "win32-x64"];
const otherDuckdbBindings = DUCKDB_BINDINGS
  .filter((b) => b !== `linux-${linuxArch}`)
  .map((b) => `!node_modules/@duckdb/node-bindings-${b}{,/**}`);

module.exports = {
  appId: base.appId,
  productName: base.productName,
  artifactName: "IRFlow-Timeline-${version}-linux-${arch}.${ext}",
  // Do not let electron-builder infer the original upstream GitHub repository
  // as an update feed. Explicit IRFLOW/TLE_UPDATE_BASE_URL configuration still
  // flows through from the base configuration.
  publish: base.publish ?? null,
  files: [...base.files, "!node_modules/@ts-evtx/messages/assets/**", ...otherDuckdbBindings],
  asarUnpack: base.asarUnpack,
  extraResources: [
    { from: "linux-vendor/${arch}/hayabusa", to: "hayabusa" },
    { from: "linux-vendor/${arch}/tools", to: "tools" },
    { from: "linux-vendor/${arch}/bundle-manifest.json", to: "bundle-manifest.json" },
    { from: "node_modules/@ts-evtx/messages/assets/merged-messages.db", to: "messages/merged-messages.db" },
  ],
  extraFiles: ["LICENSE", "LINUX.md"],
  afterPack: "scripts/prepare-linux-package.cjs",
  // better-sqlite3 13 includes Node-API prebuilds for glibc x64 and ARM64.
  // Rebuilding on one host would replace them with only the host architecture.
  npmRebuild: false,
  linux: {
    target: ["AppImage", "tar.gz"],
    executableName: "irflow-timeline",
    syncDesktopName: true,
    icon: "assets/icon.png",
    category: "Utility",
    synopsis: "DuckDB-backed DFIR timeline analysis",
    description: "Import and investigate EVTX, CSV, TSV, XLSX, Plaso, NTFS, triage, and AI-assistant artifacts.",
  },
  // The legacy AppImage target otherwise places --no-sandbox in its desktop
  // entry unconditionally. AppRun still detects hosts without user namespaces
  // and applies its compatibility fallback only when it is actually required.
  appImage: { executableArgs: [] },
  directories: { output: "release/linux" },
};
