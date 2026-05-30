# AI MR Release Intelligence

Local-first MVP for analyzing merge requests and release impact.

## Stack

- npm workspaces monorepo
- **API**: Node.js, Express, TypeScript, Prisma (SQLite)
- **Web**: React, Vite, TypeScript
- **Shared**: Zod-friendly TypeScript types

## Quick start

```bash
npm install
npm run db:migrate
npm run dev
```

- API: http://localhost:4000
- Web: http://localhost:5173

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start API and web together |
| `npm run dev:api` | API only |
| `npm run dev:web` | Web only |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run build` | Build all workspaces |
