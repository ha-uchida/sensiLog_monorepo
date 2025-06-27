# Database Setup Guide

## Quick Start

1. **Start PostgreSQL and Redis with Docker:**
   ```bash
   pnpm db:start
   ```
   This will start:
   - PostgreSQL on port 5432
   - Redis on port 6379

2. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Generate Prisma Client:**
   ```bash
   pnpm db:generate
   ```

4. **Apply database schema:**
   ```bash
   pnpm db:push
   ```

## Database Management Commands

```bash
# Start databases
pnpm db:start

# Stop databases
pnpm db:stop

# Generate Prisma client
pnpm db:generate

# Push schema changes (development)
pnpm db:push

# Create and run migrations (production)
pnpm db:migrate

# Open Prisma Studio (database GUI)
pnpm db:studio
```

## Connection Details

### PostgreSQL
- Host: localhost
- Port: 5432
- Database: sensilog
- User: sensilog
- Password: sensilog_password
- Connection URL: `postgresql://sensilog:sensilog_password@localhost:5432/sensilog?schema=public`

### Redis
- Host: localhost
- Port: 6379
- Connection URL: `redis://localhost:6379`

## Docker Commands

```bash
# View logs
docker compose -f docker-compose.dev.yml logs -f

# Access PostgreSQL CLI
docker exec -it sensilog-postgres psql -U sensilog

# Access Redis CLI
docker exec -it sensilog-redis redis-cli

# Remove volumes (clean database)
docker compose -f docker-compose.dev.yml down -v
```

## Troubleshooting

### Port already in use
If port 5432 or 6379 is already in use:
1. Stop any existing PostgreSQL/Redis services
2. Or modify the ports in `docker-compose.dev.yml`

### Permission denied
If you get permission denied when running scripts:
```bash
chmod +x scripts/start-db.sh
```

### Docker not installed
Install Docker Desktop from: https://www.docker.com/products/docker-desktop/