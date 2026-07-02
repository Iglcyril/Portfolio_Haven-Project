# Test Results — Haven
### Holberton School | Cohort C28
**Team:** Ainy Ourzik · Cyril Iglesias · Benjamin Bommier
**Date:** July 2025
**Runtime:** Bun v1.3.14

---

## Summary

| Metric | Result |
|--------|--------|
| Total tests | **192** |
| Passed | **192 ✅** |
| Failed | **0** |
| Test files | **8** |
| Total duration | ~658ms |
| `expect()` calls | **306** |

---

## Test Suites

### Unit Tests — Services & Middlewares (104 tests)

| File | Tests | Status |
|------|-------|--------|
| `src/__tests__/services/report.service.test.ts` | 39 | ✅ All pass |
| `src/__tests__/services/auth.service.test.ts` | 22 | ✅ All pass |
| `src/__tests__/middlewares/error.middleware.test.ts` | 17 | ✅ All pass |
| `src/__tests__/middlewares/auth.middleware.test.ts` | 26 | ✅ All pass |

### Integration Tests — Routes (88 tests)

| File | Tests | Status |
|------|-------|--------|
| `src/__tests__/routes/auth.routes.test.ts` | 19 | ✅ All pass |
| `src/__tests__/routes/reports.routes.test.ts` | 23 | ✅ All pass |
| `src/__tests__/routes/admin.routes.test.ts` | 24 | ✅ All pass |
| `src/__tests__/routes/parents.routes.test.ts` | 22 | ✅ All pass |

---

## Detailed Results

### `report.service.test.ts` — 39 tests ✅

| Test | Status |
|------|--------|
| `create` — creates a report and returns the trackingId | ✅ |
| `create` — creates a ChatMessage when content is provided | ✅ |
| `create` — sets isAnonymous=true when anonymatLevel is "total" | ✅ |
| `create` — links the report to userId when provided | ✅ |
| `create` — retries generateUniqueTrackingId if ID is already taken | ✅ |
| `findAll` — returns all reports for ADMIN (no userId filter) | ✅ |
| `findAll` — filters by userId for a STUDENT | ✅ |
| `findAll` — applies default pagination (page 1, limit 10) | ✅ |
| `findAll` — calculates total pages correctly | ✅ |
| `findByTrackingId` — allows ADMIN to access any report | ✅ |
| `findByTrackingId` — allows SUPERVISOR to access any report | ✅ |
| `findByTrackingId` — allows a STUDENT to access their own report | ✅ |
| `findByTrackingId` — throws FORBIDDEN when a STUDENT accesses another user's report | ✅ |
| `findByTrackingId` — allows a PARENT to access their child's report | ✅ |
| `findByTrackingId` — throws FORBIDDEN for a PARENT accessing an unlinked child's report | ✅ |
| `findByTrackingId` — throws REPORT_NOT_FOUND if the report does not exist | ✅ |
| `updateStatus` — updates the report status | ✅ |
| `updateStatus` — throws REPORT_NOT_FOUND if the report does not exist | ✅ |
| `updateSeverity` — updates the report severity | ✅ |
| `updateSeverity` — throws REPORT_NOT_FOUND if the report does not exist | ✅ |
| `addDeposition` — adds a message and advances status from EN_ATTENTE to EN_COURS | ✅ |
| `addDeposition` — sets crisisDetected=true if detected in content | ✅ |
| `addDeposition` — throws REPORT_NOT_FOUND if the report does not exist | ✅ |
| `delete` — deletes a report created less than 5 minutes ago | ✅ |
| `delete` — throws DELETE_TIMEOUT if the 5-minute window has passed | ✅ |
| `delete` — throws REPORT_NOT_FOUND if the report does not exist | ✅ |
| `delete` — throws FORBIDDEN if a STUDENT tries to delete another user's report | ✅ |
| `delete` — allows an ADMIN to delete any recent report | ✅ |
| `link` — links an anonymous report to a user account | ✅ |
| `link` — returns {linked: true} silently if already linked to the same user | ✅ |
| `link` — throws REPORT_ALREADY_LINKED if the report belongs to another user | ✅ |
| `link` — throws REPORT_NOT_FOUND if the report does not exist | ✅ |
| `findPublicByTrackingId` — returns public info for an existing report | ✅ |
| `findPublicByTrackingId` — throws REPORT_NOT_FOUND if the report does not exist | ✅ |
| `saveSummary` — creates or updates the report summary | ✅ |
| `saveSummary` — throws REPORT_NOT_FOUND if the report does not exist | ✅ |
| `assign` — assigns a supervisor to a report | ✅ |
| `assign` — throws REPORT_NOT_FOUND if the report does not exist | ✅ |
| `assign` — throws USER_NOT_FOUND if the supervisor does not exist or is not staff | ✅ |

