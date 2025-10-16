# Repository Guidelines

## Project Structure & Module Organization
This Next.js 15 app uses the App Router under `src/app`; layouts and page entry points live beside route folders, with global styles in `src/app/globals.css`. Shared helpers belong in `src/lib` and resolve through the `@/lib` alias defined in `tsconfig.json`. Keep static assets in `public`. Shadcn metadata sits in `components.json`; generate UI into `src/components` so `@/components` imports stay valid.

## Build, Test, and Development Commands
Install dependencies with `pnpm install` to keep the lockfile in sync. Use `pnpm dev` for the Turbopack dev server, `pnpm build` for a production bundle, and `pnpm start` to serve the compiled output. Run `pnpm lint` and `pnpm format` before pushing; both use Biome to keep code and styles consistent.

## Coding Style & Naming Conventions
Biome enforces two-space indentation, organized imports, and the recommended React/Next lint rules (`biome.json`). Author React modules in TypeScript; export components in PascalCase, hooks in camelCase, and utilities in camelCase to match `src/lib/utils.ts`. Prefer server components and add `"use client"` only when browser APIs are required. Tailwind classes live inline in JSX, with shared combinations wrapped in helpers such as `cn`. Global styles stay in `globals.css`.

## Testing Guidelines
No automated tests ship with this repo yet. When you add features, create colocated `*.test.ts(x)` files or organize suites under `src/__tests__` that cover the public surface. Document the test runner in `package.json` (for example, add a `pnpm test` script) and ensure it passes alongside `pnpm lint`. Share manual QA notes in the PR until the suite is stable.

## Commit & Pull Request Guidelines
Keep commits small and imperative, mirroring `git log` entries like `add shadcn/ui`. Start the subject with a verb, stay under ~72 characters, and group related changes together. Each PR should include a concise summary, linked issue or ticket, screenshots or clips for UI work, and the commands you ran (`pnpm dev`, `pnpm lint`, tests). Request review once the branch rebases cleanly on `main`.

## Configuration & Environment
Store secrets in `.env.local`, never commit them, and reference via `process.env`. Tune Next or Tailwind behavior in `next.config.ts` and `postcss.config.mjs`; document notable tweaks in the PR description. Update `components.json` and alias mappings when introducing new shared folders so `@/...` imports keep working.
