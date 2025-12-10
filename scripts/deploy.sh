#!/bin/bash
set -e

ENVIRONMENT=${1:-development}
ENV_FILE="environments/${ENVIRONMENT}.env"
COMPOSE_FILE="docker-compose.yml"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: Environment file $ENV_FILE not found."
    exit 1
fi

echo "Deploying to ${ENVIRONMENT} environment..."
echo "Using env file: ${ENV_FILE}"

# Build application image
docker-compose --env-file ${ENV_FILE} -f ${COMPOSE_FILE} build app

# Start services
docker-compose --env-file ${ENV_FILE} -f ${COMPOSE_FILE} up -d --remove-orphans

# Health check
echo "Waiting for services to be healthy..."
./scripts/health-check.sh

echo "Deployment complete!"
