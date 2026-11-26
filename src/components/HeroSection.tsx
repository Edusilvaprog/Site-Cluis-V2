import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { MEDIA_ASSETS } from '../data/cluisData';
import { LayersGridSvg, QuoteDocSvg } from './CluisIcons';
import { BlurReveal, CountUpMetric } from './FluidMotion';
import { FLUID_EASE, TACTILE_SPRING } from './MotionPrimitives';

gsap.registerPlugin(ScrollTrigger);

const HERO_STATS = [
  { target: 15, suffix: '+', label: 'Anos na região' },
  { target: 3, suffix: '', label: 'Fábricas representadas' },
  { target: 32, suffix: '', label: 'Cidades atendidas' },
  { target: 100, suffix: '%', label: 'Direto no seu CNPJ' },
];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      if (bgImageRef.current) {
        gsap.to(bgImageRef.current, {
          yPercent: 6,
          scale: 1.04,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="inicio"
      className="relative flex h-[calc(100svh-75px)] min-h-[490px] max-h-[740px] flex-col overflow-hidden bg-[#071722] text-white"
    >
      {/* Full-Bleed Hero Background Photography — Higher Presence on Right 40% */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <img
          ref={bgImageRef}
          src={MEDIA_ASSETS.heroDesktop}
          alt=""
          fetchPriority="high"
          className="hidden h-full w-full scale-[1.02] object-cover object-[74%_45%] will-change-transform sm:block"
        />
        <img
          src={MEDIA_ASSETS.heroMobile}
          alt=""
          fetchPriority="high"
          className="h-full w-full object-cover object-center sm:hidden"
        />
        {/* Calibrated Scrim — High Contrast Left 60%, Vibrant Unobstructed Photography Across Right 40% */}
        <div
          className="absolute inset-0 hidden sm:block"
          style={{
            background:
              'linear-gradient(90deg, rgba(7,23,34,0.93) 0%, rgba(7,23,34,0.80) 48%, rgba(7,23,34,0.32) 68%, rgba(7,23,34,0.08) 100%), linear-gradient(0deg, rgba(7,23,34,0.86) 0%, rgba(7,23,34,0.04) 42%)',
          }}
        />
        <div
          className="absolute inset-0 sm:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(7,23,34,0.82) 0%, rgba(7,23,34,0.68) 52%, rgba(7,23,34,0.92) 100%)',
          }}
        />
      </div>

      {/* Tight Vertical Container — Aligned Strictly to Unified 1280px Grid & Clear of Dock */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1280px] flex-1 flex-col justify-between px-4 pt-3 pb-[78px] sm:px-8 sm:pt-4 sm:pb-[78px] lg:px-10 lg:pt-5 lg:pb-[82px]">
        {/* Asymmetric 2-Column Desktop CSS Grid: 60% Narrative (3fr) / 40% Unobstructed Photography (2fr) */}
        <div
          data-testid="hero-asymmetric-grid"
          className="grid flex-1 grid-cols-1 items-center gap-4 py-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-8"
        >
          {/* Left 60% Column: Title, Proposition & Direct Actions */}
          <div className="flex flex-col justify-center">
            <BlurReveal>
              <p className="font-mono text-[11px] font-medium tracking-[0.06em] text-[#B7DBF0] sm:text-xs">
                Baixada Santista e Vale do Ribeira · Representação Oficial
              </p>
            </BlurReveal>

            <BlurReveal delay={0.04}>
              <h1
                className="mt-2 max-w-[18ch] text-balance font-display font-bold tracking-[-0.035em] text-white sm:mt-2.5"
                style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3.55rem)', lineHeight: 1.03 }}
              >
                Roma, Soprano e Carbografite{' '}
                <span className="text-[#A8D1E7]">direto da fábrica.</span>
              </h1>
            </BlurReveal>

            <BlurReveal delay={0.08}>
              <p className="mt-2.5 max-w-[50ch] text-sm leading-[1.55] text-[#DFECF4] sm:text-[15px] lg:text-base">
                Pintura, elétrica, fechaduras, ferragens, EPIs e solda para o estoque da sua
                loja — com faturamento no CNPJ e atendimento próximo de Carlos e Eduardo.
              </p>
            </BlurReveal>

            <BlurReveal
              delay={0.12}
              className="mt-4 flex flex-wrap items-center gap-2.5 sm:mt-5"
            >
              <motion.a
                href="#cotacao"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={TACTILE_SPRING}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#0D2534] whitespace-nowrap shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-colors duration-150 hover:bg-[#DCEBF4] sm:px-5"
              >
                <QuoteDocSvg className="h-4 w-4 shrink-0 text-[#285E7B]" />
                <span>Montar orçamento</span>
              </motion.a>

              <motion.a
                href="#produtos"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={TACTILE_SPRING}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-white/30 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white backdrop-blur-xs whitespace-nowrap transition-colors duration-150 hover:border-white/70 hover:bg-white/15 sm:px-5"
              >
                <LayersGridSvg className="h-4 w-4 shrink-0 text-[#A8D1E7]" />
                <span>Ver produtos</span>
              </motion.a>
            </BlurReveal>
          </div>

          {/* Right 40% Column: Open, Unobstructed Stage for Full-Bleed Product Photography */}
          <div className="hidden lg:block" aria-hidden="true" />
        </div>

        {/* Open Borderless Typographic Metrics Strip — Clean, Non-Boxy & Clear of Floating Dock */}
        <motion.dl
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.16, ease: FLUID_EASE }}
          className="grid shrink-0 grid-cols-2 gap-x-6 gap-y-2.5 border-t border-white/16 pt-3 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-10 lg:pt-3.5"
        >
          {HERO_STATS.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-7 w-[2px] shrink-0 rounded-full bg-gradient-to-b from-[#A8D1E7] to-[#A8D1E7]/15"
              />
              <div>
                <dt className="font-display text-lg font-bold leading-none tracking-tight text-white tabular-nums sm:text-[22px]">
                  <CountUpMetric target={stat.target} suffix={stat.suffix} />
                </dt>
                <dd className="mt-0.5 text-[11px] font-medium text-[#C8DCE8] sm:text-xs">
                  {stat.label}
                </dd>
              </div>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
