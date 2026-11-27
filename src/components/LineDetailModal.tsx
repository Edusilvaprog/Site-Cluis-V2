import { Suspense, lazy, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { BRANDS, type BrandId, type ProductLine } from '../data/cluisData';
import { getProduct3DSpec } from '../utils/product3dSpecs';
import { CheckDrawSvg, QuoteDocSvg } from './CluisIcons';
import { FLUID_EASE, FLUID_SPRING, TACTILE_SPRING } from './MotionPrimitives';
import { SafeImage } from './SafeImage';

const Product3DViewer = lazy(() =>
  import('./Product3DViewer').then((m) => ({ default: m.Product3DViewer })),
);

export type LineModalViewMode = 'photo' | '3d';

interface LineDetailModalProps {
  line: ProductLine | null;
  initialViewMode?: LineModalViewMode;
  onClose: () => void;
  onRequestQuoteForLine: (line: ProductLine) => void;
}

/**
 * Calibrated logo heights for roma-pinceis-clean (4.25:1), soprano (7.04:1),
 * and carbografite (6.02:1) so opening ANY product shows a uniform brand header.
 */
const MODAL_LOGO_OPTICAL_CLASS: Record<BrandId, string> = {
  roma: 'h-[28px] sm:h-[32px] max-w-[140px]',
  soprano: 'h-[22px] sm:h-[24px] max-w-[172px]',
  carbografite: 'h-[24px] sm:h-[27px] max-w-[168px]',
};

export function LineDetailModal({
  line,
  initialViewMode = 'photo',
  onClose,
  onRequestQuoteForLine,
}: LineDetailModalProps) {
  const [viewMode, setViewMode] = useState<LineModalViewMode>(initialViewMode);

  useEffect(() => {
    if (line) {
      setViewMode(initialViewMode);
    }
  }, [line, initialViewMode]);

  useEffect(() => {
    if (!line) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [line, onClose]);

  const brand = line ? BRANDS.find((b) => b.id === line.brandId) : null;
  const spec3d = line ? getProduct3DSpec(line) : null;

  return (
    <AnimatePresence>
      {line && brand && spec3d ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="line-detail-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: FLUID_EASE }}
            onClick={onClose}
            className="fixed inset-0 bg-[#071722]/78"
          />

          {/* Standardized Rounded 2-Column Lightbox — Official Studio Photo + Interactive 3D Inspector */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={FLUID_SPRING}
            className="relative z-10 grid max-h-[92vh] w-full max-w-5xl grid-cols-1 overflow-y-auto rounded-3xl border border-[#C2D2DE] bg-white shadow-[0_28px_72px_rgba(7,23,34,0.38)] lg:grid-cols-12 lg:overflow-hidden"
          >
            {/* Close button pinned top-right */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar detalhes do produto"
              className="absolute top-3.5 right-3.5 z-20 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#D5DFE6] bg-white text-[#1C2E3A] transition-colors hover:border-[#16394E] hover:bg-[#16394E] hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Left Column: Official Photo OR Interactive Three.js 3D Product Studio */}
            <div className="relative flex flex-col border-b border-[#E1EBF2] bg-[#E6EFF6] lg:col-span-6 lg:border-r lg:border-b-0">
              {/* Top Mode Switcher Strip (Outside WebGL Canvas so Zero Overlay Clutter) */}
              <div className="flex items-center justify-between gap-2 border-b border-[#D2E0EC] bg-white px-4 py-2.5">
                <div
                  role="tablist"
                  aria-label="Modo de visualização do produto"
                  className="inline-flex rounded-xl bg-[#E4EEF5] p-1"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'photo'}
                    onClick={() => setViewMode('photo')}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      viewMode === 'photo'
                        ? 'bg-white text-[#0D2534] shadow-xs'
                        : 'text-[#4C6270] hover:text-[#0D2534]'
                    }`}
                  >
                    <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Foto oficial</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === '3d'}
                    onClick={() => setViewMode('3d')}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      viewMode === '3d'
                        ? 'bg-[#0D2534] text-white shadow-xs'
                        : 'text-[#4C6270] hover:text-[#0D2534]'
                    }`}
                  >
                    <Box className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Inspecionar em 3D</span>
                  </button>
                </div>

                <span className="hidden font-mono text-[10px] font-semibold uppercase tracking-wider text-[#586B78] sm:inline">
                  {viewMode === '3d' ? 'Estúdio 3D interativo' : 'Catálogo oficial'}
                </span>
              </div>

              {/* Viewport Body */}
              {viewMode === '3d' ? (
                <div className="relative flex-1">
                  <Suspense
                    fallback={
                      <div className="flex h-full min-h-[360px] items-center justify-center gap-2 bg-[#E6EFF6] text-xs font-semibold text-[#16394E] lg:min-h-[460px]">
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        <span>Preparando modelo 3D...</span>
                      </div>
                    }
                  >
                    <Product3DViewer archetype={spec3d.archetype} />
                  </Suspense>
                </div>
              ) : (
                <div className="relative flex flex-1 items-center justify-center bg-gradient-to-b from-[#FFFFFF] to-[#F4F8FB] p-6 sm:p-8 min-h-[340px] lg:min-h-[460px]">
                  <SafeImage
                    src={line.image}
                    alt={line.name}
                    fallbackTitle={line.name}
                    className="max-h-[340px] w-full object-contain lg:max-h-[410px]"
                  />
                </div>
              )}
            </div>

            {/* Right Column: Optically Standardized Brand Logo + Specs / 3D Assembly Breakdown + Quote CTA */}
            <div className="flex flex-col justify-between p-6 sm:p-7 lg:col-span-6">
              <div>
                <div className="flex h-11 items-center border-b border-[#E6EDF2] pb-4 pr-10">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    data-testid="modal-brand-logo"
                    className={`w-auto object-contain ${MODAL_LOGO_OPTICAL_CLASS[brand.id]}`}
                  />
                </div>

                <h3
                  id="line-detail-title"
                  className="mt-5 font-display text-2xl font-bold leading-tight tracking-[-0.025em] text-[#0D2534] sm:text-[26px]"
                >
                  {line.name}
                </h3>

                <p className="mt-2.5 text-sm leading-relaxed text-[#425663] sm:text-[15px]">
                  {line.description}
                </p>

                {viewMode === '3d' ? (
                  <div className="mt-5 border-t border-[#E6EDF2] pt-4">
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#285E7B]">
                      Componentes no modelo 3D · {spec3d.title}
                    </p>
                    <ul className="mt-3 space-y-2.5">
                      {spec3d.parts.map((part) => (
                        <li
                          key={part.id}
                          className="rounded-xl bg-[#F4F8FB] px-3.5 py-2.5"
                        >
                          <p className="text-xs font-bold text-[#0D2534]">
                            {part.label}
                          </p>
                          <p className="mt-0.5 text-xs text-[#4C6270]">
                            {part.materialNote}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="mt-5 border-t border-[#E6EDF2] pt-4">
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#285E7B]">
                      Destaques da linha
                    </p>
                    <ul className="mt-3 space-y-2.5">
                      {line.highlights.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 text-sm font-medium text-[#1C2E3A]"
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#EAF3F8] text-[#16394E]">
                            <CheckDrawSvg className="h-3 w-3" />
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 border-t border-[#E6EDF2] pt-5">
                <motion.button
                  type="button"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={TACTILE_SPRING}
                  onClick={() => onRequestQuoteForLine(line)}
                  className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#0D2534] px-5 py-2.5 text-sm font-bold text-white whitespace-nowrap shadow-[0_10px_24px_rgba(13,37,52,0.16)] transition-colors duration-150 hover:bg-[#285E7B]"
                >
                  <QuoteDocSvg className="h-4 w-4 shrink-0" />
                  <span>Adicionar ao meu orçamento</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
