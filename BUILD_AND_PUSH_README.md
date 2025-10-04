# Build and Push Script - Fixed for npm install Hanging

## Problem
The npm install was hanging during the Docker frontend build.

## Solution Applied

### 1. Updated Frontend Dockerfile
Added robust npm install with timeouts and retry logic:
- `--verbose`: Shows progress to avoid appearing hung
- `--fetch-timeout=60000`: 60-second timeout per package
- `--fetch-retries=3`: Retry failed downloads up to 3 times
- Fallback: If install fails, clean cache and retry

### 2. Updated Build Script
- Added `--progress=plain` to Docker build for better visibility
- Added informative message that frontend build may take several minutes
- Backend already pushes successfully to 192.168.0.4:5001

## How to Run

```bash
cd /home/fitzzz/eCarChargeLogger
./build-and-push.sh
```

Enter your sudo password when prompted.

## What It Does

1. ✓ Checks Docker daemon configuration for insecure registry
2. ✓ Verifies registry connectivity at 192.168.0.4:5001
3. ✓ Builds backend image (already working)
4. ✓ Pushes backend to registry
5. ✓ Builds frontend image (now with improved npm install)
6. ✓ Pushes frontend to registry

## Images Created

- `192.168.0.4:5001/ecarchargelogger-backend:latest`
- `192.168.0.4:5001/ecarchargelogger-frontend:latest`

## Optional: Version Tagging

```bash
./build-and-push.sh v1.0.0
```

## Troubleshooting

If npm install still hangs:
1. Check network connectivity to npm registry
2. Try building frontend locally first: `cd frontend && npm install`
3. Consider using `--network=host` in Docker build (can add to script if needed)

## Alternative: Build Without sudo Password Prompts

Add your user to docker group (one-time setup):
```bash
sudo usermod -aG docker $USER
newgrp docker
```

Then run the script without sudo.
