# Architecture

- `index.html`: Persian RTL interface and layout
- `src/main.js`: interactive Three.js scene, controls, scenario UI
- `src/energy-model.js`: independently testable educational calculations
- `src/styles.css`: responsive presentation
- `tests/energy-model.test.js`: unit tests

Browser-only reference. No database, user tracking, or API keys.

Calculations:
- PV: capacity (kW) × equivalent sun hours/day × days × performance ratio
- Aggregation: sum of example site energy readings (kWh)
- Motor: power (W) × operating hours ÷ 1000
- Storage: nominal capacity × useful state-of-charge window × efficiency

Real installations need engineering validation, dynamic profiles and contractual details not represented in this demo.