---

### `auth.service.test.ts` — 22 tests ✅

| Test | Status |
|------|--------|
| `register` — creates a user and returns a JWT token | ✅ |
| `register` — hashes the password with bcrypt (cost 12) | ✅ |
| `register` — throws EMAIL_ALREADY_EXISTS if email is already taken | ✅ |
| `register` — throws STUDENT_FIELDS_REQUIRED if first name is missing for a STUDENT | ✅ |
| `register` — throws STUDENT_FIELDS_REQUIRED if last name is missing for a STUDENT | ✅ |
| `register` — throws STUDENT_FIELDS_REQUIRED if birth date is missing for a STUDENT | ✅ |
| `register` — creates a STUDENT with required fields | ✅ |
| `login` — returns user + token for valid credentials | ✅ |
| `login` — throws INVALID_CREDENTIALS if email does not exist | ✅ |
| `login` — throws INVALID_CREDENTIALS if password is incorrect | ✅ |
| `login` — calls bcrypt.compare with the plain password and stored hash | ✅ |
| `getProfile` — returns the user profile | ✅ |
| `getProfile` — throws USER_NOT_FOUND if the user does not exist | ✅ |
| `exportMyData` — exports reports for a STUDENT | ✅ |
| `exportMyData` — exports children data for a PARENT | ✅ |
| `exportMyData` — throws FORBIDDEN for an unauthorized role (ADMIN) | ✅ |
| `deleteMyAccount` — deletes a STUDENT account after anonymizing their reports | ✅ |
| `deleteMyAccount` — deletes a PARENT account and unlinks their children | ✅ |
| `deleteMyAccount` — deletes a SUPERVISOR account with no active cases | ✅ |
| `deleteMyAccount` — throws ACCOUNT_HAS_ACTIVE_DOSSIERS if the supervisor has active cases | ✅ |
| `listStaff` — returns the list of admins and supervisors | ✅ |
| `listStaff` — returns an empty array if no staff found | ✅ |

---

### `error.middleware.test.ts` — 17 tests ✅

| Error Code | HTTP Status | Status |
|------------|-------------|--------|
| `INVALID_TOKEN` | 401 | ✅ |
| `FORBIDDEN` | 403 | ✅ |
| `EMAIL_ALREADY_EXISTS` | 409 | ✅ |
| `INVALID_CREDENTIALS` | 401 | ✅ |
| `REPORT_NOT_FOUND` | 404 | ✅ |
| `USER_NOT_FOUND` | 404 | ✅ |
| `DELETE_TIMEOUT` | 403 | ✅ |
| `STUDENT_NOT_FOUND` | 404 | ✅ |
| `STUDENT_ALREADY_LINKED` | 409 | ✅ |
| `PARENT_NOT_FOUND` | 404 | ✅ |
| `STUDENT_FIELDS_REQUIRED` | 422 | ✅ |
| `ACCOUNT_HAS_ACTIVE_DOSSIERS` | 409 | ✅ |
| `REPORT_ALREADY_LINKED` | 409 | ✅ |
| Unknown error (`Error`) | 500 | ✅ |
| Unknown error (string) | 500 | ✅ |
| Unknown error (`null`) | 500 | ✅ |
| Unknown error (object) | 500 | ✅ |

---

### `auth.middleware.test.ts` — 26 tests ✅

| Test | Status |
|------|--------|
| `verifyToken` — decodes a valid token | ✅ |
| `verifyToken` — throws INVALID_TOKEN for an expired token | ✅ |
| `verifyToken` — throws INVALID_TOKEN for an invalid signature | ✅ |
| `verifyToken` — throws INVALID_TOKEN for an empty string | ✅ |
| `verifyToken` — throws INVALID_TOKEN for a malformed token | ✅ |
| `requireRole` — returns the payload when the role matches | ✅ |
| `requireRole` — throws FORBIDDEN when the role does not match | ✅ |
| `requireRole` — accepts any valid role from the list | ✅ |
| `requireRole` — throws INVALID_TOKEN if the token is invalid | ✅ |
| `requireAuth` — accepte STUDENT | ✅ |
| `requireAuth` — accepte SUPERVISOR | ✅ |
| `requireAuth` — accepte ADMIN | ✅ |
| `requireAuth` — accepte PARENT | ✅ |
| `requireAuth` — throws INVALID_TOKEN for an empty token | ✅ |
| `requireSupervisor` — accepte SUPERVISOR | ✅ |
| `requireSupervisor` — throws FORBIDDEN for STUDENT | ✅ |
| `requireSupervisor` — throws FORBIDDEN for ADMIN | ✅ |
| `requireSupervisor` — throws FORBIDDEN for PARENT | ✅ |
| `requireAdmin` — accepte ADMIN | ✅ |
| `requireAdmin` — throws FORBIDDEN for SUPERVISOR | ✅ |
| `requireParent` — accepte PARENT | ✅ |
| `requireParent` — throws FORBIDDEN for STUDENT | ✅ |
| `requireStaff` — accepte SUPERVISOR | ✅ |
| `requireStaff` — accepte ADMIN | ✅ |
| `requireStaff` — throws FORBIDDEN for STUDENT | ✅ |
| `requireStaff` — throws FORBIDDEN for PARENT | ✅ |

