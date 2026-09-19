import { motion, useReducedMotion } from 'framer-motion';
export default function PageTransition({children,className=''}) {
  const reduce=useReducedMotion();
  return <motion.div className={className} initial={{opacity:0,y:reduce?0:8}} animate={{opacity:1,y:0}} transition={{duration:.3,ease:[.22,1,.36,1]}}>{children}</motion.div>;
}
