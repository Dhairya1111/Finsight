# Contributing to FinSight

Thanks for your interest in contributing to FinSight.

## Development workflow

1. Fork the repository.
2. Create a feature branch from `main`.
3. Make focused, well-tested changes.
4. Run tests and lint checks locally.
5. Open a pull request using the provided template.

## Local setup

```bash
cp .env.example .env
make backend-install
make frontend-install
```

Run locally:

```bash
make backend-dev
make frontend-dev
```

## Quality expectations

Before submitting a pull request:

```bash
make test
make lint
```

## Commit conventions

Use clear conventional-style commits such as:
- `feat: add economic provider abstraction`
- `fix: handle invalid transaction dates`
- `docs: expand methodology notes`
- `test: cover simulation edge cases`

## Design principles

- keep demo mode functional
- never hard-code secrets
- separate business logic from UI
- document data sources and assumptions
- avoid claims that imply financial advice

For more detailed contributor guidance, see [`docs/contributing.md`](docs/contributing.md).
