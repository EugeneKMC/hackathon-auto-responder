# Frontend Auth Handoff — Mock Login

Backend mock auth is live. This is the contract for the frontend: change the
landing page to a login screen, gate the app behind a session, and use the
logged-in user's `client_id` to request the right data.

## Auth model

- **Stateless JWT** (HS256), no server session store.
- On login the backend returns a `token`. Store it (e.g. `localStorage`) and
  send it on every request as `Authorization: Bearer <token>`.
- Token lifetime: **7 days** (then `/me` returns 401 → send user back to login).
- All API responses are JSON. Errors look like:
  `{ "error": { "message": string, "statusCode": number } }`.
- CORS is enabled for all origins on the backend.

## Base URL

Same host the API already runs on (default `http://localhost:8000`). All auth
routes are under `/api/auth`.

## Endpoints

### POST `/api/auth/login`

Request body:
```json
{ "email": "maria@nexuslogistics.ph", "password": "Love2test!" }
```

Success `200`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "maria@nexuslogistics.ph",
    "name": "Maria Santos",
    "client_id": "CLT-001"
  },
  "client": {
    "clientId": "CLT-001",
    "companyName": "Nexus Logistics",
    "primaryContact": "Maria Santos",
    "email": "maria@nexuslogistics.ph",
    "preferredChannel": "WhatsApp",
    "accountManager": "...",
    "clientSince": "YYYY-MM-DD",
    "contractType": "Monthly|Annual",
    "status": "Active|Inactive"
  }
}
```

Bad credentials `401`: `{ "error": { "message": "Invalid email or password", "statusCode": 401 } }`

### GET `/api/auth/me`  (requires `Authorization: Bearer <token>`)

Success `200`:
```json
{
  "user": { "id": 1, "email": "...", "name": "...", "client_id": "CLT-001" },
  "client": { "clientId": "CLT-001", "companyName": "Nexus Logistics", "...": "..." }
}
```

Missing/invalid/expired token `401`:
`{ "error": { "message": "Missing or invalid Authorization header" | "Invalid or expired token", "statusCode": 401 } }`

There is no `/logout` endpoint — logout is client-side: delete the stored token.

## Frontend tasks

1. **Landing page → Login.** Replace the current landing page with a login form
   (email + password). On submit, POST to `/api/auth/login`.
2. **On success**, persist `token` (and optionally `user`/`client`), then route
   into the app.
3. **Session gate.** On app load (and on protected routes), if there is no token
   → redirect to `/login`. Optionally call `GET /api/auth/me` to validate the
   token; on `401`, clear the token and redirect to login.
4. **Attach the token** to every API call: `Authorization: Bearer <token>`.
5. **Use `user.client_id`** (or the returned `client`) to scope the data the UI
   requests/shows — each account only maps to its own client.
6. **Logout** = clear the stored token and redirect to `/login`.

## Test credentials

Password for **all** accounts: `Love2test!`

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

## Notes / options

- This is mock auth — fine for the hackathon. The token is signed but the
  default secret is dev-only (`JWT_SECRET` env var overrides it).
- If you'd prefer an httpOnly **cookie** session instead of a Bearer token in
  localStorage (auto-sent, not readable by JS), ask backend — it's a small
  change to set/read a cookie instead of returning the token in JSON.
