.PHONY: prod-up prod-rebuild prod-restart prod-logs prod-status prod-down prod-pull

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
