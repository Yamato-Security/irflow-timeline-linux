# IRFlow Timeline

![IRFlow Timeline home screen — capability launcher with Process Inspector, Lateral Movement, Persistence, Sigma, Collect AI Artifacts, Master File Table, USN Journal, and Open & Explore](assets/IRFlow-Timeline-Home.png)

> [!IMPORTANT]
> This repository is Yamato Security's Linux fork of [Renzon Cruz's original IRFlow Timeline](https://github.com/r3nzsec/irflow-timeline). We created it because the original project did not provide a Linux port or Linux release packages. The application design and the great majority of its functionality come from Renzon's project; the Linux packaging, compatibility work, and validation are maintained here.
>
> It also includes the color schemes from Yamato Security's [macOS fork](https://github.com/Yamato-Security/irflow-timeline-mac): **Dark Mode**, **Light Mode**, **Spring**, **Sakura**, **Summer**, **Autumn**, **Winter** and **Christmas**. Pick one from the toolbar's color-scheme dropdown or **Tools → Color Scheme**; the choice is remembered across launches.

Native forensic timeline analysis for glibc-based Linux distributions on x64 and ARM64. Import, search, and investigate EVTX, CSV, TSV, XLSX, Plaso, `$MFT`, `$J`, triage collections, and local AI-assistant artifacts. IRFlow Timeline uses Electron and DuckDB to keep multi-million-row investigations responsive.

## Timeline Explorer-style workflow, with more DFIR capabilities

IRFlow Timeline keeps the familiar parts of Eric Zimmerman's Timeline Explorer—fast tabular review, sorting, filtering, searching, column management, bookmarks, and export—but goes substantially beyond a timeline grid:

- **Direct evidence ingestion** — Open raw EVTX, raw NTFS `$MFT` and `$UsnJrnl` (`$J`), Plaso databases, CSV, TSV, and XLSX without first converting everything to a common CSV.
- **Built-in investigation views** — Process trees, lateral-movement graphs, RDP session reconstruction, persistence analysis, timestomping detection, ransomware-impact analysis, IOC review, and file-activity heatmaps.
- **Detection and enrichment** — Run bundled Hayabusa/Sigma rules against EVTX and enrich indicators through VirusTotal with local caching.
- **Cross-source analysis** — Work with multiple evidence tabs, correlate related telemetry, compare timelines, group events, and pivot between findings and source rows.
- **Large-dataset performance** — DuckDB-backed imports (columnar, compressed, queried on every CPU core), streaming parsers, and virtualized grids support timelines containing millions of rows.
- **Windows artifact workflows** — KAPE/triage discovery, VHDX artifact extraction, RDP bitmap-cache recovery with bundled bmc-tools and Python, and offline EVTX message rendering.
- **AI application forensics** — Collect and normalize histories from Claude Code, Codex, ChatGPT, Gemini CLI, Cursor, Copilot, Windsurf, Continue, and other supported assistants, including secret/token exposure checks.
- **Analyst reporting** — Tags, bookmarks, saved sessions, filtered exports, evidence provenance, and HTML/PDF reporting from analyzer results.

### Key Features

- **AI Artifacts** — Collect local AI history from Claude Code, Codex, Grok Build, ChatGPT Desktop, Gemini CLI, Cursor, Copilot, Windsurf, and Continue into one timeline tab; **ChatGPT Computer History** for macOS interaction telemetry; **AI Secret Hunt** for exposed keys, tokens, and credentials
- **Raw NTFS Artifact Import** — Direct ingestion of `$MFT` and `$UsnJrnl` (`$J`) with full path reconstruction, SI/FN timestamps, and change reason mapping
- **Ransomware Analytics** — Automated impact analysis from `$MFT` data: bulk rename detection, entropy-based extension analysis, ransom note identification, and temporal clustering
- **VirusTotal Enrichment** — IOC matching with bulk VT lookups, malware family extraction, verdict badges, relationship pivoting, and local caching
- **Process Inspector** — Parent-child process tree analysis with 340+ MITRE ATT&CK detection rules
- **Lateral Movement Tracker** — Network logon and RDP session visualization as interactive force-directed graphs
- **RDP Bitmap Cache Recovery** — Recover `bcache*.bmc` and `cache????.bin` artifacts with bundled bmc-tools, preview images, and export evidence packages
- **Persistence Analyzer** — 30+ persistence techniques with account chain detection, cross-technique correlation, and PowerShell 4104 script block reassembly
- **IOC Matching** — 17+ indicator categories with auto-defanging, inline highlighting, CSV/HTML export with VT enrichment data

For the upstream feature documentation, visit the **[original IRFlow Timeline documentation](https://r3nzsec.github.io/irflow-timeline/)**. Linux package and runtime instructions are in [LINUX.md](LINUX.md).

## Building from Source

**Prerequisites (for developers only):**
- A glibc-based Linux desktop
- Node.js 22.14 or later
- An x64 or ARM64 system matching the build you want to run

```bash
git clone https://github.com/Yamato-Security/irflow-timeline-linux.git
cd irflow-timeline-linux
npm ci --ignore-scripts
npx patch-package
node node_modules/electron/install.js

# Development (hot-reload)
npm run dev

# Build + launch
npm run start

# Linux ARM64 AppImage + tar.gz
npm run dist:linux:arm64
# Or, for Intel/AMD Linux
npm run dist:linux:x64
```

Linux packages are written under `release/linux/`. Both AppImage and tar.gz packages bundle Hayabusa, its offline rules, and bmc-tools. The optional RDP bitmap-cache workflow uses the host's `python3`. The release packages are unsigned and intentionally do not inherit the original repository's automatic-update feed.

## Credits & Acknowledgments

This Linux port is based on [IRFlow Timeline](https://github.com/r3nzsec/irflow-timeline), created by [Renzon Cruz](https://github.com/r3nzsec). IRFlow Timeline was inspired by [Eric Zimmerman's Timeline Explorer](https://ericzimmerman.github.io/).

### Open Source Projects

| Project | Usage | Link |
|---------|-------|------|
| **Electron** | Application framework | [electron/electron](https://github.com/electron/electron) |
| **DuckDB** | Columnar engine that stores and queries the timeline tabs | [duckdb/duckdb-node-neo](https://github.com/duckdb/duckdb-node-neo) |
| **better-sqlite3** | Reads SQLite evidence (Plaso, browser and AI app databases), Sigma scan results and the VirusTotal cache | [WiseLibs/better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| **@ts-evtx/core** | Native Windows EVTX event log parsing | [NickSmet/ts-evtx](https://github.com/NickSmet/ts-evtx) |
| **Plaso (log2timeline)** | Forensic timeline generation (we import Plaso SQLite output) | [log2timeline/plaso](https://github.com/log2timeline/plaso) |
| **ExcelJS** | XLSX streaming reader | [exceljs/exceljs](https://github.com/exceljs/exceljs) |
| **SheetJS (xlsx)** | XLSX parsing | [SheetJS/sheetjs](https://github.com/SheetJS/sheetjs) |
| **csv-parser** | CSV/TSV streaming parser | [mafintosh/csv-parser](https://github.com/mafintosh/csv-parser) |
| **React** | UI rendering | [facebook/react](https://github.com/facebook/react) |
| **Vite** | Build tooling and hot-reload | [vitejs/vite](https://github.com/vitejs/vite) |
| **VitePress** | Documentation site | [vuejs/vitepress](https://github.com/vuejs/vitepress) |
| **electron-builder** | Linux and macOS application packaging | [electron-userland/electron-builder](https://github.com/electron-userland/electron-builder) |
| **Hayabusa** | Sigma-based Windows event-log detection | [Yamato-Security/hayabusa](https://github.com/Yamato-Security/hayabusa) |
| **bmc-tools** | RDP Bitmap Cache recovery | [ANSSI-FR/bmc-tools](https://github.com/ANSSI-FR/bmc-tools) |

### DFIR Community

- [Eric Zimmerman](https://ericzimmerman.github.io/) -- Timeline Explorer for Windows, the original inspiration for this project
- [log2timeline/Plaso](https://github.com/log2timeline/plaso) -- Super timeline generation framework by Kristinn Gudjonsson and contributors
- [SANS DFIR](https://www.sans.org/digital-forensics-incident-response/) -- DFIR training and community resources
- [The DFIR Report](https://thedfirreport.com/) -- Real-world intrusion analysis reports that informed threat detection patterns
- [CyberCX](https://cybercx.com.au/blog/ntfs-usnjrnl-rewind/) -- NTFS $UsnJrnl research that informed $J parsing implementation

### Beta Testers

Thanks to the following people for testing and providing feedback:

- [Maddy Keller](https://www.linkedin.com/in/madeleinekeller98/)
- [Omar Jbari](https://www.linkedin.com/in/jbariomar/)
- [Nicolas Bareil](https://www.linkedin.com/in/nbareil/)
- [Dominic Rathmann](https://www.linkedin.com/in/dominic-rathmann-77664323b/)
- [Chip Riley](https://www.linkedin.com/in/criley4640/)

## License

Apache-2.0
