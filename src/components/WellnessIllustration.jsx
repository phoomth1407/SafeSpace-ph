import React from "react";

const common = {
  width: "100%",
  height: "100%",
  viewBox: "0 0 160 160",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
};

const defs = (id, colors) => (
  <defs>
    <linearGradient id={id} x1="24" y1="20" x2="138" y2="142" gradientUnits="userSpaceOnUse">
      <stop stopColor={colors[0]} />
      <stop offset=".55" stopColor={colors[1]} />
      <stop offset="1" stopColor={colors[2] || colors[1]} />
    </linearGradient>
    <radialGradient id={id + "Glow"} cx="0" cy="0" r="1" gradientTransform="translate(62 50) rotate(55) scale(90)">
      <stop stopColor="#fff" stopOpacity=".8" />
      <stop offset="1" stopColor="#fff" stopOpacity="0" />
    </radialGradient>
    <filter id={id + "Shadow"} x="-30%" y="-30%" width="160%" height="180%">
      <feDropShadow dx="0" dy="7" stdDeviation="7" floodColor="#0F172A" floodOpacity=".16" />
    </filter>
  </defs>
);

function Person({ skin="#F3C5B4", hair="#334155", shirt="#CBD5E1", pose="calm", filterId="p" }) {
  return (
    <g filter={`url(#${filterId}Shadow)`}>
      <ellipse cx="80" cy="137" rx="34" ry="8" fill="#0F172A" opacity=".10" />
      <path d="M55 91C60 76 69 69 80 69C91 69 100 76 105 91L111 125H49L55 91Z" fill={shirt} />
      <path d="M80 73L70 83L80 94L90 83L80 73Z" fill="#fff" opacity=".22" />
      <circle cx="80" cy="52" r="20" fill={skin} />
      <path d="M59 52C59 35 68 25 81 25C95 25 103 36 101 53C95 45 89 42 80 42C72 42 65 46 59 52Z" fill={hair} />
      <path d="M63 39C70 29 83 26 93 32" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".12" />
      <circle cx="73" cy="55" r="2.1" fill="#1E293B" />
      <circle cx="87" cy="55" r="2.1" fill="#1E293B" />
      <path d="M74 65C78 68 82 68 86 65" stroke="#8B4C4C" strokeWidth="2.4" strokeLinecap="round" opacity=".7" />
      {pose === "breath" && <>
        <path d="M56 91C43 88 36 79 34 68M104 91C117 88 124 79 126 68" stroke={skin} strokeWidth="8" strokeLinecap="round" />
        <path d="M38 67C44 61 50 61 55 66M122 67C116 61 110 61 105 66" stroke={shirt} strokeWidth="8" strokeLinecap="round" />
      </>}
      {pose === "ground" && <>
        <path d="M57 93C45 94 37 101 33 111M103 93C115 94 123 101 127 111" stroke={skin} strokeWidth="8" strokeLinecap="round" />
        <path d="M32 111C26 107 23 101 23 95M128 111C134 107 137 101 137 95" stroke="#4ADE80" strokeWidth="5" strokeLinecap="round" />
      </>}
      {pose === "worry" && <>
        <path d="M56 94C44 96 38 105 37 116M104 94C116 96 122 105 123 116" stroke={skin} strokeWidth="8" strokeLinecap="round" />
        <path d="M45 106C38 104 33 100 30 94M115 106C122 104 127 100 130 94" stroke="#C4B5FD" strokeWidth="5" strokeLinecap="round" />
      </>}
    </g>
  );
}

function BreathingIllustration() {
  return (
    <svg {...common} aria-hidden="true">
      {defs("breath", ["#E0F2FE","#7DD3FC","#38BDF8"])}
      <circle cx="80" cy="80" r="68" fill="#E0F2FE" opacity=".5" />
      <circle cx="80" cy="80" r="56" fill="url(#breathGlow)" opacity=".5" />
      <circle cx="80" cy="80" r="48" fill="#fff" opacity=".18" />
      <path d="M24 63C40 42 57 45 70 61C82 75 101 76 136 49" stroke="#38BDF8" strokeWidth="5" strokeLinecap="round" opacity=".5" />
      <path d="M28 78C44 62 59 65 72 79C84 92 102 92 132 72" stroke="#A5F3FC" strokeWidth="3.5" strokeLinecap="round" opacity=".7" />
      <Person pose="breath" shirt="#CBD5E1" filterId="breath" />
      <circle cx="122" cy="32" r="7" fill="#fff" opacity=".8" />
      <circle cx="137" cy="47" r="3" fill="#BAE6FD" />
      <circle cx="29" cy="42" r="4" fill="#fff" opacity=".65" />
    </svg>
  );
}

