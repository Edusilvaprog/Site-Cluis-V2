import { motion } from 'framer-motion';
import {
  BRANDS,
  PRODUCT_LINES,
  type BrandId,
  type ProductLine,
} from '../data/cluisData';
import { MagnifierSvg } from './CluisIcons';
import { BlurReveal } from './FluidMotion';
import {
  FLUID_EASE,
  FLUID_SPRING,
  VIEWPORT_CONFIG,
} from './MotionPrimitives';
import { SafeImage } from './SafeImage';

interface ProductCarouselSectionProps {
  activeBrand: BrandId;
  onSelectBrand: (brandId: BrandId) => void;
  onInspectLine: (line: ProductLine) => void;
}

/**
 * Calibrated logo heights for roma-pinceis-clean (4.25:1), soprano (7.04:1),
 * and carbografite (6.02:1) so all 3 marks carry equal visual weight centered side-by-side.
 */
const TAB_LOGO_OPTICAL_CLASS: Record<BrandId, string> = {
  roma: 'h-[24px] sm:h-[28px] max-w-[118px]',
  soprano: 'h-[19px] sm:h-[22px] max-w-[154px]',
  carbografite: 'h-[21px] sm:h-[25px] max-w-[150px]',
};

const gridStaggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.065,
      delayChildren: 0.03,
    },
  },
};

const cardRevealVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: FLUID_EASE,
    },
  },
};

export function ProductCarouselSection({
  activeBrand,
  onSelectBrand,
  onInspectLine,
}: ProductCarouselSectionProps) {
  const brandLines = PRODUCT_LINES.filter((line) => line.brandId === activeBrand);
  const currentBrand = BRANDS.find((b) => b.id === activeBrand) ?? BRANDS[0];

  return (
    <section
      id="produtos"
      className="band-mist py-14 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
        {/* Centered Header + Standardized Side-by-Side Brand Logo Selector */}
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <BlurReveal>
            <p className="font-mono text-xs font-semibold tracking-[0.08em] uppercase text-[#285E7B]">
              Produtos para a sua loja
            </p>
            <h2 className="mt-1.5 text-balance font-display text-2xl font-bold tracking-[-0.03em] text-[#0D2534] sm:text-3xl lg:text-[34px]">
              Conheça o que cada fábrica oferece.
            </h2>
          </BlurReveal>

          {/* Optically Standardized 3-Column Logo Bar — Perfectly Centered */}
          <div
            role="tablist"
            aria-label="Selecionar marca para ver as linhas de produtos"
            className="grid w-full grid-cols-3 items-center gap-1.5 rounded-2xl bg-white/85 p-1.5 shadow-[0_8px_24px_rgba(13,37,52,0.06)] ring-1 ring-[#0D2534]/[0.07] lg:w-auto lg:min-w-[540px]"
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
                  onClick={() => onSelectBrand(brand.id)}
                  className={`relative flex h-13 min-w-0 items-center justify-center rounded-xl px-3 transition-opacity duration-200 sm:h-14 sm:px-4 ${
                    active ? 'opacity-100' : 'opacity-45 hover:opacity-85'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="product-grid-brand-indicator"
                      transition={FLUID_SPRING}
                      className="absolute inset-0 rounded-xl bg-[#EDF4F9] ring-1 ring-[#285E7B]/20"
                    />
                  )}
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className={`relative z-10 w-auto object-contain ${TAB_LOGO_OPTICAL_CLASS[brand.id]}`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Responsive CSS Grid with transitions.dev Staggered Slide-Up Reveal */}
        <div
          id={`panel-${activeBrand}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeBrand}`}
          className="mt-8"
        >
          <motion.div
            key={activeBrand}
            data-testid="product-grid"
            aria-label={`Grade de linhas ${currentBrand.name}`}
            variants={gridStaggerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_CONFIG}
            className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] items-stretch gap-5"
          >
            {brandLines.map((line) => (
              <motion.article
                key={line.id}
                data-testid="product-grid-card"
                variants={cardRevealVariants}
                className="flex min-w-0"
              >
                <button
                  type="button"
                  onClick={() => onInspectLine(line)}
                  aria-label={`Ampliar detalhes de ${line.name} (${currentBrand.name})`}
                  className="group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white text-left shadow-[0_10px_28px_rgba(13,37,52,0.06)] ring-1 ring-[#0D2534]/[0.06] transition-[box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(13,37,52,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#285E7B]"
                >
                  {/* Standardized Product Exhibition Frame — Uniform Height & Clean Framing */}
                  <div className="relative flex h-[210px] w-full items-center justify-center overflow-hidden border-b border-[#EDF3F7] bg-[#FAFCFD] p-5">
                    <SafeImage
                      src={line.thumbnail}
                      alt={`${line.exampleLabel} — ${line.name}`}
                      fallbackTitle={line.name}
                      className="max-h-[164px] w-auto max-w-[88%] object-contain transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                    />
                  </div>

                  {/* Balanced Card Body */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <h3 className="font-display text-base font-bold leading-snug tracking-tight text-[#0D2534] transition-colors duration-150 group-hover:text-[#285E7B]">
                        {line.name}
                      </h3>
                      <p className="mt-0.5 text-xs font-medium text-[#586B78]">
                        {line.exampleLabel}
                      </p>
                      <p className="mt-2.5 line-clamp-2 text-[13.5px] leading-relaxed text-[#425663]">
                        {line.description}
                      </p>
                    </div>

                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#16394E] transition-colors duration-150 group-hover:text-[#285E7B]">
                      <MagnifierSvg className="h-3.5 w-3.5 shrink-0" />
                      <span>Ver detalhes</span>
                    </span>
                  </div>
                </button>
              </motion.article>
            ))}
          </motion.div>

          {/* Quiet Unboxed Metadata Footer */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-[#586B78]">
            <p className="tabular-nums">
              <strong className="font-semibold text-[#0D2534]">
                {currentBrand.name}
              </strong>{' '}
              · {brandLines.length} categorias de produtos
            </p>
            <p>Clique em qualquer produto para ver mais detalhes</p>
          </div>
        </div>
      </div>
    </section>
  );
}
