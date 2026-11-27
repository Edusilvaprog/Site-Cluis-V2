import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  BRANDS,
  PRODUCT_LINES,
  type BrandId,
  type ProductLine,
} from '../data/cluisData';
import { MagnifierSvg } from './CluisIcons';
import { BlurReveal } from './FluidMotion';
import { FLUID_EASE, TACTILE_SPRING } from './MotionPrimitives';
import { SafeImage } from './SafeImage';

interface ProductCarouselSectionProps {
  activeBrand: BrandId;
  onSelectBrand: (brandId: BrandId) => void;
  onInspectLine: (line: ProductLine, initialMode?: 'photo' | '3d') => void;
}

const BRAND_ORDER: BrandId[] = ['roma', 'soprano', 'carbografite'];

/**
 * Dynamic subtitle tailored to whichever represented factory is currently active.
 */
const BRAND_SUBTITLES: Record<BrandId, string> = {
  roma: 'Roma Pincéis — trinchas, rolos antigota e acessórios de pintura de giro rápido no balcão.',
  soprano:
    'Soprano — fechaduras com opções em inox para o litoral, elétrica certificada INMETRO e ferragens.',
  carbografite:
    'Carbografite — EPIs com CA vigente, equipamentos de solda e corte e ferramentas profissionais.',
};

/**
 * Calibrated logo heights for roma-pinceis-clean (4.25:1), soprano (7.04:1),
 * and carbografite (6.02:1) so all 3 brand marks sit side-by-side in equal optical scale.
 */
const TAB_LOGO_OPTICAL_CLASS: Record<BrandId, string> = {
  roma: 'h-[24px] sm:h-[26px] max-w-[116px]',
  soprano: 'h-[19px] sm:h-[21px] max-w-[148px]',
  carbografite: 'h-[21px] sm:h-[24px] max-w-[146px]',
};

const SLIDING_TAB_SPRING = {
  type: 'spring' as const,
  stiffness: 340,
  damping: 30,
  mass: 0.78,
};

