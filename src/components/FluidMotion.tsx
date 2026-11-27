import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { FLUID_EASE, VIEWPORT_CONFIG } from './MotionPrimitives';

interface SpotlightSurfaceProps {
  children: ReactNode;
  className?: string;
  tone?: 'dark' | 'light';
}

/**
 * Lightweight GPU-only container surface (zero layout-reading mousemove handlers).
 */
export function SpotlightSurface({
  children,
  className = '',
}: SpotlightSurfaceProps) {
  return <div className={className}>{children}</div>;
}

interface BlurRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Lightweight GPU-composited opacity + micro-translate reveal (triggered once).
 */
export function BlurReveal({
  children,
  className = '',
  delay = 0,
}: BlurRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_CONFIG}
      transition={{ duration: 0.28, delay, ease: FLUID_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface CountUpMetricProps {
  target: number;
  suffix?: string;
  durationMs?: number;
}

/**
 * Crisp tabular number roll-up triggered once when entering viewport.
 */
export function CountUpMetric({
  target,
  suffix = '',
  durationMs = 700,
}: CountUpMetricProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const [value, setValue] = useState<number>(target);

  useEffect(() => {
    if (!isInView) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setValue(target);
      return;
    }

    let rafId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = Math.max(0, now - start);
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    setValue(0);
    rafId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(rafId);
  }, [isInView, target, durationMs]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
      {suffix}
    </span>
  );
}
