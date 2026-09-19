import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Mascot({ show, message }) {
  return (
    <AnimatePresence>
      {show && message && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-24 right-5 sm:right-6 z-[55] flex items-end gap-2 pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="relative bg-card/90 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 max-w-[220px] shadow-xl"
          >
            <p className="text-sm text-foreground leading-relaxed">{message}</p>
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-card/90 border-r border-b border-white/20 rotate-45" />
          </motion.div>

          <motion.svg
            width="64"
            height="64"
            viewBox="0 0 100 100"
            aria-hidden="true"
            animate={{ y: [0, -5, 0], rotate: [0, 1, 0, -1, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="drop-shadow-xl"
          >
            <defs>
              <radialGradient id="mascot-aura" cx="35%" cy="25%" r="75%">
                <stop offset="0" stopColor="#FFFFFF" stopOpacity=".95" />
                <stop offset=".18" stopColor="#FBCFE8" stopOpacity=".95" />
                <stop offset=".58" stopColor="#A78BFA" />
                <stop offset="1" stopColor="#60A5FA" />
              </radialGradient>
              <linearGradient id="mascot-body" x1="20" y1="12" x2="82" y2="88" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFFFFF" stopOpacity=".92" />
                <stop offset=".25" stopColor="#F9A8D4" stopOpacity=".94" />
                <stop offset=".7" stopColor="#A78BFA" />
                <stop offset="1" stopColor="#60A5FA" />
              </linearGradient>
              <filter id="mascot-shadow" x="-35%" y="-35%" width="170%" height="180%">
                <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#312E81" floodOpacity=".25" />
              </filter>
            </defs>

            <circle cx="50" cy="50" r="44" fill="#C4B5FD" opacity=".18" />
            <circle cx="50" cy="50" r="39" fill="url(#mascot-aura)" filter="url(#mascot-shadow)" />
            <circle cx="50" cy="50" r="34" fill="url(#mascot-body)" stroke="#FFFFFF" strokeOpacity=".65" strokeWidth="2" />

            <path d="M26 48C29 27 42 18 57 20C70 21 79 31 78 45C70 36 61 32 51 33C40 33 32 38 26 48Z" fill="#FFFFFF" fillOpacity=".26" />
            <circle cx="38" cy="48" r="7.2" fill="#FFFFFF" fillOpacity=".92" />
            <circle cx="62" cy="48" r="7.2" fill="#FFFFFF" fillOpacity=".92" />
            <circle cx="39" cy="49" r="3.4" fill="#1E293B" />
            <circle cx="63" cy="49" r="3.4" fill="#1E293B" />
            <circle cx="40" cy="48" r="1.1" fill="#FFFFFF" />
            <circle cx="64" cy="48" r="1.1" fill="#FFFFFF" />
            <path d="M38 64Q50 73 62 64" stroke="#334155" strokeOpacity=".72" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            <circle cx="27" cy="61" r="4.5" fill="#FBCFE8" opacity=".7" />
            <circle cx="73" cy="61" r="4.5" fill="#FBCFE8" opacity=".7" />

            <circle cx="17" cy="31" r="2.5" fill="#FFFFFF" opacity=".7" />
            <circle cx="84" cy="25" r="2" fill="#FFFFFF" opacity=".6" />
            <path d="M82 69L85 76L92 79L85 82L82 89L79 82L72 79L79 76L82 69Z" fill="#FFFFFF" opacity=".7" />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
