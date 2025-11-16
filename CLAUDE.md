# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a social media subscription survey application built as a full-stack web application. Users can complete surveys selecting which social media platforms they use, and administrators can manage surveys and view aggregated results.

## Commands

### Development
- `npm run dev` - Start the Vite development server for the frontend (port 5173)
- `npm run dev:server` - Start the backend server with auto-reload (port 3001)
- `npm run dev:all` - Start both frontend and backend concurrently
- `npm run typecheck` - Run TypeScript type checking without emitting files

### Build & Deploy
- `npm run build` - Build the frontend for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint on the codebase

### Backend-Specific (in `/server` directory)
- `npm run dev` - Start server with auto-reload using Node.js watch mode
- `npm start` - Start server in production mode
- `npm run init-db` - Initialize the SQLite database with required tables

### Setup
- `npm run setup` - Install server dependencies and initialize the database (run this after cloning)

## Architecture

### Client-Server Structure
This is a monorepo-style project with separate frontend and backend:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS (root directory)
- **Backend**: Express.js + SQLite (in `/server` directory)
- API communication via REST endpoints at `http://localhost:3001/api`

### Frontend Architecture

#### State Management
- Uses React's built-in `useState` for state management (no external state library)
- Top-level `App.tsx` manages global navigation state using a simple state machine
- View states: `survey-list | survey-form | success | results | admin-login | admin-dashboard`

#### Component Organization
All components are in `/src/components`:
- **SurveyList**: Public-facing list of available surveys
- **SurveyForm**: Multi-select platform selection form
- **SuccessScreen**: Confirmation after survey submission
- **ResultsPage**: Public results display with bar charts
- **AdminLogin**: Simple password-based admin authentication (client-side only)
- **AdminDashboard**: Admin panel entry point
- **SurveyManagement**: CRUD operations for surveys and viewing detailed statistics

#### API Client
- Centralized API client in `/src/lib/api.ts`
- All API calls use `fetch` with Promise-based async/await
- API base URL configurable via `VITE_API_URL` environment variable (defaults to `http://localhost:3001/api`)

#### Platform Definitions
Social media platforms are defined in `/src/types/platforms.ts` as a const array. This is the single source of truth for available platforms and includes Japanese platform names (LINE, X（旧Twitter）, etc.).

### Backend Architecture

#### Database Schema
SQLite database (`/server/survey.db`) with three tables:
- **surveys**: Survey metadata (title, description, active/visible flags)
- **survey_responses**: Individual response records with session tracking
- **social_media_selections**: Many-to-many relationship between responses and platform selections

All tables use UUIDs for primary keys. Foreign keys are enabled with CASCADE delete behavior.

#### API Endpoints
Express server in `/server/index.js` provides:
- Survey CRUD: `GET/POST/PUT/DELETE /api/surveys`
- Response submission: `POST /api/responses`
- Results: `GET /api/surveys/:id/results` (public aggregated data)
- Stats: `GET /api/surveys/:id/stats` (admin-only detailed stats)
- Bulk delete: `DELETE /api/surveys/:id/responses`

#### Database Helpers
Three promisified wrapper functions (`dbAll`, `dbGet`, `dbRun`) convert sqlite3 callbacks to Promises for cleaner async/await usage.

## Important Implementation Details

### Survey Visibility
Surveys have two boolean flags:
- `is_active`: Whether survey accepts new responses
- `is_visible`: Whether survey appears in public listing
These are stored as integers (0/1) in SQLite but treated as booleans in the application.

### Admin Authentication
Admin access is client-side only with a hardcoded password check in `AdminLogin.tsx`. This is NOT secure for production use - there is no backend authentication or session management.

### Database Initialization
The database must be initialized before first use. The `init-db.js` script creates tables with proper foreign key constraints and performance indexes. Running it multiple times is safe (uses `CREATE TABLE IF NOT EXISTS`).

### Japanese Language Support
Platform names include Japanese characters and require proper UTF-8 handling. The application is designed for Japanese-speaking users.
