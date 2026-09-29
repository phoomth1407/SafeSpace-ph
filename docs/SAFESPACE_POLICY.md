# SafeSpace Policy

Version: 1.1
Last updated: 29 September 2026

The complete product policy is implemented in src/lib/safespacePolicy.js and presented through SafeSpacePolicyModal.jsx. This document is a repository-level guide to that policy rather than a second, independently editable copy.

## What the policy covers

The current policy contains 58 sections covering:

- SafeSpace's purpose and school-project status
- independent personal ownership and the project's origin as a school assignment
- account creation, email/password, Google authentication, verification, and password recovery
- account security and information associated with accounts
- assessment, guest assessment, assessment history, and PHQ-9-style screening
- AI-assisted processing, provider boundaries, local fallback behavior, and AI limitations
- sensitive wellbeing information and data minimization
- self-care and mood features
- Community use, anonymous display names, posts, comments, reactions, moderation, and reports
- public/private information and anonymity limitations
- resources, hotline information, and emergency limitations
- contact requests and administrative handling
- Supabase, GitHub Pages, RLS, Edge Functions, browser security, and known limitations
- third-party services, availability, feature changes, and policy versioning
- prohibited misuse, respect, user-submitted content, moderation, accuracy limits, and youth considerations
- acknowledgement before authentication and the policy version stored by the browser

## Authentication acknowledgement

Login and registration can require the user to review the policy before continuing. The application stores the accepted policy version in browser storage so the same acknowledgement is not repeatedly requested on the same browser. A new policy version can require acknowledgement again.

The policy can also be opened from the global footer without treating that reading action as a new authentication acknowledgement.

## Feature-specific policies

The product policy is not the only policy in SafeSpace:

- docs/ASSESSMENT_POLICY.md covers assessment-specific privacy, screening, and use limitations.
- docs/COMMUNITY_POLICY.md covers Community posting and interaction rules.

## Source of truth

When this guide and the implementation disagree, inspect src/lib/safespacePolicy.js and src/components/SafeSpacePolicyModal.jsx first, then update this document so the documentation does not drift.
