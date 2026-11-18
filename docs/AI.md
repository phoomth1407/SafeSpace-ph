# SafeSpace AI and Assessment Processing

Last reviewed: 18 November 2026 against repository `main` and live function versions.

AI supports parts of analysis and text generation. Authentication, age checks, input validation, rate limits, and database authorization are enforced outside the model. Results are screening/support information, not diagnoses.

## Main wellbeing

The signed-in flow sends consented answers to JWT-protected `analyze-assessment` (live v16). It validates request size (64 KB), answer shape (1–100 bounded items), identity, private birthdate/minimum age, consent, and rate limit (5 per 60 seconds per user/endpoint). OpenAI is used when configured; Gemini can be a fallback, with local/offline behavior if remote processing is unavailable.

The saved wellbeing row contains score/category and operational/consent metadata; answers and narrative return to the browser, with full result details cached locally. Answers may be processed by configured external AI providers.

## Guest and PHQ-9

Guests can receive a browser result and separately opt to send only score/risk level through `save-guest-score` (live v1, JWT verification off) for later claiming.

The separate authenticated `analyze-phq9` (live v5) requires nine answers, normalizes values to 0–3, calculates a 0–27 score/band, and can use OpenAI for supportive text. Unlike the main wellbeing path, it stores structured answers and result fields in `assessments`. Direct authenticated Data API grants are narrower than the underlying table schema.

## Community and provider boundary

The JWT-protected `analyze-community-post` (live v7) is a Community analysis endpoint. Post creation also uses a controlled database path and rolling limits. AI safety flags do not guarantee content safety or replace moderation.

Provider secrets stay in Supabase Edge Function secret storage. Models can misunderstand language, culture, context, sarcasm, and incomplete responses. Do not submit credentials, identity numbers, exact addresses, or another person's confidential information. See [policies](SAFESPACE_POLICY.md), [Assessment Policy](ASSESSMENT_POLICY.md), and [Edge Functions](EDGE_FUNCTIONS.md).
