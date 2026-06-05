# AidCircle Backend API

Backend API for the AidCircle SOS and nearby emergency response mobile app.

## Stack

- Node.js
- Express.js
- TypeScript
- Supabase Auth
- Supabase Postgres
- PostGIS
- Firebase Admin SDK
- Swagger / OpenAPI
- Vitest
- Supertest

## Requirements

- Node.js 20 or higher
- npm
- Supabase project
- Firebase project for push notifications

## Installation

```bash
npm install
Environment Setup

Create a .env file in the backend root.

Use .env.example as the base:

NODE_ENV=development
PORT=5000

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

APP_NAME=AidCircle
DEFAULT_ALERT_RADIUS_KM=5
SOS_AUTO_EXPIRE_MINUTES=120

CORS_ALLOWED_ORIGINS=

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=120

AUTH_RATE_LIMIT_WINDOW_MS=60000
AUTH_RATE_LIMIT_MAX_REQUESTS=10
Supabase Setup

Run the SQL schema from:

supabase/schema.sql

This creates:

user profiles
user locations
user devices
emergency categories
emergencies
emergency responders
notifications
reports
PostGIS location triggers
nearby users RPC
nearby active emergencies RPC

Required Supabase extensions:

create extension if not exists postgis;
Development
npm run dev

Default local server:

http://localhost:5000

Health check:

GET /health

Swagger UI:

http://localhost:5000/api-docs

OpenAPI JSON:

http://localhost:5000/api-docs.json
Scripts
npm run dev

Starts the development server with tsx watch.

npm run typecheck

Runs TypeScript validation without emitting files.

npm test

Runs Vitest test suite.

npm run build

Builds TypeScript into dist.

npm start

Runs the compiled production build.

npm run verify

Runs typecheck, tests, and production build.

API Modules

Base path:

/api/v1

Implemented modules:

Auth
Users
Locations
Emergencies
Responders
Notifications
Reports
Auth Endpoints
POST /api/v1/auth/signup
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me

Authentication uses Supabase access tokens.

Protected routes require:

Authorization: Bearer <access_token>
Users Endpoints
GET    /api/v1/users/me
PATCH  /api/v1/users/me
DELETE /api/v1/users/me
GET    /api/v1/users/:userId
GET    /api/v1/users/admin
PATCH  /api/v1/users/admin/:userId

Admin endpoints require:

user_profiles.role = admin
Locations Endpoints
GET  /api/v1/locations/me
POST /api/v1/locations/me
GET  /api/v1/locations/nearby-users
GET  /api/v1/locations/nearby-emergencies

Nearby lookup uses PostGIS RPC functions.

Emergencies Endpoints
GET   /api/v1/emergencies/categories
GET   /api/v1/emergencies
POST  /api/v1/emergencies
GET   /api/v1/emergencies/me/history
GET   /api/v1/emergencies/:emergencyId
PATCH /api/v1/emergencies/:emergencyId/cancel
PATCH /api/v1/emergencies/:emergencyId/resolve

SOS creation behavior:

creates an active emergency
stores GPS latitude and longitude
database trigger creates PostGIS geography point
finds nearby available users
creates in-app notification records
attempts Firebase push delivery if Firebase is configured
does not fail emergency creation if notification fanout fails
Responders Endpoints
POST   /api/v1/responders/emergencies/:emergencyId/accept
PATCH  /api/v1/responders/emergencies/:emergencyId/status
DELETE /api/v1/responders/emergencies/:emergencyId/leave
GET    /api/v1/responders/me/active
GET    /api/v1/responders/me/history
Notifications Endpoints
POST   /api/v1/notifications/devices
DELETE /api/v1/notifications/devices/:deviceId
GET    /api/v1/notifications/me
PATCH  /api/v1/notifications/:notificationId/read
POST   /api/v1/notifications/test-push

Firebase push requires:

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

If Firebase is not configured, normal backend routes still run. Push-specific routes fail only when called.

Reports Endpoints
POST  /api/v1/reports/emergencies/:emergencyId
POST  /api/v1/reports/users/:userId
GET   /api/v1/reports/me
GET   /api/v1/reports/admin
PATCH /api/v1/reports/admin/:reportId/status

Admin report queue requires:

user_profiles.role = admin
Request ID

Every response includes:

X-Request-Id

Clients may send:

x-request-id: custom-request-id

If valid, the backend reuses it. Otherwise, it generates a UUID.

Error responses include requestId when available.

Rate Limiting

General API limit:

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=120

Auth-specific limit:

AUTH_RATE_LIMIT_WINDOW_MS=60000
AUTH_RATE_LIMIT_MAX_REQUESTS=10

Rate limit response headers:

X-RateLimit-Limit
X-RateLimit-Remaining
X-RateLimit-Reset
Retry-After

Current limiter is in-memory and process-local.

For multi-instance production deployment, replace it with Redis-backed rate limiting.

CORS

Development behavior:

CORS_ALLOWED_ORIGINS=

If empty in non-production, CORS is permissive.

Production behavior:

CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com,https://admin.your-domain.com

In production, browser origins not listed here are blocked.

Requests without an Origin header are allowed for mobile/native/server clients.

Testing

Run:

npm test

Full verification:

npm run verify

Current tests cover:

health endpoint
request id behavior
not-found response shape
OpenAPI JSON exposure
documented core paths
bearer auth scheme
rate limit headers
auth rate-limit blocking
production CORS allow/block behavior
Production Build
npm run verify
npm start

The production entrypoint is:

dist/server.js
Current Limitations
Rate limiting is in-memory and single-instance only.
Firebase push depends on valid Firebase service account environment variables.
Supabase service role key must only be used server-side.
RLS policies are enabled in schema, but backend currently uses service-role access.
If direct client-to-Supabase access is added later, strict RLS policies must be completed first.

Run:

```powershell
npm run verify