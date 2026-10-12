# coop_tms

Terminal Management System for ATM and POS fleets — inventory, requests/approvals,
relocation, configuration, password vault, dashboards and reporting.

The system is split across **two independent git repositories** that must be kept in sync
manually (no monorepo tooling, no CI wiring between them):

| Repo | Path | Purpose |
| --- | --- | --- |
| `coop_tms` | this directory | React single-page application |
| `coop_tms_server` | `../coop_tms_server` | Express REST API |

---

## Stack

**Frontend** — React 18.3 on Create React App (`react-scripts` 5.0.1)

- UI: MUI v7 (`@mui/material`, `@mui/icons-material`, `@toolpad/core`, Emotion)
- Data grid / charts / pickers: MUI X (`x-data-grid`, `x-charts`, `x-date-pickers`), Recharts
- State: Redux Toolkit, React Context (`AuthContext`, `ThemeProvider`)
- Routing: react-router-dom 7
- Forms: Formik + Yup
- Maps: Leaflet + react-leaflet
- Export: xlsx, jszip, file-saver
- Misc: axios, dayjs, react-hot-toast, react-icons

**Backend** — Node.js on Express 4 (native **ES modules**, `"type": "module"`)

- Database: MongoDB via Mongoose 8, migrations via `migrate-mongo`
- Auth: JWT (`jsonwebtoken`) + `bcryptjs`, httpOnly cookie + bearer token
- Integrations: Nodemailer, `oracledb` (Oracle), `node-ssh`/`ssh2`, `groq-sdk`, `node-cron`
- Uploads: multer

---

## Requirements

- Node.js 18 or newer
- MongoDB (Atlas or local) for anything other than demo mode
- OracleDB client libraries — only if you enable the Oracle integration

---

## Getting started

### 1. Backend

```bash
cd ../coop_tms_server
npm install
```

Create `.env` (this file is git-ignored — never commit it):

| Variable | Purpose |
| --- | --- |
| `MONGODB_URL` | MongoDB connection string (**required**) |
| `PORT` | API port, defaults to `8000` |
| `JWT_SECRET` | Signing secret for auth tokens (**required**) |
| `NODE_ENV` | `production` enables secure cookies and `trust proxy` |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `FRONT_END_URL` | Frontend base URL used in emails/links |
| `MAIL_SERVER`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_SENDER` | SMTP config |
| `MAIL_REQUEST_RECIEVER`, `MAIL_RESPONSE_RECIEVER` | Notification recipients *(spelling is as-is in the codebase)* |
| `API_KEY`, `API_URL`, `GROQ_API_KEY` | Optional third-party integrations |

Then:

```bash
npm run server   # nodemon, for development
npm start        # plain node
```

Database migrations:

```bash
npx migrate-mongo up
npx migrate-mongo down     # roll back one step
```

### 2. Frontend

```bash
cd coop_tms
npm install
```

Create `.env` (git-ignored):

| Variable | Purpose |
| --- | --- |
| `REACT_APP_API_URL` | Base URL of the backend |
| `REACT_APP_NODE_ENV` | Environment label |
| `REACT_APP_DEMO_MODE` | `true` to run fully offline against static fixtures |

```bash
npm start       # http://localhost:3000
npm run build   # production bundle -> build/
npm test        # Jest via react-scripts
```

> Create React App only exposes variables prefixed with `REACT_APP_`. Changing any of these
> requires restarting the dev server.

---

## Demo mode

The app can run with no backend and no database, serving static fixtures from
`public/demo/*.json` via `src/demo/demoApi.js`.

```bash
cp .env.demo .env.local
npm start
```

- Sign in with **`demo` / `demo123`**
- Password-vault screens are disabled in demo mode
- To deploy this to Vercel, set `REACT_APP_DEMO_MODE=true` in the project's
  environment variables

---

## API surface

All routes are mounted at the server root (`server.js`):

```
/auth  /command  /terminal  /port  /search  /district  /branch  /log
/executecommand  /feedback  /switch  /ping  /pos  /request  /device
/password  /cybersource
```

`GET /health` is an unauthenticated liveness check returning `{"status":"ok"}`.

Static uploads are served from `/uploads`.

---

## Authorization model

Permissions are declared centrally in `coop_tms_server/Middleware/permissions.js`
(~86 entries covering terminals, POS, requests, ports, devices, users, reports,
manual pages, and SSH actions).

Roles live in `Middleware/enum_types.js`:

```
admin   user   superadmin   supersuperadmin
posuser   posauthorizer   posadmin
```

Role-to-permission mappings are in `Middleware/rolePermissions.js`. Every protected
route is guarded by two middlewares:

```js
import isAuthenticated from "../Middleware/authenticate.js";
import { authorize } from "../Middleware/authorization.js";
import { Permissions } from "../Middleware/permissions.js";

router
  .route("/example")
  .post(isAuthenticated, authorize(Permissions.CREATE_TERMINAL), handler);
```

`isAuthenticated` verifies the JWT and reloads the user from the database, so deleted
users are rejected immediately. `authorize` resolves the role's permission list from the
**live** user record rather than trusting the token, meaning permission changes take
effect without waiting for token expiry.

---

## Project layout (frontend)

```
src/
├── components/     shared UI (grids, forms, views, uploads)
├── context/        AuthContext, ThemeProvider
├── demo/           offline fixture API
├── hooks/
├── pages/          routed screens, grouped by feature
│   ├── POS/        POS management, MAS config, requests
│   ├── Reports/
│   ├── administration/  users, terminals, commands, ports, password vault
│   ├── cybersource/
│   ├── dashboard/
│   └── sidebar/
├── state/          Redux Toolkit store
└── App.js          route table
```

## Project layout (backend)

```
Controllers/   request handlers
Routes/        routers + middleware wiring
Models/        Mongoose schemas
Middleware/    authenticate, authorization, permissions, rolePermissions, upload
migrations/    migrate-mongo scripts
utils/         token + cookie helpers
switch/        SSH client
```

---

## Known issues

- `POST /executecommand/connect` always fails — `checkConnection` is referenced by
  `checkConnectionHandler` but only exists in commented-out code in
  `Controllers/executeCommandController.js`, so the handler throws `ReferenceError`.
- `Permissions.CREATE_PORT` and `Permissions.VIEW_PORT` are each declared twice in
  `permissions.js`. The values match, so behaviour is unaffected, but ESLint's
  `no-dupe-keys` flags it.
- `utils/generateToken.js` signs a `{ userId }` payload while `Middleware/authenticate.js`
  reads `decodedToken.user._id`. The file is currently unused, so nothing is broken —
  but wiring it up as-is would make every authenticated request fail.
- The `feat/rbac` branch exists in both repositories but is fully contained in `main`.
  It is safe to delete.

---

## Notes

- `.env` files are git-ignored in both repositories. Confirm this before committing.
- The auth cookie uses `sameSite: "none"` and `secure` in production, which assumes the
  app is served over HTTPS behind a proxy. That is handled by
  `app.set("trust proxy", 1)` in `server.js` — do not remove it when deploying behind
  Railway/Render.