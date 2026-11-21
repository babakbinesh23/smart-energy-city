# Release packaging

Build deliverable ZIPs with `python tools/package_release.py /absolute/output.zip`.
The packager must pass before delivery. Keep exactly one current versioned main
bundle and startup script; remove historical entry files only after checking
surviving runtime references. Older supporting modules may still be required by
current imports: do not delete them by version number alone.

Preserve media manifests, saved-data inputs, licenses and current runtime modules.
Do not put earlier ZIPs inside the plugin. Update plugin, entry HTML and report
version metadata together. Run the Node module-link check after entry changes.
