#!/bin/bash

MAX_RETRIES=30
RETRY_INTERVAL=5

echo "Checking application health..."

for i in $(seq 1 $MAX_RETRIES); do
    # Check if we can reach localhost:80/health (via Nginx) or localhost:3000/health (direct)
    # Since we are running this script from host, and ports are mapped.
    # Nginx is on 80, App is on 3000.
    
    if curl -s -f http://localhost/health > /dev/null; then
        echo "✅ Application is healthy (via Nginx)"
        exit 0
    fi
    
    if curl -s -f http://localhost:3000/health > /dev/null; then
        echo "✅ Application is healthy (Direct)"
        exit 0
    fi
    
    echo "⏳ Waiting for application... ($i/$MAX_RETRIES)"
    sleep $RETRY_INTERVAL
done

echo "❌ Health check failed"
exit 1