export function ProductCarouselSection({
  activeBrand,
  onSelectBrand,
  onInspectLine,
}: ProductCarouselSectionProps) {
  const prevIndexRef = useRef<number>(BRAND_ORDER.indexOf(activeBrand));
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const currentIndex = BRAND_ORDER.indexOf(activeBrand);
  const slideDirection = currentIndex >= prevIndexRef.current ? 1 : -1;

  const brandLines = PRODUCT_LINES.filter((line) => line.brandId === activeBrand);
  const currentBrand = BRANDS.find((b) => b.id === activeBrand) ?? BRANDS[0];

  const syncScrollControls = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 8);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (el) {
      el.scrollTo({ left: 0, behavior: 'auto' });
    }
    const raf = window.requestAnimationFrame(syncScrollControls);
    window.addEventListener('resize', syncScrollControls);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', syncScrollControls);
    };
  }, [activeBrand, syncScrollControls]);

  const handleSelectBrand = (nextBrand: BrandId) => {
    prevIndexRef.current = currentIndex;
    onSelectBrand(nextBrand);
  };

  const scrollTrackBy = (direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>(
      '[data-testid="product-grid-card"]',
    );
    const step = firstCard ? firstCard.offsetWidth + 28 : 380;
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  return (
    <section id="produtos" className="band-mist py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1376px] px-4 sm:px-6 lg:px-8">
        {/* Natural Heading + Dynamic Brand-Specific Subtitle + Clean Brand Switcher */}
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-[560px]">
            <BlurReveal>
              <p className="font-mono text-xs font-semibold tracking-[0.08em] uppercase text-[#285E7B]">
                Linhas representadas
              </p>
              <h2 className="mt-1.5 text-balance font-display text-2xl font-bold tracking-[-0.03em] text-[#0D2534] sm:text-3xl lg:text-[35px]">
                Conheça os produtos de cada fábrica.
              </h2>
            </BlurReveal>

            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={activeBrand}
                data-testid="brand-dynamic-subtitle"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: FLUID_EASE }}
                className="mt-2.5 text-sm leading-relaxed text-[#425663] sm:text-[15.5px]"
              >
                {BRAND_SUBTITLES[activeBrand]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between lg:w-auto lg:justify-end">
            {/* Natural White-Capsule Sliding Brand Switcher (Zero Harsh Underline) */}
            <div
              role="tablist"
              aria-label="Selecionar marca para ver as linhas de produtos"
              className="grid w-full grid-cols-3 items-center gap-1.5 rounded-2xl bg-[#CBDCE9] p-1.5 shadow-[inset_0_1px_4px_rgba(11,34,49,0.09)] lg:w-auto lg:min-w-[500px]"
            >
              {BRANDS.map((brand) => {
                const active = activeBrand === brand.id;
                return (
                  <button
                    key={brand.id}
                    type="button"
                    role="tab"
                    id={`tab-${brand.id}`}
                    aria-selected={active}
                    aria-controls={`panel-${brand.id}`}
                    aria-label={brand.name}
                    onClick={() => handleSelectBrand(brand.id)}
                    className={`relative flex h-14 min-w-0 items-center justify-center rounded-xl px-3 transition-opacity duration-200 sm:h-[58px] sm:px-5 ${
                      active
                        ? 'opacity-100'
                        : 'opacity-50 grayscale-[35%] hover:opacity-88 hover:grayscale-0'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="product-grid-brand-indicator"
                        transition={SLIDING_TAB_SPRING}
                        className="absolute inset-0 rounded-xl bg-white shadow-[0_8px_22px_-4px_rgba(11,34,49,0.16),0_2px_6px_rgba(40,94,123,0.08)] ring-1 ring-[#285E7B]/14"
                      />
                    )}
                    <motion.img
                      src={brand.logo}
                      alt={brand.name}
                      animate={{ scale: active ? 1.04 : 0.96 }}
                      transition={TACTILE_SPRING}
                      className={`relative z-10 w-auto object-contain ${TAB_LOGO_OPTICAL_CLASS[brand.id]}`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Horizontal Carousel Arrow Controls */}
            <div className="flex shrink-0 items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => scrollTrackBy(-1)}
                disabled={!canScrollPrev}
                aria-label="Ver produtos anteriores"
                data-testid="carousel-prev-btn"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#C3D5E1] bg-white text-[#0D2534] shadow-xs transition-all duration-150 hover:border-[#285E7B] hover:bg-[#0D2534] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[#C3D5E1] disabled:hover:bg-white disabled:hover:text-[#0D2534]"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollTrackBy(1)}
                disabled={!canScrollNext}
                aria-label="Ver próximos produtos"
                data-testid="carousel-next-btn"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#C3D5E1] bg-white text-[#0D2534] shadow-xs transition-all duration-150 hover:border-[#285E7B] hover:bg-[#0D2534] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[#C3D5E1] disabled:hover:bg-white disabled:hover:text-[#0D2534]"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Single-Row Horizontal Carousel Track — Never Wraps to a Second Line */}
        <div
          id={`panel-${activeBrand}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeBrand}`}
          className="relative mt-9"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeBrand}
              ref={trackRef}
              onScroll={syncScrollControls}
              data-testid="product-carousel-track"
              aria-label={`Carrossel de linhas ${currentBrand.name}`}
              initial={{ opacity: 0, x: slideDirection * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: slideDirection * -18 }}
              transition={{ duration: 0.24, ease: FLUID_EASE }}
              className="no-scrollbar flex flex-nowrap items-stretch gap-7 overflow-x-auto scroll-smooth snap-x snap-mandatory pt-1 pb-4"
            >
              {brandLines.map((line) => (
                <article
                  key={line.id}
                  data-testid="product-grid-card"
                  className="flex min-h-[396px] w-[300px] shrink-0 snap-start sm:w-[348px] lg:w-[388px]"
                >
                  <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_14px_34px_-10px_rgba(11,34,49,0.12),0_3px_10px_rgba(11,34,49,0.04)] transition-all duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_26px_52px_-12px_rgba(11,34,49,0.19),0_8px_20px_-6px_rgba(40,94,123,0.12)]">
                    <button
                      type="button"
                      onClick={() => onInspectLine(line, 'photo')}
                      aria-label={`Ampliar detalhes de ${line.name} (${currentBrand.name})`}
                      className="relative z-10 flex flex-1 flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#285E7B]"
                    >
                      <div className="relative flex h-[228px] w-full items-center justify-center overflow-hidden bg-gradient-to-b from-[#F8FBFD] to-[#EEF5FA] p-5">
                        <SafeImage
                          src={line.thumbnail}
                          alt={line.name}
                          fallbackTitle={line.name}
                          className="max-h-[188px] w-auto max-w-[90%] object-contain mix-blend-multiply transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-between px-6 pt-5 pb-2">
                        <div>
                          <h3 className="font-display text-[18px] font-bold leading-snug tracking-tight text-[#0D2534] transition-colors duration-150 group-hover:text-[#285E7B]">
                            {line.name}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-[#425663]">
                            {line.description}
                          </p>
                        </div>
                      </div>
                    </button>

                    <div className="relative z-10 flex items-center justify-between gap-2 px-6 pt-2 pb-5">
                      <button
                        type="button"
                        onClick={() => onInspectLine(line, 'photo')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16394E] transition-colors duration-150 hover:text-[#285E7B]"
                      >
                        <MagnifierSvg className="h-3.5 w-3.5 shrink-0" />
                        <span>Ver detalhes</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onInspectLine(line, '3d')}
                        aria-label={`Inspecionar ${line.name} em 3D`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF2F8] px-3 py-1.5 text-[11px] font-bold text-[#16394E] transition-colors duration-150 hover:bg-[#0D2534] hover:text-white"
                      >
                        <Box className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>Ver em 3D</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
