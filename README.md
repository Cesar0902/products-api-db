# Products app

A small Express backend and vanilla HTML/CSS/JavaScript frontend for products and categories. MySQL is the real persistence layer; the UI and API share one origin. Public routes and UI labels remain Spanish.

## Quick start

Use Node.js 22 or 24 and pnpm 12 (verification environment: Node 24.21.0 and pnpm 12.9.1). Docker Compose v2 is optional if you already have MySQL 8.0. No frontend build or separate package is needed.

```bash
pnpm install
# Only for a new checkout without an existing .env:
cp .env.example .env
# Review .env and set database credentials before continuing.
docker compose -f compose.yml up -d --wait
pnpm start
```

Open **http://localhost:3000/**, not `frontend/index.html` directly. Express serves the frontend and `/productos` and `/categorias`; browser requests use the current origin, including a custom port or deployment hostname. `pnpm dev` starts Node's watch mode. `pnpm test` runs the deterministic HTTP/SQL contract tests without MySQL.

The UI supports product creation, editing, deletion, availability filtering, text search, statistics and responsive layouts. Enter an existing category name (initial demo names: `Tecnología`, `Hogar`, `Juguetes`, `Ropa`). Categories can be managed through the API. If loading fails, inspect the browser console and server logs, confirm MySQL is ready and check the database configuration.

## Configuration

The server loads the root `.env` using an absolute path, regardless of the working directory; exported environment variables take precedence. Compose uses the root `.env` for substitution when run as shown above. **Do not overwrite an existing `.env`.** Adapt old configuration to these host-run Node settings:

| Variable | Purpose / local example |
| --- | --- |
| `PORT` | Express port; defaults to `3000` |
| `NODE_ENV` | `development` locally; set `production` when deployed |
| `DB_HOST` | `127.0.0.1` for Node on the host, not the Docker service name `mysql` |
| `DB_PORT` | `3308` for the provided Compose mapping; defaults to `3308` |
| `DB_NAME` | Database name; `tienda` in the example and Compose default |
| `DB_USER` | Application user; `unah` in the example and Compose default |
| `DB_PASSWORD` | Application password; required by Node and Compose |
| `MYSQL_ROOT_PASSWORD` | MySQL initialization root password; required by Compose, unused by Node |
| `MYSQL_VOLUME_NAME` | Defaults to the original `docker_mysql_data` volume |

`DB_USER`, `DB_PASSWORD` and `DB_NAME` are required by Node. The example passwords are **local demo credentials only**, not deployment defaults. If using an external MySQL instance, provide its host, port, database and restricted application credentials; initialize the database with `db/schema.sql` followed by `db/seed.sql` only if demo data is wanted. Both SQL files operate on the selected database rather than hard-coding `tienda`.

`BASE_URL`, `CORS_ORIGINS`, `DB_PRODUCTS_FILE` and `DB_BACKUP_FILE` are no longer used. Same-origin frontend access needs no CORS configuration. A cross-origin integration requires an explicit security decision, not a wildcard fallback.

## Database startup and existing data

Compose runs MySQL 8.0, binds **127.0.0.1:3308** to container port 3306, and mounts `db/schema.sql` as `01-schema.sql` and `db/seed.sql` as `02-seed.sql`. The health check waits for the configured application user and database. Useful commands:

```bash
docker compose -f compose.yml config --quiet
docker compose -f compose.yml ps
docker compose -f compose.yml logs mysql
docker compose -f compose.yml stop
```

The named volume is explicitly **`docker_mysql_data`**, preserving the default identity from the former `docker/docker-compose.yml`. If the old setup used `-p` or `COMPOSE_PROJECT_NAME`, determine its actual existing volume and set `MYSQL_VOLUME_NAME` to that name before starting. Stop the old Compose service before starting this one; both use container name `tienda-mysql`. Do not start both configurations simultaneously.

**MySQL initialization scripts run only when the data directory is empty.** Existing volumes retain their rows, schema, users and passwords; changing `.env` does not rotate existing credentials or rerun seeds. This migration does not reset volumes or automatically alter an existing database. Never use volume-removal commands to “fix” initialization without an explicit backup and data-loss decision.

