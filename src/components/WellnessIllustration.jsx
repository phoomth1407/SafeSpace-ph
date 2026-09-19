import React from "react";

const shell = {
  width: "100%",
  height: "100%",
  viewBox: "0 0 200 160",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
};

function Backdrop({ id, colors }) {
  return (
    <defs>
      <linearGradient id={id + "-bg"} x1="18" y1="8" x2="178" y2="152" gradientUnits="userSpaceOnUse">
        <stop stopColor={colors[0]} />
        <stop offset=".55" stopColor={colors[1]} />
        <stop offset="1" stopColor={colors[2]} />
      </linearGradient>
      <radialGradient id={id + "-glow"} cx="0" cy="0" r="1" gradientTransform="translate(66 40) rotate(48) scale(118 100)">
        <stop stopColor="#FFFFFF" stopOpacity=".92" />
        <stop offset=".5" stopColor="#FFFFFF" stopOpacity=".24" />
        <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={id + "-glass"} x1="30" y1="18" x2="165" y2="145" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" stopOpacity=".72" />
        <stop offset=".5" stopColor="#FFFFFF" stopOpacity=".18" />
        <stop offset="1" stopColor="#FFFFFF" stopOpacity=".08" />
      </linearGradient>
      <filter id={id + "-shadow"} x="-30%" y="-35%" width="160%" height="180%">
        <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#172554" floodOpacity=".18" />
      </filter>
      <filter id={id + "-soft"} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="7" />
      </filter>
    </defs>
  );
}

function Frame({ id, colors, children }) {
  return (
    <svg {...shell} aria-hidden="true">
      <Backdrop id={id} colors={colors} />
      <rect x="7" y="7" width="186" height="146" rx="36" fill={"url(#" + id + "-bg)"} />
      <circle cx="55" cy="38" r="54" fill={"url(#" + id + "-glow)"} />
      <ellipse cx="157" cy="130" rx="70" ry="28" fill="#FFFFFF" opacity=".08" filter={"url(#" + id + "-soft)"} />
      <rect x="12" y="12" width="176" height="136" rx="32" fill={"url(#" + id + "-glass)"} stroke="#FFFFFF" strokeOpacity=".45" />
      {children}
    </svg>
  );
}

function Breath() {
  return (
    <Frame id="breath-art" colors={["#CFFAFE", "#93C5FD", "#A78BFA"]}>
      <circle cx="100" cy="79" r="45" fill="#FFFFFF" opacity=".13" />
      <circle cx="100" cy="79" r="34" stroke="#FFFFFF" strokeOpacity=".42" strokeWidth="2" />
      <circle cx="100" cy="79" r="24" fill="#E0F2FE" opacity=".28" />
      <path d="M31 91C49 65 68 65 83 82C99 100 118 99 169 64" stroke="#FFFFFF" strokeOpacity=".48" strokeWidth="5" strokeLinecap="round" />
      <path d="M29 107C50 83 68 84 84 99C101 115 125 111 171 82" stroke="#C4B5FD" strokeOpacity=".55" strokeWidth="3" strokeLinecap="round" />
      <path d="M100 56V102M77 79H123" stroke="#FFFFFF" strokeOpacity=".26" strokeWidth="2" />
      <circle cx="100" cy="79" r="9" fill="#FFFFFF" fillOpacity=".75" />
      <circle cx="100" cy="79" r="4" fill="#60A5FA" fillOpacity=".7" />
      <circle cx="153" cy="38" r="5" fill="#FFFFFF" fillOpacity=".8" />
      <circle cx="168" cy="51" r="2.5" fill="#FFFFFF" fillOpacity=".55" />
      <path d="M34 44C42 35 54 32 65 35" stroke="#FFFFFF" strokeOpacity=".55" strokeWidth="4" strokeLinecap="round" />
    </Frame>
  );
}

