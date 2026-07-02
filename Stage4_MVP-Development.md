# Haven: MVP Development & Sprint Documentation

<p align="center">
  <img src="/Templates/logo_haven.png" alt="Haven Logo" width="300" />
</p>

## Project Overview

**Haven** is a school bullying report platform designed for students, parents, and educational staff.

The project is made of three main parts:

- A **REST API** built with **Bun + Elysia** and **Prisma ORM (PostgreSQL)**, with real-time WebSocket support for crisis alerts.
- A **web interface** built with **React + Vite + TypeScript**, covering a landing page, authentication flows, and three role-based dashboards.
- A **Flutter mobile app** for students, with chatbot integration, report tracking, breathing exercises and multi-role support.
- A **Typebot chatbot** that guides students through the reporting process conversationally.

---

## MVP Goal

- Let students report bullying situations with full control over their anonymity level.
- Give school staff (supervisors and directors) the tools to manage, triage, and follow up on cases.
- Keep parents informed about their child's situation without exposing sensitive data.
- Detect crisis situations automatically and alert connected staff in real time via WebSocket.

---

## v0. Sprint Planning

### Methodology: MoSCoW

| Priority | Features |
|---|---|
| **Must Have** | JWT authentication, RBAC (4 roles), report submission, crisis detection, admin dashboard, student report tracking |
| **Should Have** | Parent dashboard, real-time WebSocket alerts, team management, report assignment, RGPD export |
| **Could Have** | Breathing exercises (Flutter), anonymity levels (3 options), PDF export |
| **Won't Have** | Push notifications, multi-school SaaS mode, AI summaries (beyond MVP scope) |

### Sprint Structure

- **Duration:** ~2 weeks per sprint
- **Tools:** GitHub for version control and task tracking, Swagger UI for API testing
- **Roles:**
  - **Backend Dev:** Bun, Elysia, Prisma ORM, WebSocket
  - **Frontend Dev:** React/Vite + TypeScript, Flutter
  - **QA:** Manual testing via Swagger UI and PostgreSQL queries
  - **SCM:** Branch strategy, PR reviews, merges

---

## 1. Execute Development Tasks

### Sprint 1: Foundation & Auth (June 1-14)

**Goal:** Get the project skeleton up, database designed, and auth working end to end.

**Backend:**
- Prisma schema: `User`, `Report`, `ReportSummary`, `ChatMessage`, `Analytics`, `ParentMessage`
- 4 roles via enum: `STUDENT`, `SUPERVISOR`, `ADMIN`, `PARENT`
- Report lifecycle: `EN_ATTENTE` → `EN_COURS` → `RESOLU` → `ARCHIVE`
- `POST /auth/register` and `POST /auth/login` with JWT, password hashing with bcrypt
- `GET /auth/profile` for token validation
- Migrations: `init`, `add_admin_role`, `add_categorie_anonymat_crisis`, `statuts_francais`

**Flutter (mobile):**
- Auth pages for all 3 portals (student, parent, professional)
- Tutorial onboarding screens with SVG illustrations
- Home page, navigation setup

**SCM:**
- Branch strategy: `main` → `dev` → `feature/*`
- PRs reviewed before merging into `dev`

---

### Sprint 2: Reports, Chatbot & Crisis System (June 14-21)

**Goal:** Full report lifecycle and real-time crisis detection via WebSocket.

**Backend:**
- `POST /reports`: submit a report, supports anonymous (no bearer) or authenticated modes
- `POST /reports/:code`: Typebot webhook for adding deposition content
- `GET /reports/:code`: track a report by its code
- `DELETE /reports/:code`: cancel a report within 5 minutes of creation
- `POST /reports/:code/summary`: save full chatbot session data into `ReportSummary`
- `POST /reports/:code/link`: link an anonymous chatbot report to a student account
- Crisis keyword detection on report content (suicide, self-harm) → `crisisDetected: true`
- WebSocket manager: broadcast crisis alerts to all connected staff in real time
- Ephemeral WS token store: 30-second single-use tokens for secure WS handshake
- Migrations: `add_parent_child_link`, `add_user_profile_fields`

**Flutter:**
- Chat/report flow wired to the API
- Report tracking dashboard
- Anonymity choice page

---

### Sprint 3: Dashboards & Web Frontend (June 18-30)

**Goal:** Build the three dashboards (student, professional, parent) on web and wire everything to real data.

