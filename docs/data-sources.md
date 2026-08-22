# Data Sources

## Bundled Demo / Synthetic Data

### Personal finance demo
- synthetic transaction CSV generated for educational use

### Demo market fundamentals
- bundled demo company snapshot values for offline exploration
- clearly labeled as demo data inside the UI

### ML dataset
- synthetic risk-style classification data generated for educational purposes

## Public Data Snapshots / Providers

### World Bank Open Data
Used for India-focused macro indicators such as:
- GDP growth
- inflation
- unemployment
- exports/imports share of GDP
- FDI share of GDP
- government spending share of GDP
- exchange rate
- lending rate
- manufacturing share

### Yahoo Finance chart endpoint
Used for optional price-history retrieval and recent market price fields through the market provider abstraction.

## Caveats

- bundled snapshots can go stale
- public sources can revise historical data
- demo mode must never be presented as live advice-quality information
