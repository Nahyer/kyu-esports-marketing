# Astro Development Rules & Standards for Marketing Repository

> **MANDATORY**: Whenever working on Astro components, layouts, pages, styles, configurations, or integrations in this repository (`kyu-esports-marketing`), you **MUST** reference and adhere to the guidelines defined in the Astro skill (`.agents/skills/astro/SKILL.md`) and verify modern APIs against the Astro Docs MCP server (`astro-docs`).

## Critical Operating Protocols

### 1. Package Management & Integrations
- This project uses **`pnpm`** as its package manager.
- **NEVER** manually edit `package.json` to add Astro integrations or configure them manually in `astro.config.mjs` unless diagnosing a failure.
- **ALWAYS** use `pnpm astro add <integration>` (or `npx astro add <integration>`), e.g.:
  ```bash
  pnpm astro add @astrojs/sitemap
  ```
- For standard dependencies, install via `pnpm add <package-name>`.

### 2. Up-To-Date Astro v5+ APIs
- This project runs **Astro v5+ (`^5.4.2`)**. Do NOT use legacy Astro v1–v4 patterns.
- **Content Collections**: Use the unified Content Layer (`defineCollection` with loaders from `astro/loaders`).
- **Form Handling / Mutations**: Prefer type-safe Astro Actions (`astro:actions`) over custom manual endpoints where appropriate.
- **Server Islands**: Use `server:defer` for deferring dynamic user components.
- If unsure of an API signature, consult the Astro Docs MCP server tool (`mcp__astro-docs__search_astro_docs`) or `https://docs.astro.build`.

### 3. Dev Server & Health Checks
- The dev server can run in background mode on Windows using:
  ```bash
  pnpm astro dev --background
  ```
  or setting the environment variable `ASTRO_DEV_BACKGROUND=1`.
- Always check if `.astro/dev.json` exists before launching a duplicate server process.
- To verify the dev server is alive, poll or query the internal dev health endpoint:
  ```
  GET http://localhost:4321/_astro/status
  ```
  which responds with `{"ok": true}`.

### 4. Islands Architecture & Minimal JavaScript
- Default to pure `.astro` components (zero runtime JS).
- When React or client interactivity is needed, keep components isolated in `src/components/` and use conservative hydration directives (`client:visible`, `client:idle`, or `client:load`).

### 5. Verification
- Before finishing any task in this repo, run:
  ```bash
  pnpm build
  ```
  to verify that the Astro bundle builds without errors and all TypeScript types compile cleanly.
