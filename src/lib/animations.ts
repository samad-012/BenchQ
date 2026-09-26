export const spring = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const smoothEasing = [0.16, 1, 0.3, 1]; // --ease-out

export const pageVariants = {
  initial: { opacity: 0, y: 8, filter: "blur(4px)" },
  animate: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 0.26, ease: smoothEasing }
  },
  exit: { 
    opacity: 0, 
    y: -8, 
    filter: "blur(4px)",
    transition: { duration: 0.2, ease: smoothEasing }
  }
};

export const listVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05
    }
  }
};

export const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 30 }
  }
};
