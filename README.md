# Finance Dashboard Backend

A RESTful backend API for a multi-role finance dashboard system. Built with **Node.js**, **Express**, and **MongoDB**, it supports financial record management, role-based access control, and aggregated analytics — designed to serve data to a frontend dashboard cleanly and efficiently.

> **Live API Docs:** Once running, visit `http://localhost:5000/api-docs` for the full interactive Swagger documentation.

---

## Tech Stack

| Layer          | Technology                                      |
| -------------- | ----------------------------------------------- |
| Runtime        | Node.js (ESM)                                   |
| Framework      | Express.js v5                                   |
| Database       | MongoDB + Mongoose                              |
| Authentication | JSON Web Tokens (JWT)                           |
| Validation     | Zod v4                                          |
| Security       | Helmet, bcryptjs, express-rate-limit            |
| Logging        | Morgan (dev only)                               |
| API Docs       | Swagger UI (swagger-jsdoc + swagger-ui-express) |
| Testing        | Vitest + Supertest                              |

---

## Project Structure

```
finance-dashboard-backend/
├── src/
│   ├── config/
│   │   └── swagger.js              # Full OpenAPI 3.0 specification
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── record.controller.js
│   │   └── user.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT protect + RBAC authorizeRoles
│   │   ├── error.middleware.js     # Global error handler + 404 handler
│   │   └── validate.middleware.js  # Reusable Zod validation middleware
│   ├── models/
│   │   ├── Record.model.js
│   │   └── User.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── record.routes.js
│   │   └── user.routes.js
│   ├── tests/
│   │   ├── health.test.js          # Health check + 404 route tests
│   │   └── validate.test.js        # Zod middleware unit tests
│   ├── app.js                      # Express app setup
│   ├── seed.js                     # Database seeder
│   └── server.js                   # Entry point with env guards
├── .env.example
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone and install

```bash
git clone https://github.com/Amarsah15/finance-dashboard-backend.git
cd finance-dashboard-backend
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/finance_dashboard
JWT_SECRET=your_super_secret_jwt_key_here
```

> The server exits immediately with a clear error message if `JWT_SECRET` or `MONGODB_URI` are missing.

### 3. Seed the database

Populates the database with 3 test users and 20 sample financial records so you can test all endpoints immediately.

```bash
npm run seed
```

**Test credentials created by the seed script:**

| Role    | Email            | Password    |
| ------- | ---------------- | ----------- |
| Admin   | admin@test.com   | password123 |
| Analyst | analyst@test.com | password123 |
| Viewer  | viewer@test.com  | password123 |

### 4. Start the server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Server starts on `http://localhost:5000`.
Swagger UI available at `http://localhost:5000/api-docs`.

### 5. Run tests

```bash
npm test
```

---

## API Reference

All routes are prefixed with `/api/v1`. A health check is available at `GET /api/health`.

**Authentication:** Protected routes require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

> For a fully interactive version with request/response examples, use the Swagger UI at `/api-docs`.

---

### Auth

| Method | Endpoint                | Access | Description                              |
| ------ | ----------------------- | ------ | ---------------------------------------- |
| POST   | `/api/v1/auth/register` | Public | Register a new user (always Viewer role) |
| POST   | `/api/v1/auth/login`    | Public | Login and receive a JWT token            |

#### POST `/api/v1/auth/register`

```json
// Request Body
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}

// Response 201
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "Viewer",
    "token": "<jwt_token>"
  }
}
```

#### POST `/api/v1/auth/login`

```json
// Request Body
{ "email": "admin@test.com", "password": "password123" }

// Response 200
{
  "success": true,
  "data": { "_id": "...", "name": "Admin User", "role": "Admin", "token": "<jwt_token>" }
}
```

---

### Financial Records

| Method | Endpoint              | Access         | Description                                          |
| ------ | --------------------- | -------------- | ---------------------------------------------------- |
| GET    | `/api/v1/records`     | Admin, Analyst | Get all records with filters, search, and pagination |
| POST   | `/api/v1/records`     | Admin          | Create a new financial record                        |
| PUT    | `/api/v1/records/:id` | Admin          | Update an existing record                            |
| DELETE | `/api/v1/records/:id` | Admin          | Soft-delete a record                                 |

#### GET `/api/v1/records` — Query Parameters

