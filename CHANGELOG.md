# SafeSpace — Changelog

## 2026-09-20 — Current backend and project cleanup

- Added the SafeSpace Non-Commercial Attribution License and documented the reuse/attribution rules.
- Brightened the Community and Resources backgrounds without changing their card/content styling.
- Tracked the current Community posting protections and hardened security-definer functions in the Supabase migrations.
- Updated project documentation to match the current Supabase functions, migrations, authentication flows, guest assessment behavior, and frontend structure.
- Refreshed the standalone About page so it describes the current project instead of older implementation snapshots.


## 2026-09-19 — Current state and security hardening

- Completed the security-hardening pass for sensitive Supabase data and AI endpoints.
- Added assessment privacy acknowledgement and input validation.
- Added database-backed per-user rate limiting for expensive AI functions.
- Added request-size validation and JWT authentication to the current AI functions.
- Added signup password-strength and breached-password screening on the main branch.
- Added browser Content Security Policy and locked CI dependency installation to `npm ci`.
- Refreshed the README, security model, architecture, deployment, environment, Edge Function, and RLS documentation.
- Mirrored the currently deployed production sources for `analyze-assessment` v13, `analyze-community-post` v5, and `analyze-phq9` v5 under `supabase/functions/`.
- Kept a record of production/source-control drift so the repository does not falsely claim to contain backend code that is not actually tracked.

## Historical repository update log

The section below is generated from the Git history of `main`, from the initial commit through 2026-09-19. It intentionally preserves even small/fixup commits so the project history is not lost.

### 2026-09-19

- `fd0f7cf` chore: mirror deployed analyze-phq9 source
- `5d19f17` chore: mirror deployed analyze-community-post source
- `34ac72c` chore: mirror deployed analyze-assessment source
- `5bd4fe0` docs: add EDGE_FUNCTIONS.md
- `2c7dbda` docs: add DEPLOYMENT.md
- `e0fcb37` docs: add ENVIRONMENT.md
- `000d99b` docs: add ARCHITECTURE.md
- `e5b6c3f` docs: refresh RLS audit
- `75809fc` docs: add security hardening changelog entry
- `a6ef35d` docs: correct development notes
- `fdd28fc` docs: refresh security model
- `aee974a` docs: update README for current stack and security
- `283598f` security: enforce signup password policy on main
- `d817077` Merge pull request #13 from phoomth1407/security-hardening
- `14020c2` security: version-control Supabase hardening migration
- `c8fca7c` security: add browser content security policy
- `dbc8276` ci: use locked npm dependencies
- `271dc3b` fix: correct assessment repair language source
- `ce221a3` security: add assessment privacy acknowledgement
- `7e0c071` Refine bilingual content in about.html
- `0ad7b7a` Update footer credit in about.html

### 2026-09-18

- `99102f3` Update README.md
- `006d2ed` Modify website URL and add introduction link
- `764d895` Add Thai translation and replace emoji UI with SVG icons
- `c21dcff` Add Home introduction translations
- `85b3e31` Add standalone introduction button to Home
- `2a7c284` Add standalone project introduction page

### 2026-09-17

- `f41c8ba` Delete safespace-introduction.html
- `b034881` Update fmt.Println message from 'Hello' to 'Goodbye'
- `d63e1af` Update print statement to say 'Goodbye World'
- `d8fea84` Remove About page
- `b7c980f` Remove About page links from main layout
- `8ad4ba3` Add standalone About link to SafeSpace navigation and footer
- `1c9b51b` Add standalone SafeSpace About introduction page

### 2026-09-16

