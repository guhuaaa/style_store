# RiskNick Frontend Style Training Pack

Standalone source package extracted from the RiskNick frontend. It is intended as a clean reference corpus for training or analyzing the product's frontend style.

## Included

- Vue 3 + Vite application source (`src/`)
- Views, shared components, charts, graph visualization, router, stores, composables, API client, and global styles
- Public brand assets (`public/`)
- Reproducible dependency manifest and lock file
- Vite, Tailwind, and PostCSS configuration

## Intentionally excluded

- `node_modules/`, `dist/`, and local development logs
- Backend code, databases, uploads, reports, test data, and project backups
- Actual environment configuration and credentials

## Run locally

```bash
pnpm install
copy .env.example .env
pnpm dev
```

The user interface can load without the backend, but data-driven actions require an API compatible with the `/api` endpoints. Configure the optional backend proxy in `.env`.

## Style orientation

The package demonstrates a professional financial-risk dashboard visual language: dark navigation, restrained blue/cyan accents, card-based analytical layouts, dense data views, Element Plus components, ECharts dashboards, and G6 relationship graphs. The main style primitives are in `src/styles/`, while representative page compositions are in `src/views/` and `src/components/`.
