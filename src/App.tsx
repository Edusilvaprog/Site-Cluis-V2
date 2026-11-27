/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { type BrandId, type ProductLine } from './data/cluisData';
import {
  addQuoteLineItem,
  clearLegacySavedQuoteData,
  DEFAULT_QUOTE_DRAFT,
  type B2BQuoteDraft,
} from './utils/quoteLogic';
import { TopBar } from './components/TopBar';
import { HeroSection } from './components/HeroSection';
import { ProductCarouselSection } from './components/ProductCarouselSection';
import { BrandsSection } from './components/BrandsSection';
import { RegionMapSection } from './components/RegionMapSection';
import { QuoteSection } from './components/QuoteSection';
import { AboutSection } from './components/AboutSection';
import { FaqAndContactSection } from './components/FaqAndContactSection';
import {
  LineDetailModal,
  type LineModalViewMode,
} from './components/LineDetailModal';
import { CommercialChatWidget } from './components/CommercialChatWidget';
import { ScrollProgressBar } from './components/MotionPrimitives';
import { scrollToSectionId, useSmoothScroll } from './hooks/useSmoothScroll';

export default function App() {
  useSmoothScroll();

  const [activeCarouselBrand, setActiveCarouselBrand] = useState<BrandId>('roma');
  const [inspectedLine, setInspectedLine] = useState<ProductLine | null>(null);
  const [inspectedMode, setInspectedMode] = useState<LineModalViewMode>('photo');
  const [quoteDraft, setQuoteDraft] = useState<B2BQuoteDraft>(DEFAULT_QUOTE_DRAFT);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  // Ensure no legacy company data remains stored in the browser
  useEffect(() => {
    clearLegacySavedQuoteData();
  }, []);

  useEffect(() => {
    const handleQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    scrollToSectionId(sectionId);
  };

  const handleUpdateDraft = (patch: Partial<B2BQuoteDraft>) => {
    setQuoteDraft((prev) => ({ ...prev, ...patch }));
  };

  const handleResetDraft = () => {
    setQuoteDraft(DEFAULT_QUOTE_DRAFT);
    toast('Formulário de cotação limpo.');
  };

  const handleExploreBrandInCarousel = (brandId: BrandId) => {
    setActiveCarouselBrand(brandId);
    scrollToSection('produtos');
  };

  const handleRequestQuoteForLine = (line: ProductLine) => {
    setInspectedLine(null);
    setQuoteDraft((prev) => {
      const nextBrands = prev.selectedBrands.includes(line.brandId)
        ? prev.selectedBrands
        : [...prev.selectedBrands, line.brandId];
      const nextItems = addQuoteLineItem(prev.quoteItems, line.name);

      return {
        ...prev,
        selectedBrands: nextBrands,
        quoteItems: nextItems,
      };
    });
    toast.success(`${line.name} adicionada ao orçamento.`);
    window.setTimeout(() => scrollToSection('cotacao'), 120);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-white text-[#1C2E3A]">
        {mapsQuotaExceeded && (
          <div className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs text-amber-900 shadow-sm md:text-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-amber-950 underline hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}
        <ScrollProgressBar />

        <a
          href="#conteudo-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-sm focus:bg-[#0D2534] focus:px-4 py-2 text-sm font-semibold text-white"
        >
          Pular para o conteúdo principal
        </a>

        <Toaster
          position="bottom-left"
          toastOptions={{
            style: {
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              borderColor: '#CFD9E1',
              color: '#0D2534',
            },
          }}
        />

        <TopBar />

        <main id="conteudo-principal">
          <HeroSection />

          <ProductCarouselSection
            activeBrand={activeCarouselBrand}
            onSelectBrand={setActiveCarouselBrand}
            onInspectLine={(line, mode = 'photo') => {
              setInspectedMode(mode);
              setInspectedLine(line);
            }}
          />

          <BrandsSection
            onExploreBrandInCarousel={handleExploreBrandInCarousel}
          />

          <RegionMapSection />

          <QuoteSection
            draft={quoteDraft}
            onDraftChange={handleUpdateDraft}
            onResetDraft={handleResetDraft}
          />

          <AboutSection />

          <FaqAndContactSection />
        </main>

        <LineDetailModal
          line={inspectedLine}
          initialViewMode={inspectedMode}
          onClose={() => setInspectedLine(null)}
          onRequestQuoteForLine={handleRequestQuoteForLine}
        />

        <CommercialChatWidget />
      </div>
    </MotionConfig>
  );
}