function GroundingIllustration() {
  return (
    <svg {...common} aria-hidden="true">
      {defs("ground", ["#DCFCE7","#86EFAC","#22C55E"])}
      <circle cx="80" cy="80" r="68" fill="#DCFCE7" opacity=".62" />
      <circle cx="80" cy="80" r="54" fill="url(#groundGlow)" opacity=".4" />
      <path d="M80 108C77 125 68 139 55 151M80 108C83 125 92 139 105 151M80 111V153" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" opacity=".75" />
      <path d="M30 113C44 107 56 110 70 121M130 113C116 107 104 110 90 121" stroke="#86EFAC" strokeWidth="3" strokeLinecap="round" />
      <Person pose="ground" shirt="#E2E8F0" filterId="ground" />
      <path d="M38 49C30 45 24 39 23 30C34 31 42 37 45 46Z" fill="#4ADE80" opacity=".8" />
      <path d="M122 49C130 45 136 39 137 30C126 31 118 37 115 46Z" fill="#86EFAC" opacity=".8" />
      <circle cx="31" cy="73" r="4" fill="#BBF7D0" />
      <circle cx="130" cy="76" r="3" fill="#DCFCE7" />
    </svg>
  );
}

function WorryIllustration() {
  return (
    <svg {...common} aria-hidden="true">
      {defs("worry", ["#F3E8FF","#C4B5FD","#8B5CF6"])}
      <circle cx="80" cy="80" r="68" fill="#F3E8FF" opacity=".65" />
      <circle cx="80" cy="80" r="52" fill="url(#worryGlow)" opacity=".42" />
      <Person pose="worry" shirt="#C4B5FD" hair="#4C1D95" filterId="worry" />
      <path d="M34 48C43 41 52 42 58 49" stroke="#A78BFA" strokeWidth="4" strokeLinecap="round" opacity=".8" />
      <path d="M126 48C117 41 108 42 102 49" stroke="#A78BFA" strokeWidth="4" strokeLinecap="round" opacity=".8" />
      <circle cx="27" cy="63" r="5" fill="#DDD6FE" />
      <circle cx="134" cy="64" r="4" fill="#C4B5FD" />
      <circle cx="40" cy="32" r="3" fill="#E9D5FF" />
      <circle cx="120" cy="30" r="3.5" fill="#DDD6FE" />
    </svg>
  );
}

function MoodIllustrationSvg({ mood }) {
  const palettes = {
    great:["#D1FAE5","#10B981","#F3C5B4"], good:["#E0F2FE","#38BDF8","#F3C5B4"],
    okay:["#F1F5F9","#94A3B8","#F3C5B4"], worried:["#FEF3C7","#F59E0B","#F3C5B4"],
    sad:["#DBEAFE","#60A5FA","#F3C5B4"], stressed:["#FFEDD5","#F97316","#F3C5B4"],
    heavy:["#FFE4E6","#FB7185","#F3C5B4"],
  };
  const [bg, accent, skin] = palettes[mood] || palettes.okay;
  const mouth = {
    great:"M70 67Q80 77 90 67", good:"M72 68Q80 73 88 68", okay:"M72 70H88",
    worried:"M72 72Q80 66 88 72", sad:"M72 73Q80 67 88 73", stressed:"M72 72Q80 68 88 72",
    heavy:"M71 73Q80 64 89 73"
  }[mood] || "M72 70H88";
  return (
    <svg {...common} aria-hidden="true">
      <circle cx="80" cy="80" r="67" fill={bg} opacity=".8" />
      <ellipse cx="80" cy="139" rx="35" ry="7" fill="#0F172A" opacity=".08" />
      <circle cx="80" cy="61" r="23" fill={skin} />
      <path d="M57 61C58 43 68 34 81 34C96 34 104 46 102 62C96 53 90 50 80 50C70 50 64 54 57 61Z" fill={accent} />
      <path d="M61 48C70 38 84 36 95 43" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".14" />
      <circle cx="72" cy="65" r="2.2" fill="#334155" /><circle cx="88" cy="65" r="2.2" fill="#334155" />
      <path d={mouth} stroke="#334155" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M58 84C64 77 72 75 80 75C88 75 96 77 102 84L108 124H52L58 84Z" fill="#fff" opacity=".94" />
      <path d="M55 96C44 100 37 108 33 119M105 96C116 100 123 108 127 119" stroke={accent} strokeWidth="7" strokeLinecap="round" />
      <circle cx="33" cy="119" r="3" fill={accent} /><circle cx="127" cy="119" r="3" fill={accent} />
    </svg>
  );
}