---

### `auth.routes.test.ts` — 19 tests ✅

| Endpoint | Scenario | Status |
|----------|----------|--------|
| `POST /auth/register` | 201 — creates an account and returns user + token | ✅ |
| `POST /auth/register` | 409 — email already taken | ✅ |
| `POST /auth/register` | 422 — invalid email | ✅ |
| `POST /auth/register` | 422 — password too short | ✅ |
| `POST /auth/register` | 422 — required fields missing | ✅ |
| `POST /auth/register` | 422 — STUDENT fields missing | ✅ |
| `POST /auth/login` | 200 — returns user + token | ✅ |
| `POST /auth/login` | 401 — invalid credentials | ✅ |
| `POST /auth/login` | 422 — empty body | ✅ |
| `GET /auth/profile` | 200 — returns the profile | ✅ |
| `GET /auth/profile` | 401 — no token | ✅ |
| `GET /auth/profile` | 401 — invalid token | ✅ |
| `GET /auth/profile` | 404 — user not found | ✅ |
| `GET /auth/me/export` | 200 — exports STUDENT data | ✅ |
| `GET /auth/me/export` | 403 — ADMIN access denied | ✅ |
| `GET /auth/me/export` | 401 — no token | ✅ |
| `DELETE /auth/me` | 204 — deletes the account | ✅ |
| `DELETE /auth/me` | 409 — supervisor with active cases | ✅ |
| `DELETE /auth/me` | 401 — no token | ✅ |

---

### `reports.routes.test.ts` — 23 tests ✅

| Endpoint | Scenario | Status |
|----------|----------|--------|
| `POST /reports` | 200 — signalement anonyme no token | ✅ |
| `POST /reports` | 200 — report linked to account | ✅ |
| `POST /reports` | 200 — bloc urgence si crise détectée | ✅ |
| `POST /reports` | 200 — pas de bloc urgence sans mot clé | ✅ |
| `POST /reports` | 422 — anonymat_level missing | ✅ |
| `POST /reports/:code` | 200 — adds a deposition | ✅ |
| `POST /reports/:code` | 200 — alerte WebSocket si crise | ✅ |
| `POST /reports/:code` | 404 — report not found | ✅ |
| `POST /reports/:code` | 422 — content too short | ✅ |
| `GET /reports` | 200 — retourne les rapports (connecté) | ✅ |
| `GET /reports` | 401 — no token | ✅ |
| `GET /reports/:code` | 200 — returns the report | ✅ |
| `GET /reports/:code` | 401 — no token | ✅ |
| `GET /reports/:code` | 403 — mauvais utilisateur | ✅ |
| `GET /reports/:code` | 404 — report not found | ✅ |
| `DELETE /reports/:code` | 200 — annule dans les 5 minutes | ✅ |
| `DELETE /reports/:code` | 403 — délai dépassé | ✅ |
| `DELETE /reports/:code` | 401 — no token | ✅ |
| `POST /reports/:code/link` | 200 — rattache un signalement anonyme | ✅ |
| `POST /reports/:code/link` | 401 — no token | ✅ |
| `POST /reports/:code/link` | 409 — rapport déjà rattaché | ✅ |
| `POST /reports/:code/summary` | 200 — sauvegarde le résumé chatbot | ✅ |
| `POST /reports/:code/summary` | 404 — report not found | ✅ |

---

### `admin.routes.test.ts` — 24 tests ✅

