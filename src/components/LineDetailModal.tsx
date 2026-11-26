import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { BRANDS, type ProductLine } from '../data/cluisData';
import { CheckDrawSvg, QuoteDocSvg } from './CluisIcons';
import { FLUID_EASE, FLUID_SPRING, TACTILE_SPRING } from './MotionPrimitives';
import { SafeImage } from './SafeImage';

interface LineDetailModalProps {
  line: ProductLine | null;
  onClose: () => void;
  onRequestQuoteForLine: (line: ProductLine) => void;
}

export function LineDetailModal({
  line,
  onClose,
  onRequestQuoteForLine,
}: LineDetailModalProps) {
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

  return (
    <AnimatePresence>
      {line && brand ? (
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
            className="fixed inset-0 bg-[#071722]/75 backdrop-blur-[3px]"
          />

          {/* Compact 2-Column Architectural Lightbox — Large Transparent Logo, Zero PDF Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={FLUID_SPRING}
            className="relative z-10 grid max-h-[92vh] w-full max-w-4xl grid-cols-1 overflow-y-auto rounded-sm border border-[#B8C7D1] bg-white shadow-[0_28px_72px_rgba(7,23,34,0.36)] lg:grid-cols-12 lg:overflow-hidden"
          >
            {/* Close button pinned top-right */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar detalhes do produto"
              className="absolute top-3 right-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-sm border border-[#D5DFE6] bg-white/95 text-[#1C2E3A] transition-colors hover:border-[#16394E] hover:bg-[#16394E] hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Left Column: Seamless Pure-White Studio Product Showcase */}
            <div className="relative flex flex-col justify-between border-b border-[#DCE5EC] bg-white lg:col-span-6 lg:border-r lg:border-b-0">
              <div className="flex flex-1 items-center justify-center p-5 sm:p-7">
                <SafeImage
                  src={line.image}
                  alt={`${line.exampleLabel} — ${line.name}`}
                  fallbackTitle={line.name}
                  className="max-h-[340px] w-full object-contain lg:max-h-[420px]"
                />
              </div>
              <p className="border-t border-[#E6EDF2] bg-[#F7F9FB] px-5 py-3 text-xs font-medium text-[#586B78]">
                Exemplo da linha:{' '}
                <span className="font-semibold text-[#0D2534]">{line.exampleLabel}</span>
              </p>
            </div>

            {/* Right Column: Large Transparent Brand Logo + Technical Details + Quote Action ONLY */}
            <div className="flex flex-col justify-between p-5 sm:p-7 lg:col-span-6">
              <div>
                <div className="flex items-center border-b border-[#E6EDF2] pb-4 pr-10">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    data-testid="modal-brand-logo"
                    className="h-12 w-auto max-w-[230px] object-contain sm:h-14"
                  />
                </div>

                <h3
                  id="line-detail-title"
                  className="mt-5 font-display text-2xl font-bold tracking-[-0.025em] text-[#0D2534] sm:text-[28px]"
                >
                  {line.name}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-[#425663] sm:text-[15px]">
                  {line.description}
                </p>

                <div className="mt-5 border-t border-[#E6EDF2] pt-4">
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#285E7B]">
                    O que tem nessa linha
                  </p>
                  <ul className="mt-3 space-y-2">
                    {line.highlights.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm font-medium text-[#1C2E3A]"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-xs bg-[#EEF4F8] text-[#16394E]">
                          <CheckDrawSvg className="h-3 w-3" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Single Decisive Quotation Action (No PDF button) */}
              <div className="mt-6 border-t border-[#E6EDF2] pt-5">
                <motion.button
                  type="button"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={TACTILE_SPRING}
                  onClick={() => onRequestQuoteForLine(line)}
                  className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-sm bg-[#16394E] px-5 py-2.5 text-sm font-semibold text-white whitespace-nowrap transition-colors duration-150 hover:bg-[#285E7B]"
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