**Backend:**
- `GET /admin/reports`: paginated list with optional status filter
- `POST /admin/reports/:id/assign`: assign a referent to a case
- `PATCH /admin/reports/:id`: update status and/or severity
- `POST /admin/reports/:id/events`: add a follow-up action (persisted as STAFF ChatMessage)
- `GET /admin/reports/:id/summary`: full chatbot session data for a case
- `GET /admin/stats`: report statistics per establishment
- `GET /admin/team`: team list with jobTitle and isCoRef fields
- `PATCH /admin/users/:userId`: update jobTitle, isCoRef, and SUPERVISOR → ADMIN promotion
- `PATCH /admin/users/:userId/parent`: link a parent account to a student
- RGPD: `GET /auth/me/export` and `DELETE /auth/me`
- Migrations: `cyril_schema_update`, `add_performance_indexes`, `add_jobtitle_iscoref`
- Singleton PrismaClient, CORS locked to `CORS_ORIGIN` env variable, JWT reduced to 24h

**Frontend Web (React + Vite):**
- Landing page: Hero, Features, SmokeBackground, WaveDivider, Navbar, Footer
- AuthPage with split-screen layout for 3 portals
- Student dashboard: report cards, filter bar, detail panel, timeline, progress tracker
- Professional dashboard: report list, team sidebar with stats, severity picker, assignment, StatsTab
- Parent dashboard: child selector, report cards, detail panel, establishment contact panel
- Parent and Professional onboarding flows
- Dark/light theme toggle
- Pagination on all dashboards (server-side + client-side)

**Flutter:**
- Professional dashboard (mobile) wired to API
- Parent dashboard with child registration
- `flutter_screenutil` integrated (iPhone 17 reference)
- Fonts (Fraunces, Manrope) bundled into APK
- INTERNET permission, adaptive icon, error handling in dashboards

---

### Backend Routes Summary

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create account |
| POST | `/auth/login` | Public | Login + JWT |
| GET | `/auth/profile` | JWT | Connected user profile |
| GET | `/auth/me/export` | JWT | RGPD data export |
| DELETE | `/auth/me` | JWT | Delete account (RGPD) |
| POST | `/reports` | Optional | Submit report |
| POST | `/reports/:code` | Public | Chatbot deposition webhook |
| GET | `/reports/:code` | JWT | Track report by code |
| DELETE | `/reports/:code` | JWT | Cancel report (5-min window) |
| POST | `/reports/:code/link` | JWT | Link anonymous report to account |
| POST | `/reports/:code/summary` | Public | Save chatbot summary |
| GET | `/admin/reports` | Staff | All reports (paginated) |
| GET | `/admin/reports/:id` | Staff | Report detail |
| GET | `/admin/reports/:id/summary` | Staff | Full chatbot summary |
| POST | `/admin/reports/:id/assign` | Staff | Assign referent |
| PATCH | `/admin/reports/:id` | Staff | Update status / severity |
| POST | `/admin/reports/:id/events` | Staff | Add follow-up action |
| GET | `/admin/stats` | Staff | Stats per establishment |
| GET | `/admin/team` | Staff | Team list |
| PATCH | `/admin/users/:userId` | Staff | Update jobTitle / isCoRef / role |
| PATCH | `/admin/users/:userId/parent` | Staff | Link parent to student |
| POST | `/ws/token` | Staff | Get ephemeral WS token |
| WS | `/ws?token=` | WS Token | Real-time crisis connection |

---

## 2. Monitor Progress and Adjust

### Stand-ups

Daily reviews kept things moving, and helped catch blockers before they became real problems. A few things that came up during development:

- CORS was misconfigured early on: the Flutter app couldn't reach the API at first, took a bit to track down that the `CORS_ORIGIN` env variable wasn't set correctly in the Docker compose.
- JWT was set to 7 days initially, then we realized that was way too long for a sensitive app and reduced it to 24h.
- The role-based redirect after login had edge cases: ADMIN users were landing on the wrong dashboard.
- The `BAS` severity wasn't persisting to the database because the frontend was sending the wrong string value.
- SPA refresh on Vercel was returning 404 because there was no `vercel.json`: that one wasn't planned for and had to be added last minute.

Tracking was mainly done through GitHub commits and the Swagger UI: not the most formal setup, but it worked for a solo/small project.

### Metrics

| Sprint | Tasks planned | Completed | Main blockers |
|---|---|---|---|
| Sprint 1 | 12 | 11 | CORS setup, JWT configuration |
| Sprint 2 | 10 | 10 | WS token timing, crisis keyword tuning |
| Sprint 3 | 16 | 15 | Role redirects, severity bug, Vercel 404 |

---

## 3. Sprint Reviews & Retrospectives

### End of Sprint Demos

- **Sprint 1:** Working register/login, JWT-protected profile endpoint, role-based routing in the Flutter app
- **Sprint 2:** Full report submission from the chatbot, crisis detection active, report tracking on student dashboard
- **Sprint 3:** Director and referent dashboards fully wired to real data, parent portal, team management, stats

### Retrospective

