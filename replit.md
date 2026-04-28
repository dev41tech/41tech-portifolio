# 41 Tech

## Overview

Institutional landing page + admin panel for 41 Tech — the technology division of Grupo 41. The app demonstrates projects, cases, team members, and technical stack, with a full admin CRUD backend.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (Tailwind CSS, shadcn/ui, Framer Motion, Wouter routing)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Auth**: Express sessions (bcryptjs password hashing)
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

- `artifacts/41tech` — React frontend (served at `/`)
- `artifacts/api-server` — Express API server (served at `/api`)

## Key Routes

### Public
- `/` — Landing page (hero, services, projects, cases, team, tech stack)
- `/projetos` — Projects list
- `/projetos/:slug` — Project detail
- `/equipe` — Team page
- `/cases/:slug` — Case study detail

### Admin (hidden — no public links)
- `/admin-41tech/login` — Login page
- `/admin-41tech/dashboard` — Stats dashboard
- `/admin-41tech/projects` — CRUD for projects
- `/admin-41tech/team` — CRUD for team members
- `/admin-41tech/cases` — CRUD for cases
- `/admin-41tech/technologies` — CRUD for technologies

## Admin Credentials (Demo)

- Email: `admin@41tech.com.br`
- Password: `admin41tech@2024`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Database Schema

Tables: `users`, `team_members`, `projects`, `technologies`, `cases`

See `lib/db/src/schema/` for full schema definitions.
