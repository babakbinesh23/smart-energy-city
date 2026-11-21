# Original production city vs. public code-only source vs. separate reference

**Three different surfaces must not be confused:**

| Surface | Link | Description |
| --- | --- | --- |
| Real WordPress-hosted interactive city | https://www.bodara.ir/barghetocity/ | Live production application, relies on the Bargheto server, WordPress and licensed assets |
| Sanitized real code-only v2.5.250 | [production/v2.5.250](../production/v2.5.250/README.md) | Public original plugin code and distributed JS, without user records/media and with an administrator-login hardening patch |
| Independent educational reference | https://babakbinesh23.github.io/smart-energy-city/reference/ | Small runnable Three.js simulator, not the real visual world |
| Project portal | https://babakbinesh23.github.io/smart-energy-city/ | Landing page linking to the original product and the independent reference |

The original archive was `Bargheto-City-Full-2.5.250-2026-11-21-124746.zip`. The published production source uses `game/dist/index.html` and generated JS, with WordPress AJAX, dynamically injected asset URLs, saved layouts, multiplayer and office configuration. Its large distributed files are committed as parts with a checksummed restore script.

**Security and privacy:** The provided original archive contained saved visitor records, some assets with CC BY-NC or other third-party licensing, and audio whose distribution rights were not confirmed. None of those user records or media were included in the published code-only edition. The administrator-password fix in GitHub **has not been applied to the live site**.

The original product loading page was reachable at inspection, but an independent full end-to-end VR/WebGL test was not completed. Do not describe the minimal GitHub Pages reference as a faithful reproduction or the sanitized code-only snapshot as a complete turnkey game.