- `027b179` Update SafeSpace icon to the cloud profile style
- `d2b5962` Remove redundant manual Pages deployment workflow
- `6237250` Fix GitHub Pages manifest and favicon paths
- `38de59d` Add local SafeSpace app icon
- `cd6e24b` Add GitHub Pages-safe web app manifest
- `4c992cb` Replace ambient sound emojis with custom illustrations
- `c9ff3df` Add custom illustrations for ambient sound channels
- `e7b8bf3` Clean up worry illustration imports
- `c010fb7` Replace worry-release emojis with custom illustrations
- `5ab94dc` Replace mood emojis with custom illustrations
- `d886c7f` Fix wellness illustration exports
- `a33df8a` Add illustrated mood and worry-mode visuals
- `6240520` Use wellness illustrations instead of emojis on tool cards
- `c852bd8` Replace wellness tool emojis with custom illustrations
- `589d45a` Make separate Pages deploy workflow manual-only
- `56ce9ba` Gate GitHub Pages deployment behind all quality checks
- `64f781e` Add themed assessment deletion dialog copy
- `84ed9e4` Set test language before Resources smoke test
- `5901c3f` Use themed confirmation dialog for assessment deletion
- `ad97f8b` Make slow-network smoke tests stable on CI
- `da04093` Deploy only after quality checks pass
- `5edc254` Make slow-network Resources smoke test robust to heading markup
- `094a073` Test English offline assessment output
- `e9a2e38` Persist selected language on AI assessment results
- `4ef34a5` Add bilingual assessment history deletion labels
- `7cb4219` Make offline model source badge readable in both themes
- `a2eac7c` Add user-controlled assessment history deletion
- `99c4f4c` Persist assessment language for localized results
- `d1bd343` Pass selected language into offline assessment model
- `14f0bfc` Make offline assessment fallback bilingual
- `40f1bbb` Fix slow-network Resources smoke test selector
- `e164b13` Repair legacy assessment fallback results on read
- `0c863d0` Fix remaining accessibility CI lint errors
- `78bd9e6` Fix remaining accessibility CI lint errors
- `16cf671` Fix accessibility CI lint errors
- `049edd5` Fix accessibility CI lint errors
- `a3b90d8` Fix accessibility CI lint errors
- `c910be3` Replace legacy AI fallback result with offline model
- `e0b9ba0` Fallback when AI function returns an error payload
- `dd573ba` Align scoring tests with offline model behavior
- `8f2f0d9` Only flag offline patterns when answers indicate concern
- `154e8b0` Keep emergency hotline label aligned with its call link
- `d2184cb` Show whether result used AI or offline model
- `c171c22` Add offline model result labels and clarify screening language
- `ecb4b32` Test offline screening fallback behavior
- `7e8a8a7` Use offline screening model when remote AI is unavailable
- `324bfc4` Strengthen offline classical screening fallback model
- `092741c` fix: resolve text invisibility and theme contrast in light/dark modes

### 2026-09-14

- `7dc0166` Run slow-network browser smoke tests in CI
- `82df0dc` Add slow-network smoke coverage
- `14167af` Configure Playwright slow-network smoke tests
- `ae1212f` Add Playwright for slow-network smoke testing
- `0fef699` Split vendor chunks for better frontend caching
- `3fc92bb` Fix page heading theme colors
- `cde3da8` Fix page heading theme colors
- `543c989` Document visual and microcopy polish
- `aaa4360` Polish bilingual microcopy and screening language
- `2ab26e5` Polish visual hierarchy and microcopy
- `c82abb8` Polish visual hierarchy and microcopy
- `5b368e0` Polish visual hierarchy and microcopy
- `c8f9322` Polish visual hierarchy and microcopy
- `2eb89e4` Polish visual hierarchy and microcopy
- `4531993` Add visible focus and reduced motion support
- `335b16f` Improve modal keyboard accessibility
- `8afecbc` Improve modal keyboard accessibility
- `fd4869e` Improve modal keyboard accessibility
- `7eaff10` Add Resources error state and retry
- `2ef4f71` Improve history loading and error recovery
- `f6d9ab3` Add loading error recovery copy
- `bc352f0` Improve light theme placeholder contrast
- `a5b1171` Improve resource card text contrast
- `b63630e` Improve Community subtitle contrast
- `d12428e` Improve Resources light and dark contrast
- `1cdc7d8` Fix accessibility audit rule configuration
- `b0f9852` Fix CI without a package lockfile
- `f34f1c6` Document SafeSpace 1.1.0 release
- `2537d18` Bump SafeSpace version to 1.1.0
- `7a7d001` Tame Dependabot update volume and avoid unplanned major upgrades
- `2cc36a4` Improve README with quality and performance overview
- `a6d9d7b` Run tests accessibility audit and build in CI
- `31bdcab` Add automated dependency update checks
- `7dbbf64` Lazy-load application routes
- `1a33ebd` Enable JSX accessibility audit rules
- `3beb57b` Add accessibility audit tooling
- `2be3a6c` Remove persistent crisis banner from main layout
- `1f42123` Document security and crisis support
- `b4d2c4c` Keep safe environment template tracked
- `3ccec00` Add visible crisis support banner
- `519bcfe` Add bilingual crisis support labels
- `09e4c69` Document Supabase RLS audit
- `9286922` Add SafeSpace security documentation
- `94ec684` Add safe local environment template
- `8dbc23d` Configure jsdom for Contact Admin test
- `5468dc7` Fix Vitest globals in scoring tests
- `4c5a8da` Test assessment AI fallback chain
- `d9cae5f` Extract AI fallback selection for testing
- `10e2ca0` Add automated test workflow
- `c98ed01` Fix test matcher setup
- `06532d1` Add core SafeSpace automated tests
- `37bea48` Add core SafeSpace automated tests
- `4d88a91` Add Vitest and React testing dependencies
- `2f6f725` Fix contact request insert RLS response flow

