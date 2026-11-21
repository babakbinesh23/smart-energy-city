# Actual Bargheto Smart Energy City v2.5.250 — code-only source

This folder contains the **real author's WordPress plugin code** extracted from the original 2.5.250 archive. It is **not** the simplified Three.js sample shown on GitHub Pages.

### Included
- WordPress PHP plugin entrypoint (`bargheto-city.php`) and backend modules
- Real compiled frontend Three.js JavaScript and WebXR integration
- Babylon.js office scripts, editor code, and source HTML
- Versioned tools, module metadata, attribution and third-party license notices
- A security hardening change to `multiplayer.php` that removes a fixed administrator password

### Excluded
- Visitor snapshots and customer data, database state, portable-data backups
- GLB models, audio, video, textures, font binaries and assets without independently confirmed redistribution rights
- Credentials, private host IP addresses and other production configuration

### Restore three large original files

For transport, three large files were published as checked text parts rather than single blobs:
- `game/dist/assets/index-2.5.250.js` (11 parts)
- `office/source-v22.html` (4 parts)
- `office/xr-babylon-8.46.2.js` (4 parts)

From the repository root, run:

```bash
node production/v2.5.250/restore-split-files.mjs
```

The restore script checks SHA-256 hashes before writing reconstructed files. No network access is needed for this step.

### Runtime and security boundaries

This plugin is dependent on **WordPress**, its AJAX endpoints, dynamically injected asset configuration, appropriate media and saved layouts. It **cannot** run as the full product on static GitHub Pages. See [the actual hosted experience](https://www.bodara.ir/barghetocity/).

**Important:** The old production ZIP had a fixed administrator credential in `multiplayer.php`. The public code removes it and requires a logged-in WordPress administrator or a configured password hash. **Updating GitHub does not fix the currently deployed website.** Do not install this source directly without a staging test and a comprehensive WordPress security review.

### Build/source provenance

The supplied original ZIP contains distributed frontend bundles but not the complete independent editable source and lockfile used to build those bundles. Consequently, **this is actual production code as delivered, not a fully reproducible development source tree or full-media product release**.

### Licensing

Owner-authored source code: MIT per this repository. Bundled third-party materials retain their own terms in `licenses/` (including Apache and Creative Commons notices). These terms do not grant rights to separately stored brand media, models or audio.

### Public-maintenance honesty

The source archive contains actual private product version notes predating this repository. They are **not** evidence of historical open-source contributions or downloads.
