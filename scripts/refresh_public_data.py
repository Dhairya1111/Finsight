from __future__ import annotations

"""Refresh bundled macroeconomic snapshot data from public World Bank endpoints."""

import json
from pathlib import Path
from urllib.request import urlopen

INDICATORS = {
    'gdp_growth': ('NY.GDP.MKTP.KD.ZG', 'GDP growth', '%', 'Annual'),
    'cpi_inflation': ('FP.CPI.TOTL.ZG', 'CPI inflation', '%', 'Annual'),
    'unemployment': ('SL.UEM.TOTL.ZS', 'Unemployment', '% of labor force', 'Annual'),
    'fdi_gdp': ('BX.KLT.DINV.WD.GD.ZS', 'FDI net inflows', '% of GDP', 'Annual'),
    'exports_gdp': ('NE.EXP.GNFS.ZS', 'Exports', '% of GDP', 'Annual'),
    'imports_gdp': ('NE.IMP.GNFS.ZS', 'Imports', '% of GDP', 'Annual'),
    'gov_spending_gdp': ('NE.CON.GOVT.ZS', 'Government spending', '% of GDP', 'Annual'),
    'exchange_rate': ('PA.NUS.FCRF', 'Exchange rate', 'INR per USD (period average)', 'Annual'),
    'lending_rate': ('FR.INR.LEND', 'Lending interest rate', '%', 'Annual'),
    'manufacturing_share': ('NV.IND.MANF.ZS', 'Manufacturing value added', '% of GDP', 'Annual'),
}


def fetch_world_bank(code: str):
    url = f'https://api.worldbank.org/v2/country/IND/indicator/{code}?format=json&per_page=80'
    meta, entries = json.loads(urlopen(url, timeout=30).read().decode())
    series = [
        {'date': item['date'], 'value': float(item['value'])}
        for item in entries
        if item['value'] is not None
    ]
    series.sort(key=lambda point: point['date'])
    return meta['lastupdated'], series


def main() -> None:
    payload = {}
    for key, (code, label, units, frequency) in INDICATORS.items():
        last_updated, series = fetch_world_bank(code)
        payload[key] = {
            'id': key,
            'code': code,
            'label': label,
            'country': 'India',
            'source': 'World Bank Open Data',
            'source_url': f'https://data.worldbank.org/indicator/{code}?locations=IN',
            'units': units,
            'frequency': frequency,
            'last_updated': last_updated,
            'series': series,
        }
    out_path = Path(__file__).resolve().parents[1] / 'data' / 'sample' / 'economic_indicators_india.json'
    out_path.write_text(json.dumps(payload, indent=2))
    print(f'Wrote {out_path}')


if __name__ == '__main__':
    main()
