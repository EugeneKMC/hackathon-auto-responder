# API Reference — Auto-Responder Backend

Complete reference for the endpoints that are **live and tested**. Wire the
frontend against these now.

## Conventions

- **Base URL**: set `NEXT_PUBLIC_API_BASE_URL` to the host **including `/api`**
  (e.g. `http://localhost:8000/api`). All paths below are relative to that, so
  do **not** add a leading `/api` in client code.
- **Auth**: every request except `POST /auth/login` sends
  `Authorization: Bearer <token>`. The backend reads the client from the token —
  send **no** `clientId`; data is automatically scoped to the logged-in user.
- **Content type**: `application/json`. All dashboard endpoints are `GET`.
- **Dates**: ISO‑8601 strings. **Amounts**: numbers + a `currency` string.

### Success envelopes

```ts
// single object
type BaseResponse<T> = { data: T; errors: unknown[]; message: string; success: boolean };

// list
type PaginatedResponse<T> = {
  data: {
    items: T[];
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    pageNumber: number;
    totalCount: number;
    totalPages: number;
  };
  errors: unknown[]; message: string; success: boolean;
};
```

### List query params

`pageNumber` (1-based, default 1) · `pageSize` (default 10) · `sort`
(`"field:direction"`, e.g. `createdAt:desc`) · `search` (optional free text).
Sort is date-based per resource; default is date-descending.

### Search & AI fallback (all three list endpoints)

`GET /invoices`, `GET /seats`, and `GET /service-requests` accept an optional
`search` query param (send it only when the user types something).

Backend behavior:
1. **Native first** — simple queries are filtered without the LLM: a recognized
   status keyword (`paid`/`pending`/`overdue`, `open`/`in_progress`/`resolved`,
   `occupied`/`vacant`), a priority word (service requests), or any single
   token (matched as a substring against ids/numbers/names/subjects).
