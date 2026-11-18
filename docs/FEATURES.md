# SafeSpace Features

Last reviewed: 18 November 2026 against repository `main` and connected Supabase metadata.

## Home and self-care
- Daily mood check-in saved to a signed-in user's account.
- Wellbeing assessment, screening, resource, and saved-tool shortcuts.
- Breathing, grounding, worry-release, and browser-generated ambient sound.
- Thai/English, light/dark themes, reduced motion, and performance settings.

## Assessment and history
- General wellbeing assessment with age context, policy acknowledgement, and sensitive-data consent.
- Signed-in assessments require a saved private birthdate; server-side logic checks eligibility from that profile.
- Guest assessment results display in the browser. Guests may separately share only score and risk level for later claiming.
- Signed-in users can review scores in History and delete records. Full wellbeing result details use a browser-local cache.
- A separate authenticated PHQ-9-style screening flow.
- Admin sharing is an opt-in for risk score and risk level; answers and written responses are excluded.

## Community and support
- Public Community reading; signed-in posting/commenting after Community Policy acceptance.
- Username or anonymous author label; incomplete profiles default to anonymous.
- Reactions, bumping, search/filter, reports, moderation, pinning, and Realtime updates.
- Controlled database-side post creation and rolling limits.
- Hotline/emergency-contact information and self-care reading links.

## Accounts and app shell
- Email/password and Google sign-in; reset/verification flows where configured.
- Welcome profile-completion dialog when username or birthdate is missing; Settings has the same profile controls.
- Admin/tester tools for permitted moderation, resource, report, support, and score-review tasks; account deletion.
- React/Vite with `HashRouter` for GitHub Pages, lazy routes, a session preloader, and separate in-app transitions.
- Standalone [project introduction](../public/about.html).

SafeSpace is screening/support, not diagnosis or emergency care. AI can be wrong and Community content is user-generated. Read [SafeSpace Policy](SAFESPACE_POLICY.md), [Assessment Policy](ASSESSMENT_POLICY.md), and [Community Policy](COMMUNITY_POLICY.md).