| | Notes |
|---|---|
| What went well | Prisma migrations were smooth: schema changes throughout the project never caused data loss. Elysia's TypeScript-first design caught a lot of bugs at compile time rather than runtime. The separation between web frontend and backend was clean from the start, which made parallel development easier. |
| What didn't | Initial CORS setup was too permissive. JWT duration was too long. The SPA routing on Vercel wasn't planned for and caught us off guard at deployment. Also the active/resolved counters on team cards were wrong because we were computing them from the user object rather than from the actual reports. |
| What to improve | More structured API testing earlier: we relied almost entirely on manual Swagger UI tests and direct PostgreSQL queries. Some automated integration tests would have caught the severity bug and the role redirect issue before they reached the final sprint. |

---


# 4. Final Integration, QA Testing & Deployement

## Mobile Application (Flutter / Android)

The mobile application is built using Flutter and distributed as an Android APK.

### Build

The APK is compiled with the production API URL injected at build time via a Dart define:

```bash
flutter build apk --dart-define=API_BASE_URL=https://portfolio-haven-project.onrender.com
```

### Prerequisites

- Flutter SDK
- Java OpenJDK 17 (required by the Android build toolchain)
- On macOS, the JDK must be symlinked to the system Java directory:

```bash
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk \
  /Library/Java/JavaVirtualMachines/openjdk-17.jdk
```

### Distribution

The compiled APK is distributed to testers via a **GitHub Release** (tag `v1.0.0`) on the project repository. No app store is involved — testers download and install the APK directly on their Android devices.

---

## Web Application (React / Vite)

The web frontend is deployed on **Vercel**.

### Configuration

| Setting | Value |
|---|---|
| Root Directory | `front_web/` |
| Framework Preset | Vite |
| Build Command | `vite build` |
| Output Directory | `dist/` |
| Environment Variable | `VITE_API_URL=https://portfolio-haven-project.onrender.com` |

### SPA Routing

A `vercel.json` file is included at the root of `front_web/` to handle client-side routing. Without it, direct URL access or page refresh returns a 404 error.

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Deploy Pipeline

Vercel auto-deploys on every push to the `main` branch of the connected repository. Deployments are triggered with:

```bash
git push deploy dev:main --force
```

Where `deploy` is the Git remote pointing to `aourzik/portfolio-haven-project`.

---

## Backend & Database (context)

| Service | Provider | Notes |
|---|---|---|
| Backend (Elysia.js / Bun) | Render | Docker-based, free tier — kept alive by UptimeRobot (ping `/health` every 5 min) |
| Database (PostgreSQL) | Neon | Cloud-hosted, EU Frankfurt region — Prisma migrations applied automatically on backend startup |


### Integration Verified

- Flutter app → API: authentication, report submission (anonymous + linked), report tracking, parent-child linking
- Web app → API: all three dashboards fully connected to live Prisma data (no more mock)
- Typebot chatbot → API: `POST /reports`, `POST /reports/:code`, `POST /reports/:code/summary` webhooks tested and confirmed
- WebSocket: crisis broadcast confirmed: staff connected to `/ws` receive a real-time event when a report contains crisis keywords
- Swagger auto-docs available at `/swagger`, all routes documented

### Bugs Fixed During Integration

- Role redirect: ADMIN → director dashboard, SUPERVISOR → referent dashboard (was inverted)
- `BAS` severity persistence (frontend was sending `"low"` instead of `"BAS"`)
- `vercel.json` added to fix SPA refresh 404 on Vercel deployment
- Active/resolved counters on team member cards now computed from report data
- Responsive navbar and hamburger menu added for mobile web
- Silent errors in Flutter dashboards handled properly

### API Testing via Swagger UI

```
POST   /auth/register                    → 201 created
POST   /auth/login                       → 200 + JWT token
GET    /auth/profile                     → 200 profile object
GET    /auth/me/export                   → 200 full data export
DELETE /auth/me                          → 204 account deleted
POST   /reports                          → 200 + trackingCode HVN-XXXX-XXXX
POST   /reports/:code                    → 200 deposition added
GET    /reports/:code                    → 200 report detail
DELETE /reports/:code (within 5 min)     → 200 cancelled
POST   /admin/reports/:id/assign         → 200 referent assigned
PATCH  /admin/reports/:id (status)       → 200 status updated
PATCH  /admin/reports/:id (severity)     → 200 severity updated
GET    /admin/stats                      → 200 stats object
GET    /admin/team                       → 200 team list
WS     /ws?token=<ephemeral>             → connection accepted, crisis event received
GET    /health                           → { status: "ok", project: "Haven", version: "0.1.0" }
```

### Test Report: Haven-test.md

