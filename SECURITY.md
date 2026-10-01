# SafeSpace — Internal Security Notes
## September 2026

> **Internal, not user-facing.** The public SafeSpace Policy intentionally does not publish a detailed list of known security weaknesses.

Current internal limitations documented by the project include:

1. **Client-side password screening can be bypassed by direct callers.** Frontend password screening is not a substitute for server-side authentication protections.
2. **Some authenticated Edge Functions have broad CORS configuration.** Review and narrow this where practical without breaking legitimate application flows.
3. **Older compatibility functions remain during migration.** Review and remove them when they are no longer required.

These are engineering limitations, not evidence that the entire system is unsafe.

Security controls such as authentication, Row Level Security, server-side validation, request limits, CSP, and protected Edge Functions reduce risk but cannot guarantee perfect security.

Known limitations should be tracked internally, prioritised, tested, and updated as fixes are deployed.

Do not copy this internal block into user-facing policy popups.
