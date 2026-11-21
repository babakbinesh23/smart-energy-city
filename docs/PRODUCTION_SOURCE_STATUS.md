# Actual Smart Energy City v2.5.250 — code-only publication

**Status: Public code-only source, not the full deployable production experience.**

The owner confirmed being the author and having authority to publish the original project code. Based on the user-supplied version 2.5.250 ZIP, a sanitized code-only copy is now in [production/v2.5.250](../production/v2.5.250/README.md).

## Contents verified during preparation

- Original archive: 826 entries, including WordPress PHP, distributed JS, Babylon office runtime, models/media, and saved visitor data.
- Public code-only directory: 512 source/documentation/license files excluding visitor data, databases, models/media and font binaries.
- Syntax checks: 20 PHP and 443 JavaScript files passed.
- Limited known-pattern scan: no remaining recognized hardcoded API keys, Iranian mobile literals or private IP addresses in the prepared files.
- Fixed hardcoded admin password: public `multiplayer.php` requires configured password hash or WordPress admin login.
- Three large source files are published as SHA-256-verifiable text fragments and must be reconstructed with `restore-split-files.mjs`.

## Limits

- This was **not a full penetration test or rights audit for every embedded vendor module**.
- Some frontend code is a prebuilt distribution rather than its original editable development source with a reproducible lockfile.
- The original game still depends on WordPress, media, saved layout/configuration and appropriate backend services. GitHub Pages continues to host the separate simple educational reference.
- The production website has **not** received the security patch automatically. [Important hardening note](SECURITY_HARDENING_FA.md).
- Original version notes are private historical development evidence, not a record of public Git commits.
- Third-party attribution/license notices are included; models/audio/fonts were not redistributed.

## Open work

- [x] Confirm user's authorship and authorization to publish original source code
- [x] Publish code-only sanitized source with attribution notices
- [x] Remove one fixed administrator credential in the published copy
- [x] Provide checksummed restoration script for large source files
- [ ] Patch and verify the actual WordPress deployment; expire old admin sessions
- [ ] Audit WordPress authorization, nonces, storage and upload endpoints
- [ ] Recover the original editable frontend source & reproducible build toolchain
- [ ] Review each third-party/vendor dependency and media license before releasing media
- [ ] Collect real public OSS usage and community feedback; never fabricate it
