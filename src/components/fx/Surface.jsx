import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function Surface({ as='div', interactive=false, className='', children, ...props }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] ?? motion.div;
  const handlePointerMove = (e) => {
    if (!interactive || e.pointerType === 'touch') return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX-r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY-r.top}px`);
  };
  return (
    <Comp
      className={`ss-surface ${interactive ? 'ss-surface--interactive' : ''} ${className}`}
      onPointerMove={interactive ? handlePointerMove : undefined}
      whileHover={interactive && !reduce ? { y: -3 } : undefined}
      whileTap={interactive && !reduce ? { scale: .985 } : undefined}
      transition={{ type:'spring', stiffness:320, damping:26 }}
      {...props}
    >
      {children}
    </Comp>
  );
}
