#!/bin/sh
set -e

echo "================================"
echo "Container Startup - Environment Check"
echo "================================"
echo "All environment variables:"
env | sort
echo "================================"

# Check if BACKEND_HOST is set
if [ -z "$BACKEND_HOST" ]; then
    echo "ERROR: BACKEND_HOST environment variable is NOT SET!"
    echo "This variable MUST be set in your Docker container configuration."
    echo "In Unraid, go to Docker > Edit Container > Add Variable"
    echo "  Name: BACKEND_HOST"
    echo "  Key: BACKEND_HOST" 
    echo "  Value: 192.168.0.4:3001"
    echo ""
    echo "Using fallback default: localhost:3001"
    export BACKEND_HOST="localhost:3001"
else
    echo "✓ BACKEND_HOST is set to: $BACKEND_HOST"
fi

echo "================================"

# Substitute environment variables in nginx config
envsubst '${BACKEND_HOST}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Show the generated config for debugging
echo "Generated nginx configuration:"
echo "================================"
cat /etc/nginx/conf.d/default.conf
echo "================================"

# Test the nginx configuration
echo "Testing nginx configuration..."
nginx -t

echo "Starting nginx..."
# Start nginx
exec nginx -g 'daemon off;'
