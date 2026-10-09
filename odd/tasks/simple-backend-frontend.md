# Simple backend/frontend organization

## Objective
Replace the over-layered backend with a small backend/frontend layout, preserve the product/category application, refresh setup documentation and compatible dependencies.

## Problem and rationale
Two resources currently use router/controller/service/model forwarding layers. Documentation describes obsolete persistence, SQL mutations are incomplete, and database initialization is incorrectly mounted. The approved layout uses one root package, a small Express backend, the existing vanilla frontend, and explicit database schema/seed files.

## Authorized scope and constraints
- Keep public Spanish API paths and existing UI language and functionality.
- Preserve the user's `.gitignore` change and local `.env`; do not stage either.
- Preserve legacy local data and builder scripts until deletion is explicitly authorized.
- No remote execution, push, PR creation, or destructive volume operations.
- Use parameterized SQL, input validation, clear errors, and deterministic tests without adding architectural layers.
- Dependency updates remain compatible and verified; do not upgrade majors automatically.

## Delivery and tracking
- Branch: `refactor/simple-backend-frontend`.
- Base boundary: `27aa669323c27225b131f577bc70177693a5b69b`.
- Delivery strategy: `auto-chain`; chain strategy: `feature-branch-chain` (user selected one branch with staged work).
- Forecast: approximately 1,900–2,500 authored added/deleted lines, excluding generated lockfile changes. Much of the change replaces existing layering; do not split a runnable migration artificially or omit tests to meet the advisory 400-line heuristic.
- Running authored count: pending.
- No PRs authorized; work units will be separate commits, with future delivery slices retained on the feature branch.
- RDD: on, global source. Review boundaries and outcomes pending native assessment.
- Engram mirror: initial document saved and read back as observation 2785; current progress synchronization pending.

## Tasks
- [ ] T1 — Deliver the runnable layout migration with corrected CRUD, deterministic regression tests, frontend integration, database initialization and accurate setup documentation.
  - Route: delegated direct; preparation and multiple non-trivial files trigger delegation.
  - Acceptance: backend replaces active `src` layers; frontend uses same-origin API; root Compose initializes schema then seeds; README explains host-run Node and database startup; legacy data preserved.
  - Checks: `node --test backend/tests/products.test.js backend/tests/categories.test.js`; syntax checks for backend/frontend; `docker compose -f compose.yml config --quiet`; `git diff --check`; server/HTTP tests with injected database.
  - Test policy: explicit configured TDD mode unknown; apply default deterministic test-first RED → GREEN → REFACTOR for CRUD regression fixes. Structural relocation and passive docs have no meaningful failing behavior test before relocation; use characterization and structural checks.
  - Environmental limitation: Docker daemon unavailable and no MySQL CLI; actual MySQL execution must be reported unavailable, never inferred from SQL stubs.
  - Implementation observed: backend/frontend layout, real SQL statements, static serving, ordered schema/seed initialization and consolidated README delivered. Legacy local data and builder retained.
  - Verification: worker observed initial regression RED (11 failures; focused 3), then final GREEN 49/49; parent reran 49/49. Syntax checks, Compose configuration with dummy environment and whitespace checks passed.
  - Live MySQL and browser E2E unavailable/unverified; Docker daemon unavailable. Tests cover HTTP behavior and SQL contracts with doubles only.
  - Authored count: 2,243 (818 additions, 1,425 deletions), excluding generated files and user changes.
  - Git identity: user configured repository-local name/email and explicitly requested a descriptive Spanish commit. Earlier commit attempt created no commit. Preserve the user's `.gitignore` outside staging.
  - Native assessment/review pending: initial worktree assessment refused undeclared untracked files; candidate now staged but cannot close its work-unit commit until author identity is provided. T1 stays unchecked until closure evidence is recorded.
- [ ] T2 — Refresh compatible dependencies and verify the migrated application.
  - Route: delegated direct; dependency research, manifest and lockfile changes require a worker.
  - Acceptance: versions and engine requirements documented; root manifest and lockfile consistent; no unnecessary frameworks or test dependencies.
  - Checks: T1 checks plus `pnpm install --frozen-lockfile` and `pnpm test`.
  - Test policy: dependency/config changes use the existing regression suite; no fabricated RED.
  - Commit, authored count, native assessment and review: pending.

## Verification evidence
- Planning only: Node 24.21.0 and pnpm 12.9.1 available; Docker executable available, daemon unavailable.
- T1 deterministic suite: 49 passed, zero failed or skipped; independently rerun by parent.
- Syntax, Compose configuration and whitespace checks passed; real database execution unavailable.

## Next step
Create the user-authorized Spanish T1 commit and assess its native review; dependency refresh remains pending for T2.
