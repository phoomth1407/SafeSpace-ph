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
          className="fixed bottom-6 right-6 z-50 flex items-end gap-2 pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="relative bg-card border border-border rounded-2xl px-4 py-3 max-w-[220px] shadow-lg"
          >
            <p className="text-sm text-foreground leading-relaxed">{message}</p>
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-card border-r border-b border-border rotate-45" />
          </motion.div>
          <motion.svg
            width="56"
            height="56"
            viewBox="0 0 100 100"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <defs>
              <linearGradient id="mascotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f9a8d4" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="40" fill="url(#mascotGrad)" />
            <circle cx="38" cy="42" r="7" fill="white" />
            <circle cx="62" cy="42" r="7" fill="white" />
            <circle cx="39" cy="43" r="3.5" fill="#1e293b" />
            <circle cx="63" cy="43" r="3.5" fill="#1e293b" />
            <circle cx="40" cy="42" r="1.2" fill="white" />
            <circle cx="64" cy="42" r="1.2" fill="white" />
            <path d="M 40 58 Q 50 66 60 58" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="30" cy="55" r="4" fill="#fbb6c5" opacity="0.6" />
            <circle cx="70" cy="55" r="4" fill="#fbb6c5" opacity="0.6" />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
