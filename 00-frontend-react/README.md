# Linglooma frontend

The frontend uses React 19, Vite 6, Tailwind CSS 3, and React Router 7. Use Node.js 22 and npm. The API runs separately on port 3000; the Vite development server listens on <http://localhost:4028> and proxies `/api` to <http://localhost:3000>.

From `00-frontend-react` in PowerShell:

```powershell
Copy-Item .env.example .env
npm ci
npm run dev
```

The example sets `VITE_BACKEND_URL=http://localhost:3000`. Set this variable to your own backend URL for another environment and restart Vite after changing `.env`. See the [repository setup guide](../README.en.md) for PostgreSQL 15, backend credentials, and Docker instructions. Never put server secrets or API keys in a `VITE_` variable because they are included in the browser build.

Practice catalog reads are public. Chat, submissions, and private results require sign-in and a JWT. The analytics page displays saved speaking results only. Listening exercises currently do not persist progress.

## Source structure

```text
src/
├── app/          # Application shell and route definitions
├── components/   # Reusable, feature-independent UI
├── contexts/     # React context providers
├── pages/        # Feature folders containing pages and local components
├── services/     # Shared API and external-service clients
└── styles/       # Global and Tailwind styles
```

Keep a component inside its feature folder when only that feature uses it. Move it to `components/` only when it is shared by multiple features. Page files use descriptive `*Page.jsx` names rather than ambiguous `index.jsx` files.

## Checks

```powershell
npm run build
npx cypress run
```

The production bundle is written to `build/`. Cypress browser tests need a working browser and running app. If the API proxy reports `ECONNREFUSED`, start the backend on port 3000 and confirm its environment settings.
