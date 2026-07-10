#!/bin/bash
# Startup script for production deployment
set -e

# Write Google Earth Engine credentials to a file if provided via environment variable
if [ -n "$GEE_JSON_CONTENT" ]; then
    echo "Writing GEE credentials to ${GEE_KEY_FILE:-gee-service-key.json}"
    # Decode base64 JSON content
    echo "$GEE_JSON_CONTENT" | base64 -d > "${GEE_KEY_FILE:-gee-service-key.json}"
    
    # Verify that the file exists before proceeding
    if [ ! -f "${GEE_KEY_FILE:-gee-service-key.json}" ]; then
        echo "Error: Failed to create ${GEE_KEY_FILE:-gee-service-key.json}"
        exit 1
    fi
fi

# Start the application
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --workers "${WORKERS:-2}" --proxy-headers
