# Travel Planner (Angular MVP)

Group travel planner MVP: trips, members, itinerary, budget, polls, pocket, diary, and where-to-eat list.

## Production build

```bash
npm ci
npm run build
```

Output: `dist/travel-planner-angular/` (`browser/` + `server/server.mjs`).

Local SSR after build:

```bash
npm run start
# or: node run.cjs
```

## Deploy to Azure Web App (Node SSR, not Static Web Apps)

Same pattern as the **sweldopinoy** sibling project (`../sweldopinoy`): Windows App Service + Node 22 + **iisnode** → `run.cjs` → `dist/travel-planner-angular/server/server.mjs`.

| File | Purpose |
|------|---------|
| `run.cjs` | CommonJS bootstrap for iisnode (ESM SSR bundle) |
| `web.config` | IIS rewrite all non-file requests to Node |
| `.deployment` | Skip Oryx rebuild on server (CI ships `dist` + `node_modules`) |

**Azure Portal:** Web App → Configuration → General settings → Stack **Node 22 LTS**, Startup command can stay empty (iisnode uses `web.config`). Do **not** use Static Web Apps for this repo.

**CI:** Use **Deployment Center** to connect GitHub; Azure will generate the workflow. Ensure the build ships `dist`, production `node_modules`, `web.config`, `run.cjs`, and `.deployment` (same package layout as sweldopinoy).

## Mock data layer

This build uses an **in-memory mock backend** with optional `localStorage` persistence. Real-time sync across browsers, SMS/email invites, and cloud file storage require a real backend (Supabase/Firebase). Repository interfaces under `src/app/data/repositories/` are the swap point—implement the same interfaces and register them in `mock.providers.ts` instead of mock classes.

### Demo login

- `alex@example.com` (organizer seed user)
- `jamie@example.com` / `sam@example.com`

## UI

Tailwind CSS v4 with global utility classes. ZardUI CLI init is optional; components use shared `.btn`, `.card`, and `.field` patterns in `src/styles.scss`.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.7.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
