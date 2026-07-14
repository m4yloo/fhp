import { motion, type MotionProps } from "framer-motion";
import type { ReactNode } from "react";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

const pageTransition: MotionProps["transition"] = {
  duration: 0.2,
  ease: [0.25, 0.1, 0.25, 1],
};

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}