### 2026-09-13

- `62defef` Fix authenticated contact request inserts
- `d25f007` Improve contact form error diagnostics
- `3744694` Update CHANGELOG.md
- `7bbb647` Add live Supabase Realtime updates to Community
- `9bf46ee` Update PageNotFound.jsx
- `e419302` Update colors for ExternalLink and Loader components
- `1414ced` Update text colors in Community component
- `6169c63` Update text colors for dark mode compatibility
- `0c1654a` Include website URL in README
- `2080f1a` Remove old Base44 client filename
- `25d977d` Rename app client references
- `9a755e1` Rename app client references
- `20786fd` Rename app client references
- `3c2b672` Rename app client references
- `d49c78b` Rename app client references
- `aabb420` Rename app client references
- `5d90624` Rename app client references
- `52ed6e4` Rename app client references
- `73f3c48` Rename app client references
- `9eadcc9` Rename app client references
- `41f20cf` Rename app client references
- `9820773` Rename app client references
- `f6d4fdc` Rename app client references
- `16544f7` Rename app client references
- `d85ee66` Rename app client references
- `aa9b8e1` Rename app client references
- `e60de78` Rename app client references
- `797a65e` Rename app client references
- `69d293b` Use renamed app client
- `55a5a4f` Use renamed app client
- `50ca08c` Use renamed app client
- `86fdbd0` Use renamed app client
- `7452d2b` Use renamed app client
- `9107bfc` Use renamed app client
- `30e3f2b` Use renamed app client
- `298819c` Use renamed app client
- `ed8ab84` Use renamed app client
- `0032f0c` Rename compatibility client to appClient
- `18330e8` Update development notes for current Supabase stack
- `eae20aa` Update README for current Supabase architecture
- `954c618` Remove old Base44 artifact path
- `da2e6ad` Move legacy Base44 artifact to legacy folder
- `46b1bc4` Remove old Base44 artifact path
- `2cb33bc` Move legacy Base44 artifact to legacy folder
- `309a2b9` Remove old Base44 artifact path
- `f561a1f` Move legacy Base44 artifact to legacy folder
- `ab0d0fd` Remove old Base44 artifact path
- `cd8a42e` Move legacy Base44 artifact to legacy folder
- `1c67565` Remove old Base44 artifact path
- `deebdd4` Move legacy Base44 artifact to legacy folder
- `d4379cd` Remove old Base44 artifact path
- `94ecd84` Move legacy Base44 artifact to legacy folder
- `b242b8c` Remove old Base44 artifact path
- `89a4ba4` Move legacy Base44 artifact to legacy folder
- `31b18fb` Remove old Base44 artifact path
- `d4b1e5c` Move legacy Base44 artifact to legacy folder
- `1017231` Remove old Base44 artifact path
- `707af70` Move legacy Base44 artifacts to legacy folder
- `8f3cf53` Remove old Base44 artifact path
- `49382c9` Move legacy Base44 artifacts to legacy folder
- `18f8ecf` Remove old Base44 artifact path
- `6667dd5` Move legacy Base44 artifacts to legacy folder
- `11c59fc` Remove old Base44 artifact path
- `b199402` Move legacy Base44 artifacts to legacy folder
- `d71c0af` Remove old Base44 artifact path
- `a6863f4` Move legacy Base44 artifacts to legacy folder
- `8df60ad` Remove old Base44 artifact path
- `1db17d5` Move legacy Base44 artifacts to legacy folder
- `78808f3` Remove old Base44 artifact path
- `9c3ebcd` Move legacy Base44 artifacts to legacy folder
- `d614510` Clean changelog formatting and remove emoji
- `c4443ce` Add changelog for September 13 feature session
- `a6f04e7` Set personalized tool titles and AI result text to black
- `b335e38` Add personalized AI-selected next steps to assessment results
- `9656efa` Add personalized next-step tool labels
- `df75b90` Preserve original button colors in resources
- `e26fa22` Preserve original button colors in community
- `7c8bd64` Restore original light-theme button text behavior
- `4df0145` Normalize resources theme classes
- `cb95a03` Normalize community theme classes
- `6e3da96` Normalize history page light and dark theme contrast
- `6d3cae3` Fix global light-theme text contrast
- `7cd60df` Restore grounding card animation and improve tool title contrast
- `f744041` Fix assessment result navigation cards
- `d4a36d1` Make assessment result more interactive with motion feedback
- `91a13c0` Add subtle interactive motion to wellbeing tools on Home
- `fec4afe` Soften resource descriptions to light gray
- `ee0589e` Soften community descriptive text to light gray
- `b972e66` Refine assessment result dark-theme text hierarchy
- `f156a34` Improve resources dark-theme description contrast
- `4d4f579` Improve community dark-theme description contrast
- `456745c` Fix resources dark-theme text contrast
- `b903f72` Fix community dark-theme text contrast
- `d4718cb` Make requested AssessmentResult.jsx section headings black
- `33cf0c2` Make requested Resources.jsx section headings black
- `42a2432` Make requested Community.jsx section headings black
- `8166576` Make community page text black in both themes
- `097f2ee` Make resources page text black in both themes
- `e8f4e36` Make assessment result text black in both themes
- `eed4116` Fix Home JSX comment syntax
- `733e134` Add interactive self-care tools to resources
- `e03e221` Add quick wellbeing tools to community
- `b3fa4d7` Allow pages to open the global sound mixer
- `562d0b2` Add next-step wellbeing tools to assessment results
- `cf0c933` Organize home wellbeing tools under one section
- `b5179d9` Add shared wellbeing tool translations for Home, Result, Community and Resources
- `8758657` Fix ambient player theme icon, simplify UI, and make lo-fi audible
- `ded3ac3` Rename forest ambient sound to wind in Thai
- `9112e54` Fix ambient audio silence, wave modulation, bowl, and lo-fi sounds
- `b163bb2` Add ambient mixer usage instructions
- `5616ec4` Make ambient sounds audible by default and clarify how to use the mixer
- `52ce2f0` Add persistent SafeSpace ambient sound player
- `a6476bd` Add ambient sound mixer translations
- `f2147ea` Add procedural ambient sound mixer
- `b7f3670` Animate the user's worry text during release
- `3d17de2` Make worry placeholder black in light mode
- `be80ed0` Fix worry text placeholder contrast in light mode
- `e897de9` Animate worry release and improve light theme text contrast
- `92b22be` Fix duplicate comma in worry release English translation
- `62d5b94` Fix i18n syntax error from worry release feature
- `5e4611b` Add worry release tool to SafeSpace home
- `1715715` Add Thai and English worry release translations
- `e1813ab` Add reflective worry release experience
- `c6fd7cc` Add grounding exercise to SafeSpace home
- `1391a05` Add Thai and English grounding exercise translations
- `de3e6e5` Add interactive 5-4-3-2-1 grounding exercise
- `4863c14` Revert broad Home theme changes; keep breathing title contrast fix
- `1d7636b` Fix Home light and dark theme contrast explicitly
- `4d51343` Fix light theme overrides on breathing modal title and start button
- `6a56fb3` Improve breathing card contrast in light mode
- `c001f34` Improve breathing controls contrast in light and dark themes
- `793219d` Add breathing exercise entry point to home
- `cc2ae07` Add Thai and English breathing exercise translations
- `a26e6dd` Add interactive breathing exercise modal
- `7902e3c` Improve mood check-in title contrast in light mode
- `02ee44a` Add mood check-in to SafeSpace home
- `3a14d54` Add Thai and English mood check-in translations
- `052b0f0` Add daily mood check-in card
- `7d11060` Separate main navigation from right-side controls
- `a2911c9` Match youth hotline styling with Base44
- `c3893e6` Fix emergency hotline button contrast in light theme
- `583f8f0` Fix OAuth translation JSX expressions
- `675d13e` Fix nested JSX translation expression
- `a53b414` Fix login translation JSX build error
- `7a5b64f` Use selected language for community admin label
- `310b803` Translate community admin label
- `777ac79` Fix OAuth consent translation rendering
- `ede16b5` Translate assessment result content by selected language
- `b32cb99` Fix and complete register translations
- `da44430` Add OAuth consent translations
- `f2da5be` Translate OAuthConsent.jsx by selected language
- `f766539` Translate ResetPassword.jsx by selected language
- `3bdf07c` Translate ForgotPassword.jsx by selected language
- `f7f55b5` Translate Register.jsx by selected language
- `d808a72` Finish login page translations
- `6ede675` Translate Google login labels
- `65b0b0b` Translate login page by selected language
- `f366954` Complete Thai and English translations for auth and results
- `daa318c` Pass One Tap nonce to Supabase ID-token sign-in
- `24861c3` Restore complete hotline list with safe fallback data
- `3dbae42` Add Google One Tap to registration page
- `df73ede` Add Google One Tap to login page
- `5fc235f` Support nonce for Google One Tap ID token sign-in
- `323ac8b` Add Google One Tap authentication
- `f8122be` Return users to app after Google OAuth or One Tap sign-in
- `59202b5` Fix Google OAuth callback routing and add One Tap sign-in helper
- `9d0d2e8` Improve light theme contrast across all pages
- `39b3b45` Improve result readability across light and dark themes
- `c5cc862` Restore AI analysis section on assessment results
- `77bf301` Restore AI assessment analysis through Supabase using original prompt
- `52d2683` Remove AI section from clean baseline result page
- `83441f1` Reset assessment analysis to original local non-AI baseline

