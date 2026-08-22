# FinSight Architecture

## Overview

FinSight uses a monorepo structure with separate frontend and backend applications plus shared demo/public datasets.

## Backend layers

1. **API routes** — FastAPI endpoints with request/response schemas
2. **Analytics layer** — reusable finance, scenario, and ML functions
3. **Provider layer** — market, economics, and AI abstractions
4. **Data layer** — bundled sample files and SQLAlchemy models

## Frontend layers

1. **Pages** — route-level feature workspaces
2. **Components** — reusable cards, states, and layout elements
3. **Charts** — focused visualization wrappers
4. **Services** — typed API client helpers
5. **Hooks** — async loading and state helpers

## Provider architecture

### MarketDataProvider
- `DemoMarketProvider`
- `YahooChartMarketProvider`

### EconomicDataProvider
- `DemoEconomicProvider`
- `WorldBankEconomicProvider`

### AIProvider
- `FallbackAIProvider`
- `OpenAICompatibleProvider`

## Rationale

This architecture demonstrates:
- separation of concerns
- easy demo mode support
- API replacement flexibility
- testable analytics logic
- a credible path from portfolio project to production-style codebase