function WorryModeIllustrationSvg({ mode }) {
  return (
    <svg {...common} aria-hidden="true">
      <circle cx="80" cy="80" r="67" fill={mode === "lantern" ? "#FEF3C7" : mode === "leaves" ? "#DCFCE7" : "#EDE9FE"} opacity=".82" />
      {mode === "lantern" && <>
        <path d="M59 50H101L95 111H65L59 50Z" fill="#F59E0B" />
        <path d="M62 60H98M64 99H96" stroke="#92400E" strokeWidth="3" opacity=".45" />
        <path d="M68 45C71 35 89 35 92 45" stroke="#B45309" strokeWidth="4" strokeLinecap="round" />
        <circle cx="80" cy="79" r="13" fill="#FFF7ED" opacity=".85" />
        <path d="M80 111V127M72 127H88" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
      </>}
      {mode === "leaves" && <>
        <path d="M77 127C73 100 75 73 89 38" stroke="#15803D" strokeWidth="5" strokeLinecap="round" />
        <path d="M80 79C64 76 54 67 51 53C66 54 76 62 80 73Z" fill="#4ADE80" />
        <path d="M82 99C97 96 108 86 112 72C97 74 87 83 82 91Z" fill="#22C55E" />
        <path d="M76 65C65 60 59 51 59 39C70 42 77 51 79 60Z" fill="#86EFAC" />
      </>}
      {mode === "stardust" && <>
        <circle cx="80" cy="82" r="22" fill="#C4B5FD" opacity=".55" />
        <path d="M80 28L86 54L112 60L86 66L80 92L74 66L48 60L74 54L80 28Z" fill="#A78BFA" />
        <path d="M35 86L38 97L49 100L38 103L35 114L32 103L21 100L32 97L35 86Z" fill="#DDD6FE" />
        <path d="M124 78L127 88L137 91L127 94L124 104L121 94L111 91L121 88L124 78Z" fill="#C4B5FD" />
      </>}
    </svg>
  );
}

function SoundIllustration({ type }) {
  const colors = {
    rain:["#E0F2FE","#60A5FA"], ocean:["#CFFAFE","#06B6D4"], forest:["#DCFCE7","#22C55E"],
    fire:["#FFEDD5","#F97316"], bowl:["#FEF3C7","#EAB308"], lofi:["#EDE9FE","#8B5CF6"]
  };
  const [bg, accent] = colors[type] || colors.rain;
  return (
    <svg {...common} aria-hidden="true">
      <circle cx="80" cy="80" r="67" fill={bg} opacity=".82" />
      <circle cx="80" cy="80" r="48" fill="#fff" opacity=".12" />
      {type === "rain" && <><path d="M42 75C45 59 60 51 74 57C81 43 102 43 109 58C124 56 134 67 130 80H42Z" fill={accent} opacity=".85" /><path d="M57 96L53 110M78 96L74 110M99 96L95 110" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" /></>}
      {type === "ocean" && <><path d="M23 78C38 63 53 65 68 78C83 91 98 91 113 78C124 69 134 69 140 77" stroke={accent} strokeWidth="8" strokeLinecap="round" /><path d="M23 101C38 86 53 88 68 101C83 114 98 114 113 101C124 92 134 92 140 100" stroke="#67E8F9" strokeWidth="5" strokeLinecap="round" /></>}
      {type === "forest" && <><path d="M80 128C76 100 77 72 90 39" stroke="#15803D" strokeWidth="5" strokeLinecap="round" /><path d="M82 83C67 80 57 71 54 57C68 58 78 66 82 76Z" fill={accent} /><path d="M84 102C99 99 110 89 114 75C99 77 89 86 84 94Z" fill="#4ADE80" /><path d="M78 67C68 62 62 53 62 42C73 45 80 53 81 62Z" fill="#86EFAC" /></>}
      {type === "fire" && <><path d="M80 128C59 128 49 115 54 99C57 88 66 83 68 70C83 77 84 89 81 96C91 89 96 76 93 60C112 75 119 96 112 111C106 123 95 128 80 128Z" fill={accent} /><path d="M80 117C70 117 65 110 68 103C70 98 76 96 78 88C87 97 89 104 86 110C84 114 82 116 80 117Z" fill="#FED7AA" /></>}
      {type === "bowl" && <><path d="M47 82H113C110 105 98 117 80 117C62 117 50 105 47 82Z" fill="#FACC15" /><ellipse cx="80" cy="82" rx="33" ry="9" fill="#FEF9C3" stroke="#CA8A04" strokeWidth="3" /><path d="M69 62C75 51 85 51 91 62" stroke="#FDE68A" strokeWidth="4" strokeLinecap="round" /></>}
      {type === "lofi" && <><rect x="45" y="55" width="70" height="54" rx="12" fill="#DDD6FE" /><path d="M54 98L65 79L76 93L89 66L106 98" stroke={accent} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="59" cy="65" r="5" fill="#8B5CF6" /><circle cx="101" cy="65" r="5" fill="#A78BFA" /></>}
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

export function SoundIllustrationIcon({ type, className = "" }) {
  return <div className={className}><SoundIllustration type={type} /></div>;
}

export default WellnessIllustration;
