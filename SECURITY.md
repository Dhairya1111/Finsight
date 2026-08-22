# Security Policy

## Supported Versions

FinSight is currently maintained as a portfolio/demo project. The latest `main` branch is the supported version.

## Reporting a Vulnerability

Please do **not** open public issues for sensitive security reports.

Instead:
1. describe the issue privately to the maintainer
2. include reproduction steps
3. include impact assessment if possible

## Security Expectations in This Repository

- no secrets should be committed
- API keys must be supplied via environment variables
- uploaded CSVs must be validated and size-limited
- internal stack traces should not be shown to end users
