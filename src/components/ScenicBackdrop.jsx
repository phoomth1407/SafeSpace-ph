import React from "react";

export default function ScenicBackdrop({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 620"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="ssSunsetSky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5F9CCB" />
          <stop offset=".42" stopColor="#8EA5D4" />
          <stop offset=".72" stopColor="#C9A8CF" />
          <stop offset="1" stopColor="#F1C1C5" />
        </linearGradient>
        <linearGradient id="ssFarHills" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#A7B6D4" />
          <stop offset=".5" stopColor="#8999C0" />
          <stop offset="1" stopColor="#B49ABC" />
        </linearGradient>
        <linearGradient id="ssNearHills" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#4B587E" />
          <stop offset=".55" stopColor="#354363" />
          <stop offset="1" stopColor="#1C2948" />
        </linearGradient>
        <linearGradient id="ssHorizonGlow" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#FFE8CB" stopOpacity=".72" />
          <stop offset=".5" stopColor="#F6C9C7" stopOpacity=".20" />
          <stop offset="1" stopColor="#1E293B" stopOpacity=".42" />
        </linearGradient>
        <radialGradient id="ssSunGlow">
          <stop stopColor="#FFF9EA" stopOpacity=".98" />
          <stop offset=".25" stopColor="#FFE3B0" stopOpacity=".55" />
          <stop offset=".7" stopColor="#FFD5C8" stopOpacity=".10" />
          <stop offset="1" stopColor="#FFD5C8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1440" height="620" fill="url(#ssSunsetSky)" />
      <ellipse cx="1110" cy="245" rx="300" ry="220" fill="url(#ssSunGlow)" opacity=".85" />
      <circle cx="1110" cy="250" r="44" fill="#FFF7E3" opacity=".92" />

      <g fill="#FFF" opacity=".16">
        <path d="M85 175c55-48 125-45 176-8 43-37 112-25 135 21H45c5-6 19-10 40-13Z" />
        <path d="M885 145c43-38 102-32 137 3 36-25 89-13 108 25H840c8-13 22-22 45-28Z" opacity=".8" />
      </g>

      <g fill="#FFF" opacity=".38">
        <circle cx="170" cy="88" r="2.5" />
        <circle cx="224" cy="114" r="1.8" />
        <circle cx="315" cy="78" r="2" />
        <circle cx="1250" cy="95" r="2.4" />
        <circle cx="1310" cy="135" r="1.6" />
      </g>

      <path
        d="M0 390C155 335 250 360 382 405C520 451 602 350 760 365C905 379 1006 431 1134 378C1260 326 1342 354 1440 380V620H0Z"
        fill="url(#ssFarHills)"
        opacity=".76"
      />
      <path
        d="M0 452C154 405 248 442 378 482C510 523 632 424 770 438C906 451 1010 505 1134 454C1260 402 1355 431 1440 452V620H0Z"
        fill="url(#ssHorizonGlow)"
        opacity=".48"
      />
      <path
        d="M0 500C130 447 240 478 360 530C470 578 575 486 700 494C818 502 912 555 1032 514C1162 470 1292 490 1440 515V620H0Z"
        fill="url(#ssNearHills)"
      />

      <g fill="none" stroke="#F4F2FF" strokeLinecap="round" opacity=".22">
        <path d="M70 510C240 468 320 520 445 548" strokeWidth="3" />
        <path d="M890 548C1020 506 1120 515 1320 550" strokeWidth="3" />
        <path d="M190 548C310 520 400 554 500 580" strokeWidth="2" />
      </g>

      <g fill="#FFF7ED" opacity=".5">
        <circle cx="1020" cy="460" r="2.2" />
        <circle cx="1040" cy="445" r="1.4" />
        <circle cx="1070" cy="470" r="1.8" />
      </g>

      <rect y="470" width="1440" height="150" fill="#0B1228" opacity=".14" />
    </svg>
  );
}
