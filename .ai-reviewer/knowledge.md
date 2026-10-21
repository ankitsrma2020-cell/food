# food reviewer notes

## Architecture
This is a two-package JavaScript application: an Express/Mongoose backend under `backend/` and a Vite React frontend under `frontend/`. The root package orchestrates installation, development, build, and startup across both packages using `--prefix`; the frontend runs on port 5173 (`frontend/vite.config.js`). The supplied `.vite-cache/` files are Vite-generated dependency artifacts rather than application source.

## Conventions
- Use native ES modules throughout: the root, `backend/package.json`, `frontend/package.json`, and `.vite-cache/deps/package.json` specify `"type": "module"`.
- Keep server code under `backend/src/`; backend development and production both start `src/server.js` (`backend/package.json`).
- Keep frontend code under `frontend/` and use Vite scripts (`frontend/package.json`): `dev`, `build`, and `preview`.
- Use root scripts as the cross-package entry points: `npm run dev` starts backend and frontend concurrently, while `build` and `start` delegate to the corresponding package (`package.json`).
- The backend is an Express API with MongoDB/Mongoose, authentication/security dependencies (`jsonwebtoken`, `bcryptjs`, `cookie-parser`), uploads/media support (`multer`, `cloudinary`), and environment configuration via `dotenv` (`backend/package.json`).
- Frontend routing is provided by `react-router-dom`; icons come from `lucide-react` (`frontend/package.json`). Do not add another routing or icon library without a concrete need.
- Vite’s dependency cache is deliberately outside the frontend package at `../.vite-cache` (`frontend/vite.config.js`).

## Intentional non-standard choices
- Package names do not match the repository name: the backend is named `mosaic-api`, the frontend `mosaic-web`, and the root `mosaic-social` (`backend/package.json`, `frontend/package.json`, `package.json`). Treat these as existing application identifiers, not naming errors.
- `.vite-cache/deps/` contains large generated React/Vite dependency bundles. These are build artifacts configured by `frontend/vite.config.js`; application changes should not be made directly there.

## Watch out for
- Do not place frontend dependencies or scripts in the root package, or backend dependencies in the frontend package; installation and execution are explicitly separated with `npm install --prefix ...` and `npm run ... --prefix ...` (`package.json`).
- Changes to the frontend dev port can break the established local workflow; preserve port `5173` unless the root orchestration and consumers are updated (`frontend/vite.config.js`).
- Avoid committing hand edits to `.vite-cache/`; regenerate it through Vite instead.
- Backend startup depends on `backend/src/server.js` and the backend’s module mode; renaming or converting that entry point without updating `backend/package.json` will break both `dev` and `start`.