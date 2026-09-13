# SafeSpace — Changelog
## 2026-09-13

> Session summary grouped by user-facing changes instead of listing every micro-commit.

### 🌤️ Wellbeing & Home
- Added Daily Mood Check-in.
- Added interactive guided breathing exercise with Thai/English support.
- Added interactive 5-4-3-2-1 Grounding with Thai/English support.
- Added Worry Release / Let It Go with Thai/English support.
- Added animated release effects for the user's own text: Sky Lantern, Breeze into Leaves, and Stardust.
- Improved Light/Dark contrast across the wellbeing tools.

### 🎧 Ambient Sound Mixer
- Added a global procedural Ambient Sound Mixer using Web Audio API.
- Added Rain, Ocean, Wind, Fireplace, Soft Bowl / 432 Hz, and Lo-Fi.
- Added per-track volume, master volume, Play/Pause, and 15/30/60 minute timers.
- Added Deep Focus, Rainy Cabin, Zen, and Sleep presets.
- Made the player persistent through the global Layout.
- Fixed volume leakage so a channel at 0 can actually be silent.
- Reworked Bowl and Lo-Fi generation after they were too quiet/unusable.
- Renamed the Thai Wind label to 'ลม'.
- Added cross-page controls from Community and Resources.

### 🧠 Assessment Result & AI
- Restored and expanded AI analysis on Assessment Result.
- Improved explanations to discuss concern level, reasons, answer patterns, and recommendations.
- Added 'Things you can try next' / 'สิ่งที่คุณลองทำต่อได้'.
- Added direct actions to Breathe, Grounding, Community, Resources, Worry Release, and Sounds.
- Added AI Personalization: the AI can select 2–4 next-step tools from the respondent's actual answer patterns.
- Added a reason for each selected tool.
- Added a local rule-based tool recommender as a final fallback.
- Added the database field for personalized tool recommendations.

### 🤖 AI reliability / fallback
- Added a three-level AI path: OpenAI → Gemini → local fallback.
- Added better AI error logging.
- Increased AI output capacity to reduce truncation.
- Deployed the assessment Edge Function through multiple hardened versions.
- Gemini fallback expects the Supabase secret GEMINI_API_KEY.

### 💬 Community
- Added Quick wellbeing tools: Breathe, Grounding, and Sounds.
- Improved Community text hierarchy and Dark Mode readability.
- Improved descriptive and empty-state text contrast.
- Preserved the original button appearance after theme cleanup.

### 📞 Resources / Hotlines
- Restored the hotline list with safe fallback data.
- Added Breathe, Grounding, and Sounds to the Resources self-care section.
- Improved Light/Dark text hierarchy and supporting-text contrast.

### 📊 History
- Improved Light/Dark contrast and text hierarchy.
- Kept History focused on assessment history and trend visualization.

### 🌐 TH / EN
- Expanded and fixed translations across Authentication, Assessment, Result, Mood Check-in, Breathing, Grounding, Worry Release, Community, and Resources.
- Fixed several JSX translation/rendering issues.
- Passed the selected language into assessment and community AI flows.

### 🎨 Light / Dark Theme & UI consistency
- Improved Light/Dark contrast across major pages.
- Fixed text that was too gray or invisible in Light Mode.
- Fixed Dark Mode text that became black on dark backgrounds.
- Normalized Community, Resources, History, and Assessment Result text hierarchy.
- Preserved the original button colors and appearance.
- Added subtle motion to Home wellbeing cards.
- Added motion to the Assessment Result score and tool cards.
- Restored Grounding card animation after an intermediate regression.
- Fixed Assessment Result navigation cards for Community and Resources.

### 🐛 Build / stability fixes
- Fixed multiple JSX/i18n syntax errors caused by malformed translation edits.
- Fixed Worry Release build failures.
- Fixed Assessment Result navigation/link structure.
- Fixed theme overrides that unintentionally changed button colors.
- Fixed the database mismatch after adding personalized AI tool recommendations.
- Kept the assessment Edge Function JWT-protected.

### 🔐 Authentication
- Added Google One Tap authentication.
- Added nonce handling for Google One Tap ID-token sign-in.
- Fixed OAuth callback routing and return-to behavior.
- Added and completed authentication translations.
- Preserved the existing authentication system while adding new wellbeing features.

### Current architecture
SafeSpace
├── Home
│   ├── Mood Check-in
│   ├── Breathe
│   ├── Grounding
│   ├── Worry Release
│   └── Community preview
├── Assessment
│   └── Assessment Result
│       ├── AI analysis
│       ├── Summary
│       ├── Recommendations
│       └── Personalized next-step tools
├── Community
│   └── Quick wellbeing tools
├── Resources / Hotlines
│   └── Quick wellbeing tools
├── History
│   └── Assessment history + trend
└── Global
    ├── Light / Dark theme
    ├── Thai / English
    └── Ambient Sound Player

### Notes
- No Mood Streak feature was added.
- The assessment AI is intended for screening/supportive guidance and not medical diagnosis.
- AI personalization selects tools; it does not change the underlying assessment scoring model.