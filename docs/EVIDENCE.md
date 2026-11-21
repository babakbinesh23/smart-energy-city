# Public-source evidence and maintenance record

Updated 2026-11-21. The information below separates facts that can be inspected from private-product history and unknown adoption metrics.

| Evidence | Verified public location | Limit |
| --- | --- | --- |
| Public repository | [Smart Energy City](https://github.com/babakbinesh23/smart-energy-city) | Created 2026-11-21 |
| Original production code-only snapshot | [v2.5.250 folder](../production/v2.5.250/README.md) | Sanitized; omits media and user data, not a turnkey deployment |
| Source-only release | [v2.5.250-code-only](https://github.com/babakbinesh23/smart-energy-city/releases/tag/v2.5.250-code-only) | Marked prerelease |
| Educational code and runnable independent demo | [src](../src) and [reference demo](https://babakbinesh23.github.io/smart-energy-city/reference/) | Does not reproduce original game |
| Project portal | [GitHub Pages](https://babakbinesh23.github.io/smart-energy-city/) | Link hub, not the production 3D client |
| Automated tests and deployments | [GitHub Actions](https://github.com/babakbinesh23/smart-energy-city/actions) | CI tests reference and reconstructs/checksums production code-only parts; not a full WordPress runtime test |
| License | [MIT](../LICENSE) and [third-party notices](../production/v2.5.250/licenses) | Excludes unpublished media/brand rights |
| Past product development | [Archive version notes](ORIGINAL_ARCHIVE_HISTORY.md) | Earlier private version documentation, not public OSS contributions |

## Unknown or unverified

No external contributors, forks, pull requests, customer adoption, classroom installations, external usage, benchmark results, or download counts are asserted here. Real numbers should come from time-stamped and verifiable sources.

The source archive had 826 ZIP entries. Sensitive visitor records, backup data and separately licensed media are excluded from the code-only public snapshot.

## Outstanding maintenance and security

- Apply and test the administrator-login hardening patch on the live WordPress server; updating GitHub did not do this.
- Audit WordPress permissions, nonce checks, uploads and storage in a staging environment.
- Obtain original editable frontend build sources and lockfile if available.
- Confirm that deployment and code-only split-file restoration work on fresh checkout.
- Continue real community interaction over time rather than fabricating or backdating Git activity.

This record is intended as accurate evidence for project review, **not a claim that the repository is a mature or widely used open-source project**.
