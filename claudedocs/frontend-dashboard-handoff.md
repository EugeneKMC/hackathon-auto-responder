# Frontend Dashboard Handoff — Implemented & Live

All 5 dashboard endpoints from your API contract are implemented, tested, and
returning the documented envelopes. Read-only, **token-scoped**.

## Token scoping (important)

- Every request must send `Authorization: Bearer <token>` (from `/auth/login`).
- The backend reads the **client from the token** and returns only that client's
  data. Do **not** send a `clientId` param — the token decides everything.
- Missing/invalid/expired token → `401 { "error": { "message", "statusCode": 401 } }`.

## Base URL / path prefix (action needed)

All backend routes are under an `/api` prefix:

| Contract path | Actual URL |
|---|---|
| `POST /auth/login` | `POST /api/auth/login` |
| `GET /auth/me` | `GET /api/auth/me` |
| `GET /invoices/preview` | `GET /api/invoices/preview` |
| `GET /invoices` | `GET /api/invoices` |
| `GET /seats/preview` | `GET /api/seats/preview` |
| `GET /seats` | `GET /api/seats` |
| `GET /service-requests` | `GET /api/service-requests` |

**Set `NEXT_PUBLIC_API_BASE_URL` to include `/api`** (e.g.
`http://localhost:8000/api`) and keep your client paths as documented
(`/invoices/preview`, `/auth/login`, etc.) with **no** leading `/api`. That way
everything resolves correctly and consistently for both auth and dashboard.

## Verified behavior

- Envelopes match exactly: `BaseResponse<T>` and `PaginatedResponse<T>`.
- Pagination: `pageNumber` (1-based), `pageSize`, `sort` all honored.
- `sort` is treated as date-only per resource: `:desc` (default) or `:asc`;
  the field part is accepted but each resource always sorts by its own date.

## Mapping notes (so the UI matches reality)

**Invoices**
- `status`: `paid` | `pending` (was "Unpaid") | `overdue`.
- `amount` is a number, `currency` is `"PHP"`.
- `/invoices/preview`: `latest` = most recently *issued* invoice; `incoming` =
  invoice with the nearest `dueDate >= today` (any status). They can be the same
  invoice. Either may be `null`.
- `/invoices` default sort `issuedDate:desc`.

**Seats** ⚠️ dataset caveat
- The dataset stores an **aggregate** seat allocation per client
  (total / occupied / available), not individual seats.
- `/seats/preview` → `{ used, total }` is **real** data.
- `/seats` (list) **synthesizes** individual seat rows from the aggregate so the
  table renders: first `used` seats are `occupied` (with `assignedDate` =
  contract start), the rest `vacant`. `assignedTo` is always `null`, and
  `status` is only `occupied`/`vacant` (never `reserved`) — there is no per-seat
  detail to draw from. If the UI needs real per-seat assignees, the dataset must
  add a per-seat table.

**Service Requests**
- `status`: `open` | `in_progress` | `resolved` (no `closed` in dataset).
- `priority`: `low` | `medium` | `high` (no `urgent` in dataset).
- `subject` is mapped from the request's description; `category` = request type;
  `reference` = ticket id (e.g. `SR-0007`).
- Default sort `createdAt:desc`. Dashboard call:
  `GET /api/service-requests?pageNumber=1&pageSize=10&sort=createdAt:desc`.

## Test accounts

Password for all: `Love2test!`. Each maps to one client, so different logins
show different dashboard data (e.g. maria@nexuslogistics.ph → 5 seats used /10;
areyes@urbanedge.com → 16/25).
