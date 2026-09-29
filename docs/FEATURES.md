# SafeSpace Features

Last reviewed: 30 September 2026

This document describes the user-facing features currently represented in the frontend. The code and feature-specific policies remain the authoritative sources when behavior changes.

## Assessment and wellbeing

- Wellbeing assessment with age and nationality context.
- Separate assessment policy acknowledgement before starting.
- Guest assessment flow that keeps the current result in browser navigation state rather than attaching it to an account.
- Signed-in assessment history with deletion of saved records.
- AI-assisted assessment analysis with OpenAI, Gemini fallback when configured, and local fallback logic.
- PHQ-9-style screening flow.
- Daily mood check-in.
- Breathing, grounding, and worry-release tools.
- Procedural ambient sound mixer.

## Community

- Public reading for Community posts and comments.
- Authenticated posting and commenting.
- Community policy acknowledgement before posting/commenting where required.
- Moderation, reporting, reactions, and admin controls.
- Realtime Community updates through Supabase Realtime.
- Database-enforced Community posting controls; the UI is not the only protection.

## Resources

- Emergency contacts and support hotlines.
- Self-care and self-therapy reading resources.
- Informational resources are presented as support information, not as a replacement for professional care.

## Accounts and administration

- Email/password authentication.
- Google authentication and Google One Tap.
- Password recovery and account verification flows where enabled by the Supabase configuration.
- Admin-only moderation/resource management and contact/report handling.
- Thai/English interface and Light/Dark themes.

## Application experience

- GitHub Pages-compatible frontend routing through HashRouter.
- A first-open cinematic preloader stored with the safespace:booted session key so it runs once per browser session.
- Route transition overlay for in-app navigation with destination labels, progress ring, SafeSpace mark, and top progress bar.
- Desktop preloader ambient/canvas effects with a lighter mobile path.
- Reduced-motion handling.
- SafeSpace app icon reused from public/icons/safespace-icon.svg.
- Global SafeSpace Policy accessible from the footer.
- Standalone project introduction at public/about.html.

## Important boundaries

SafeSpace is a wellbeing screening/support project, not a medical diagnosis service or emergency service. Automated output can be wrong, Community content is user-generated, and online services can fail or change. See docs/ASSESSMENT_POLICY.md, docs/SAFESPACE_POLICY.md, docs/COMMUNITY_POLICY.md, and SECURITY.md for the relevant limitations and controls.
