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
  const colors = {
    rain: ["#38BDF8", "#0EA5E9"],
    ocean: ["#22D3EE", "#0891B2"],
    forest: ["#34D399", "#059669"],
    fire: ["#FB923C", "#EA580C"],
    bowl: ["#FACC15", "#CA8A04"],
    lofi: ["#A78BFA", "#7C3AED"],
  };
  const [a, b] = colors[type] || colors.rain;
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={"sound-icon-" + type} x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="20" fill={"url(#sound-icon-" + type + ")"} fillOpacity=".10" />
      {type === "rain" && <>
        <path d="M13 24c1.3-5.1 5.1-8 10-8 3.8 0 7 1.7 8.5 4.8C36.3 20.7 39 23.1 39 27c0 4.3-3.2 7-8 7H16c-4 0-6-2.2-6-5.5 0-2.4 1.1-3.7 3-4.5Z" fill={"url(#sound-icon-" + type + ")"} fillOpacity=".9"/>
        <path d="M17 36l-1.8 4M25 36l-1.8 4M33 36l-1.8 4" stroke={b} strokeWidth="2.2" strokeLinecap="round"/>
      </>}
      {type === "ocean" && <>
        <path d="M7 22c5-5 9-5 14 0s9 5 14 0 9-5 14 0" stroke={b} strokeWidth="3.2" strokeLinecap="round"/>
        <path d="M7 31c5-5 9-5 14 0s9 5 14 0 9-5 14 0" stroke={a} strokeOpacity=".55" strokeWidth="2.2" strokeLinecap="round"/>
      </>}
      {type === "forest" && <>
        <path d="M24 39V16" stroke={b} strokeWidth="2.6" strokeLinecap="round"/>
        <path d="M23 27c-6 0-10-3.2-11-8 6 .2 10.2 2.8 11 8Z" fill={a}/>
        <path d="M25 33c6-.4 10-3.5 11-8.5-5.8.3-10 3.1-11 8.5Z" fill={b}/>
        <path d="M23 22c-4.2-.8-7-3.5-7.8-7.5 4.4.5 7.3 2.8 7.8 7.5Z" fill="#86EFAC"/>
      </>}
      {type === "fire" && <>
        <path d="M25 40c-7.2-.7-11-5.2-9.4-11.2 1.1-4 4.9-6.6 6-11.4 5.7 3.8 6.5 8.2 5.5 11.7 2.4-2.3 3.5-5 3-8.4 5.2 5.2 6.1 11.6 2.7 16-1.7 2.1-4.2 3.1-7.8 3.3Z" fill={a}/>
        <path d="M24.5 35c-2.9-.3-4.5-2.1-3.7-4.5.5-1.5 1.9-2.5 2.5-4.4 2.2 1.5 2.7 3.2 2.2 4.7 1-.9 1.4-1.9 1.2-3.1 2 2.2 2.2 5 .8 6.4-.8.7-1.7 1-3 1Z" fill="#FED7AA"/>
      </>}
      {type === "bowl" && <>
        <path d="M11 23h26c-.7 9.4-5.3 14.8-13 14.8S11.7 32.4 11 23Z" fill={a} fillOpacity=".25" stroke={b} strokeWidth="2"/>
        <path d="M9 22c0-2.5 6.7-4.8 15-4.8s15 2.3 15 4.8-6.7 4.8-15 4.8S9 24.5 9 22Z" fill="#FEF9C3" stroke={b} strokeWidth="2"/>
        <path d="M19 13c1-3 2.7-4.5 5-4.5s4 1.5 5 4.5" stroke={a} strokeWidth="2" strokeLinecap="round"/>
      </>}
      {type === "lofi" && <>
        <rect x="10" y="12" width="28" height="24" rx="6" fill={a} fillOpacity=".14" stroke={a} strokeWidth="2"/>
        <path d="M14 31l6-8 5 5 5-9 5 12" stroke={b} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="17" cy="18" r="2.2" fill={a}/><circle cx="33" cy="18" r="2.2" fill={b}/>
      </>}
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
