# Electricity Meter Tracker - Architecture

## Implementation Status: ✅ COMPLETED

This document describes the architecture of the self-hosted electricity meter tracking web application.

## Overview

A production-ready web application for logging and tracking electricity meter readings with automatic delta calculations and pricing, deployed using Docker Compose.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Docker Network                        │
│                                                              │
│  ┌─────────────┐         ┌──────────────┐                  │
│  │   Frontend  │ ──────> │   Backend    │                  │
│  │   (React)   │         │  (Express)   │                  │
│  │   Port 3000 │ <────── │  Port 3001   │                  │
│  └─────────────┘         └──────┬───────┘                  │
│                                  │                           │
│                                  ▼                           │
│                          ┌──────────────┐                   │
│                          │   SQLite DB  │                   │
│                          │  (Volume)    │                   │
│                          └──────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend
- **Runtime**: Node.js 20 (Alpine Linux)
- **Framework**: Express 4.18
- **Database**: SQLite with better-sqlite3
- **Validation**: express-validator
- **Security**: helmet, cors
- **Performance**: compression

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **UI Library**: Material-UI (MUI) v5
- **Charts**: MUI X Charts
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **PWA**: vite-plugin-pwa

### Deployment
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose v3.8
- **Networking**: Bridge network for service communication
- **Persistence**: Volume mount for SQLite database

## Data Model

### Tables

#### meters
```sql
CREATE TABLE meters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### readings
```sql
CREATE TABLE readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meter_id INTEGER NOT NULL,
  value REAL NOT NULL,
  price REAL NOT NULL,
  delta REAL,
  cost REAL,
  notes TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meter_id) REFERENCES meters(id) ON DELETE CASCADE
);

CREATE INDEX idx_readings_meter_id ON readings(meter_id);
CREATE INDEX idx_readings_timestamp ON readings(timestamp);
```

### Relationships
- One-to-Many: meters → readings
- Cascade delete: Deleting a meter removes all its readings

## API Endpoints

### Meters API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meters` | Get all meters |
| GET | `/api/meters/:id` | Get meter by ID |
| POST | `/api/meters` | Create new meter |
| PUT | `/api/meters/:id` | Update meter |
| DELETE | `/api/meters/:id` | Delete meter |

### Readings API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/readings` | Get all readings (paginated) |
| GET | `/api/readings/:id` | Get reading by ID |
| POST | `/api/readings` | Create new reading |
| PUT | `/api/readings/:id` | Update reading |
| DELETE | `/api/readings/:id` | Delete reading |
| GET | `/api/readings/stats/:meter_id` | Get statistics |
| GET | `/api/readings/trend/:meter_id` | Get consumption trend |

## Business Logic

### Delta Calculation
When a new reading is added:
1. Fetch previous reading for the same meter
2. Calculate delta = current_value - previous_value
3. Calculate cost = delta × price
4. Store delta and cost with the reading

### Edit Handling
When a reading is edited:
1. Recalculate its delta based on previous reading
2. Recalculate its cost based on new delta × price
3. Update next reading's delta and cost (ripple effect)

### Delete Handling
When a reading is deleted:
1. Remove the reading from database
2. Recalculate next reading's delta (skip deleted reading)
3. Update next reading's cost

## Frontend Architecture

### Pages
- **MainPage** (`/`): Dashboard with reading form and history
- **StatisticsPage** (`/statistics`): Charts and analytics

### Components
- **ReadingsList**: Table with CRUD operations
- **App**: Main layout with navigation

### State Management
- Local state with `useState` hooks
- API calls with async/await
- Loading and error states handled per component

### Responsive Design
- Mobile-first approach
- Drawer navigation for mobile
- Touch-friendly controls
- Responsive tables and charts

## Security

### Backend
- Input validation with express-validator
- CORS configuration
- Helmet for security headers
- No SQL injection (prepared statements)
- Error sanitization (no stack traces to client)

### Frontend
- No sensitive data in localStorage
- HTTPS ready (when deployed with reverse proxy)
- CSP-friendly build

## Deployment

### Docker Compose Setup
```yaml
services:
  - backend: Node.js API server
  - frontend: React static files served via Vite preview
  - network: Bridge network for inter-service communication
  - volume: Persistent storage for SQLite database
```

### Environment Variables
- `FRONTEND_PORT`: Frontend port (default: 3000)
- `BACKEND_PORT`: Backend port (default: 3001)
- `DATABASE_PATH`: SQLite database path

### Build Process
1. Multi-stage Docker builds for optimization
2. Production dependencies only in final image
3. Frontend built and served statically
4. Health check endpoint at `/health`

## Monitoring & Maintenance

### Logging
- Request logging in backend
- Console logging for development
- Production-ready log format

### Health Checks
- Backend: `GET /health` endpoint
- Returns status and timestamp

### Backups
- Database stored in `./database/` directory
- Simple file-based backup strategy
- Can be backed up with standard tools

## Performance

### Backend
- Database indexes on frequently queried columns
- Pagination for large result sets
- Compression middleware for responses
- WAL mode for SQLite (better concurrency)

### Frontend
- Code splitting with Vite
- Lazy loading (future enhancement)
- Optimized production builds
- PWA caching strategy

## Future Architecture Considerations

### Scalability
- Current: Single-instance deployment
- Future: Load balancing, Redis cache, PostgreSQL migration

### Multi-tenancy
- Current: Single-tenant design
- Future: User authentication, data isolation

### Real-time Updates
- Current: Polling/manual refresh
- Future: WebSockets for live updates

## Development Workflow

### Local Development
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

### Production Deployment
```bash
docker-compose up -d
```

## Documentation

- **README.md**: User documentation and setup guide
- **CONTRIBUTING.md**: Developer guidelines and standards
- **TODO.md**: Future enhancements and roadmap
- **Architecture.md**: This file

---

**Implementation Date**: October 1, 2025  
**Status**: Production Ready ✅  
**Version**: 1.0.0