# SafeSpace

SafeSpace is a bilingual Thai/English wellbeing web app built as a school project. It combines self-reflection and screening, self-care tools, Community features, and support resources.

> SafeSpace is a screening/support tool, not a clinic, diagnosis service, or emergency service. Automated results can be wrong.

## Current app

React 18 and Vite 6 build a static GitHub Pages frontend. Supabase provides Auth, Postgres, RLS, Realtime, and Edge Functions. The app includes email/password and Google sign-in, mood check-ins, wellbeing and PHQ-9-style screening, result history, a self-care toolkit, public Community reading and signed-in participation, resources/hotlines, Settings, admin tools, and account deletion. The interface supports Thai/English and light/dark themes.

See [Features](docs/FEATURES.md), [Architecture](docs/ARCHITECTURE.md), and [Current App Guide](docs/CURRENT_APP_GUIDE.md).

## Privacy and data

Signed-in users can complete a username and birthdate profile in a welcome dialog or Settings. The full birthdate is in `private.user_birthdates`, separate from the admin-readable `public.users` profile; public and admin profile views do not expose it. The server uses the private value for account assessment eligibility.

Sharing risk score and risk level with admins is a separate opt-in choice. It does not share answers or written responses. Signed-in wellbeing answers are sent to the protected analysis function and may be processed by configured AI providers; the saved wellbeing row contains score/category and operational metadata, while full results are cached locally in the browser. The separate PHQ-9 flow stores its answers and result fields. Guests may opt to share only score and risk level for later claiming. See [Data Model](docs/DATA_MODEL.md) and [AI](docs/AI.md).

## Development

Use Node.js 22:

```bash
npm ci
npm run dev
```

Useful checks: `npm test`, `npm run lint:a11y`, `npm run build`, `npm run test:e2e`. GitHub Actions runs these checks for pull requests and deploys a successful `main` build to Pages. Supabase migrations and Edge Function deployments are separate.

The browser receives only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Provider and service-role secrets stay server-side. See [Environment](docs/ENVIRONMENT.md), [Deployment](docs/DEPLOYMENT.md), and [Edge Functions](docs/EDGE_FUNCTIONS.md).

- [Live app](https://phoomth1407.github.io/SafeSpace-ph/)
- [Project introduction](https://phoomth1407.github.io/SafeSpace-ph/about.html)
- [License](LICENSE)