For an existing database, back up first and review schema differences manually: the new schema makes product names unique, requires category IDs, enforces boolean availability and positive prices, and restricts category deletion through a foreign key. `CREATE TABLE IF NOT EXISTS` does not upgrade old tables. Resolve any duplicate names, orphaned/null categories or invalid values before applying reviewed constraints. Runtime duplicate-name checks also work on the old schema, but only a database unique constraint closes concurrent insertion races. Existing null category rows can still be listed via the left join; assign an existing category when editing them. Demo seeds are intended for a new database, not repeated imports.

## API contract

Responses use `{ "success": true, "data": ..., "message": "..." }`; deletions omit `data`. Errors use `{ "success": false, "message": "..." }`, with an `errors` array of `{ "field", "message" }` for validation failures. Empty collections return 200 with `data: []`. Invalid input/IDs, JSON or availability filters return 400, missing resources 404, duplicate names and categories in use 409. Unexpected database errors return 500 without SQL or credential details.

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/productos` | List; optional `?disponible=true` or `false` |
| GET | `/productos/disponibles` | Available products |
| GET | `/productos/:id` | Product detail; preserves the one-item array in `data` |
| POST | `/productos` | Create; returns an object in `data` |
| PUT / PATCH | `/productos/:id` | Update supplied fields; returns an object in `data` |
| DELETE | `/productos/:id` | Delete product |
| GET | `/categorias` or `/categorias/:id` | Category list or single object |
| POST | `/categorias` | Create category |
| PUT | `/categorias/:id` | Rename category |
| DELETE | `/categorias/:id` | Delete only when no products reference it |

Example product request:

```json
{
  "nombre": "Laptop",
  "precio": 899.99,
  "descripcion": "Laptop portátil para el trabajo y el estudio.",
  "categoria": "Tecnología",
  "disponible": true
}
```

Products require a nonblank name (maximum 100 characters), a positive numeric price (maximum 99999999.99), a description of 10–16000 characters and an existing category name. Availability must be boolean and defaults to true on creation. Responses include numeric prices, boolean availability, `categoria` as a name and the stored `categoria_id`. Category requests use `{ "nombre": "Hogar" }` (3–50 trimmed characters). IDs must be positive integers. Unknown fields and empty updates are rejected. PUT retains the existing partial-update semantics.

## Layout and verification

```text
backend/
  server.js            # Environment, MySQL connection check and listener
  app.js               # Injectable Express app and static frontend
  db.js                # mysql2 promise pool
  schemas.js           # Input validation
  routes/              # Product/category HTTP handlers and parameterized SQL
  middleware/          # Error responses
  tests/               # Deterministic HTTP/SQL contracts
frontend/              # Existing vanilla UI, no build step
db/                    # Ordered schema and demo seeds
compose.yml            # MySQL only; Node runs on the host
package.json           # One root package and start/dev/test scripts
```

```bash
pnpm test
node --test backend/tests/products.test.js backend/tests/categories.test.js
```

Tests inject a database double, launch real HTTP listeners, verify SQL/parameters and exercise static frontend serving. They do not prove MySQL schema execution or replace a live-database smoke test. The server requires real MySQL and checks the connection before listening.

`scripts/builder.js` and `src/infrastructure/database/local-db/{products,backupProducts}.js` remain untouched as **unused legacy generation/data artifacts**. They are not the active persistence implementation. Old layered backend code and duplicate Docker/frontend setup guides have been consolidated here.

## Deployment caveats

This is an unauthenticated local demo, not a production-ready public service. Before exposing it, add authentication/authorization, HTTPS through a reverse proxy, appropriate request limits, monitoring and backups. Use strong secrets from deployment configuration, a least-privilege MySQL user and private database networking. The Compose database port is loopback-only; do not expose it publicly. Keep schema upgrades explicit and reviewed. The UI retains its external icon stylesheet, which requires network access for icons. Dependency modernization is a separate work unit; this migration does not update dependency versions or the lockfile.
