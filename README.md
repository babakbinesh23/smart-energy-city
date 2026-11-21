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

> **Important distinction:** This public repository is a new, self-contained **educational reference demo** inspired by the scope of the Bargheto Smart Energy City project. It is **not** the private production WordPress plugin, its original bundled Three.js build, its proprietary GLB models, customer records, or company-owned media. The production archive `Bargheto-City-Full-2.5.250-2026-11-21-124746.zip` was reviewed for publication; those production materials were intentionally not uploaded here.

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

The source archive provided for review was version **2.5.250**. It included a built JavaScript distribution, PHP plugin code, a Babylon.js office, media files, restoration backups, and saved visitor information. We deliberately kept the public educational demo separate while media and company code ownership are reviewed. See [Publication audit](docs/PUBLICATION_AUDIT.md).

## Project status

This is an **early-stage** open-source reference, not an established or widely adopted OSS project. We do **not** claim outside contributors, production deployments, GitHub stars, or download statistics. Contributions and technical review are welcome; see [Contributing](CONTRIBUTING.md).

## Open-source boundaries and licensing

The files in this repository's reference demo are MIT-licensed under [LICENSE](LICENSE). External trademarks and the original Bargheto production source/media are **not** part of this license or public repository. Any future publication of production assets requires the rights holder's approval and third-party asset-license checks.

## Maintainer

GitHub: [@babakbinesh23](https://github.com/babakbinesh23)

## Online reference demo & public release

- **Original game on Bargheto:** [Open actual version 2.5.250](https://www.bodara.ir/barghetocity/)
- **Reference demo:** [Simple Three.js teaching example](https://babakbinesh23.github.io/smart-energy-city/reference/)
- **GitHub Pages:** [Project portal](https://babakbinesh23.github.io/smart-energy-city/)
- **Releases:** [v0.1.0 public reference release](https://github.com/babakbinesh23/smart-energy-city/releases/tag/v0.1.0) *(requires the automated release workflow to succeed)*
- **Documentation:** [فارسی: Installation](docs/INSTALL_FA.md) · [فارسی: Contributing](docs/CONTRIBUTING_FA.md) · [Deployment instructions](docs/DEMO_SETUP_FA.md) · [Evidence](docs/EVIDENCE.md) · [Release notes](docs/RELEASE_NOTES_v0.1.0.md)

The live demo and release represent the standalone MIT-licensed **public reference**, not production version 2.5.250. Real project adoption statistics are not claimed.
