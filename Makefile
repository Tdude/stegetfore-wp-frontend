.PHONY: prod-up prod-rebuild prod-restart prod-logs prod-status prod-down prod-pull help

COMPOSE_PROD = docker compose -f docker-compose.prod.yaml

prod-up:
	$(COMPOSE_PROD) up -d

prod-rebuild:
	$(COMPOSE_PROD) down
	$(COMPOSE_PROD) build --no-cache
	$(COMPOSE_PROD) up -d

prod-restart:
	$(COMPOSE_PROD) restart

prod-logs:
	$(COMPOSE_PROD) logs -f --tail=200

prod-status:
	$(COMPOSE_PROD) ps

prod-down:
	$(COMPOSE_PROD) down

prod-pull:
	git pull

help:
	@echo "Stegetfore prod commands (run from this repo folder):"
	@echo "  make prod-pull     - git pull"
	@echo "  make prod-up       - start/update containers (no rebuild)"
	@echo "  make prod-restart  - restart containers"
	@echo "  make prod-logs     - tail logs (last 200 lines)"
	@echo "  make prod-status   - show container status + health"
	@echo "  make prod-down     - stop containers"
	@echo "  make prod-rebuild  - full rebuild (--no-cache) + restart"
	@echo ""
	@echo "Notes:"
	@echo "  - Site should be reachable via nginx on https://stegetfore.nu"
	@echo "  - Upstream is on http://127.0.0.1:3001 (nginx proxies to it)"
	@echo "  - Health is shown in 'make prod-status' once healthchecks are active"