Beyond the route checklist above, we put together a dedicated test report [`Haven-test.md`](https://github.com/Iglcyril/Portfolio_Haven-Project/blob/dev/Haven-test.md) that documents each test case in detail: the exact request sent, the expected response, and what we actually got back. The goal was to have a written trace of what was validated before the final delivery, not just a list of green checkmarks.

The file covers the main happy paths (register, login, report submission, admin actions) as well as the cases that are easy to miss: submitting a report without a token, hitting a staff-only route with a student JWT, trying to cancel a report after the 5-minute window, and triggering the crisis detection by including flagged keywords in a report. Those edge cases are where bugs tend to hide, so we made sure they were explicitly tested and documented.

---

## MVP Delivery Summary

| Feature | Status | Notes |
|---|---|---|
| JWT Authentication | ✅ | Register, login, profile, RGPD export/delete |
| RBAC (4 roles) | ✅ | STUDENT, PARENT, SUPERVISOR, ADMIN |
| Report Submission | ✅ | Anonymous or linked, with anonymity level |
| Chatbot Integration | ✅ | Typebot webhooks connected |
| Crisis Detection | ✅ | Keyword scan + real-time WebSocket alert |
| Student Dashboard (web) | ✅ | Tracking, timeline, progress bar |
| Student Dashboard (Flutter) | ✅ | Report submission, tracking |
| Professional Dashboard (web) | ✅ | Reports, team management, severity, stats |
| Professional Dashboard (Flutter) | ✅ | Mobile version wired to API |
| Parent Dashboard (web) | ✅ | Child selector, report cards, establishment info |
| Parent Dashboard (Flutter) | ✅ | Child registration + report tracking |
| Admin Team Management | ✅ | jobTitle, isCoRef (max 2), SUPERVISOR → ADMIN |
| Performance Indexes | ✅ | userId, etablissementId, status, createdAt, assignedToId |
| Swagger Documentation | ✅ | Auto-generated at /swagger |
| RGPD Compliance | ✅ | Data export and account deletion |
| Vercel Deployment | ✅ | vercel.json configured for SPA |
| Breathing Exercises (Flutter) | ✅ | Standalone feature in mobile app |
| Dark / Light Theme | ✅ | Web frontend |

---

## 5. Deliverables

| Deliverable | Link |
|---|---|
| Source Repository | [GitHub: Portfolio Haven Project](https://github.com/Iglcyril/Portfolio_Haven-Project) |
| Production (Web) | https://portfolio-haven-project.vercel.app/ |
| API Swagger Docs | `/swagger` on the running backend |
| APK Download | Available via the web landing page Hero section |

---

## Setup & Installation

### Requirements

- Bun >= 1.0
- PostgreSQL database
- `.env` file (see below)

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/haven"
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
PORT=3000
```

### Launch

```bash
# 1. Install dependencies
bun install

# 2. Run Prisma migrations
bunx --bun prisma migrate dev

# 3. Generate Prisma client
bunx --bun prisma generate

# 4. Start the backend
bun run dev

# 5. Start the web frontend (in /front_web)
cd front_web
npm install
npm run dev
```

### URLs

| Service | URL |
|---|---|
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/swagger |
| Health Check | http://localhost:3000/health |
| Web Frontend | http://localhost:5173 |

---

## Resources

- [Elysia Documentation](https://elysiajs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Bun Runtime](https://bun.sh)
- [React + Vite](https://vitejs.dev)
- [Flutter Docs](https://docs.flutter.dev)
- [Typebot](https://typebot.io)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp)

---

## Acknowledgements

We want to thank **Sofian Messaoui** for his investment and his advice throughout the project. His experience and the time he took to guide us made a real difference, especially in the moments where we weren't sure which direction to take.

A big thank you to the entire **C28 cohort**: and to our friends and family who agreed to test the app, report bugs, and give honest feedback. That kind of support is easy to underestimate but genuinely invaluable when you're deep in development and lose perspective on your own product.

We also want to thank **Romain Ballais**, project sponsor, who believed in Haven from the beginning and pushed us consistently toward building something we could actually be proud of: something presentable in front of a professional jury, not just a school exercise. His support and direction helped us stay focused on what mattered.

We had our difficult moments. Some technical problems took longer than expected, some decisions had to be revisited, and there were days where the end goal felt further away than it should. But we worked as a team, we figured things out together, and in the end we got there.

The hardest part wasn't the code. It was keeping the architecture clean while moving fast, and not cutting corners on security (RBAC, CORS, JWT duration, RGPD) even when it felt like slowing things down. I think the codebase reflects that those choices were worth it.

---

**© 2026: Haven**
Developed by **Aïny Ourzik, Benjamin Bommier & Cyril Iglesias**
*"A safe space to speak up."*
