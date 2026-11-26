import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { FLUID_EASE, VIEWPORT_CONFIG } from './MotionPrimitives';

interface SpotlightSurfaceProps {
  children: ReactNode;
  className?: string;
  tone?: 'dark' | 'light';
}

/**
 * Inspired by React Bits SpotlightCard:
 * Zero-re-render pointer tracking via CSS custom properties (--spot-x, --spot-y).
 */
export function SpotlightSurface({
  children,
  className = '',
  tone = 'dark',
}: SpotlightSurfaceProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    el.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`spotlight-surface ${
        tone === 'light' ? 'spotlight-surface-light' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface TiltMediaFrameProps {
  children: ReactNode;
  className?: string;
  maxTiltDeg?: number;
}

/**
 * Inspired by React Bits TiltedCard & Transitions.dev tactile frames:
 * Direct-DOM GPU perspective tilt (zero state re-renders, disabled on touch/reduced-motion).
 */
export function TiltMediaFrame({
  children,
  className = '',
  maxTiltDeg = 4,
}: TiltMediaFrameProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const el = frameRef.current;
    if (!el) return;
    if (
      typeof window !== 'undefined' &&
      (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        !window.matchMedia('(pointer: fine)').matches)
    ) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    const rotateY = px * maxTiltDeg * 2;
    const rotateX = -py * maxTiltDeg * 2;
    el.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(0)`;
  };

  const handleMouseLeave = () => {
    const el = frameRef.current;
    if (!el) return;
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
  };

  return (
    <div
      ref={frameRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transition: 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'transform',
      }}
      className={className}
    >
      {children}
    </div>
  );
}

interface BlurRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Inspired by React Bits BlurText & transitions.dev optical reveals:
 * Smooth opacity + micro-translate + optical blur settle, triggered once.
 */
export function BlurReveal({ children, className = '', delay = 0 }: BlurRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_CONFIG}
      transition={{ duration: 0.34, delay, ease: FLUID_EASE }}
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
 * Inspired by React Bits CountUp:
 * Crisp tabular number roll-up triggered once when entering viewport.
 */
export function CountUpMetric({
  target,
  suffix = '',
  durationMs = 850,
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
      // Expo ease-out curve
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
