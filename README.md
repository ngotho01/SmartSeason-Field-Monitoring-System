 SmartSeason Field Monitoring System

A full-stack web application for tracking crop progress across multiple fields during a growing season. Built as a technical assessment submission.

🌐 Live Demo:** https://smart-season-field-monitoring-syste-blond.vercel.app
📦 Repository:** https://github.com/ngotho01/SmartSeason-Field-Monitoring-System

---

🎯 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin (Coordinator) | `admin` | `admin123` |
| Field Agent | `agent1` | `agent123` |
| Field Agent | `agent2` | `agent123` |

> Seed data is loaded automatically on first run if the database is empty.

---

## 🛠️ Tech Stack

**Backend**
- Spring Boot 3.2 (Java 17)
- Spring Security with JWT authentication
- Spring Data JPA
- MySQL 8
- Maven

**Frontend**
- React 18 + Vite
- React Router DOM
- Axios
- Recharts (data visualizations)
- Lucide React (icons)

**Deployment**
- Backend: Railway
- Frontend: Vercel
- Database: Railway MySQL

---

## 📁 Project Structure

```
smartseason/
├── backend/                  Spring Boot REST API
│   └── src/main/java/com/ngothodev/smartseason/
│       ├── config/           Data initializer
│       ├── controller/       REST controllers
│       ├── dto/              Request/response DTOs (records)
│       ├── exception/        Global exception handler
│       ├── model/            JPA entities & enums
│       ├── repository/       Spring Data repositories
│       ├── security/         JWT + Spring Security config
│       └── service/          Business logic
└── frontend/                 React SPA
    └── src/
        ├── api/              Axios instance
        ├── components/       Reusable UI components
        ├── context/          Auth & toast contexts
        └── pages/            Route-level pages
```

---

## 🚀 Setup Instructions

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- MySQL 8 running locally on port 3306

### 1. Clone the repo
```bash
git clone https://github.com/ngotho01/SmartSeason-Field-Monitoring-System.git
cd SmartSeason-Field-Monitoring-System
```

### 2. Backend setup
```bash
cd backend
```

Edit `src/main/resources/application.properties` to match your local MySQL credentials if needed (defaults are `root` with no password).

```bash
mvn spring-boot:run
```

Backend starts on **http://localhost:8080**. On first start, three users and four sample fields are seeded automatically.

### 3. Frontend setup
```bash
cd ../frontend
npm install
```

Create `.env.local` to point at your local backend:
```
VITE_API_URL=http://localhost:8080/api
```

Then run:
```bash
npm run dev
```

Frontend starts on **http://localhost:5173**.

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | Public | Login, returns JWT |

### Fields
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/fields` | Any | List fields (Admin: all, Agent: assigned only) |
| GET | `/api/fields/{id}` | Any | Field details |
| POST | `/api/fields` | ADMIN | Create field |
| PUT | `/api/fields/{id}` | ADMIN | Update field |
| PUT | `/api/fields/{id}/assign` | ADMIN | Assign agent to field |
| DELETE | `/api/fields/{id}` | ADMIN | Delete field |

### Field Updates
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/fields/{id}/updates` | Any | List updates for a field |
| POST | `/api/fields/{id}/updates` | AGENT | Post observation + optional stage change |

### Agents (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/agents` | Simple list of agents |
| GET | `/api/users/agents/detailed` | Agents with field counts |
| POST | `/api/users/agents` | Create a new agent |
| DELETE | `/api/users/agents/{id}` | Delete agent (must have no fields) |

