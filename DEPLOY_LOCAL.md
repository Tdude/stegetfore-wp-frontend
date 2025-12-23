Here’s the minimal “how to run dev” for this project.

1. Start local WordPress (Docker)
From the project root (/Users/tiborberki/Sites/DOCKER/stegetfore.nu):

bash
docker compose up
# or, if your Docker version still uses the old name:
# docker-compose up
Key points:

Uses docker-compose.yaml:
WordPress on http://localhost:8000
DB via MariaDB container
wp-config.docker.php is mounted as wp-config.php
Local WP debug:
WORDPRESS_DEBUG: 1 in docker-compose.yaml → WP_DEBUG = true in wp-config.docker.php.
To stop:

bash
docker compose down
2. Start the Next.js frontend dev server
From the frontend folder:

bash
cd stegetfore-wp-frontend
npm install        # first time / when deps changed
npm run dev        # starts Next.js dev server
Default dev URL: http://localhost:3000
It talks to local WordPress at http://wordpress inside Docker, but from the browser you normally use http://localhost:3000 (frontend) and http://localhost:8000 (WP admin).
If you want the faster dev server:

bash
npm run dev:turbo
3. Env files to check (frontend)
For dev, usually:

.env.local (or .env.development) — typical contents:
bash
NEXT_PUBLIC_WORDPRESS_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000/wp-json
NEXT_PUBLIC_THEME_SLUG=steget
NEXT_PUBLIC_USE_MODULAR_TEMPLATES=true
NEXT_PUBLIC_DISABLE_CACHE=true
NEXT_PUBLIC_DEBUG_MODE=true   # if you want the debug button locally