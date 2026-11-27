import { motion } from 'framer-motion';
import { MEDIA_ASSETS } from '../data/cluisData';
import { LayersGridSvg, QuoteDocSvg } from './CluisIcons';
import { BlurReveal, CountUpMetric } from './FluidMotion';
import { FLUID_EASE, TACTILE_SPRING } from './MotionPrimitives';

const HERO_STATS = [
  { target: 15, suffix: '+', label: 'Anos de estrada na região' },
  { target: 3, suffix: '', label: 'Fábricas oficiais' },
  { target: 32, suffix: '', label: 'Municípios atendidos' },
  { target: 100, suffix: '%', label: 'Faturamento direto no CNPJ' },
];

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[560px] flex-col justify-between overflow-hidden bg-[#071722] text-white sm:h-[calc(100svh-76px)] sm:max-h-[780px]"
    >
      {/* Crisp Static Full-Bleed Background Photography — Zero Parallax Motion */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <img
          src={MEDIA_ASSETS.heroDesktop}
          alt=""
          fetchPriority="high"
          className="hidden h-full w-full object-cover object-[76%_44%] sm:block"
        />

        <img
          src={MEDIA_ASSETS.heroMobile}
          alt=""
          fetchPriority="high"
          className="h-full w-full object-cover object-center sm:hidden"
        />

        {/* Editorial Directional Scrim — High Contrast Left 60%, Open Photography Right 40% */}
        <div
          className="absolute inset-0 hidden sm:block"
          style={{
            background:
              'linear-gradient(90deg, rgba(7,23,34,0.94) 0%, rgba(7,23,34,0.82) 45%, rgba(7,23,34,0.34) 68%, rgba(7,23,34,0.08) 100%), linear-gradient(0deg, rgba(7,23,34,0.72) 0%, rgba(7,23,34,0.06) 36%)',
          }}
        />
        <div
          className="absolute inset-0 sm:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(7,23,34,0.82) 0%, rgba(7,23,34,0.68) 52%, rgba(7,23,34,0.94) 100%)',
          }}
        />
      </div>

      {/* Main 60/40 Asymmetric Desktop Grid — Vertically Centered Within Viewport Fold */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1376px] flex-1 flex-col justify-center px-4 pt-8 pb-4 sm:px-6 sm:pt-6 sm:pb-3 lg:px-8">
        <div
          data-testid="hero-asymmetric-grid"
          className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12"
        >
          {/* Left 60% Editorial Column */}
          <div className="flex flex-col justify-center">
            <BlurReveal>
              <h1
                className="max-w-[16ch] text-balance font-display font-bold tracking-[-0.036em] text-white"
                style={{
                  fontSize: 'clamp(2.2rem, 3.9vw, 3.65rem)',
                  lineHeight: 1.05,
                }}
              >
                Parceria direta da fábrica{' '}
                <span className="text-[#A8D1E7]">
                  para o balcão da sua loja.
                </span>
              </h1>
            </BlurReveal>

            <BlurReveal delay={0.06}>
              <p className="mt-4 max-w-[48ch] text-[15px] leading-[1.68] text-[#DFECF4] sm:mt-5 sm:text-[16px] lg:text-[17px]">
                Representação oficial da Roma Pincéis, Soprano e Carbografite na
                Baixada Santista e no Vale do Ribeira — tabela de indústria,
                pedido faturado no seu CNPJ e suporte comercial próximo para
                manter seu estoque girando.
              </p>
            </BlurReveal>

            <BlurReveal
              delay={0.12}
              className="mt-7 flex flex-wrap items-center gap-3.5"
            >
              <motion.a
                href="#cotacao"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={TACTILE_SPRING}
                className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#0D2534] whitespace-nowrap shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition-colors duration-150 hover:bg-[#DCEBF4]"
              >
                <QuoteDocSvg className="h-4 w-4 shrink-0 text-[#285E7B]" />
                <span>Montar orçamento</span>
              </motion.a>

              <motion.a
                href="#produtos"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={TACTILE_SPRING}
                className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-white/[0.12] px-6 py-3 text-sm font-semibold text-white whitespace-nowrap transition-colors duration-150 hover:bg-white/22"
              >
                <LayersGridSvg className="h-4 w-4 shrink-0 text-[#A8D1E7]" />
                <span>Ver linhas</span>
              </motion.a>
            </BlurReveal>
          </div>

          {/* Right 40% Open Visual Breathing Stage for Photography */}
          <div className="hidden lg:block" aria-hidden="true" />
        </div>
      </div>

      {/* Elevated Centered Floating Dark Translucent Stats Bar */}
      <div className="relative z-10 mx-auto w-full max-w-[1376px] px-4 pb-6 sm:px-6 sm:pb-9 lg:px-8">
        <motion.div
          data-testid="hero-floating-stats-bar"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.14, ease: FLUID_EASE }}
          className="mx-auto w-full max-w-[1040px] rounded-2xl border border-white/15 bg-[#081C29]/88 px-5 py-4 shadow-[0_20px_48px_rgba(0,0,0,0.38)] sm:px-8 sm:py-5"
        >
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-center sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-white/12">
            {HERO_STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center sm:px-4"
              >
                <dt className="font-display text-2xl font-bold leading-none tracking-tight text-white tabular-nums sm:text-[26px]">
                  <CountUpMetric target={stat.target} suffix={stat.suffix} />
                </dt>
                <dd className="mt-1.5 text-xs font-medium leading-snug text-[#C7DEEB]">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  );
}
