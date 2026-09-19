import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function VisualAtmosphere() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="visual-atmosphere" aria-hidden="true">
      <div className="visual-grid" />
      <div className="visual-vignette" />
      <motion.div
        className="visual-orb visual-orb-a"
        animate={reduceMotion ? undefined : { x: [0, 45, -20, 0], y: [0, -35, 25, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="visual-orb visual-orb-b"
        animate={reduceMotion ? undefined : { x: [0, -35, 20, 0], y: [0, 25, -30, 0], scale: [1, 0.94, 1.07, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="visual-orb visual-orb-c"
        animate={reduceMotion ? undefined : { y: [0, 28, -18, 0], opacity: [0.45, 0.65, 0.4, 0.45] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