function Ground() {
  return (
    <Frame id="ground-art" colors={["#DCFCE7", "#99F6E4", "#86EFAC"]}>
      <path d="M20 119C49 98 71 102 95 119C117 135 143 135 181 112V153H20Z" fill="#065F46" opacity=".16" />
      <path d="M20 105C51 84 73 87 98 106C123 125 147 122 181 100" stroke="#FFFFFF" strokeOpacity=".42" strokeWidth="4" strokeLinecap="round" />
      <path d="M55 113C63 87 77 72 98 63C99 88 90 107 73 121" fill="#22C55E" opacity=".72" />
      <path d="M104 118C115 91 129 76 151 68C150 94 139 111 119 124" fill="#10B981" opacity=".62" />
      <path d="M99 123C96 99 100 75 114 48" stroke="#047857" strokeOpacity=".7" strokeWidth="5" strokeLinecap="round" />
      <path d="M97 83C83 78 74 68 72 55C86 57 96 66 99 77" fill="#4ADE80" opacity=".85" />
      <circle cx="42" cy="49" r="10" fill="#FFFFFF" fillOpacity=".42" />
      <circle cx="157" cy="45" r="6" fill="#FFFFFF" fillOpacity=".38" />
      <path d="M29 68C37 61 45 59 53 62" stroke="#FFFFFF" strokeOpacity=".52" strokeWidth="3" strokeLinecap="round" />
    </Frame>
  );
}

function Worry() {
  return (
    <Frame id="worry-art" colors={["#F5D0FE", "#C4B5FD", "#93C5FD"]}>
      <circle cx="100" cy="80" r="47" fill="#FFFFFF" opacity=".11" />
      <path d="M44 63C56 43 78 39 91 53C102 65 115 61 128 48C145 32 166 39 171 59" stroke="#FFFFFF" strokeOpacity=".52" strokeWidth="4" strokeLinecap="round" />
      <path d="M39 86C57 68 73 69 85 82C99 97 117 98 137 80C151 67 166 70 175 83" stroke="#FFFFFF" strokeOpacity=".3" strokeWidth="3" strokeLinecap="round" />
      <path d="M63 115C75 98 91 91 108 96C123 100 135 114 138 128" stroke="#7C3AED" strokeOpacity=".35" strokeWidth="18" strokeLinecap="round" />
      <circle cx="74" cy="101" r="7" fill="#FFFFFF" fillOpacity=".58" />
      <circle cx="101" cy="88" r="5" fill="#FFFFFF" fillOpacity=".72" />
      <circle cx="130" cy="105" r="8" fill="#FFFFFF" fillOpacity=".42" />
      <path d="M96 40L100 49L109 53L100 57L96 67L92 57L83 53L92 49L96 40Z" fill="#FFFFFF" fillOpacity=".75" />
      <path d="M151 91L154 97L161 100L154 103L151 110L148 103L141 100L148 97L151 91Z" fill="#FFFFFF" fillOpacity=".58" />
    </Frame>
  );
}

