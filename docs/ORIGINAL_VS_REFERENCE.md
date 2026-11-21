# Real product vs. public reference

- **Original production game:** https://www.bodara.ir/barghetocity/ (WordPress-hosted, original version 2.5.250).
- **Separate lightweight reference demo:** https://babakbinesh23.github.io/smart-energy-city/reference/
- **GitHub Pages homepage:** project portal and launch page, not the original 3D renderer.
- **Original archive inspected:** `Bargheto-City-Full-2.5.250-2026-11-21-124746.zip`.

The production plugin loads `game/dist/index.html` and `assets/index-2.5.250.js` and injects WordPress AJAX, assets, layouts and multiplayer/office configuration dynamically. A simple static copy cannot reproduce the production game.

The original archive also includes visitor records, GLBs with third-party licenses (including CC BY-NC), audio of unverified redistribution rights, and private server settings. Those files must **not** be uploaded to a public repository without a rights, privacy and security audit. The current MIT license applies only to the independent educational reference code.

**Status:** The real URL was reachable and displayed the original loading page at inspection, but full WebGL rendering was not independently tested.
