import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BRANDS, PDF_CATALOGS, type BrandId } from '../data/cluisData';
import {
  CatalogBookSvg,
  DisclosureSvg,
  FactoryGlobeSvg,
  LayersGridSvg,
  PdfBadgeSvg,
} from './CluisIcons';
import { BlurReveal } from './FluidMotion';
import {
  FLUID_EASE,
  FLUID_SPRING,
  TACTILE_SPRING,
  VIEWPORT_CONFIG,
} from './MotionPrimitives';
import { SafeImage } from './SafeImage';

interface BrandsSectionProps {
  onExploreBrandInCarousel: (brandId: BrandId) => void;
}

/**
 * Calibrated logo heights for roma-pinceis-clean (4.25:1), soprano (7.04:1),
 * and carbografite (6.02:1) so all 3 factory blocks display uniform visual mass.
 */
const LOGO_OPTICAL_CLASS: Record<BrandId, string> = {
  roma: 'h-8 max-w-[146px]',
  soprano: 'h-[24px] max-w-[178px]',
  carbografite: 'h-[27px] max-w-[178px]',
};

export function BrandsSection({ onExploreBrandInCarousel }: BrandsSectionProps) {
  const [openCatalogBrand, setOpenCatalogBrand] = useState<BrandId | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!openCatalogBrand) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest('[data-catalog-dropdown]')) {
        setOpenCatalogBrand(null);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenCatalogBrand(null);
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [openCatalogBrand]);

  return (
    <section
      ref={sectionRef}
      id="representacoes"
      className="band-slate py-14 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
        <BlurReveal>
          <p className="font-mono text-xs font-semibold tracking-[0.08em] uppercase text-[#285E7B]">
            Fábricas parceiras e catálogos
          </p>
          <h2 className="mt-1.5 font-display text-2xl font-bold tracking-[-0.03em] text-[#0D2534] sm:text-3xl lg:text-[34px]">
            Três indústrias de referência com faturamento direto da fábrica.
          </h2>
        </BlurReveal>

        {/* Stacked Editorial Blocks — One Below Another, Staggered Slide-Up Reveal */}
        <div
          data-testid="brands-stacked-list"
          className="mt-8 space-y-6"
        >
          {BRANDS.map((brand, idx) => {
            const brandCatalogs = PDF_CATALOGS.filter(
              (cat) => cat.brandId === brand.id,
            );
            const hasMultipleCatalogs = brandCatalogs.length > 1;
            const isCatalogOpen = openCatalogBrand === brand.id;

            return (
              <motion.article
                key={brand.id}
                id={`marca-${brand.id}`}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT_CONFIG}
                transition={{
                  duration: 0.44,
                  delay: idx * 0.08,
                  ease: FLUID_EASE,
                }}
                className={`group relative grid grid-cols-1 rounded-2xl bg-white shadow-[0_14px_36px_rgba(13,37,52,0.08)] ring-1 ring-[#0D2534]/[0.07] transition-shadow duration-200 hover:shadow-[0_22px_48px_rgba(13,37,52,0.13)] lg:grid-cols-12 ${
                  isCatalogOpen ? 'z-30' : 'z-10'
                }`}
              >
                {/* Left 5 Cols: Standardized Aerial Factory Photo (Uniform Height & Framing) */}
                <div className="relative h-[220px] overflow-hidden rounded-t-2xl bg-[#0B2231] sm:h-[250px] lg:col-span-5 lg:h-[276px] lg:rounded-t-none lg:rounded-l-2xl">
                  <SafeImage
                    src={brand.factoryImage}
                    alt={brand.factoryImageAlt}
                    fallbackTitle={`Fábrica ${brand.name}`}
                    className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                  />
                  <span className="absolute bottom-3 left-3 rounded-lg bg-[#071722]/85 px-2.5 py-1 font-mono text-[11px] font-medium text-[#E4EFF5] backdrop-blur-xs">
                    {brand.origin} · Desde {brand.since}
                  </span>
                </div>

                {/* Right 7 Cols: Optically Standardized Logo + Authentic Factory Copy + Overlay Catalog Dropdown */}
                <div className="flex flex-col justify-between p-6 sm:p-7 lg:col-span-7 lg:px-8 lg:py-7">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div
                        data-testid={`factory-logo-stage-${brand.id}`}
                        className="flex h-10 items-center"
                      >
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          data-testid={`factory-logo-${brand.id}`}
                          className={`w-auto object-contain ${LOGO_OPTICAL_CLASS[brand.id]}`}
                        />
                      </div>
                      <span className="text-xs font-medium text-[#586B78]">
                        {brand.highlight}
                      </span>
                    </div>

                    <h3 className="mt-3 font-display text-lg font-bold tracking-tight text-[#0D2534] sm:text-xl">
                      {brand.specialty}
                    </h3>

                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#425663] sm:text-[15px]">
                      {brand.description}
                    </p>
                  </div>

                  {/* Action Bar — Floating Overlay Dropdown NEVER Pushes Content Down */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8F0F5] pt-4">
                    <div
                      data-testid={`factory-catalogs-${brand.id}`}
                      data-catalog-dropdown
                      className="relative"
                    >
                      {hasMultipleCatalogs ? (
                        <>
                          <motion.button
                            type="button"
                            aria-expanded={isCatalogOpen}
                            aria-controls={`catalogs-panel-${brand.id}`}
                            whileTap={{ scale: 0.98 }}
                            transition={TACTILE_SPRING}
                            onClick={() =>
                              setOpenCatalogBrand((prev) =>
                                prev === brand.id ? null : brand.id,
                              )
                            }
                            className={`inline-flex min-h-[42px] items-center justify-between gap-2.5 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors duration-150 sm:text-sm ${
                              isCatalogOpen
                                ? 'bg-[#0D2534] text-white'
                                : 'bg-[#16394E] text-white hover:bg-[#285E7B]'
                            }`}
                          >
                            <CatalogBookSvg className="h-4 w-4 shrink-0" />
                            <span>
                              Catálogos {brand.shortName} ({brandCatalogs.length})
                            </span>
                            <DisclosureSvg
                              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                                isCatalogOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </motion.button>

                          <AnimatePresence>
                            {isCatalogOpen && (
                              <motion.ul
                                id={`catalogs-panel-${brand.id}`}
                                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                                transition={FLUID_SPRING}
                                style={{ transformOrigin: 'top left' }}
                                className="absolute left-0 top-[calc(100%+8px)] z-50 w-[290px] max-w-[calc(100vw-3rem)] divide-y divide-[#EDF3F7] overflow-hidden rounded-xl border border-[#CBD9E3] bg-white p-1 shadow-[0_22px_50px_rgba(7,23,34,0.22)]"
                              >
                                {brandCatalogs.map((cat) => (
                                  <li key={cat.id}>
                                    <a
                                      href={cat.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={() => setOpenCatalogBrand(null)}
                                      className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-xs font-medium text-[#1C2E3A] transition-colors hover:bg-[#EEF4F8] hover:text-[#0D2534]"
                                    >
                                      <span className="flex items-center gap-2 truncate">
                                        <PdfBadgeSvg className="h-3.5 w-3.5 shrink-0 text-[#285E7B]" />
                                        <span className="truncate">{cat.label}</span>
                                      </span>
                                      <span className="shrink-0 font-mono text-[10px] font-semibold uppercase text-[#285E7B]">
                                        PDF
                                      </span>
                                    </a>
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <motion.a
                          href={brandCatalogs[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          transition={TACTILE_SPRING}
                          className="inline-flex min-h-[42px] items-center gap-2.5 rounded-xl bg-[#16394E] px-4 py-2 text-xs font-semibold text-white whitespace-nowrap transition-colors duration-150 hover:bg-[#285E7B] sm:text-sm"
                        >
                          <CatalogBookSvg className="h-4 w-4 shrink-0" />
                          <span>Catálogo Geral {brand.shortName}</span>
                          <span className="font-mono text-[10px] font-semibold uppercase text-[#B8D9EA]">
                            PDF
                          </span>
                        </motion.a>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-5 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => onExploreBrandInCarousel(brand.id)}
                        className="group/line inline-flex items-center gap-1.5 text-[#16394E] transition-colors hover:text-[#285E7B]"
                      >
                        <LayersGridSvg className="h-3.5 w-3.5 shrink-0 text-[#285E7B]" />
                        <span className="border-b border-transparent pb-0.5 transition-colors group-hover/line:border-[#285E7B]">
                          Ver produtos {brand.shortName}
                        </span>
                      </button>

                      <a
                        href={brand.officialSite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[#586B78] transition-colors hover:text-[#0D2534]"
                      >
                        <FactoryGlobeSvg className="h-3.5 w-3.5 shrink-0" />
                        <span>Site da fábrica</span>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
