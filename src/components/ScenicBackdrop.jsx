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
        <linearGradient id="sunsetSky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6EA8D8" />
          <stop offset=".42" stopColor="#8FA7D9" />
          <stop offset=".72" stopColor="#C7A9CF" />
          <stop offset="1" stopColor="#F2C2C7" />
        </linearGradient>
        <linearGradient id="horizonGlow" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#FFE6C7" stopOpacity=".72" />
          <stop offset=".45" stopColor="#F6C8C6" stopOpacity=".22" />
          <stop offset="1" stopColor="#1E293B" stopOpacity=".45" />
        </linearGradient>
        <linearGradient id="farHills" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#A8B6D3" />
          <stop offset=".5" stopColor="#8F9DC4" />
          <stop offset="1" stopColor="#B59BBE" />
        </linearGradient>
        <linearGradient id="nearHills" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#4B587E" />
          <stop offset=".55" stopColor="#354363" />
          <stop offset="1" stopColor="#1D2948" />
        </linearGradient>
        <radialGradient id="sunGlow">
          <stop stopColor="#FFF8E8" stopOpacity=".95" />
          <stop offset=".22" stopColor="#FFE3B0" stopOpacity=".56" />
          <stop offset=".58" stopColor="#FFD5C8" stopOpacity=".14" />
          <stop offset="1" stopColor="#FFD5C8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cloud" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#FFFFFF" stopOpacity=".26" />
          <stop offset="1" stopColor="#F5E8F3" stopOpacity=".08" />
        </linearGradient>
        <filter id="blur24" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="24" /></filter>
        <filter id="blur8" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8" /></filter>
      </defs>

      <rect width="1440" height="620" fill="url(#sunsetSky)" />

      <ellipse cx="1110" cy="250" rx="360" ry="250" fill="url(#sunGlow)" filter="url(#blur24)" />
      <circle cx="1110" cy="250" r="62" fill="#FFF4D6" opacity=".82" filter="url(#blur8)" />
      <circle cx="1110" cy="250" r="38" fill="#FFF7E3" opacity=".92" />

      <g fill="url(#cloud)" filter="url(#blur8)">
        <path d="M120 155C185 125 235 132 278 160C320 120 397 124 432 168C474 156 522 172 540 205H86C91 182 103 166 120 155Z" />
        <path d="M870 122C916 98 968 105 1002 136C1032 112 1084 116 1111 149C1150 143 1188 159 1201 186H830C839 159 854 137 870 122Z" opacity=".7" />
      </g>

      <g opacity=".38" fill="#FFFFFF">
        <circle cx="170" cy="88" r="2.5" />
        <circle cx="224" cy="114" r="1.8" />
        <circle cx="315" cy="78" r="2" />
        <circle cx="1250" cy="95" r="2.4" />
        <circle cx="1310" cy="135" r="1.6" />
      </g>

      <path
        d="M0 390C155 335 250 360 382 405C520 451 602 350 760 365C905 379 1006 431 1134 378C1260 326 1342 354 1440 380V620H0Z"
        fill="url(#farHills)"
        opacity=".74"
      />
      <path
        d="M0 452C154 405 248 442 378 482C510 523 632 424 770 438C906 451 1010 505 1134 454C1260 402 1355 431 1440 452V620H0Z"
        fill="url(#horizonGlow)"
        opacity=".42"
      />
      <path
        d="M0 500C130 447 240 478 360 530C470 578 575 486 700 494C818 502 912 555 1032 514C1162 470 1292 490 1440 515V620H0Z"
        fill="url(#nearHills)"
      />

      <g fill="none" stroke="#E9EAF7" strokeLinecap="round" opacity=".18">
        <path d="M70 510C240 468 320 520 445 548" strokeWidth="3" />
        <path d="M890 548C1020 506 1120 515 1320 550" strokeWidth="3" />
        <path d="M190 548C310 520 400 554 500 580" strokeWidth="2" />
      </g>

      <g fill="#FFF7ED" opacity=".48">
        <circle cx="1020" cy="460" r="2.2" />
        <circle cx="1040" cy="445" r="1.4" />
        <circle cx="1070" cy="470" r="1.8" />
      </g>

      <rect y="470" width="1440" height="150" fill="#0B1228" opacity=".16" />
    </svg>
  );
}
