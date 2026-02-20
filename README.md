# Resilience360

Resilience360 is an Infrastructure Safety and Disaster Engineering Toolkit focused on district-level planning, hazard overlays, practical engineering guidance, and field-ready outputs.

## Tech stack

- React + TypeScript + Vite
- Express backend for AI/guidance routes
- Leaflet map UI with district/province overlays
- PWA support via vite-plugin-pwa
- Capacitor mobile shells for Android and iOS

## Local development

- Frontend only: npm run dev
- Full stack (frontend + backend): npm run dev:full
- Backend only: npm run server

## Production build

- npm run build

## GitHub auto-deploy

- Frontend auto-deploy workflow: [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml)
- Backend auto-deploy instructions: [docs/BACKEND_DEPLOY_INSTRUCTIONS.md](docs/BACKEND_DEPLOY_INSTRUCTIONS.md)

### One-time GitHub Pages setup

1. Open repository Settings -> Pages
2. Set Source to GitHub Actions
3. Push to main (workflow auto-deploys frontend)

## Mobile (PWA + Capacitor)

- Build and sync native projects: npm run mobile:prepare
- Open Android project: npm run cap:open:android
- Open iOS project: npm run cap:open:ios

For complete store release instructions and signing checklists:

- [docs/MOBILE_RELEASE_GUIDE.md](docs/MOBILE_RELEASE_GUIDE.md)

## Important deployment note

This app includes server-backed AI features. For production mobile builds, ensure all API endpoints are public HTTPS endpoints (do not use localhost).
