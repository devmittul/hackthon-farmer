#!/bin/bash
# Startup script for production deployment
set -e

# Write Google Earth Engine credentials to a file if provided via environment variable
if [ -n "$GEE_JSON_CONTENT" ]; then
    echo "Writing GEE credentials to ${GEE_KEY_FILE:-gee-service-key.json}"
    # Check if content starts with '{' (Raw JSON) or is base64 encoded
    if [[ "$GEE_JSON_CONTENT" == {* ]]; then
        echo "$GEE_JSON_CONTENT" > "${GEE_KEY_FILE:-gee-service-key.json}"
    else
        echo "$GEE_JSON_CONTENT" | base64 -d > "${GEE_KEY_FILE:-gee-service-key.json}"
    fi
    
    # Verify that the file exists before proceeding
    if [ ! -f "${GEE_KEY_FILE:-gee-service-key.json}" ]; then
        echo "Error: Failed to create ${GEE_KEY_FILE:-gee-service-key.json}"
        exit 1
    fi
fi

# Start the application
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --workers "${WORKERS:-2}" --proxy-headers
