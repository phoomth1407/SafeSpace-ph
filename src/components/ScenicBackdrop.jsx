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
        <linearGradient id="sceneSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7DD3FC" stopOpacity=".62" />
          <stop offset=".48" stopColor="#C4B5FD" stopOpacity=".40" />
          <stop offset="1" stopColor="#FBCFE8" stopOpacity=".28" />
        </linearGradient>
        <radialGradient id="sceneSun" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFF7ED" stopOpacity=".96" />
          <stop offset=".35" stopColor="#FED7AA" stopOpacity=".48" />
          <stop offset="1" stopColor="#F9A8D4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="farMountains" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#A5B4FC" stopOpacity=".62" />
          <stop offset="1" stopColor="#818CF8" stopOpacity=".22" />
        </linearGradient>
        <linearGradient id="nearMountains" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#475569" stopOpacity=".38" />
          <stop offset="1" stopColor="#1E293B" stopOpacity=".10" />
        </linearGradient>
        <filter id="sceneBlur"><feGaussianBlur stdDeviation="18" /></filter>
      </defs>

      <rect width="1440" height="620" fill="url(#sceneSky)" />
      <ellipse cx="1040" cy="180" rx="260" ry="190" fill="url(#sceneSun)" filter="url(#sceneBlur)" />
      <ellipse cx="1050" cy="190" rx="72" ry="72" fill="#FFF7ED" opacity=".54" />

      <g fill="#fff" opacity=".30" filter="url(#sceneBlur)">
        <ellipse cx="240" cy="145" rx="170" ry="34" />
        <ellipse cx="550" cy="92" rx="190" ry="38" />
        <ellipse cx="1220" cy="125" rx="210" ry="42" />
      </g>

      <path
        d="M0 430L170 310L280 386L430 250L570 378L720 205L875 360L1010 230L1160 374L1310 275L1440 360V620H0Z"
        fill="url(#farMountains)"
      />
      <path
        d="M0 500L160 382L300 470L470 345L610 470L770 325L920 465L1080 345L1230 468L1360 382L1440 430V620H0Z"
        fill="url(#nearMountains)"
      />

      <path
        d="M0 520C180 472 320 505 500 525C700 548 850 480 1040 500C1210 518 1320 486 1440 505V620H0Z"
        fill="#0F172A"
        opacity=".11"
      />
    </svg>
  );
}