| Parameter        | Type                  | Description                                             |
| ---------------- | --------------------- | ------------------------------------------------------- |
| `type`           | `income` \| `expense` | Filter by record type                                   |
| `category`       | string                | Filter by exact category name                           |
| `search`         | string                | Search across `category` and `notes` (case-insensitive) |
| `startDate`      | ISO date              | Records from this date                                  |
| `endDate`        | ISO date              | Records up to this date                                 |
| `page`           | number                | Page number (default: `1`)                              |
| `limit`          | number                | Results per page (default: `20`)                        |
| `includeDeleted` | `true`                | Admin only — include soft-deleted records               |

```json
// Response 200
{
  "success": true,
  "count": 10,
  "pagination": {
    "totalRecords": 47,
    "currentPage": 1,
    "totalPages": 3,
    "limit": 20
  },
  "data": [...]
}
```

#### POST `/api/v1/records`

```json
// Request Body
{
  "amount": 5000,
  "type": "income",
  "category": "Salary",
  "date": "2025-06-01T00:00:00.000Z",
  "notes": "Monthly salary"
}
```

---

### Dashboard

| Method | Endpoint                    | Access    | Description                      |
| ------ | --------------------------- | --------- | -------------------------------- |
| GET    | `/api/v1/dashboard/summary` | All roles | Get aggregated financial summary |

**Admin** sees aggregated data across all users in the system.
**Analyst and Viewer** see data scoped to their own records only.

```json
// Response 200
{
  "success": true,
  "data": {
    "summary": {
      "totalIncome": 15000,
      "totalExpense": 8200,
      "netBalance": 6800
    },
    "categories": [
      { "category": "Salary", "type": "income", "totalAmount": 10000 },
      { "category": "Rent",   "type": "expense", "totalAmount": 3000 }
    ],
    "trends": [
      { "year": 2025, "month": 6, "income": 5000, "expense": 2700, "net": 2300 },
      { "year": 2025, "month": 5, "income": 5000, "expense": 2800, "net": 2200 }
    ],
    "recentActivity": [...]
  }
}
```

---

### User Management

| Method | Endpoint                   | Access    | Description                   |
| ------ | -------------------------- | --------- | ----------------------------- |
| GET    | `/api/v1/users/me`         | All roles | Get own profile               |
| GET    | `/api/v1/users`            | Admin     | List all users                |
| PUT    | `/api/v1/users/:id/role`   | Admin     | Change a user's role          |
| PUT    | `/api/v1/users/:id/status` | Admin     | Activate or deactivate a user |

```json
// PUT /api/v1/users/:id/role
{ "role": "Analyst" }   // "Viewer" | "Analyst" | "Admin"

// PUT /api/v1/users/:id/status
{ "isActive": false }
```

---

## Role Permissions

| Action                      | Viewer | Analyst | Admin |
| --------------------------- | ------ | ------- | ----- |
| Register / Login            | ✅     | ✅      | ✅    |
| View own profile            | ✅     | ✅      | ✅    |
| View dashboard (own data)   | ✅     | ✅      | —     |
| View dashboard (all users)  | —      | —       | ✅    |
| View financial records      | ❌     | ✅      | ✅    |
| Create records              | ❌     | ❌      | ✅    |
| Update records              | ❌     | ❌      | ✅    |
| Delete records (soft)       | ❌     | ❌      | ✅    |
| List all users              | ❌     | ❌      | ✅    |
| Change user roles           | ❌     | ❌      | ✅    |
| Activate / deactivate users | ❌     | ❌      | ✅    |

---

## Data Models

### User

| Field      | Type    | Notes                                                                             |
| ---------- | ------- | --------------------------------------------------------------------------------- |
| `name`     | String  | Required                                                                          |
| `email`    | String  | Required, unique, lowercase                                                       |
| `password` | String  | Bcrypt hashed, min 6 chars — never returned in responses                          |
| `role`     | Enum    | `Viewer` \| `Analyst` \| `Admin` — default `Viewer`                               |
| `isActive` | Boolean | Default `true`. Inactive users are blocked at login and at every protected route. |

### Record

