"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const { extract } = require("@electron-internal/extract-zip");

const arch = process.argv[2] || process.arch;
if (!["x64", "arm64"].includes(arch)) {
  throw new Error("Usage: node scripts/bundle-linux-tools.cjs [x64|arm64]");
}

const root = path.resolve(__dirname, "..", "linux-vendor", arch);
const hayabusa = {
  x64: {
    name: "hayabusa-4.1.0-lin-x64-gnu.zip",
    sha256: "ed2c4595f95b8e765d37f392212587304ce89ed7cfb6682b425a96d126ed67eb",
  },
  arm64: {
    name: "hayabusa-4.1.0-lin-aarch64-gnu.zip",
    sha256: "9a112ed5ead6850c0f7f1b2a18b2c9c71c6eddc469cc2e1a31f5ed1170afa628",
  },
}[arch];
const bmcCommit = "5a4cad32be78b3b874aeec910cb478e04ba3501e";

async function download(url) {
  console.log(`Downloading ${url}`);
  const response = await fetch(url, { signal: AbortSignal.timeout(180000) });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

function digest(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

async function findHayabusaBinary(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const nested = await findHayabusaBinary(fullPath);
      if (nested) return nested;
    } else if (entry.isFile() && /^hayabusa(?:-|$)/i.test(entry.name) && !/\.(zip|txt|md|ya?ml|json|css|png|jpg)$/i.test(entry.name)) {
      if ((await fs.stat(fullPath)).size > 1_000_000) return fullPath;
    }
  }
  return null;
}

async function preparedBundleIsCurrent(manifestPath) {
  try {
    const previous = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    if (previous.platform !== "linux" || previous.arch !== arch
      || previous.hayabusa.sha256 !== hayabusa.sha256 || previous.bmcCommit !== bmcCommit) return false;
    for (const file of ["hayabusa/hayabusa", "hayabusa/rules", "tools/bmc-tools/bmc-tools.py"]) {
      await fs.access(path.join(root, file));
    }
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const manifestPath = path.join(root, "bundle-manifest.json");
  if (await preparedBundleIsCurrent(manifestPath)) {
    console.log(`Using prepared Linux ${arch} tools at ${root}`);
    return;
  }

  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "irflow-linux-tools-"));
  try {
    await fs.rm(root, { recursive: true, force: true });
    await fs.mkdir(root, { recursive: true });

    const hayabusaUrl = `https://github.com/Yamato-Security/hayabusa/releases/download/v4.1.0/${hayabusa.name}`;
    const hayabusaBytes = await download(hayabusaUrl);
    const actualHayabusaSha256 = digest(hayabusaBytes);
    if (actualHayabusaSha256 !== hayabusa.sha256) {
      throw new Error(`Hayabusa SHA-256 mismatch: expected ${hayabusa.sha256}, got ${actualHayabusaSha256}`);
    }
    const hayabusaZip = path.join(temp, hayabusa.name);
    await fs.writeFile(hayabusaZip, hayabusaBytes);
    const hayabusaRoot = path.join(root, "hayabusa");
    await extract(hayabusaZip, { dir: hayabusaRoot });
    const bundledBinary = await findHayabusaBinary(hayabusaRoot);
    if (!bundledBinary) throw new Error("Hayabusa executable absent from archive");
    const finalBinary = path.join(hayabusaRoot, "hayabusa");
    if (bundledBinary !== finalBinary) await fs.rename(bundledBinary, finalBinary);
    await fs.chmod(finalBinary, 0o755);

    const bmcRoot = path.join(root, "tools", "bmc-tools");
    await fs.mkdir(bmcRoot, { recursive: true });
    const bmcFiles = {};
    for (const name of ["bmc-tools.py", "README.md", "LICENCE.txt"]) {
      const bytes = await download(`https://raw.githubusercontent.com/ANSSI-FR/bmc-tools/${bmcCommit}/${name}`);
      await fs.writeFile(path.join(bmcRoot, name), bytes);
      bmcFiles[name] = digest(bytes);
    }
    await fs.chmod(path.join(bmcRoot, "bmc-tools.py"), 0o755);

    await fs.writeFile(manifestPath, JSON.stringify({
      platform: "linux",
      arch,
      hayabusa: { version: "4.1.0", url: hayabusaUrl, sha256: hayabusa.sha256 },
      bmcCommit,
      bmcFiles,
    }, null, 2) + "\n");
    console.log(`Prepared Linux ${arch} tools at ${root}`);
  } finally {
    await fs.rm(temp, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