### 2026-09-09

- `6d77b8d` fix registration flow and friendly Google OAuth errors
- `66a9e43` sync auth context from real Supabase session
- `c68d4a2` fix auth session handling for assessment and OAuth errors
- `35c1e5a` Finalize Supabase compatibility adapter for runtime
- `a675589` Use Node 22 for Supabase client compatibility
- `3d54b43` Fix Vite path alias for production build
- `bedc3f6` Fix invalid dependency version for Pages build
- `2f49059` Fix invalid dependency version
- `8c4e03b` Fix HashRouter auth return routing
- `d25d2c2` Wire app auth state to Supabase
- `b9f239d` Replace local storage adapter with Supabase backend
- `3e69b13` Add Supabase browser client
- `30f0cb0` Add Supabase client dependency
- `7e8897a` Fix Pages workflow Node setup without lockfile cache
- `ac9d1c8` Make auth return URLs GitHub Pages compatible
- `8cdf8f0` Use HashRouter for reliable GitHub Pages navigation
- `0ca60ce` Add GitHub Pages deployment workflow
- `d53beda` Fix bilingual offline assessment scoring and safety wording
- `de9120b` Remove Base44 packages from project dependencies
- `d06c7ef` Remove Base44 Vite plugin
- `f9ad4da` Remove Base44 SDK auth dependency
- `d3c5228` Add local email authentication to Base44-free adapter
- `6d2d7c7` Remove Base44 runtime and add local browser backend
- `e312e14` Create Resources.jsx
- `8a3f759` Create ResetPassword.jsx
- `4acd4a4` Create Register.jsx
- `52c2048` Create OAuthConsent.jsx
- `7068e90` Create Login.jsx
- `2dce9fd` Create LanguageSelect.jsx
- `66b5607` Create Home.jsx
- `ec8e9f3` Create History.jsx
- `4a42a2e` Add Forgot Password component
- `56c0320` Create ContactAdmin.jsx
- `3efda63` Create Community.jsx
- `bfd8f80` Create AssessmentResult.jsx
- `a3224de` Create Assessment.jsx
- `aa68fe0` Create Admin.jsx
- `41c948d` Create index.ts
- `a3c2fe8` Create utils.js
- `2b891bf` Create theme.jsx
- `1785b71` Create query-client.js
- `5939b09` Create PageNotFound.jsx
- `9faf25d` Create i18n.jsx
- `7b9945e` Create authReturnTo.js
- `3d336b7` Create AuthContext.jsx
- `99eef20` Create assessmentScoring.js
- `26de79e` Create assessmentQuestions.js
- `f815fe5` Create app-params.js
- `9fcc8db` Create use-size.jsx
- `bb153ec` Create use-mobile.jsx
- `38c9f3c` Create use-toast.jsx
- `8ed2b74` Create tooltip.jsx
- `d363893` Create toggle.jsx
- `0572cc7` Create toggle-group.jsx
- `e29475d` Create toaster.jsx
- `4581952` Create textarea.jsx
- `a77ad15` Create toast.jsx
- `8f80eec` Create tabs.jsx
- `8503202` Create table.jsx
- `eb86600` Create switch.jsx
- `b60bded` Create sonner.jsx
- `07652c5` Create slider.jsx
- `489d542` Create skeleton.jsx
- `6b21b54` Create sidebar.jsx
- `68e4975` Create sheet.jsx
- `90754e3` Create separator.jsx
- `4323e34` Create select.jsx
- `ce13ff9` Create scroll-area.jsx
- `0c9f012` Create resizable.jsx
- `276ec54` Create radio-group.jsx
- `9ba81b1` Create progress.jsx
- `9862689` Create popover.jsx
- `cf5f32c` Create pagination.jsx
- `d3a55ce` Create navigation-menu.jsx
- `f961973` Create menubar.jsx
- `259c6f9` Create label.jsx
- `8ab1b62` Create input.jsx
- `164377f` Create input-otp.jsx
- `08f2cb7` Create image.jsx
- `5768b40` Create image-helpers.js
- `e755021` Create hover-card.jsx
- `34d9d6a` Create form.jsx
- `2235efa` Create dropdown-menu.jsx
- `b9a3ebf` Create drawer.jsx
- `2c2e2bc` Create dialog.jsx
- `940bf41` Update context-menu.jsx
- `0035eea` Create context-menu.jsx
- `d7e7992` Create command.jsx
- `f3f90ba` Create collapsible.jsx
- `102c4df` Create checkbox.jsx
- `0cceca5` Create chart.jsx
- `a6354b8` Create carousel.jsx
- `7f233a8` Create card.jsx
- `745e7b7` Create calendar.jsx
- `f7ed4e0` Create button.jsx
- `3b9ff00` Create breadcrumb.jsx
- `f4fa4ec` Create badge.jsx
- `0409812` Create avatar.jsx
- `4b76817` Create aspect-ratio.jsx
- `6c88fdd` Create alert.jsx
- `e83304a` Create alert-dialog.jsx
- `1fec255` Create accordion.jsx
- `397ebff` Create UserNotRegisteredError.jsx
- `6e71fe6` Create TiltCard.jsx
- `2891be0` Create StatsDashboard.jsx
- `926c205` Create ScrollToTop.jsx
- `af0ae6f` Create ResourceCard.jsx
- `62ac951` Create ReportButton.jsx
- `b34345f` Create ProtectedRoute.jsx
- `f3708b0` Create Mascot.jsx
- `9720961` Create MagneticButton.jsx
- `e3391ef` Create Layout.jsx
- `a3f5945` Create GoogleIcon.jsx
- `514ce98` Create FloatingOrbs.jsx
- `97e6b2a` Create CommunityPostCard.jsx
- `838bfa0` Create CommentSection.jsx
- `4010381` Create CommentItem.jsx
- `bc62c61` Create BanModal.jsx
- `3f31864` Create AuthLayout.jsx
- `f668ee9` Create AnimatedCounter.jsx
- `3ee722b` Create base44Client.js
- `55e58db` Create main.jsx
- `368fa7b` Create index.css
- `a202b38` Create App.jsx
- `375a720` Create entry.ts
- `81e5b75` Create entry.ts
- `b4d29ec` Create entry.ts
- `978c7bd` Create entry.ts
- `74c378c` Create entry.ts
- `f9b1f33` Delete base44/functions directory
- `14d061f` Update analyzeAssessment
- `cbf88b5` Create analyzeAssessment
- `a33a5ba` Create profanity.ts
- `f1786e3` Create User.jsonc
- `9dac106` Create Report.jsonc
- `a7ae75e` Create GuestAssessment.jsonc
- `f1c7dbf` Create EmergencyResource.jsonc
- `a175963` Create ContactRequest.jsonc
- `582bb5d` Create CommunityPost.jsonc
- `a5636c1` Create CommunityComment.jsonc
- `3a62872` Create Assessment.jsonc
- `7dcabc1` Create config.jsonc
- `989493f` Create vite.config.js
- `236b9df` Create tailwind.config.js
- `ed0243a` Update README.md
- `019471f` Create postcss.config.js
- `462b666` Create package.json
- `b69983e` Create jsconfig.json
- `e78edc9` Create index.html
- `9169a36` Create eslint.config.js
- `9e4e3ed` Add components.json configuration file
- `58abaf0` Create CLAUDE.md
- `db68f9c` Create AGENTS.md
- `53f0fc1` Add .gitignore file to exclude environment and log files
- `b5b6baf` Initial commit