| Field       | Type     | Notes                                                                     |
| ----------- | -------- | ------------------------------------------------------------------------- |
| `user`      | ObjectId | Reference to the User who created the record                              |
| `amount`    | Number   | Required, must be positive                                                |
| `type`      | Enum     | `income` \| `expense`                                                     |
| `category`  | String   | Required, min 2 chars, trimmed                                            |
| `date`      | Date     | Defaults to creation time                                                 |
| `notes`     | String   | Optional, max 500 chars                                                   |
| `isDeleted` | Boolean  | Soft delete flag, default `false`                                         |
| `deletedAt` | Date     | Set on soft delete. MongoDB TTL index removes the document after 30 days. |

**Indexes:**

- `{ user: 1, date: -1 }` — optimises the most common query: a user's records sorted by date descending
- `{ deletedAt: 1 }` with `expireAfterSeconds: 2592000` — TTL index for automatic 30-day cleanup of soft-deleted records

---

## Optional Enhancements Implemented

Every optional enhancement listed in the assignment has been implemented:

| Enhancement                 | Implementation                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------- |
| Authentication using tokens | JWT via `jsonwebtoken`, 30-day expiry                                              |
| Pagination                  | `?page` and `?limit` on `GET /records` with full metadata response                 |
| Search support              | `?search=` performs case-insensitive regex across `category` and `notes`           |
| Soft delete                 | `isDeleted` flag + `deletedAt` timestamp + MongoDB TTL auto-purge after 30 days    |
| Rate limiting               | `express-rate-limit` — 100 requests per 15 minutes per IP across all `/api` routes |
| Unit tests                  | Vitest + Supertest — health check integration tests and Zod middleware unit tests  |
| API documentation           | Full OpenAPI 3.0 spec with interactive Swagger UI at `/api-docs`                   |

---

## Error Handling

All errors follow a consistent response shape:

```json
{ "success": false, "message": "A human-readable description" }
```

| Scenario                        | Status Code |
| ------------------------------- | ----------- |
| Zod validation failure          | 400         |
| Duplicate email on register     | 400         |
| Invalid credentials             | 401         |
| Missing or invalid JWT token    | 401         |
| Insufficient role permissions   | 403         |
| Deactivated account attempt     | 403         |
| Resource not found              | 404         |
| Invalid MongoDB ObjectId format | 404         |
| Rate limit exceeded             | 429         |
| Unhandled server error          | 500         |

In `development` mode, error responses also include a `stack` field for debugging. The stack is suppressed in `production`.

---

## Design Decisions and Tradeoffs

**Registration always creates a Viewer.**
Any self-registered user gets the `Viewer` role regardless of what is sent in the request body. Role elevation is an explicit Admin action via `PUT /api/v1/users/:id/role`. This prevents privilege escalation at the registration endpoint.

**Soft delete with automatic TTL cleanup.**
Records are never immediately destroyed. Instead, `isDeleted` is set to `true` and `deletedAt` is recorded. A MongoDB TTL index on `deletedAt` automatically removes the document from the database after 30 days, preserving a short-term audit trail without requiring a manual cleanup job or cron task.

**Role-scoped dashboard on a single endpoint.**
Rather than separate endpoints per role, `GET /api/v1/dashboard/summary` uses a dynamic `matchStage` built from `req.user.role` before being passed into each MongoDB aggregation pipeline. Admins receive data aggregated across all users; Analysts and Viewers receive only their own. This keeps the API surface clean while demonstrating conditional business logic in a single place.

**Deactivated users blocked at two layers.**
The `protect` middleware checks `isActive` on every authenticated request using the live database record, not just the token payload. The login endpoint also checks `isActive` before issuing a new token. This means deactivating a user immediately blocks both new logins and requests made with previously issued tokens — without requiring token blacklisting.

**Field-safe record updates.**
`PUT /api/records/:id` destructures only `{ amount, type, category, date, notes }` from `req.body` and passes that object to `findByIdAndUpdate`. The `user` field is explicitly excluded, preventing record ownership from being reassigned through the update endpoint.

**Search uses regex over a full-text index.**
The `?search=` parameter uses a case-insensitive MongoDB regex across `category` and `notes`. This is straightforward and appropriate for this scale. At larger scale, MongoDB Atlas Search or a dedicated search engine would offer better performance and relevance ranking.

**Tests target the Express layer without a live database.**
The unit and integration tests use Vitest and Supertest against the exported Express `app` instance, without connecting to MongoDB. This keeps the test suite fast, environment-independent, and reliable in CI. Database integration tests would be the natural next step.
