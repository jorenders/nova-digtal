# Nova Digital

Premium static landing page for Nova Digital.

## Local preview

1. Install dependencies with `npm ci`.
2. Start a local preview with `npm run build && npm run preview`.
3. Open `http://127.0.0.1:4173`.

## Pipeline

The repository now uses GitHub Actions for validation, testing, and deployment.

- `CI` runs on feature branch pushes, fixes, hotfixes, and pull requests into `main`.
- `Deploy Pages` runs on pushes to `main` and only deploys after linting, unit tests, build validation, and browser-based UAT all succeed.
- `Failure Triage` opens or updates a follow-up GitHub issue when either workflow fails, so broken pipelines get a clear recovery trail instead of silently stalling.

### Quality gates

- `npm run lint` validates HTML, CSS, and JavaScript.
- `npm run test:unit` covers the translation and language-switch logic.
- `npm run build` produces the deployable `dist/` artifact.
- `npm run test:uat` runs Playwright checks against the built site and verifies that the homepage, navigation, services section, CTA, and language switch behave correctly.

## Deploy

Enable GitHub Pages in the repository settings and set the source to `GitHub Actions`.
The `Deploy Pages` workflow uploads `dist/` as the Pages artifact and publishes it automatically after all checks pass on `main`.

## Recommended branch protection

For a small but professional setup, protect `main` with these rules:

- Require pull requests before merging.
- Require the `CI / quality` and `CI / uat` status checks to pass.
- Restrict direct pushes to `main`.
- Require branches to be up to date before merging.
- Keep deployment tied to `main` only, so failed checks can never publish to GitHub Pages.
