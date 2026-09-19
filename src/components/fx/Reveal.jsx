import { motion, useReducedMotion } from 'framer-motion';
const ease=[.22,1,.36,1];
export function Reveal({ as='div', delay=0, y=14, className='', children, ...props }) {
  const reduce=useReducedMotion(); const Comp=motion[as] ?? motion.div;
  return <Comp className={className} initial={reduce?false:{opacity:0,y}} whileInView={reduce?undefined:{opacity:1,y:0}} viewport={{once:true,margin:'0px 0px -10% 0px'}} transition={{duration:.65,delay,ease}} {...props}>{children}</Comp>;
}
export function Stagger({className='',delay=0,gap=.09,children,...props}) {
  const reduce=useReducedMotion();
  return <motion.div className={className} initial={reduce?false:'hidden'} whileInView="show" viewport={{once:true,margin:'0px 0px -10% 0px'}} variants={{hidden:{},show:{transition:{staggerChildren:gap,delayChildren:delay}}}} {...props}>{children}</motion.div>;
}
export function StaggerItem({as='div',className='',children,...props}) {
  const Comp=motion[as] ?? motion.div;
  return <Comp className={className} variants={{hidden:{opacity:0,y:16},show:{opacity:1,y:0,transition:{duration:.6,ease}}}} {...props}>{children}</Comp>;
}
