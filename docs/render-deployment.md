# Render Deployment Guide

## Architecture

FinSight is deployed as a single Render web service:
- **Frontend**: Vite build output served by FastAPI
- **Backend**: FastAPI application
- **Database**: PostgreSQL on Render

## 1. Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/finsight.git
git push -u origin main
```

## 2. Deploy with `render.yaml`

Render can read the included `render.yaml` blueprint and create:
- a PostgreSQL database
- a web service

In Render:
1. New → Blueprint
2. Select your GitHub repository
3. Confirm the generated database and web service
4. After the first deploy, update `CORS_ORIGINS` to your real Render URL if needed

## 3. Required environment variables

The blueprint already defines the important ones:
- `DATABASE_URL`
- `AUTH_SECRET_KEY`
- `APP_ENV=production`
- `APP_DEBUG=false`
- `DEMO_MODE=false`
- `MARKET_PROVIDER=yfinance`
- `ECONOMIC_PROVIDER=world_bank`

Optional AI settings:
- `AI_PROVIDER=openai_compatible`
- `OPENAI_API_KEY=...`
- `OPENAI_BASE_URL=https://api.openai.com/v1`

## 4. How login works

FinSight uses:
- account registration
- password hashing with `scrypt`
- JWT bearer tokens
- protected finance routes
- per-user ledger storage

## 5. Notes

- The first deploy builds the frontend and then serves it from FastAPI.
- Shared ledger pages remain public when someone has the share link.
- Move to a paid database/service plan if you expect heavier usage.
