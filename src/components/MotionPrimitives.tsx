import type { ReactNode } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  type Transition,
  type Variants,
} from 'framer-motion';

export const FLUID_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const FLUID_SPRING: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 32,
  mass: 0.85,
};

export const TACTILE_SPRING: Transition = {
  type: 'spring',
  stiffness: 460,
  damping: 28,
  mass: 0.7,
};

export const VIEWPORT_CONFIG = {
  once: true,
  amount: 'some' as const,
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.075,
      delayChildren: 0.04,
    },
  },
};

export const fadeSlideUpVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.52,
      ease: FLUID_EASE,
    },
  },
};

/* --- Advanced Variants for BrandsSection Factory Cards --- */

export const brandCardRevealVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.58,
      ease: FLUID_EASE,
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

export const brandCardHoverVariants: Variants = {
  rest: {
    y: 0,
    boxShadow: '0 14px 34px rgba(22, 57, 78, 0.09)',
    borderColor: '#B2C3CE',
    transition: FLUID_SPRING,
  },
  hover: {
    y: -5,
    boxShadow: '0 24px 52px rgba(22, 57, 78, 0.16)',
    borderColor: '#285E7B',
    transition: FLUID_SPRING,
  },
};

export const brandAccentBarVariants: Variants = {
  rest: {
    scaleX: 0,
    opacity: 0,
    transition: { duration: 0.24, ease: FLUID_EASE },
  },
  hover: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.34, ease: FLUID_EASE },
  },
};

export const brandMediaZoomVariants: Variants = {
  rest: {
    scale: 1,
    transition: { duration: 0.48, ease: FLUID_EASE },
  },
  hover: {
    scale: 1.04,
    transition: { duration: 0.48, ease: FLUID_EASE },
  },
};

export const brandInnerItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: FLUID_EASE },
  },
};

/* --- Advanced Variants for RegionMapSection --- */

export const regionCityGridVariants: Variants = {
  hidden: { opacity: 0.6 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.01,
      delayChildren: 0,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.1, ease: FLUID_EASE },
  },
};

export const regionCityButtonVariants: Variants = {
  hidden: { opacity: 0.4, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.16, ease: FLUID_EASE },
  },
};

export const mapSvgContainerVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.975 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.36, ease: FLUID_EASE },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.985,
    transition: { duration: 0.2, ease: FLUID_EASE },
  },
};

export const mapPolygonVariants: Variants = {
  idle: {
    fill: '#8BBBD9',
    stroke: '#0E2837',
    strokeWidth: 1.25,
    fillOpacity: 0.94,
    transition: { duration: 0.22, ease: FLUID_EASE },
  },
  hovered: {
    fill: '#D2E9F8',
    stroke: '#FFFFFF',
    strokeWidth: 1.65,
    fillOpacity: 1,
    transition: { duration: 0.16, ease: FLUID_EASE },
  },
  selected: {
    fill: '#EA7317',
    stroke: '#FFFFFF',
    strokeWidth: 2.1,
    fillOpacity: 1,
    transition: { duration: 0.24, ease: FLUID_EASE },
  },
};

export const mapPinCalloutVariants: Variants = {
  hidden: { opacity: 0, y: 6, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: FLUID_SPRING,
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.94,
    transition: { duration: 0.14, ease: FLUID_EASE },
  },
};

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

export function SectionReveal({
  children,
  className,
  delay = 0,
  y = 24,
}: SectionRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_CONFIG}
      transition={{ duration: 0.56, delay, ease: FLUID_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
}

export function StaggerContainer({ children, className }: StaggerContainerProps) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_CONFIG}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div variants={fadeSlideUpVariants} className={className}>
      {children}
    </motion.div>
  );
}

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2.5px] origin-left bg-[#285E7B]"
    />
  );
}
