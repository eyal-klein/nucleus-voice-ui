# NUCLEUS Voice UI

Medical Imaging Pipeline Monitoring Dashboard for NUCLEUS-ATLAS

## Features

- **Home Dashboard** - Real-time overview of subjects, scans, and processing status
- **GCS Browser** - Browse DICOM and NIFTI files in Google Cloud Storage
- **Engine 1 Monitor** - Track DICOM→NIFTI conversion jobs
- **Engine 2 Monitor** - Monitor DTI and fMRI processing
- **Database Viewer** - View all database tables (subjects, scans, metrics)
- **NUCLEUS Chat** - Text chat interface with the autonomous orchestrator

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **UI Components**: shadcn/ui + Tailwind CSS 4
- **Routing**: Wouter
- **Build**: Vite
- **Deployment**: Cloud Run (nginx)

## Backend Integration

Connected to `nucleus-atlas-backend-v2` API:
- Real-time data fetching (no mock data)
- Auto-refresh every 10-30 seconds
- RESTful API endpoints

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```

## Deployment

Automatically deployed to Cloud Run on push to `main` branch via GitHub Actions.

**Production URL**: TBD after first deployment

## Architecture

```
nucleus-voice-ui (Frontend)
    ↓ HTTP/REST
nucleus-atlas-backend-v2 (Backend API)
    ↓
PostgreSQL (Supabase) + GCS (Storage)
```

## CI/CD

- **Build**: Docker multi-stage build with nginx
- **Deploy**: Cloud Run (europe-west1)
- **Trigger**: Push to main branch
- **Health Check**: `/health` endpoint

## License

Private - NUCLEUS-ATLAS Project
