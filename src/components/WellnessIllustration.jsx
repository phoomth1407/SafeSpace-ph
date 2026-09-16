import React from "react";

const common = {
  width: "100%",
  height: "100%",
  viewBox: "0 0 120 120",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
};

function BreathingIllustration() {
  return (
    <svg {...common} aria-hidden="true">
      <defs>
        <linearGradient id="breathGlow" x1="22" y1="18" x2="98" y2="104" gradientUnits="userSpaceOnUse">
          <stop stopColor="#BFE9FF" />
          <stop offset="1" stopColor="#7DD3FC" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="47" fill="url(#breathGlow)" opacity=".18" />
      <path d="M21 46C34 31 49 31 61 45C72 58 87 59 101 43" stroke="#7DD3FC" strokeWidth="4" strokeLinecap="round" opacity=".9" />
      <path d="M24 60C39 46 52 49 62 60C71 70 85 71 97 61" stroke="#A5F3FC" strokeWidth="3" strokeLinecap="round" opacity=".75" />
      <circle cx="88" cy="25" r="7" fill="#E0F2FE" opacity=".95" />
      <circle cx="98" cy="16" r="3.5" fill="#BAE6FD" />
      <circle cx="24" cy="26" r="4" fill="#DBEAFE" />

      <ellipse cx="60" cy="94" rx="25" ry="7" fill="#0F172A" opacity=".12" />
      <path d="M43 74C48 63 54 58 60 58C66 58 72 63 77 74V89H43V74Z" fill="#CBD5E1" />
      <circle cx="60" cy="45" r="10" fill="#F6C7B6" />
      <path d="M49 45C49 37 54 32 61 32C67 32 72 37 72 44C69 41 65 40 61 40C57 40 53 42 49 45Z" fill="#334155" />
      <path d="M45 78C42 80 39 83 38 86" stroke="#F6C7B6" strokeWidth="4" strokeLinecap="round" />
      <path d="M75 78C78 80 81 83 82 86" stroke="#F6C7B6" strokeWidth="4" strokeLinecap="round" />
      <path d="M44 92H54M66 92H76" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function GroundingIllustration() {
  return (
    <svg {...common} aria-hidden="true">
      <defs>
        <linearGradient id="groundGlow" x1="18" y1="20" x2="96" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D1FAE5" />
          <stop offset="1" stopColor="#86EFAC" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="52" r="44" fill="url(#groundGlow)" opacity=".2" />
      <path d="M60 84C57 93 52 101 45 109M60 84C63 94 69 102 77 109M60 86C60 96 60 103 60 111" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 86C33 82 44 84 55 92" stroke="#86EFAC" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M100 84C87 82 76 84 65 92" stroke="#86EFAC" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="60" cy="104" rx="25" ry="6" fill="#0F172A" opacity=".1" />

      <circle cx="60" cy="34" r="9.5" fill="#F6C7B6" />
      <path d="M50 34C50 25 55 20 62 20C69 20 73 26 72 34C68 30 65 29 60 29C56 29 53 31 50 34Z" fill="#3F3F46" />
      <path d="M46 48C51 42 55 40 60 40C65 40 69 42 74 48L79 75H41L46 48Z" fill="#E2E8F0" />
      <path d="M48 75L43 94" stroke="#166534" strokeWidth="7" strokeLinecap="round" />
      <path d="M72 75L77 94" stroke="#166534" strokeWidth="7" strokeLinecap="round" />
      <path d="M43 54C37 56 32 60 29 67M77 54C83 56 88 60 91 67" stroke="#F6C7B6" strokeWidth="4" strokeLinecap="round" />
      <path d="M28 67C22 63 19 58 19 52" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round" />
      <path d="M92 67C98 63 101 58 101 52" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round" />

      <path d="M23 33C29 29 34 31 36 37C30 38 26 37 23 33ZM96 34C91 30 86 32 84 38C90 39 94 38 96 34Z" fill="#86EFAC" opacity=".9" />
    </svg>
  );
}

function WorryIllustration() {
  return (
    <svg {...common} aria-hidden="true">
      <defs>
        <linearGradient id="worryGlow" x1="18" y1="18" x2="100" y2="106" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E9D5FF" />
          <stop offset="1" stopColor="#C4B5FD" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="46" fill="url(#worryGlow)" opacity=".22" />
      <ellipse cx="60" cy="97" rx="24" ry="6" fill="#0F172A" opacity=".1" />

      <circle cx="60" cy="39" r="10" fill="#F6C7B6" />
      <path d="M49 40C49 31 54 25 61 25C68 25 73 31 72 40C68 36 65 35 60 35C56 35 52 37 49 40Z" fill="#4C1D95" />
      <path d="M43 54C48 47 53 44 60 44C67 44 72 47 77 54L81 83H39L43 54Z" fill="#C4B5FD" />
      <path d="M47 59C42 61 37 65 34 70M73 59C78 61 83 65 86 70" stroke="#F6C7B6" strokeWidth="5" strokeLinecap="round" />
      <path d="M34 70C29 70 25 68 22 65M86 70C91 70 95 68 98 65" stroke="#F6C7B6" strokeWidth="4" strokeLinecap="round" />

      <circle cx="19" cy="59" r="4" fill="#DDD6FE" />
      <circle cx="27" cy="48" r="3" fill="#C4B5FD" />
      <circle cx="36" cy="35" r="2.5" fill="#E9D5FF" />
      <circle cx="101" cy="60" r="4" fill="#DDD6FE" />
      <circle cx="93" cy="49" r="3" fill="#C4B5FD" />
      <circle cx="84" cy="36" r="2.5" fill="#E9D5FF" />
      <path d="M17 77C27 73 32 77 37 83" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" opacity=".8" />
      <path d="M103 77C93 73 88 77 83 83" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" opacity=".8" />
      <path d="M29 86C22 89 20 94 19 98M91 86C98 89 100 94 101 98" stroke="#C4B5FD" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="14" cy="100" r="2" fill="#DDD6FE" />
      <circle cx="106" cy="100" r="2" fill="#DDD6FE" />
    </svg>
  );
}

function MoodIllustrationSvg({ mood }) {
  const palettes = {
    great: ["#A7F3D0", "#10B981", "#F6C7B6"],
    good: ["#BAE6FD", "#38BDF8", "#F6C7B6"],
    okay: ["#E2E8F0", "#94A3B8", "#F6C7B6"],
    worried: ["#FEF3C7", "#F59E0B", "#F6C7B6"],
    sad: ["#DBEAFE", "#60A5FA", "#F6C7B6"],
    stressed: ["#FED7AA", "#F97316", "#F6C7B6"],
    heavy: ["#FFE4E6", "#FB7185", "#F6C7B6"],
  };
  const [bg, accent, skin] = palettes[mood] || palettes.okay;
  const mouth = {
    great: "M52 63 Q60 71 68 63",
    good: "M54 64 Q60 68 66 64",
    okay: "M54 66 H66",
    worried: "M54 68 Q60 63 66 68",
    sad: "M54 69 Q60 63 66 69",
    stressed: "M54 68 Q60 64 66 68",
    heavy: "M53 69 Q60 61 67 69",
  }[mood] || "M54 66 H66";
  return (
    <svg {...common} aria-hidden="true">
      <circle cx="60" cy="60" r="48" fill={bg} opacity=".75" />
      <circle cx="60" cy="45" r="15" fill={skin} />
      <path d="M45 45C46 33 53 27 61 27C70 27 76 34 75 46C71 40 67 38 61 38C54 38 50 40 45 45Z" fill={accent} />
      <circle cx="54" cy="55" r="1.8" fill="#334155" />
      <circle cx="66" cy="55" r="1.8" fill="#334155" />
      <path d={mouth} stroke="#334155" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M45 67C49 73 53 77 60 78C67 77 71 73 75 67L79 92H41L45 67Z" fill="white" opacity=".92" />
      <path d="M42 78C35 80 30 85 28 92M78 78C85 80 90 85 92 92" stroke={accent} strokeWidth="5" strokeLinecap="round" />
      <circle cx="28" cy="92" r="2.5" fill={accent} />
      <circle cx="92" cy="92" r="2.5" fill={accent} />
    </svg>
  );
}

function WorryModeIllustrationSvg({ mode }) {
  return (
    <svg {...common} aria-hidden="true">
      <circle cx="60" cy="60" r="47" fill={mode === "lantern" ? "#FEF3C7" : mode === "leaves" ? "#DCFCE7" : "#EDE9FE"} opacity=".7" />
      {mode === "lantern" && (
        <>
          <path d="M45 38H75L70 78H50L45 38Z" fill="#F59E0B" />
          <path d="M47 45H73M49 70H71" stroke="#7C2D12" strokeWidth="2.5" opacity=".55" />
          <path d="M52 32C54 27 66 27 68 32" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
          <path d="M60 78V88" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
          <path d="M55 88H65" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
          <circle cx="60" cy="57" r="10" fill="#FFF7ED" opacity=".8" />
        </>
      )}
      {mode === "leaves" && (
        <>
          <path d="M58 88C55 70 56 53 64 35" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" />
          <path d="M60 59C49 58 43 53 41 44C50 44 57 48 60 55Z" fill="#4ADE80" />
          <path d="M61 72C70 70 77 65 80 56C70 57 64 62 61 68Z" fill="#22C55E" />
          <path d="M55 48C47 45 42 39 42 31C50 33 55 38 57 44Z" fill="#86EFAC" />
          <circle cx="29" cy="73" r="3" fill="#86EFAC" opacity=".9" />
          <circle cx="92" cy="40" r="4" fill="#BBF7D0" opacity=".9" />
        </>
      )}
      {mode === "stardust" && (
        <>
          <circle cx="60" cy="61" r="15" fill="#C4B5FD" opacity=".7" />
          <path d="M60 26L64 42L80 46L64 50L60 66L56 50L40 46L56 42L60 26Z" fill="#A78BFA" />
          <path d="M31 63L33 71L41 73L33 75L31 83L29 75L21 73L29 71L31 63Z" fill="#DDD6FE" />
          <path d="M87 70L89 77L96 79L89 81L87 88L85 81L78 79L85 77L87 70Z" fill="#C4B5FD" />
        </>
      )}
    </svg>
  );
}


function SoundIllustration({ type }) {
  const colors = {
    rain: ["#DBEAFE", "#60A5FA"],
    ocean: ["#CFFAFE", "#06B6D4"],
    forest: ["#DCFCE7", "#22C55E"],
    fire: ["#FFEDD5", "#F97316"],
    bowl: ["#FEF3C7", "#EAB308"],
    lofi: ["#EDE9FE", "#8B5CF6"],
  };
  const [bg, accent] = colors[type] || colors.rain;
  return (
    <svg {...common} aria-hidden="true">
      <circle cx="60" cy="60" r="46" fill={bg} opacity=".65" />
      {type === "rain" && (
        <>
          <path d="M33 57C35 47 45 41 54 44C58 35 72 34 77 44C88 43 94 51 91 60H33Z" fill={accent} opacity=".85" />
          <path d="M43 70L40 80M55 70L52 80M67 70L64 80M79 70L76 80" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {type === "ocean" && (
        <>
          <path d="M20 63C30 53 40 54 50 63C60 72 70 72 80 63C88 56 95 56 100 62" stroke={accent} strokeWidth="7" strokeLinecap="round" />
          <path d="M20 78C30 68 40 69 50 78C60 87 70 87 80 78C88 71 95 71 100 77" stroke="#67E8F9" strokeWidth="5" strokeLinecap="round" opacity=".9" />
          <circle cx="76" cy="36" r="10" fill="#E0F2FE" />
          <circle cx="89" cy="26" r="5" fill="#BAE6FD" />
        </>
      )}
      {type === "forest" && (
        <>
          <path d="M58 92C55 75 55 59 63 36" stroke="#15803D" strokeWidth="4" strokeLinecap="round" />
          <path d="M60 61C49 59 42 53 40 44C50 44 57 49 60 56Z" fill={accent} />
          <path d="M61 72C71 71 79 65 81 56C71 57 64 63 61 68Z" fill="#4ADE80" />
          <path d="M57 49C50 45 45 38 45 30C53 33 58 39 59 45Z" fill="#86EFAC" />
          <path d="M76 44C82 39 87 33 87 25" stroke="#166534" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {type === "fire" && (
        <>
          <path d="M60 91C48 91 42 83 45 73C47 66 52 63 53 54C63 59 63 67 61 71C68 66 72 58 70 48C84 58 87 72 82 82C78 89 70 92 60 91Z" fill={accent} />
          <path d="M60 84C54 84 51 80 53 75C55 71 58 70 59 65C65 70 67 75 65 79C64 82 62 84 60 84Z" fill="#FED7AA" />
        </>
      )}
      {type === "bowl" && (
        <>
          <path d="M35 63H85C83 79 74 88 60 88C46 88 37 79 35 63Z" fill="#FACC15" />
          <ellipse cx="60" cy="63" rx="25" ry="7" fill="#FEF9C3" stroke="#CA8A04" strokeWidth="2" />
          <path d="M52 48C57 40 63 40 68 48" stroke="#FDE68A" strokeWidth="3" strokeLinecap="round" opacity=".8" />
        </>
      )}
      {type === "lofi" && (
        <>
          <rect x="35" y="42" width="50" height="38" rx="8" fill="#DDD6FE" />
          <path d="M42 72L50 60L57 69L66 52L78 72" stroke={accent} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="45" cy="49" r="4" fill="#8B5CF6" />
          <circle cx="76" cy="49" r="4" fill="#A78BFA" />
        </>
      )}
    </svg>
  );
}

export function WellnessIllustration({ type, className = "" }) {
  if (type === "ground") return <div className={className}><GroundingIllustration /></div>;
  if (type === "worry") return <div className={className}><WorryIllustration /></div>;
  return <div className={className}><BreathingIllustration /></div>;
}

export function MoodIllustration({ mood, className = "" }) {
  return <div className={className}><MoodIllustrationSvg mood={mood} /></div>;
}

export function WorryModeIllustration({ mode, className = "" }) {
  return <div className={className}><WorryModeIllustrationSvg mode={mode} /></div>;
}

export function SoundIllustrationIcon({ type, className = "" }) { return <div className={className}><SoundIllustration type={type} /></div>; }

export default WellnessIllustration;