function Mood({ mood }) {
  const map = {
    great:["#D1FAE5","#10B981","#FDE68A"], good:["#DBEAFE","#3B82F6","#BAE6FD"],
    okay:["#E2E8F0","#64748B","#CBD5E1"], worried:["#FEF3C7","#F59E0B","#FED7AA"],
    sad:["#DBEAFE","#60A5FA","#C4B5FD"], stressed:["#FFEDD5","#F97316","#FDBA74"],
    heavy:["#FFE4E6","#FB7185","#FDA4AF"]
  };
  const [a,b,c] = map[mood] || map.okay;
  const mouth = {
    great:"M87 84Q100 96 113 84", good:"M90 85Q100 92 110 85", okay:"M90 89H110",
    worried:"M90 92Q100 84 110 92", sad:"M90 92Q100 84 110 92",
    stressed:"M90 92Q100 86 110 92", heavy:"M89 93Q100 82 111 93"
  }[mood] || "M90 89H110";
  return (
    <svg {...shell} aria-hidden="true">
      <defs>
        <linearGradient id="mood-bg" x1="20" y1="10" x2="180" y2="150"><stop stopColor={a}/><stop offset="1" stopColor={c}/></linearGradient>
        <filter id="mood-shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="9" stdDeviation="8" floodColor="#172554" floodOpacity=".16"/></filter>
      </defs>
      <rect x="7" y="7" width="186" height="146" rx="36" fill="url(#mood-bg)" />
      <circle cx="52" cy="36" r="42" fill="#FFFFFF" opacity=".28" />
      <ellipse cx="100" cy="130" rx="52" ry="10" fill="#0F172A" opacity=".09" />
      <g filter="url(#mood-shadow)">
        <circle cx="100" cy="65" r="31" fill="#F3C5B4" />
        <path d="M69 65C70 42 83 31 101 31C121 31 133 46 130 68C121 54 113 50 99 51C87 51 78 56 69 65Z" fill={b}/>
        <circle cx="90" cy="70" r="2.6" fill="#334155"/><circle cx="110" cy="70" r="2.6" fill="#334155"/>
        <path d={mouth} stroke="#334155" strokeWidth="3" strokeLinecap="round" />
        <path d="M70 101C79 91 90 88 100 88C111 88 121 92 130 101L137 131H63L70 101Z" fill="#FFFFFF" fillOpacity=".88"/>
        <path d="M68 107C56 112 49 119 44 130M132 107C144 112 151 119 156 130" stroke={b} strokeWidth="9" strokeLinecap="round"/>
      </g>
      <circle cx="42" cy="69" r="5" fill="#FFFFFF" opacity=".52"/><circle cx="159" cy="56" r="4" fill="#FFFFFF" opacity=".42"/>
    </svg>
  );
}

function WorryMode({ mode }) {
  const bg = mode === "lantern" ? ["#FEF3C7","#FDBA74"] : mode === "leaves" ? ["#DCFCE7","#86EFAC"] : ["#EDE9FE","#C4B5FD"];
  return (
    <svg {...shell} aria-hidden="true">
      <defs><linearGradient id="wm-bg" x1="20" y1="10" x2="180" y2="150"><stop stopColor={bg[0]}/><stop offset="1" stopColor={bg[1]}/></linearGradient></defs>
      <rect x="7" y="7" width="186" height="146" rx="36" fill="url(#wm-bg)"/>
      <circle cx="100" cy="75" r="50" fill="#FFFFFF" opacity=".14"/>
      {mode === "lantern" && <><path d="M70 57H130L121 117H79L70 57Z" fill="#F59E0B"/><path d="M75 70H125M78 103H122" stroke="#92400E" strokeOpacity=".3" strokeWidth="4"/><path d="M82 53C84 39 116 39 118 53" stroke="#B45309" strokeWidth="5" strokeLinecap="round"/><circle cx="100" cy="86" r="18" fill="#FFF7ED" opacity=".85"/><path d="M100 117V132M91 132H109" stroke="#92400E" strokeWidth="5" strokeLinecap="round"/></>}
      {mode === "leaves" && <><path d="M100 133C96 105 98 77 112 43" stroke="#15803D" strokeWidth="6" strokeLinecap="round"/><path d="M101 86C83 82 71 71 68 55C86 57 98 68 102 79Z" fill="#22C55E"/><path d="M104 106C123 101 136 89 140 72C121 75 109 87 104 96Z" fill="#16A34A"/><path d="M98 71C85 65 77 54 77 40C91 44 99 55 100 65Z" fill="#86EFAC"/></>}
      {mode === "stardust" && <><path d="M100 27L108 57L139 65L108 73L100 104L92 73L61 65L92 57L100 27Z" fill="#8B5CF6" opacity=".78"/><path d="M49 92L53 104L65 108L53 112L49 124L45 112L33 108L45 104L49 92Z" fill="#FFFFFF" opacity=".72"/><path d="M153 69L157 80L168 84L157 88L153 99L149 88L138 84L149 80L153 69Z" fill="#FFFFFF" opacity=".55"/></>}
    </svg>
  );
}