## Architecture milestones

### Initial project / Base44 era — 2026-09-09

- The repository began from a Base44-generated application structure, including the original `base44Client.js`, Base44 function artifacts, JSONC entity definitions, React pages, shared UI components, and the initial assessment/community/admin/resource flows.
- The project was then progressively detached from Base44: the runtime was replaced, the Base44 SDK/auth dependency and Vite plugin were removed, and the old Base44 artifact paths were moved to `legacy/` or removed from the active application.

### Supabase migration — 2026-09-09

- Added the Supabase browser client and moved persistence/authentication to Supabase.
- Added GitHub Pages deployment support and HashRouter-compatible navigation.
- Connected the app auth context to real Supabase sessions and fixed OAuth/return routing.
- Added the compatibility adapter now known as `src/api/appClient.js`.

### Authentication and AI — 2026-09-13

- Added Google OAuth and Google One Tap, including nonce handling and callback routing.
- Completed Thai/English authentication and assessment-result translations.
- Restored assessment AI analysis through Supabase and later added the OpenAI → Gemini → local/offline fallback chain.
- Added AI source labels, offline screening fallback behavior, bilingual offline results, and personalized next-step wellbeing tools.

### Wellbeing features — 2026-09-13

- Added Daily Mood Check-in.
- Added interactive breathing and 5-4-3-2-1 grounding exercises.
- Added Worry Release with animated personal-text effects.
- Added a persistent procedural Ambient Sound Mixer with multiple sounds, volume controls, presets, and timers.
- Added quick wellbeing tools to Home, Assessment Result, Community, and Resources.

