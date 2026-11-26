import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

let activeLenis: Lenis | null = null;

export function scrollToSectionId(sectionId: string) {
  const target = document.getElementById(sectionId);
  if (!target) return;

  if (activeLenis) {
    activeLenis.scrollTo(target, {
      offset: -76,
      duration: 1.05,
    });
    return;
  }

  target.scrollIntoView({ behavior: 'smooth' });
}

export function useSmoothScroll() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;

    if (prefersReducedMotion || !isFinePointer) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    activeLenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const id = href.slice(1);
      const section = document.getElementById(id);
      if (!section) return;

      event.preventDefault();
      lenis.scrollTo(section, {
        offset: -76,
        duration: 1.05,
      });
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      gsap.ticker.remove(onTick);
      lenis.destroy();
      if (activeLenis === lenis) {
        activeLenis = null;
      }
    };
  }, []);
}