function Sound({ type }) {
  const data = {
    rain:["#E0F2FE","#60A5FA"], ocean:["#CFFAFE","#06B6D4"], forest:["#DCFCE7","#16A34A"],
    fire:["#FFEDD5","#F97316"], bowl:["#FEF3C7","#EAB308"], lofi:["#EDE9FE","#8B5CF6"]
  };
  const [bg, accent] = data[type] || data.rain;
  return (
    <svg {...shell} aria-hidden="true">
      <defs><linearGradient id="sound-bg" x1="18" y1="8" x2="182" y2="152"><stop stopColor={bg}/><stop offset="1" stopColor="#FFFFFF"/></linearGradient></defs>
      <rect x="7" y="7" width="186" height="146" rx="36" fill="url(#sound-bg)"/>
      <circle cx="51" cy="42" r="35" fill="#FFFFFF" opacity=".3"/>
      {type === "rain" && <><path d="M48 80C51 63 67 55 81 61C89 47 111 48 119 63C134 61 147 72 143 87H48Z" fill={accent} opacity=".82"/><path d="M66 102L61 119M91 102L86 119M116 102L111 119" stroke="#60A5FA" strokeWidth="5" strokeLinecap="round"/></>}
      {type === "ocean" && <><path d="M25 79C43 61 61 64 79 79C96 93 113 94 130 79C143 68 157 69 175 81" stroke={accent} strokeWidth="9" strokeLinecap="round"/><path d="M25 105C43 88 61 90 79 105C96 119 113 120 130 105C143 94 157 95 175 107" stroke="#67E8F9" strokeWidth="5" strokeLinecap="round"/></>}
      {type === "forest" && <><path d="M101 128C96 101 99 75 113 43" stroke="#166534" strokeWidth="6" strokeLinecap="round"/><path d="M101 87C84 83 73 72 70 57C87 59 98 69 102 79Z" fill={accent}/><path d="M105 106C122 102 135 90 139 75C123 77 111 87 105 97Z" fill="#4ADE80"/><path d="M97 72C86 66 80 56 80 43C92 46 99 55 100 65Z" fill="#86EFAC"/></>}
      {type === "fire" && <><path d="M100 128C76 128 64 113 70 96C73 85 84 79 86 64C103 73 104 87 100 96C111 87 116 73 112 55C135 74 142 99 134 115C128 125 116 128 100 128Z" fill={accent}/><path d="M100 116C89 116 84 109 87 101C90 95 96 94 98 86C108 96 110 104 106 110C104 114 102 115 100 116Z" fill="#FED7AA"/></>}
      {type === "bowl" && <><path d="M62 83H138C134 111 120 125 100 125C80 125 66 111 62 83Z" fill="#FACC15"/><ellipse cx="100" cy="83" rx="38" ry="10" fill="#FEF9C3" stroke="#CA8A04" strokeWidth="3"/><path d="M87 60C93 48 107 48 113 60" stroke="#FDE68A" strokeWidth="5" strokeLinecap="round"/></>}
      {type === "lofi" && <><rect x="54" y="53" width="92" height="65" rx="16" fill="#DDD6FE"/><path d="M65 105L79 81L93 97L110 66L133 105" stroke={accent} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="70" cy="65" r="6" fill="#8B5CF6"/><circle cx="130" cy="65" r="6" fill="#A78BFA"/></>}
    </svg>
  );
}

export function WellnessIllustration({ type, className = "" }) {
  const Art = type === "ground" ? Ground : type === "worry" ? Worry : Breath;
  return <div className={className}><Art /></div>;
}
export function MoodIllustration({ mood, className = "" }) {
  return <div className={className}><Mood mood={mood} /></div>;
}
export function WorryModeIllustration({ mode, className = "" }) {
  return <div className={className}><WorryMode mode={mode} /></div>;
}
export function SoundIllustrationIcon({ type, className = "" }) {
  return <div className={className}><Sound type={type} /></div>;
}
export default WellnessIllustration;