2. **AI fallback** — if the query is natural language (e.g. *"pending invoices
   for the months of March to June"*), it's sent to OpenAI to produce a
   structured filter (status / priority / date range / keyword), which is then
   applied.
3. Either way the response uses the **same `PaginatedResponse` envelope**. AI
   only adds a `data.ai` object; it never changes the shape.

`data.ai` (present **only** when AI interpreted the query):
```ts
type AiSearchMeta = {
  handledByAi: boolean;            // true when OpenAI interpreted the query
  interpretation?: string | null; // short summary, e.g. "Pending invoices issued Mar–Jun 2026"
};
```
Omitted entirely for native filtering or no `search`. One synchronous round
trip — the endpoint returns final paged results + `ai` in a single response.

```
GET /invoices?pageNumber=1&pageSize=15&search=pending%20invoices%20for%20March%20to%20June
```
```json
{
  "data": {
    "items": [ /* ...filtered invoices... */ ],
    "hasNextPage": false, "hasPreviousPage": false,
    "pageNumber": 1, "totalCount": 4, "totalPages": 1,
    "ai": { "handledByAi": true, "interpretation": "Pending invoices issued Mar–Jun 2026" }
  },
  "errors": [], "message": "OK", "success": true
}
```

> Requires `OPENAI_API_KEY` on the server. Without it (or on an API error), the
> AI step is skipped and the query degrades to a best-effort substring match
> with **no** `data.ai`.

### Errors

Non-2xx returns `{ "error": { "message": string, "statusCode": number } }`.
`401` = missing/invalid/expired token. `400` = validation. `404` = not found /
not owned by the caller.

---

## Auth

### `POST /auth/login`
Body: `{ "email": string, "password": string }`

`200`:
```json
{
  "token": "eyJhbGci...",
  "user": { "id": 1, "email": "maria@nexuslogistics.ph", "name": "Maria Santos", "client_id": "CLT-001" },
  "client": { "clientId": "CLT-001", "companyName": "Nexus Logistics", "primaryContact": "Maria Santos", "email": "...", "preferredChannel": "WhatsApp", "accountManager": "...", "clientSince": "YYYY-MM-DD", "contractType": "Monthly", "status": "Active" }
}
```
`401`: `{ "error": { "message": "Invalid email or password", "statusCode": 401 } }`

Token lifetime: 7 days. No `/logout` — clear the token client-side.

### `GET /auth/me`  (Bearer)
`200`: `{ "user": {id,email,name,client_id}, "client": {...} }`

---

## Invoices

### `GET /invoices/preview`  (Bearer) → `BaseResponse<InvoicePreview>`
```ts
type InvoicePreview = { latest: Invoice | null; incoming: Invoice | null };
type Invoice = {
  id: string; invoiceNumber: string; amount: number; currency: string;
  status: "paid" | "pending" | "overdue"; issuedDate: string; dueDate: string;
};
```
- `latest` = most recently issued invoice. `incoming` = nearest invoice with
  `dueDate >= today` (any status). Either may be `null`; they can be the same.

```json
{ "data": { "latest": { "id": "INV-0005", "invoiceNumber": "WS-2026-0005", "amount": 80845, "currency": "PHP", "status": "overdue", "issuedDate": "2026-06-01", "dueDate": "2026-07-01" }, "incoming": { "...": "..." } }, "errors": [], "message": "OK", "success": true }
```

### `GET /invoices?pageNumber=&pageSize=&sort=`  (Bearer) → `PaginatedResponse<Invoice>`
Default sort `issuedDate:desc`.

### `GET /invoices/:id`  (Bearer) → `BaseResponse<Invoice>`
`id` = invoice id (e.g. `INV-0005`). `404` if not found or not owned by the caller.

---

## Seats

### `GET /seats/preview`  (Bearer) → `BaseResponse<SeatSummary>`
```ts
type SeatSummary = { used: number; total: number };
```
```json
{ "data": { "used": 5, "total": 10 }, "errors": [], "message": "OK", "success": true }
```

### `GET /seats?pageNumber=&pageSize=&sort=`  (Bearer) → `PaginatedResponse<Seat>`
```ts
type Seat = {
  id: string; seatNumber: string; assignedTo: string | null;
  status: "occupied" | "vacant" | "reserved"; assignedDate: string | null;
};
```
⚠️ **Dataset caveat**: the source data is an aggregate (total/occupied) per
client, not per-seat. The list **synthesizes** rows — first `used` are
`occupied` (with `assignedDate`), the rest `vacant`. `assignedTo` is always
`null`; `reserved` is never emitted. `/seats/preview` is real data.

### `GET /seats/:id`  (Bearer) → `BaseResponse<Seat>`
`id` is the synthetic seat id from the list (e.g. `SEAT-CLT-001-3`). `404` if it
doesn't belong to the caller or the index is out of range.

---

## Service Requests

### `GET /service-requests?pageNumber=&pageSize=&sort=`  (Bearer) → `PaginatedResponse<ServiceRequest>`
```ts
type ServiceRequest = {
  id: string; reference: string; subject: string; category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
};
```
- Default sort `createdAt:desc`. Dashboard call:
  `GET /service-requests?pageNumber=1&pageSize=10&sort=createdAt:desc`.
- From the dataset: `status` is `open|in_progress|resolved` (no `closed`),
  `priority` is `low|medium|high` (no `urgent`). `subject` = request description,
  `category` = request type, `reference` = ticket id (e.g. `SR-0007`).

```json
{ "data": { "items": [ { "id": "SR-0007", "reference": "SR-0007", "subject": "Hardware, software, or connectivity issue", "category": "IT Support", "priority": "medium", "status": "resolved", "createdAt": "2026-05-24" } ], "hasNextPage": false, "hasPreviousPage": false, "pageNumber": 1, "totalCount": 7, "totalPages": 1 }, "errors": [], "message": "OK", "success": true }
```

### `GET /service-requests/:id`  (Bearer) → `BaseResponse<ServiceRequest>`
`id` = ticket id (e.g. `SR-0007`). `404` if not found or not owned.

### `POST /service-requests`  (Bearer) → `BaseResponse<ServiceRequest>` (`201`)
Creates a request for the caller's client (id, reference, status, createdAt are
set by the backend). Body:
```ts
{
  subject: string;            // required — the request summary
  category:                   // required — allowed taxonomy
    "Headcount Change" | "Facilities" | "IT Support" |
    "Contract Query" | "Access & Security" | "Other";
  priority: "low" | "medium" | "high";   // required
  details?: string;           // optional extra notes
}
```
New requests start as `status: "open"`. Invalid `category`/`priority` → `400`.

```json
// POST body
{ "subject": "Projector flickering in Room 4A", "category": "Facilities", "priority": "high", "details": "Started this morning" }
// 201 response.data
{ "id": "SR-0039", "reference": "SR-0039", "subject": "Projector flickering in Room 4A", "category": "Facilities", "priority": "high", "status": "open", "createdAt": "2026-06-25" }
```

### `PATCH /service-requests/:id`  (Bearer) → `BaseResponse<ServiceRequest>`
Updates a request the caller owns (`404` otherwise). Send only the fields you
want to change; at least one is required (`400` if empty):
```ts
{
  subject?: string;
  category?: <same enum as create>;
  priority?: "low" | "medium" | "high";
  status?: "open" | "in_progress" | "resolved";
  details?: string;
}
```
Setting `status: "resolved"` stamps the resolved date automatically.

---

## Test accounts (password `Love2test!`)

| Email | Client | client_id |
|---|---|---|
| maria@nexuslogistics.ph | Nexus Logistics | CLT-001 |
| kevin@brightpathbpo.com | BrightPath BPO | CLT-002 |
| plim@horizonretail.com | Horizon Retail | CLT-003 |
| ramon@aquacore.io | AquaCore Systems | CLT-004 |
| elena@skybridgefinance.com | SkyBridge Finance | CLT-005 |
| dgo@pinnaclepharma.com | Pinnacle Pharma | CLT-006 |
| rbautista@coastal.ph | Coastal Shipping | CLT-007 |
| areyes@urbanedge.com | UrbanEdge Property | CLT-008 |

Different logins return different data (verified: maria → seats 5/10; areyes → 16/25).
