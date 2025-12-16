.PHONY: help build up down logs clean test lint backend-test frontend-lint

help:
	@echo "Available commands:"
	@echo "  make build         - Build all Docker images"
	@echo "  make up            - Start all services"
	@echo "  make down          - Stop all services"
	@echo "  make logs          - View logs from all services"
	@echo "  make clean         - Stop services and remove volumes"
	@echo "  make test          - Run all tests"
	@echo "  make backend-test  - Run backend tests"
	@echo "  make frontend-lint - Run frontend linter"

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

clean:
	docker compose down -v

test: backend-test frontend-lint

backend-test:
	cd backend && ./mvnw test

frontend-lint:
	cd frontend && npm run lint
