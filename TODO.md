# TODO - Future Enhancements

This document tracks planned features and improvements for the Electricity Meter Tracker application.

## High Priority

### Export Functionality
- [ ] Export readings to CSV
- [ ] Export readings to Excel
- [ ] Export statistics report as PDF
- [ ] Scheduled automatic exports

### Data Import
- [ ] Import readings from CSV
- [ ] Import from other meter tracking tools
- [ ] Bulk import with validation

### User Management
- [ ] Basic authentication (username/password)
- [ ] Multi-user support with access control
- [ ] User preferences (date format, currency, language)

### Notifications
- [ ] Email notifications for unusual consumption
- [ ] Alerts for missing readings (scheduled checks)
- [ ] Budget alerts (when costs exceed threshold)

## Medium Priority

### Advanced Statistics
- [ ] Year-over-year comparison
- [ ] Consumption predictions based on history
- [ ] Cost projections
- [ ] Peak consumption analysis
- [ ] Seasonal trends visualization

### Improved Charts
- [ ] More chart types (pie, area, stacked bar)
- [ ] Custom date range selection
- [ ] Compare multiple meters side-by-side
- [ ] Heatmap for hourly consumption

### Mobile App
- [ ] Native iOS app
- [ ] Native Android app
- [ ] Offline support with sync
- [ ] Camera integration for meter reading OCR

### Data Management
- [ ] Automated backups to cloud (S3, Dropbox, etc.)
- [ ] Data retention policies
- [ ] Archive old readings
- [ ] Duplicate detection

### API Enhancements
- [ ] REST API documentation (Swagger/OpenAPI)
- [ ] Rate limiting
- [ ] API authentication tokens
- [ ] Webhooks for integrations

## Low Priority

### Integrations
- [ ] Home Assistant integration
- [ ] IFTTT support
- [ ] Zapier integration
- [ ] Smart meter direct integration (if API available)
- [ ] Solar panel production tracking

### Advanced Features
- [ ] Budget planning tool
- [ ] Cost comparison with neighbors (anonymized)
- [ ] Energy saving tips based on consumption
- [ ] Carbon footprint calculation
- [ ] Tariff optimizer (suggest best electricity plans)

### UI/UX Improvements
- [ ] Dark mode
- [ ] Multiple themes
- [ ] Customizable dashboard widgets
- [ ] Drag-and-drop dashboard layout
- [ ] Accessibility improvements (WCAG 2.1 AA)
- [ ] Multiple language support (i18n)

### Developer Experience
- [ ] Unit tests for backend
- [ ] Integration tests
- [ ] E2E tests with Playwright/Cypress
- [ ] CI/CD pipeline
- [ ] TypeScript migration
- [ ] API versioning

### Performance
- [ ] Database query optimization
- [ ] Caching layer (Redis)
- [ ] Frontend lazy loading
- [ ] Image optimization
- [ ] Service worker for offline functionality

### Deployment
- [ ] Kubernetes deployment option
- [ ] Cloud deployment guides (AWS, Azure, GCP)
- [ ] One-click deployment (Railway, Render, Fly.io)
- [ ] ARM architecture support (Raspberry Pi)

## Infrastructure

### Monitoring
- [ ] Application logging (Winston, Pino)
- [ ] Error tracking (Sentry)
- [ ] Analytics (privacy-focused)
- [ ] Health check endpoint improvements
- [ ] Performance monitoring

### Database
- [ ] PostgreSQL support as alternative to SQLite
- [ ] MySQL/MariaDB support
- [ ] Database migration tool
- [ ] Automatic database backups

### Security
- [ ] Two-factor authentication
- [ ] OAuth2 support (Google, GitHub)
- [ ] Session management improvements
- [ ] HTTPS enforcement
- [ ] Security headers (CSP, HSTS)
- [ ] Audit logging

## Nice-to-Have

- [ ] Browser extension for quick reading entry
- [ ] Voice input for readings (mobile)
- [ ] QR code generation for sharing meters
- [ ] Public dashboard sharing (read-only)
- [ ] Widget for home screen (mobile)
- [ ] Desktop app (Electron)
- [ ] CLI tool for power users
- [ ] GraphQL API
- [ ] Real-time updates (WebSockets)
- [ ] Collaborative features (shared meters)

## Community Requests

_This section will be updated based on user feedback and community contributions._

---

## How to Contribute

If you'd like to work on any of these features:

1. Check if an issue exists for the feature
2. If not, create an issue describing your approach
3. Wait for maintainer feedback
4. Fork the repository and create a feature branch
5. Implement the feature following [CONTRIBUTING.md](CONTRIBUTING.md)
6. Submit a pull request

## Prioritization Criteria

Features are prioritized based on:

1. **User Value**: How many users will benefit?
2. **Effort**: How much work is required?
3. **Dependencies**: Does it block other features?
4. **Maintenance**: What's the ongoing maintenance cost?
5. **Security**: Does it improve security?

## Completed Features

When features are completed, they will be moved here with the completion date:

- ✅ Multi-meter support (2025-10-01)
- ✅ Statistics and trend charts (2025-10-01)
- ✅ Docker deployment (2025-10-01)
- ✅ PWA support (2025-10-01)
- ✅ Edit and delete readings (2025-10-01)
- ✅ Automatic delta and cost calculation (2025-10-01)

---

Last updated: 2025-10-01
