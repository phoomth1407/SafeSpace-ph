# SafeSpace AI

Last reviewed: 2026-09-20

AI is used in a few parts of SafeSpace, but it is not the whole application. Some UI and assessment logic work without a remote AI provider.

The main idea is to use AI for supportive analysis and text generation while keeping authentication, validation, rate limiting, and database permissions outside the model.

## Current AI functions

| Function | Version | What it does |
| --- | ---: | --- |
| `analyze-assessment` | 14 | Analyzes the main wellbeing assessment and saves the result |
| `analyze-community-post` | 7 | Helps check and process Community posts |
| `analyze-phq9` | 5 | Processes the PHQ-9-style screening flow |
| `analyzeCommunityPost` | 3 | Old compatibility endpoint being retired |

`communityInteract` v3 is also still used by the current Community UI for compatibility.

## Main assessment flow

~~~text
Assessment.jsx
    |
    v
analyze-assessment
    |
    +-- check JWT
    +-- validate request
    +-- check rate limit
    |
    +-- OpenAI
    |     |
    |     +-- success -> use result
    |     +-- unavailable -> fallback
    |
    +-- Gemini fallback
    |
    +-- local fallback
    |
    v
public.assessments
    |
    v
Assessment Result / History
~~~

The provider response is not used as an authorization decision. The Edge Function decides who can call it and what gets written.

## What the main assessment checks

Before expensive processing, `analyze-assessment` checks:

- valid JWT
- authenticated user
- request body within 64 KB
- valid JSON
- 1–100 answer objects
- answer text limits
- reasonable age when supplied
- 5 requests / 60 seconds / user

The result is saved to `public.assessments`.

## AI fallback

I did not want the whole assessment to stop working just because one provider is unavailable.

For the main assessment:

1. OpenAI is tried first when configured.
2. Gemini can be used as a fallback.
3. Local fallback logic is available if remote AI is unavailable.

The local fallback is simpler than a full AI response. It exists to keep the app usable rather than pretending it can reproduce a remote model.

## Community AI

`analyze-community-post` requires a JWT, limits the request body to 64 KB, validates the JSON and content, requires at least 10 characters, applies the 5-per-60-second user limit, performs a lightweight safety check, can use OpenAI, and writes the post to `community_posts`.

Community posting also has a database-side `create_community_post` path and rolling limit. This matters because a React-side limit can be bypassed by calling the backend directly. The database path also applies a lightweight risk-flag floor for obvious high-risk phrases, so a direct RPC caller cannot simply mark that content as safe.

The old `analyzeCommunityPost` endpoint is kept while the old path is being retired.

## PHQ-9-style screening

`analyze-phq9` expects exactly nine answers and normalizes them to 0–3. It calculates a total from 0 to 27 and assigns the screening band used by the application.

OpenAI can optionally generate supportive text around the result.

This is a screening result, not a diagnosis.

## Provider and privacy boundary

Provider API keys stay in Supabase Edge Function secret storage. The frontend never receives them.

Assessment and Community content can contain sensitive personal information, so changing the AI payload should be treated as a privacy change, not just an implementation detail. Check the Assessment Policy if the type of information sent to a provider changes.

## What AI does not control

AI does not decide whether a user is authenticated, owns a row, is an admin, is within a rate limit, can bypass RLS, or can use an API secret. Those controls are implemented by Supabase Auth, Edge Functions, database policies, and server-side functions.

## Failure cases

Remote AI can fail because of missing configuration, provider errors, network problems, unexpected responses, or provider-side rate limits.

The app should fail in a controlled way instead of exposing provider secrets or raw internal errors. The main assessment has a local fallback for this reason.

## Safety and limitations

SafeSpace is a school-project screening/support application.

AI output can be wrong, incomplete, or generic. It should not be treated as a medical diagnosis or a replacement for a qualified professional. The app also does not claim that an AI model can reliably determine a person's mental health from a questionnaire.

For urgent situations, the app points users toward appropriate crisis/support resources rather than trying to make the AI an emergency service.

## If you change an AI function

1. Keep JWT verification enabled.
2. Validate the body before using user-controlled values.
3. Keep request-size limits.
4. Rate-limit expensive calls.
5. Keep provider keys in Supabase secrets.
6. Preserve response fields expected by the frontend.
7. Check database writes against RLS/ownership rules.
8. Test rejected requests as well as successful ones.
9. Update [docs/EDGE_FUNCTIONS.md](EDGE_FUNCTIONS.md) when the deployed version or behavior changes.

I would rather document a limitation honestly than make the AI sound more capable than it really is.
