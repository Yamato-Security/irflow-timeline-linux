# IRFlow Timeline for Linux

This Linux port is maintained by Yamato Security and is based on
[Renzon Cruz's original IRFlow Timeline](https://github.com/r3nzsec/irflow-timeline).
It exists because the original project did not provide a Linux port or Linux
release packages. Version 1.0.13 supports glibc-based x64 and ARM64 desktop
distributions and was built and validated on Kali Linux ARM64.

## Run

Choose the package matching the output of `uname -m`:

- `x86_64`: use `IRFlow-Timeline-1.0.13-linux-x86_64.AppImage` or the `x64` tarball.
- `aarch64` or `arm64`: use the `arm64` AppImage or tarball.

Download packages and the checksum manifest from this repository's
[GitHub Releases](https://github.com/Yamato-Security/irflow-timeline-linux/releases).

For the AppImage:

```bash
chmod +x IRFlow-Timeline-1.0.13-linux-arm64.AppImage
./IRFlow-Timeline-1.0.13-linux-arm64.AppImage
```

If FUSE is unavailable, use the tarball. The AppImage's
`--appimage-extract-and-run` mode is suitable for a one-off launch, but a second
launch can invalidate the first process's temporary extraction directory on
some AppImage runtimes. For the tarball, extract the complete archive and run
`irflow-timeline` from the extracted directory. Keep `resources`, `locales`, and
the shared libraries beside the executable.

Open evidence from **File > Open**, drag it into the application, or pass one or
more paths on the command line:

```bash
./irflow-timeline '/evidence/timeline 日本語.csv'
```

Only one application instance runs per desktop session. Files passed to a later
invocation are forwarded to the existing window. Settings, temporary databases,
and analysis caches use the current user's XDG application-data directories.
Set `IRFLOW_USER_DATA_DIR` to select an isolated workspace for testing.

Hayabusa 4.1.0 and its offline rules are included. The bmc-tools script is also
included; its RDP bitmap-cache workflow requires `python3` on the host. Internet
access is needed only for online features such as VirusTotal and rule updates.
No automatic application-update feed is configured for these portable builds.

## Rebuild

Install Node.js 22.14 or later, Python 3, and the normal Electron desktop runtime
libraries. From the source checkout:

```bash
npm ci --ignore-scripts
npx patch-package
node node_modules/electron/install.js
npm run dist:linux:arm64
# Or: npm run dist:linux:x64
```

AppImage and tar.gz packages are written under `release/linux/`. The bundling
script pins Hayabusa and bmc-tools, verifies Hayabusa against its publisher's
SHA-256 digest, and records source versions and hashes in
`resources/bundle-manifest.json`. The packaging hook also converts the offline
EVTX message catalog from WAL to rollback-journal mode so it is safely readable
from portable, read-only application media.

## Validation

Run `npm test` for source-level coverage. The packaged ARM64 application is also
tested under Xvfb on Kali Linux to exercise native Electron, SQLite/FTS5, the
sandboxed preload bridge, renderer, worker imports, command-line file opening,
single-instance forwarding, Unicode paths, Hayabusa, bmc-tools discovery, and
offline EVTX parsing/message rendering.
