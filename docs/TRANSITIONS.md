# SafeSpace Loading and Navigation Transitions

Last reviewed: 30 September 2026

SafeSpace currently has two separate transition systems. They should not be treated as one generic loading spinner.

## 1. Cinematic first-open preloader

Implementation:

- src/components/Preloader/Preloader.jsx
- src/components/Preloader/Preloader.css
- wired from src/App.jsx

The preloader runs only when the session does not contain safespace:booted=1. Once it completes, App.jsx stores that value in sessionStorage and renders the normal application.

The animation includes the SafeSpace application icon, title treatment, progress/loading state, ambient visual effects, cursor treatment on supported desktop devices, reduced-motion handling, and optional Web Audio cues. Sound is currently enabled by default in component state, but browser autoplay policies can prevent audio until a user gesture occurs.

Mobile intentionally avoids the heavier desktop canvas/particle path so the transition does not add unnecessary rendering work on touch devices.

## 2. In-app route transition

Implementation:

- src/components/RouteTransition/RouteTransition.jsx
- src/components/RouteTransition/RouteTransition.css
- rendered inside the existing HashRouter in src/App.jsx

The transition watches useLocation() and shows a short veil during route changes. It displays the destination name in the current language, a circular progress indicator, the SafeSpace mark, and a thin top progress bar. Route labels cover the main application and authentication paths.

This is a navigation transition, not a substitute for the page's React/Suspense loading state. The existing RouteLoading fallback remains responsible for rendering when lazy-loaded route modules are still loading.

## Integration rules

- Keep HashRouter; do not replace it with BrowserRouter just to add the transition.
- Keep the preloader above the router so it represents cold/session startup.
- Keep the route transition inside the router so it can observe pathname changes.
- Keep safespace:booted as the session key unless the boot contract is intentionally changed everywhere.
- Preserve prefers-reduced-motion behavior.
- Do not add desktop-only canvas/particle work to the mobile path.
- When route labels are changed, update the LABELS map in RouteTransition.jsx.
