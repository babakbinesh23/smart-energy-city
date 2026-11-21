# VPP 2.5.81

Implementation: game/dist/assets/vpp-2.5.81.js. Engine and inventory/wayfinding helpers are separate modules. The 2.5.77 entry re-exports the current implementation. Configuration remains game/dist/vpp-config.json.

## Inventory and simulation

Each house's ratedKW is its active canonical roof instance count times 0.620. Zero-scale deleted instances, deleted buildings and auxiliary spatial/shadow copies are excluded. Arbitrary configured ratedKW values are no longer used. Inventory and layout refresh once per real second.

Production is an educational 06:00–18:00 sine profile with rated power as its noon maximum. Energy is integrated from session start, not invented for earlier hours. Midnight wraps and resets daily recorded energy. This is not weather or meter telemetry.

Distance, flight and the editor no longer stop the model. Real frame gaps are accounted for, with at most one day of catch-up per update. Explicit game/tour pause stops scenario time. State remains local to the open browser session: reload persistence and an always-running server are outside this version.

The solar-field BESS is informational and excluded from this VPP portfolio's balance. A preview uses a copy and changes no shared BESS state. Offers, sales, prices and settlement remain educational and perform no external transactions.

## Input adapter

Wait for window.barghetoVPP; it is exposed only after scene readiness. Existing setTelemetry(payload) and the bargheto:vpp-telemetry event remain supported. Supply all three house IDs with Boolean connected, nonnegative finite powerKW and optional measured energyKWh. Supply localLoadKW and battery capacityKWh, soc and powerKW. Positive terminal battery power means discharge, negative means charge. Optional battery.inPortfolio=false excludes that battery from the VPP balance; omitted/true means an explicitly supplied portfolio battery. Invalid numeric market fields are rejected. The adapter does not fetch, authenticate or verify meter data.

snapshot() additionally exposes houses with moduleCount, moduleWatts, ratedKW, connected, powerKW and energyKWh. In input-data mode, supplied readings remain authoritative; inventory refresh does not overwrite them.

## Scene

Permanent floor wayfinding marks the entry, three plants, center and market. Main visuals remain visible from nearby flight views and in the editor. Distant visual culling does not stop accounting. Cyan means information; green is an educational existing-grid route. The battery information link and tour target follow the battery's current world position.
