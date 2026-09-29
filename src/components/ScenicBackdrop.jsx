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
        <linearGradient id="safeSky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7DD3FC" stopOpacity=".58" />
          <stop offset=".45" stopColor="#A78BFA" stopOpacity=".36" />
          <stop offset="1" stopColor="#F9A8D4" stopOpacity=".22" />
        </linearGradient>
        <linearGradient id="safeHorizon" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#E0F2FE" stopOpacity=".34" />
          <stop offset="1" stopColor="#312E81" stopOpacity=".28" />
        </linearGradient>
        <linearGradient id="safeRibbon" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#E0F2FE" stopOpacity=".42" />
          <stop offset=".5" stopColor="#DDD6FE" stopOpacity=".28" />
          <stop offset="1" stopColor="#FCE7F3" stopOpacity=".18" />
        </linearGradient>
        <radialGradient id="safeGlow">
          <stop stopColor="#FFF7ED" stopOpacity=".72" />
          <stop offset=".42" stopColor="#FDE68A" stopOpacity=".20" />
          <stop offset="1" stopColor="#FDE68A" stopOpacity="0" />
        </radialGradient>
        <filter id="safeBlur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="28" />
        </filter>
        <filter id="safeSoftBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      <rect width="1440" height="620" fill="url(#safeSky)" />

      <ellipse cx="1080" cy="120" rx="300" ry="230" fill="url(#safeGlow)" filter="url(#safeBlur)" />
      <circle cx="1080" cy="126" r="58" fill="#FFF7ED" opacity=".16" filter="url(#safeSoftBlur)" />

      <g fill="none" stroke="url(#safeRibbon)" strokeLinecap="round">
        <path d="M-80 420C190 270 390 300 610 420S1050 560 1530 330" strokeWidth="78" opacity=".32" />
        <path d="M-120 505C180 360 430 360 670 485S1110 610 1540 430" strokeWidth="42" opacity=".30" />
        <path d="M-80 550C250 430 440 455 720 540S1160 620 1510 500" strokeWidth="18" opacity=".30" />
      </g>

      <path
        d="M0 500C180 430 320 445 510 500C700 555 860 470 1030 500C1190 528 1320 485 1440 450V620H0Z"
        fill="url(#safeHorizon)"
        opacity=".58"
      />

      <g fill="#FFFFFF" opacity=".20">
        <circle cx="190" cy="120" r="3" />
        <circle cx="260" cy="168" r="2" />
        <circle cx="350" cy="96" r="2.5" />
        <circle cx="1260" cy="92" r="3" />
        <circle cx="1320" cy="150" r="2" />
      </g>

      <path
        d="M0 585C260 530 470 565 690 585C940 610 1150 545 1440 570V620H0Z"
        fill="#0F172A"
        opacity=".10"
      />
    </svg>
  );
}
