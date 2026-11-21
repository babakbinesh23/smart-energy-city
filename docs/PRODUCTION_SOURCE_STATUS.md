# Original v2.5.250 Source — Publication Status

**Status: PRIVATE REVIEW CANDIDATE. The full production project is NOT public open source.**

## What was examined

The owner-provided WordPress ZIP for Bargheto Smart Energy City v2.5.250 contained **826 ZIP entries**, including the plugin's PHP backend, generated JavaScript frontend, separate Babylon office runtime, historical notes, media, and visitor snapshots.

An offline **sanitized, code-only review candidate** has been prepared from the provided archive. It contains **513 code/documentation files** and excludes visitor snapshots and externally sourced 3D/audio/video/image assets. A limited scan found three private IPv4 literals in distributed JS; these were replaced with loopback placeholders *inside the offline candidate*. Its validation completed with **20 PHP syntax checks and 443 JavaScript syntax checks passing**. These checks do not constitute a complete security audit.

## Relevant actual architecture

- `bargheto-city.php`: WordPress plugin entry and registration of the `/barghetocity/` route
- `visitors.php`: WordPress visitor handling code (different from saved visitors' records)
- `game/dist/index.html`: frontend bootstrapping with versioned startup and main script
- `game/dist/assets/index-2.5.250.js`: actual large **prebuilt distribution**, not the complete editable original frontend source tree
- `office/`: office frontend and Babylon-based/XR runtime
- `multiplayer.php`, `layout-editor.php`, `moderation.php`, `media-manager.php`: WordPress integration modules
- `portable-data/` inside the original archive: contains saved state and visitor records — excluded from the private code-only candidate and must not be committed

## Why this cannot simply be published as-is

1. **Source ownership:** authorization is needed from the relevant rights holder for production source, trademarks and brand assets; no MIT license can be assigned to third-party/company code by assumption.
2. **Privacy:** saved visitor records include phone-number fields, and backed-up application state must not be uploaded.
3. **Media licensing:** provenance records include CC BY-NC items and media whose redistribution license was not established.
4. **Build provenance:** the main frontend is a compiled/prebuilt distribution; the supplied ZIP does not establish a reproducible original source build. Publishing the bundle is not equivalent to publishing fully editable source code.
5. **Runtime:** the product expects WordPress URL injection, AJAX/backend services, saved layouts, model/voice assets, and server configuration. GitHub Pages serves static files and cannot itself run the complete PHP-dependent system.
6. **Security:** text pattern scans and syntax checks cannot certify the application as secure; WordPress permissions/nonces and stored data require separate review.

## Responsible release plan

- [x] Inspect the exact provided production ZIP, excluding PII and media in an offline review candidate
- [x] Create a truthful inventory of actual product modules and original archived release notes
- [x] Preserve separate functioning public educational reference code and its CI
- [ ] Confirm written production-code ownership/publication rights
- [ ] Obtain the original editable frontend source and build instructions, or clearly label any released distribution as prebuilt
- [ ] Independently review WordPress endpoint authorization, secrets and privacy
- [ ] Create a per-asset redistribution/license manifest
- [ ] Publish only the authorized, sanitized portion under its true license
- [ ] Verify deployment and runtime interactions with actual media and backend

**Do not copy the full 194 MiB archive into the public repo.** For questions about a future open-source core, use the GitHub issues to track actual review and approvals.

Current public reference: [Smart Energy City](../README.md). Actual hosted product: https://www.bodara.ir/barghetocity/.
