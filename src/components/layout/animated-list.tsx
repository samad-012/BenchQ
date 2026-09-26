"use client";

import { motion } from "motion/react";
import { listVariants, itemVariants } from "@/lib/animations";

export function AnimatedList({ children, className, as = "ul" }: { children: React.ReactNode, className?: string, as?: any }) {
  const Component = (motion as any)[as] || motion.ul;
  return (
    <Component
      variants={listVariants}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </Component>
  );
}

export function AnimatedItem({ children, className, as = "li" }: { children: React.ReactNode, className?: string, as?: any }) {
  const Component = (motion as any)[as] || motion.li;
  return (
    <Component
      variants={itemVariants}
      className={className}
    >
      {children}
    </Component>
  );
}
