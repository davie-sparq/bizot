# Firebase / Local Development Notes

This project includes Firebase Hosting, Firestore, and Cloud Functions (TypeScript).

Key points
- The functions code references Genkit-like packages; those packages are not required for
  local development because a small adapter `functions/src/genkit-adapter.ts` provides
  a runtime fallback. When the real packages are installed, the adapter will use them.
- The web frontend is located in `web/` and the production build output is `web/dist`.
- Dockerfile builds the frontend from `web/` and serves `dist/` using a small `server.js`.

Local setup

1. Functions

```bash
cd functions
# install dependencies and regenerate lockfile
npm install --legacy-peer-deps
npm run build
```

2. Web

```bash
cd web
npm install --legacy-peer-deps
npm run build
```

3. Docker (optional)

```bash
cd $(repo-root)
docker build -t bizot:local .
docker run --rm -p 8080:8080 bizot:local
# open http://127.0.0.1:8080
```

4. Firebase emulators

```bash
firebase login
firebase emulators:start --only functions,hosting,firestore
```

Adapter behavior
- `functions/src/genkit-adapter.ts` attempts to `require()` the real packages:
  `@genkit-ai/flow`, `@genkit-ai/googleai`, and `genkit`. If they are present, it delegates
  to them. Otherwise it provides simple fallback implementations so the function code can
  compile and run locally.

Deployment
- Before deploying to production, ensure real Genkit packages are installed and vetted.
  Install them inside `functions/` and remove or update the adapter as desired.