| Endpoint | Scenario | Status |
|----------|----------|--------|
| `GET /admin/reports` | 200 — SUPERVISOR retrieves all reports | ✅ |
| `GET /admin/reports` | 200 — ADMIN retrieves all reports | ✅ |
| `GET /admin/reports` | 403 — STUDENT access denied | ✅ |
| `GET /admin/reports` | 401 — no token | ✅ |
| `GET /admin/reports` | 200 — filters by status | ✅ |
| `GET /admin/reports/:id` | 200 — détail d'un rapport | ✅ |
| `GET /admin/reports/:id` | 404 — report not found | ✅ |
| `GET /admin/reports/:id` | 403 — STUDENT access denied | ✅ |
| `GET /admin/reports/:id/summary` | 200 — résumé complet | ✅ |
| `GET /admin/reports/:id/summary` | 403 — STUDENT access denied | ✅ |
| `POST /admin/reports/:id/assign` | 200 — assigne un référent | ✅ |
| `POST /admin/reports/:id/assign` | 422 — referent_id missing | ✅ |
| `POST /admin/reports/:id/assign` | 403 — STUDENT access denied | ✅ |
| `PATCH /admin/reports/:id` | 200 — met à jour le statut | ✅ |
| `PATCH /admin/reports/:id` | 200 — met à jour la sévérité | ✅ |
| `PATCH /admin/reports/:id` | 403 — STUDENT access denied | ✅ |
| `GET /admin/stats` | 200 — returns statistics | ✅ |
| `GET /admin/stats` | 200 — filtre par establishment_id | ✅ |
| `GET /admin/stats` | 403 — STUDENT access denied | ✅ |
| `GET /admin/team` | 200 — returns the team list | ✅ |
| `GET /admin/team` | 403 — STUDENT access denied | ✅ |
| `POST /admin/reports/:id/events` | 200 — adds a follow-up event | ✅ |
| `POST /admin/reports/:id/events` | 404 — report not found | ✅ |
| `POST /admin/reports/:id/events` | 422 — type missing | ✅ |

---

### `parents.routes.test.ts` — 22 tests ✅

| Endpoint | Scenario | Status |
|----------|----------|--------|
| `GET /parents/report/:code` | 200 — parent accesses their child's report | ✅ |
| `GET /parents/report/:code` | 200 — SUPERVISOR peut accéder | ✅ |
| `GET /parents/report/:code` | 403 — parent not linked | ✅ |
| `GET /parents/report/:code` | 401 — no token | ✅ |
| `GET /parents/report/:code` | 404 — report not found | ✅ |
| `GET /parents/report/:code/summary` | 200 — returns the summary | ✅ |
| `GET /parents/report/:code/summary` | 403 — parent not linked | ✅ |
| `GET /parents/report/:code/summary` | 401 — no token | ✅ |
| `GET /parents/children/reports` | 200 — rapports des enfants liés | ✅ |
| `GET /parents/children/reports` | 200 — message si aucun enfant lié | ✅ |
| `GET /parents/children/reports` | 403 — STUDENT access denied | ✅ |
| `GET /parents/children/reports` | 401 — no token | ✅ |
| `POST /parents/contact` | 200 — sends a contact message | ✅ |
| `POST /parents/contact` | 422 — invalid email | ✅ |
| `POST /parents/contact` | 422 — message too short | ✅ |
| `POST /parents/contact` | 422 — name too short | ✅ |
| `POST /parents/link-child` | 200 — links a child to the parent account | ✅ |
| `POST /parents/link-child` | 404 — no student found | ✅ |
| `POST /parents/link-child` | 409 — enfant déjà rattaché | ✅ |
| `POST /parents/link-child` | 403 — STUDENT access denied | ✅ |
| `POST /parents/link-child` | 401 — no token | ✅ |
| `POST /parents/link-child` | 422 — invalid date format | ✅ |

---

## Testing Strategy

### Unit Tests (104 tests)
Unit tests using Prisma mocks — no real database involved. Each service and middleware is tested in isolation.

**Tools:** Bun Test, manual Prisma mocks (`src/__mocks__/prisma.ts`)

### Integration Tests (88 tests)
Integration tests against real HTTP routes via Supertest. Each endpoint is tested with happy path and error scenarios (missing auth, invalid data, unauthorized access).

**Tools:** Bun Test, Supertest, ElysiaJS test client

### Coverage Areas

| Domain | Coverage |
|--------|----------|
| Authentication (register, login, profile, export, delete) | ✅ Full |
| Role-based access control (Student, Supervisor, Admin, Parent) | ✅ Full |
| Report lifecycle (create, read, update, delete, link) | ✅ Full |
| Crisis detection → emergency numbers | ✅ Full |
| 5-minute cancellation window | ✅ Full |
| Parent/child linking | ✅ Full |
| Error codes & HTTP status mapping | ✅ Full (13 error codes) |
| Chatbot summary webhook | ✅ Full |
| Admin statistics & team management | ✅ Full |

---

*Last updated: July 2025 — Haven Project | Holberton School Cohort C28*
