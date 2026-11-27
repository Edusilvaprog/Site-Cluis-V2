import { useEffect } from 'react';

const HEADER_OFFSET_PX = 76;

export function scrollToSectionId(sectionId: string) {
  const target = document.getElementById(sectionId);
  if (!target) return;

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const top =
    target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET_PX;

  window.scrollTo({
    top: Math.max(0, top),
    behavior: prefersReduced ? 'auto' : 'smooth',
  });
}

/**
 * Lightweight native anchor navigation (zero 60fps JS wheel-hijacking).
 */
export function useSmoothScroll() {
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const id = href.slice(1);
      if (!document.getElementById(id)) return;

      event.preventDefault();
      scrollToSectionId(id);
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);
}
