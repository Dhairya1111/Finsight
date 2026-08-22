PYTHON ?= python3
PIP ?= pip3
NPM ?= npm

.PHONY: install backend-install frontend-install dev backend-dev frontend-dev test lint format

install: backend-install frontend-install

backend-install:
	cd backend && $(PIP) install -e .[dev]

frontend-install:
	cd frontend && $(NPM) install

dev:
	@echo "Run backend and frontend in separate terminals using backend-dev and frontend-dev"

backend-dev:
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

frontend-dev:
	cd frontend && $(NPM) run dev -- --host 0.0.0.0 --port 5173

test:
	cd backend && pytest
	cd frontend && $(NPM) run test -- --run

lint:
	cd backend && ruff check app tests && black --check app tests
	cd frontend && $(NPM) run lint && $(NPM) run format:check

format:
	cd backend && ruff check --fix app tests && black app tests
	cd frontend && $(NPM) run format
