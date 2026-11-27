import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { MEDIA_ASSETS } from '../data/cluisData';
import { QuoteDocSvg, WhatsAppBubbleSvg } from './CluisIcons';
import { FLUID_EASE } from './MotionPrimitives';

const NAV_LINKS = [
  { href: '#produtos', label: 'Produtos' },
  { href: '#representacoes', label: 'Fábricas e Catálogos' },
  { href: '#atuacao', label: 'Onde Atendemos' },
  { href: '#quem-somos', label: 'Quem Somos' },
  { href: '#faq', label: 'Dúvidas' },
];

export function TopBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-[#CFD9E1] bg-white/96 backdrop-blur-md transition-shadow duration-200 ${
        scrolled
          ? 'shadow-[0_10px_28px_rgba(7,23,34,0.09)]'
          : 'shadow-[0_1px_0_rgba(7,23,34,0.03)]'
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between gap-8 px-4 sm:px-8 lg:px-10">
        {/* Zone 1: Transparent Official Cluis Logo (Zero Background Box) */}
        <a
          href="#inicio"
          aria-label="Cluis Representações — Voltar ao início"
          className="inline-flex shrink-0 items-center justify-center transition-transform duration-150 active:scale-[0.98] focus-visible:rounded"
        >
          <img
            src={MEDIA_ASSETS.logoCluis}
            alt="Cluis Representações Comerciais"
            className="h-12 w-auto object-contain sm:h-[54px]"
          />
        </a>

        {/* Zone 2: Clean 5-Link Navigation (Catalogs live exclusively inside each factory card) */}
        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-7 lg:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative py-2 text-sm font-medium text-[#223643] whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#285E7B]"
            >
              <span>{link.label}</span>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-[#285E7B] transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
              />
            </a>
          ))}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex shrink-0 items-center gap-2.5">
          <a
            href="#cotacao"
            className="group inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-[#16394E] px-4 py-2 text-xs font-semibold tracking-[0.01em] text-white whitespace-nowrap shrink-0 transition-all duration-150 hover:bg-[#285E7B] active:scale-[0.97] sm:px-5 sm:text-sm"
          >
            <QuoteDocSvg className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:-translate-y-0.5" />
            <span className="hidden sm:inline">Pedir orçamento</span>
            <span className="sm:hidden">Orçamento</span>
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-[#C6D4DD] bg-white text-[#1C2E3A] transition-colors duration-150 hover:border-[#16394E] hover:text-[#16394E] active:scale-[0.96] lg:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Clean Mobile Drawer */}
      <AnimatePresence initial={false}>
        {mobileMenuOpen && (
          <motion.nav
            id="mobile-nav-menu"
            aria-label="Menu mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: FLUID_EASE }}
            className="overflow-hidden border-t border-[#CFD9E1] bg-white lg:hidden"
          >
            <div className="px-5 py-3">
              <ul className="flex flex-col divide-y divide-[#E3EAEF]">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex min-h-[46px] items-center justify-between text-sm font-medium text-[#1C2E3A] transition-colors hover:text-[#285E7B]"
                    >
                      <span>{link.label}</span>
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#contato"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-[46px] items-center gap-2 text-sm font-semibold text-[#285E7B]"
                  >
                    <WhatsAppBubbleSvg className="h-4 w-4" />
                    <span>Atendimento comercial</span>
                  </a>
                </li>
              </ul>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