### UI, accessibility, reliability — 2026-09-13 to 2026-09-16

- Improved Light/Dark contrast, theme behavior, button preservation, motion, keyboard accessibility, focus states, and reduced-motion support.
- Added Vitest/component tests, CI, accessibility linting, Playwright slow-network smoke tests, lazy-loaded routes, dependency update checks, and production build checks.
- Added error/retry states for History and Resources and improved slow-network behavior.
- Replaced wellbeing emojis with custom illustrations and made the GitHub Pages manifest/favicon/icon paths reliable.

### Project introduction and current public presentation — 2026-09-17 to 2026-09-19

- Added, revised, removed, and then restored the standalone SafeSpace introduction/About experience while refining navigation and translations.
- Updated the public website URL and footer/about presentation.
- Continued security hardening across RLS, authentication, AI endpoints, request validation, rate limiting, password policy, and browser security.

## Base44 migration policy

Base44 is **legacy only**. New development should not use Base44 SDKs, Base44 runtime APIs, Base44 authentication, or Base44 deployment/runtime assumptions. The active application backend is Supabase.

The `legacy/` directory may contain archived Base44-era artifacts for historical reference, but those files are not the active production backend.

## Current production Edge Functions

| Function | Version | JWT | Git source |
| --- | ---: | --- | --- |
| `analyze-assessment` | 13 | Required | `supabase/functions/analyze-assessment/index.ts` |
| `analyze-community-post` | 5 | Required | `supabase/functions/analyze-community-post/index.ts` |
| `analyze-phq9` | 5 | Required | `supabase/functions/analyze-phq9/index.ts` |

These files were copied from the currently deployed Supabase functions on 2026-09-19. Future Edge Function changes should update Git first (or immediately mirror the deployed source) so production and repository source remain synchronized.

## Notes

- SafeSpace is a school-project screening/support application, not a diagnostic medical service.
- AI output is intended as supportive screening guidance and should not be treated as a diagnosis.
- Security hardening reduces common attack/abuse paths but does not make the application impossible to attack.
- The historical list is commit-level; repeated scaffold/generated-file commits are retained rather than silently omitted.
