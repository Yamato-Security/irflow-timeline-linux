"use strict";

const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

module.exports = async function prepareLinuxPackage(context) {
  if (context.electronPlatformName !== "linux") return;

  const resourcesPath = path.join(context.appOutDir, "resources");
  const databasePath = path.join(resourcesPath, "messages", "merged-messages.db");
  const database = new Database(databasePath);
  try {
    // The dependency publishes the catalog in WAL mode. Portable packages must
    // not depend on writable sidecars beside their read-only application files.
    database.pragma("wal_checkpoint(TRUNCATE)");
    const mode = database.pragma("journal_mode = DELETE", { simple: true });
    if (String(mode).toLowerCase() !== "delete") {
      throw new Error(`Could not normalize EVTX message catalog journal mode: ${mode}`);
    }
  } finally {
    database.close();
  }

  for (const suffix of ["-wal", "-shm"]) fs.rmSync(`${databasePath}${suffix}`, { force: true });
  for (const executable of [
    path.join(resourcesPath, "hayabusa", "hayabusa"),
    path.join(resourcesPath, "tools", "bmc-tools", "bmc-tools.py"),
  ]) {
    fs.chmodSync(executable, 0o755);
  }
}