### Dashboard
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/admin` | ADMIN | Overview of all fields, agents, recent activity |
| GET | `/api/dashboard/agent` | AGENT | Overview of assigned fields and own updates |

---

## 🔐 Authentication Flow

1. Client POSTs `{ username, password }` to `/api/auth/login`
2. `AuthService` validates credentials via Spring's `AuthenticationManager`
3. On success, a JWT (HS256, 24h expiry) is signed with the username as subject
4. Response includes `{ token, userId, username, fullName, role }`
5. Client stores the token in `localStorage` and attaches it as `Authorization: Bearer <token>` on every subsequent request
6. `JwtAuthenticationFilter` parses the token on each request, loads the user, and populates the security context with `ROLE_ADMIN` or `ROLE_AGENT`
7. `@PreAuthorize` annotations on controllers enforce role-based access; service-layer checks enforce ownership (an agent can only access fields assigned to them)
8. On any `401` response, the axios interceptor clears storage and redirects to `/login`

---

## 🧠 Field Status Logic

Field status is **computed on read** rather than stored — it's a pure function of the field's data, located in `FieldStatusService`:

| Status | Condition |
|--------|-----------|
| **COMPLETED** | `currentStage == HARVESTED` |
| **AT_RISK** | No update in the last 7 days (uses `lastUpdateAt`, falling back to `createdAt`) |
| **ACTIVE** | Everything else |

**Why computed instead of stored?**
- No data drift — status is always consistent with the field's actual state
- No scheduled job required to flip statuses to `AT_RISK`
- Trivial to unit test (pure function, no I/O)
- Easy to change the rules later without a data migration

---

## 🏗️ Design Decisions

### Architecture
- **Layered architecture**: `controller → service → repository → model/dto`. Controllers stay thin; all business logic lives in services.
- **DTOs as Java records** for immutability and brevity.
- **Stateless JWT** — no server-side sessions, easy to scale horizontally.
- **Single source of truth for status** via `FieldStatusService`, used by both the field service and the dashboard service.

### Security
- Passwords hashed with **BCrypt** before storage.
- Two layers of access control:
  - `@PreAuthorize("hasRole('ADMIN')")` for admin-only endpoints
  - Ownership checks in services (agents can only read/update fields assigned to them)
- CORS configured via environment variable to support local + production origins.
- Agent deletion is guarded — an agent with assigned fields cannot be deleted until those fields are reassigned, preventing orphaned data.

### Frontend
- Single shared `axios` instance with request/response interceptors for auth and 401 handling.
- React Context for auth state (`AuthContext`) and toast notifications (`ToastContext`).
- Sidebar layout with role-aware navigation (Agents link only visible to admins).
- Loading skeletons on every page — no blank flashes.
- Toast notifications for every user action (create, update, delete, errors).
- Charts on the admin dashboard for status and stage breakdowns.
- Search and status filter on the field list page.
- Timeline view for field update history.

### Data Modeling
- A "field update" entity captures both **observations** (notes only) and **stage changes** (notes + new stage). Treating them as one entity keeps the audit trail in a single place rather than splitting into two tables.
- `lastUpdateAt` on the field is denormalized from `field_updates` for fast `AT_RISK` calculation without an extra query.

---

## 📋 Assumptions

- Agents do not self-register — admins onboard them via the Agents page (realistic for a coordinator-run system).
- One agent per field at a time. Reassignment replaces the previous agent.
- The "no update in 7 days = AT_RISK" threshold is a reasonable default. It's a single constant in `FieldStatusService` and easy to tune.
- The seed data only loads if the database is empty, so restarts and redeploys are safe.
- Demo passwords are intentionally simple. In production, agents would receive an invitation email and set their own password on first login.

---

## 🚧 What's Out of Scope (Possible Extensions)

- Pagination & advanced filtering on field lists
- Field photo uploads
- Email/SMS notifications when a field becomes `AT_RISK`
- Refresh token rotation
- Audit trail for admin actions
- Multi-tenant support (multiple coordinators / regions)
- Docker Compose for one-command local startup

---

## 🧪 Quick Testing Flow

1. Visit the [live demo](https://smart-season-field-monitoring-syste-blond.vercel.app) and log in as `admin / admin123`
2. You'll see the admin dashboard with seeded data
3. Open **Fields** → you'll see four sample fields. "South Block B" should show **At Risk** (its last update was seeded 10 days ago)
4. "East Block C" should show **Completed** (stage = HARVESTED)
5. Open the **Agents** page → create a new agent
6. Open any field → assign it to the new agent
7. Log out, log in as the new agent → confirm only their assigned field is visible
8. Post an update with notes + a stage change → confirm the status updates and appears on the admin dashboard

---

## 👤 Author

Built by Charles Wachira *— BSc Information Technology student at KCA University, Nairobi.

GitHub: [@ngotho01](https://github.com/ngotho01)
