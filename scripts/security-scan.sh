#!/bin/bash

IMAGE_NAME="identity-ocr-liveness-kata-node-app"

echo "🔒 Starting security scan for image: $IMAGE_NAME..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH."
    exit 1
fi

# Use Trivy container to scan the application image
# We mount docker.sock so Trivy can see the local images
docker run --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    aquasec/trivy image \
    --severity HIGH,CRITICAL \
    --no-progress \
    $IMAGE_NAME

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Security scan completed."
else
    echo "⚠️ Security scan found issues or failed."
    # We don't exit with error here to avoid breaking deployment flow if vulnerabilities are found, 
    # but in a real CI/CD pipeline you might want to block.
fi
