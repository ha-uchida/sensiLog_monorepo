# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SensiLog is a monorepo application for VALORANT players to manage sensitivity settings and analyze performance data. It uses a modern microservices architecture with TypeScript throughout.

### Tech Stack
- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4
- **Backend**: NestJS + TypeScript + JWT auth with Riot OAuth
- **Database**: PostgreSQL with Prisma ORM
- **API**: OpenAPI 3.0 spec with auto-generated React Query client + Swagger UI
- **Build**: pnpm workspaces + Turborepo

## Essential Commands

### Development
```bash
pnpm dev              # Start all services (web on :3000, api on :3001)
pnpm dev --filter=web # Start only frontend
pnpm dev --filter=api # Start only backend
```

### Build & Type Checking
```bash
pnpm build           # Build all packages
pnpm lint            # ESLint across all packages
pnpm type-check      # TypeScript type checking
```

### Database
```bash
pnpm db:start        # Start PostgreSQL & Redis with Docker
pnpm db:stop         # Stop database containers
pnpm db:push         # Apply schema changes to database
pnpm db:studio       # Open Prisma Studio UI
pnpm db:generate     # Generate Prisma client
pnpm db:migrate      # Run database migrations
```

### API Development
```bash
pnpm generate:api    # Generate TypeScript client from OpenAPI spec
```

### Testing
No test scripts are currently configured. Check with the user for testing approach.

## Architecture

### Monorepo Structure
- `apps/web/`: Next.js frontend with App Router
- `apps/api/`: NestJS backend API with modular architecture
- `apps/api/prisma/`: Prisma schema and migrations
- `packages/api-client/`: Auto-generated API client with React Query hooks
- `api-spec/openapi.yaml`: Single source of truth for API contracts

### API-First Development Workflow
1. Define endpoints in `api-spec/openapi.yaml`
2. Run `pnpm generate:api` to create type-safe client
3. Implement backend endpoints in NestJS modules (`apps/api/src/*/`)
4. Use generated React Query hooks in frontend

### Key API Routes
- `/auth/*`: Riot OAuth authentication
- `/settings/*`: Sensitivity/device settings management
- `/match-data/*`: VALORANT match data operations
- `/analytics/*`: Performance correlation analysis
- `/riot/*`: Riot API integrations
- `/health`: Health check endpoint

### Database Schema (Prisma)
Main models in `apps/api/prisma/schema.prisma`:
- `User`: User accounts with Riot integration
- `SettingsRecord`: Historical sensitivity/DPI settings  
- `MatchData`: VALORANT match performance data
- `Team`/`TeamMember`: Team management structure
- `Tag`: Settings categorization
- `AdminAction`: Audit logs

### Authentication Flow
1. JWT-based authentication with Riot OAuth
2. Tokens stored encrypted in database
3. Admin roles for team management features

## Local Development Setup

### Docker Services
```bash
docker compose up postgres redis -d  # Start required services
```

### Environment Variables
Required in `.env`:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Min 32 characters
- `RIOT_CLIENT_ID/SECRET`: Riot API credentials
- `NEXT_PUBLIC_API_URL`: Backend URL for frontend

## Important Notes

- **Riot API Integration**: Handles rate limits and caching automatically
- **Mock Data**: Development mode includes mock data generation for testing
- **API Documentation**: Available at `http://localhost:3001/docs` (Swagger UI)
- **Database Viewer**: Run `pnpm db:studio` to open Prisma Studio
- **Deployment**: Designed for ultra-low-cost deployment (Vercel + Railway + Neon)
- **CORS**: Configured for production domains in `apps/api/src/main.ts`
- **NestJS Modules**: Auth, Settings, MatchData, Analytics, Prisma