#!/bin/bash

echo "Starting PostgreSQL and Redis with Docker..."

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker compose is available
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif docker-compose version &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi

# Start PostgreSQL and Redis
$DOCKER_COMPOSE -f docker-compose.dev.yml up -d postgres redis

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker exec sensilog-postgres pg_isready -U sensilog &> /dev/null; then
        echo "PostgreSQL is ready!"
        break
    fi
    echo -n "."
    sleep 1
done

# Check if PostgreSQL is running
if docker ps | grep -q sensilog-postgres; then
    echo "✅ PostgreSQL is running on port 5432"
    echo "   Connection string: postgresql://sensilog:sensilog_password@localhost:5432/sensilog"
else
    echo "❌ Failed to start PostgreSQL"
    exit 1
fi

# Check if Redis is running
if docker ps | grep -q sensilog-redis; then
    echo "✅ Redis is running on port 6379"
else
    echo "❌ Failed to start Redis"
    exit 1
fi

echo ""
echo "To stop the services, run:"
echo "  $DOCKER_COMPOSE -f docker-compose.dev.yml down"
echo ""
echo "To view logs, run:"
echo "  $DOCKER_COMPOSE -f docker-compose.dev.yml logs -f"