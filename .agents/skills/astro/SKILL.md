---
name: astro
description: Official guide, best practices, and runbook for developing Astro applications (v5+), integrating with the Astro Docs MCP server, running non-blocking dev servers with health checks, and maintaining modern Astro codebases. Use whenever working on Astro projects, components (.astro), pages, layouts, content collections, Astro actions, server islands, integrations (React, Tailwind), or troubleshooting Astro builds.
---

# Astro AI Development Guide & Runbook

This skill equips agents with current knowledge, best practices, workflows, and tools for building and maintaining Astro applications (specifically Astro v5+), based on the official [Astro Build with AI Guide](https://docs.astro.build/en/guides/build-with-ai/).

## Table of Contents
1. [Core Principles](#1-core-principles)
2. [Astro Docs MCP Server Integration](#2-astro-docs-mcp-server-integration)
3. [Integrations Protocol (`astro add`)](#3-integrations-protocol-astro-add)
4. [Modern Astro v5+ API Guidelines](#4-modern-astro-v5-api-guidelines)
5. [Dev Server Management & Health Checks](#5-dev-server-management--health-checks)
6. [Component Architecture & Islands](#6-component-architecture--islands)
7. [Marketing Repo (`kyu-esports-marketing`) Reference](#7-marketing-repo-kyu-esports-marketing-reference)

---

## 1. Core Principles

- **Never rely on outdated Astro patterns (v1–v4)**: Modern Astro (v5+) uses new Content Layer APIs, Astro Actions, and Server Islands. Verify APIs with the MCP server or docs before writing code.
- **Use `astro add` for official integrations**: Do not manually add integration packages to `package.json` and modify `astro.config.mjs` by hand unless troubleshooting. Always run `astro add <integration>`.
- **Minimal Client-Side JavaScript**: Default to static `.astro` components. Only use React or UI framework components (`.tsx`, `.jsx`) when client interactivity is required, and choose the most conservative hydration directive (`client:idle`, `client:visible`, or `client:load`).
- **Enforce Project Rules**: Follow project rules specified in `AGENTS.md` and `GEMINI.md`.

---

## 2. Astro Docs MCP Server Integration

The Astro Docs MCP server provides real-time access to the official Astro documentation index via `kapa.ai`.

### Server Details
- **Name**: `astro-docs`
- **URL**: `https://mcp.docs.astro.build/mcp`
- **Transport**: Streamable HTTP / SSE
- **Tool**: `mcp__astro-docs__search_astro_docs` (or `search_astro_docs`)

### Antigravity Configuration (`mcp_config.json`)
```json
{
  "mcpServers": {
    "astro-docs": {
      "serverUrl": "https://mcp.docs.astro.build/mcp"
    }
  }
}
```

### When and How to Consult Docs
- Whenever implementing a feature or API that changed recently (Content Layer, Astro Actions, Sessions, Server Islands, View Transitions).
- Call `mcp__astro-docs__search_astro_docs` or consult `https://docs.astro.build` when troubleshooting build errors or API signatures.

---

## 3. Integrations Protocol (`astro add`)

When adding official integrations (e.g., Tailwind, React, MDX, Sitemap):
- In `kyu-esports-marketing` (which uses `pnpm`):
  ```bash
  pnpm astro add <integration-name>
  ```
  Or via `npx`:
  ```bash
  npx astro add <integration-name>
  ```
- **Why**: `astro add` installs the correct peer dependencies, registers the integration in `astro.config.mjs`, and sets up TypeScript types and configs automatically.
- For third-party packages or non-official libraries:
  ```bash
  pnpm add <package-name>
  ```
  Avoid hand-editing `package.json` directly.

---

## 4. Modern Astro v5+ API Guidelines

### A. Content Collections & Content Layer
In Astro 5+, collections use the unified Content Layer:
```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
  }),
});

export const collections = { blog };
```

### B. Astro Actions
For handling form submissions, mutations, and backend logic with type safety:
```typescript
// src/actions/index.ts
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

export const server = {
  submitRegistration: defineAction({
    input: z.object({
      name: z.string(),
      email: z.string().email(),
    }),
    handler: async (input) => {
      // process submission
      return { success: true };
    },
  }),
};
```
In client components / forms:
```astro
---
import { actions } from 'astro:actions';
---
<form method="POST" action={actions.submitRegistration}>
...
</form>
```

### C. Server Islands
Defer rendering of dynamic parts while serving the rest statically:
```astro
<UserProfile server:defer>
  <UserProfileSkeleton slot="fallback" />
</UserProfile>
```

---

## 5. Dev Server Management & Health Checks

### Dev Server Command & Background Execution
- To start dev server:
  ```bash
  pnpm dev
  ```
  or
  ```bash
  npx astro dev
  ```
- On Windows or when background execution is desired:
  Pass `--background` or set `ASTRO_DEV_BACKGROUND=1`:
  ```bash
  pnpm astro dev --background
  ```
- Dev lock file:
  Astro writes `.astro/dev.json` (or `.astro/preview.json`) containing:
  ```json
  {
    "url": "http://localhost:4321/",
    "port": 4321,
    "pid": 12345
  }
  ```
  Always check if `.astro/dev.json` exists before launching a second instance.

### Health Endpoint Check
The dev server exposes an automated health endpoint:
```http
GET http://localhost:4321/_astro/status
```
Expected response:
```json
{"ok": true}
```
Use this endpoint to confirm the dev server is alive and ready to handle requests without parsing terminal logs. (Note: Only present in development mode).

---

## 6. Component Architecture & Islands

1. **Astro Components (`.astro`)**:
   - Zero JavaScript by default.
   - Use for static structure, layouts, typography, navigation links, and SEO metadata.
2. **Framework Components (`.tsx`, `.jsx`, `.vue`, `.svelte`)**:
   - Hydrate only when necessary:
     - `client:load`: Critical interactive components needed immediately (e.g., above-the-fold interactive modals).
     - `client:idle`: Lower priority interactivity (chat widgets, analytics).
     - `client:visible`: Interactive elements that appear on scroll (e.g. registration forms, calculators).
     - `client:only="react"`: Elements that strictly require browser-only APIs and should skip SSR.

---

## 7. Marketing Repo (`kyu-esports-marketing`) Reference

When working in `c:\Users\WORK-PC\Downloads\PROJECT\KYUesports\kyu-esports-marketing`:
- **Package Manager**: `pnpm` (run commands with `pnpm <script>` or `pnpm astro ...`).
- **Frameworks Active**:
  - Astro 5 (`^5.4.2`)
  - React 19 (`@astrojs/react`)
  - Tailwind CSS 3 (`@astrojs/tailwind`)
  - Lucide React icons
- **Project Structure**:
  - `src/layouts/RootLayout.astro`: Base HTML shell with theme and font setup.
  - `src/pages/index.astro`: Main landing page composing modular sections.
  - `src/components/`:
    - `Hero.astro`: Landing hero section.
    - `Navbar.astro`: Navigation bar.
    - `GameTitles.astro`: Featured titles grid.
    - `TribePerks.astro`: Community perks.
    - `RegistrationForm.tsx`: Interactive React island (`client:visible`).
    - `Footer.astro`: Page footer.
  - `src/styles/global.css`: Global styles, design tokens, gaming aesthetics.
- **Verification Commands**:
  ```bash
  pnpm build     # Verifies Astro build and TypeScript compilation
  pnpm astro check # Type checks Astro components
  ```
