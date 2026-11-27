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
import { BlurReveal, SpotlightSurface } from './FluidMotion';
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
 * and carbografite (6.02:1) so all 3 brand marks share identical optical weight.
 */
const LOGO_OPTICAL_CLASS: Record<BrandId, string> = {
  roma: 'h-[30px] sm:h-[34px] max-w-[152px]',
  soprano: 'h-[22px] sm:h-[24px] max-w-[180px]',
  carbografite: 'h-[25px] sm:h-[28px] max-w-[180px]',
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
            Representação oficial
          </p>
          <h2 className="mt-1.5 font-display text-2xl font-bold tracking-[-0.03em] text-[#0D2534] sm:text-3xl lg:text-[34px]">
            As fábricas que levamos para a sua loja.
          </h2>
          <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-[#425663] sm:text-[15.5px]">
            Consulte os catálogos atualizados de cada indústria e monte seu pedido
            com faturamento direto no CNPJ.
          </p>
        </BlurReveal>

        {/* Stacked Editorial Factory Blocks — One Below Another with Authentic Factory History */}
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
                initial={{ opacity: 0, y: 26, scale: 0.985 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={VIEWPORT_CONFIG}
                transition={{
                  duration: 0.46,
                  delay: idx * 0.08,
                  ease: FLUID_EASE,
                }}
                className={`relative ${isCatalogOpen ? 'z-30' : 'z-10'}`}
              >
                <SpotlightSurface
                  tone="light"
                  className="cluis-block cluis-block-interactive group grid grid-cols-1 rounded-2xl lg:grid-cols-12"
                >
                  {/* Left: Standardized Factory Aerial Photography */}
                  <div className="relative h-[220px] overflow-hidden rounded-t-2xl bg-[#0B2231] sm:h-[250px] lg:col-span-5 lg:h-auto lg:min-h-[276px] lg:rounded-t-none lg:rounded-l-2xl">
                    <SafeImage
                      src={brand.factoryImage}
                      alt={brand.factoryImageAlt}
                      fallbackTitle={`Fábrica ${brand.name}`}
                      className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#071722]/72 via-[#071722]/15 to-transparent"
                    />
                    <span className="absolute bottom-3.5 left-4 font-mono text-[11px] font-medium tracking-[0.02em] text-[#E6F1F8]">
                      {brand.origin} · Desde {brand.since}
                    </span>
                  </div>

                  {/* Right: Standardized Logo, Factory Story & Floating Overlay Catalog Actions */}
                  <div className="relative z-10 flex flex-col justify-between p-6 sm:p-7 lg:col-span-7 lg:p-8">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5EEF4] pb-4">
                        <div
                          data-testid={`factory-logo-stage-${brand.id}`}
                          className="flex h-11 items-center"
                        >
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            data-testid={`factory-logo-${brand.id}`}
                            className={`w-auto object-contain ${LOGO_OPTICAL_CLASS[brand.id]}`}
                          />
                        </div>
                        <span className="text-xs font-semibold text-[#285E7B]">
                          {brand.specialty}
                        </span>
                      </div>

                      <p className="mt-4 text-sm leading-[1.7] text-[#354B58] sm:text-[15px]">
                        {brand.description}
                      </p>

                      <p className="mt-3 text-xs font-medium text-[#586B78]">
                        {brand.highlight}
                      </p>
                    </div>

                    {/* Action Bar — Floating Overlay Catalog Dropdown NEVER Pushes Layout */}
                    <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#E5EEF4] pt-5">
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
                              className={`inline-flex min-h-[42px] items-center justify-between gap-3 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors duration-150 sm:text-sm ${
                                isCatalogOpen
                                  ? 'bg-[#0D2534] text-white'
                                  : 'bg-[#16394E] text-white hover:bg-[#285E7B]'
                              }`}
                            >
                              <span className="inline-flex items-center gap-2">
                                <CatalogBookSvg className="h-4 w-4 shrink-0" />
                                <span>Catálogos ({brandCatalogs.length})</span>
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
                                  className="absolute left-0 top-[calc(100%+8px)] z-50 w-[270px] divide-y divide-[#EDF3F7] overflow-hidden rounded-xl border border-[#B8CAD6] bg-white p-1.5 shadow-[0_24px_52px_rgba(7,23,34,0.24)]"
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
                            <span>Abrir catálogo</span>
                          </motion.a>
                        )}
                      </div>

                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        transition={TACTILE_SPRING}
                        onClick={() => onExploreBrandInCarousel(brand.id)}
                        className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-[#C6D5E0] bg-[#F5F9FC] px-4 py-2 text-xs font-semibold text-[#16394E] whitespace-nowrap transition-colors hover:border-[#285E7B] hover:bg-white hover:text-[#0D2534] sm:text-sm"
                      >
                        <LayersGridSvg className="h-4 w-4 shrink-0 text-[#285E7B]" />
                        <span>Ver produtos</span>
                      </motion.button>

                      <a
                        href={brand.officialSite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto inline-flex min-h-[40px] items-center gap-1.5 text-xs font-semibold text-[#586B78] transition-colors hover:text-[#0D2534]"
                      >
                        <FactoryGlobeSvg className="h-3.5 w-3.5 shrink-0" />
                        <span>Site oficial</span>
                      </a>
                    </div>
                  </div>
                </SpotlightSurface>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
