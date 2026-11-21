# Smart Energy City — Interactive 3D Energy Education

**Important: The screenshot of a simplified city was NOT the original Bargheto game.** We corrected this distinction.

- [Enter the **real WordPress-hosted Smart Energy City**](https://www.bodara.ir/barghetocity/)
- [GitHub Pages **project portal**](https://babakbinesh23.github.io/smart-energy-city/)
- [Separate **lightweight educational reference**](https://babakbinesh23.github.io/smart-energy-city/reference/)
- [Differences and deployment dependencies](docs/ORIGINAL_VS_REFERENCE.md)


![Status](https://img.shields.io/badge/status-early%20open--source%20reference-118a84)
![Three.js](https://img.shields.io/badge/3D-Three.js-1e5e72)
![License](https://img.shields.io/badge/reference%20code-MIT-blue)

**Smart Energy City** is a browser-based, interactive 3D reference project that helps explain energy systems through user-controlled experiments rather than static diagrams.

> **Two clearly separated components:** The simple standalone educational reference remains under `src/` and `/reference/`. The **real sanitized code-only WordPress plugin v2.5.250** is now published under [`production/v2.5.250/`](production/v2.5.250/README.md) with a hardened administrator login and an optional restoration script for three large distributed files. **Private visitor records, GLB models, media, fonts, original server secrets, and database state remain excluded.** The code-only plugin is not a complete independently deployable version of the live game.


## Real source code (new)

- **[Actual Smart Energy City WordPress source v2.5.250 — code-only](production/v2.5.250/README.md)**
- [دستور بازسازی فایل‌های بزرگ و نصب نسخه کد](production/v2.5.250/README.fa.md)
- [Security hardening required on the **live site**](docs/SECURITY_HARDENING_FA.md)

This source was published with the author's permission and does **not** include the original user data, media or WordPress configuration. The live site is not patched by updating this repository. Large files are stored as checksummed text parts to accommodate publication transport limits.

## What you can do

- Explore a lightweight procedural 3D energy city with selectable districts.
- Change solar capacity and sunlight assumptions to estimate educational PV output.
- Aggregate hypothetical generation from rooftop solar homes.
- Compare electricity use of conventional and higher-efficiency motors.
- Explore a simplified battery state-of-charge and discharge-efficiency model.
- Compare hypothetical industrial electricity supply offers.
- Navigate with mouse/touch, in a Persian RTL interface.

All example inputs are illustrative. The calculations are **not** valid for billing, electricity dispatch, engineering certification, or financial decisions.

## Architecture and technology

| Area | Stack |
|---|---|
| Rendering | Three.js and WebGL |
| UI | Plain JavaScript / RTL CSS |
| Development | Vite |
| Energy models | Independent, testable JavaScript modules |
| Tests | Node.js native test runner |
| 3D media | Procedural shapes only (no proprietary models) |

See [Architecture](docs/ARCHITECTURE.md) and [Roadmap](docs/ROADMAP.md).

## Getting started

Requirements: Node.js 20+.

```bash
npm install
npm run dev
```

Open the localhost URL printed by Vite (usually `http://localhost:5173`).

Run checks:

```bash
npm test
npm run build
```

## Project background

The broader Smart Energy City product is a WordPress-based 3D educational environment featuring a city simulation with interactive topics such as electricity procurement, virtual power plants, rooftop solar, energy efficiency, energy storage, and VR. The production system also contains office and multiplayer components.

The source archive provided for review was version **2.5.250**. It included a built JavaScript distribution, PHP plugin code, a Babylon.js office, media files, restoration backups, and saved visitor information. The public code-only edition of the actual plugin is now published separately under `production/v2.5.250/`; private media and stored user data remain excluded. See [Publication audit](docs/PUBLICATION_AUDIT.md).

## Project status

This is an **early-stage** open-source reference, not an established or widely adopted OSS project. We do **not** claim outside contributors, production deployments, GitHub stars, or download statistics. Contributions and technical review are welcome; see [Contributing](CONTRIBUTING.md).

## Open-source boundaries and licensing

Owner-authored reference and production source code are released under [MIT](LICENSE). Third-party/vendored code retains its respective licenses and notices under `production/v2.5.250/licenses/`. **Media files, fonts, visitor data and trademarks were not redistributed;** no rights are claimed over them. The original game's prebuilt distribution is a code-only artifact, not proof of an independently reproducible development source build.

## Maintainer

GitHub: [@babakbinesh23](https://github.com/babakbinesh23)

## Online reference demo & public release

- **Original game on Bargheto:** [Open actual version 2.5.250](https://www.bodara.ir/barghetocity/)
- **Reference demo:** [Simple Three.js teaching example](https://babakbinesh23.github.io/smart-energy-city/reference/)
- **GitHub Pages:** [Project portal](https://babakbinesh23.github.io/smart-energy-city/)
- **Releases:** [v0.1.0 educational reference](https://github.com/babakbinesh23/smart-energy-city/releases/tag/v0.1.0) · [v2.5.250 code-only source](https://github.com/babakbinesh23/smart-energy-city/releases/tag/v2.5.250-code-only)
- **Documentation:** [فارسی: Installation](docs/INSTALL_FA.md) · [فارسی: Contributing](docs/CONTRIBUTING_FA.md) · [Deployment instructions](docs/DEMO_SETUP_FA.md) · [Evidence](docs/EVIDENCE.md) · [Release notes](docs/RELEASE_NOTES_v0.1.0.md)

The GitHub Pages live demo still represents the standalone **educational reference**, not the real v2.5.250 production application. Real project adoption statistics are not claimed.

## Original project maintenance and source release status

- **Private production history:** [version-notes evidence from 2.5.150–2.5.250](docs/ORIGINAL_ARCHIVE_HISTORY.md) (archive-backed, **not** historical public Git commits).
- **Real-source inventory and publication gates:** [Production source status](docs/PRODUCTION_SOURCE_STATUS.md).
- **Current public maintenance record:** [Maintainer operations](docs/MAINTAINER_OPERATIONS.md) (real issues, CI, release, and honest limitations).

**Do not confuse the code-only v2.5.250 production source with the runnable v0.1.0 educational reference.** The production code is published in a separate folder, but its third-party media, stored data, server and complete original edit/build toolchain are not. Do not claim that this new public repository has years of OSS participation.
