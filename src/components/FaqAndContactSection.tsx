import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUp,
  ArrowUpRight,
  ChevronRight,
  Clock3,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Plus,
} from 'lucide-react';
import {
  COMPANY_CONTACT,
  FAQS,
  PRIMARY_CONTACT,
} from '../data/cluisData';
import { buildWhatsAppUrl } from '../utils/quoteLogic';
import {
  CheckDrawSvg,
  CopySheetSvg,
  WhatsAppBubbleSvg,
} from './CluisIcons';
import { BlurReveal, SpotlightSurface } from './FluidMotion';
import {
  FLUID_EASE,
  FLUID_SPRING,
  TACTILE_SPRING,
  VIEWPORT_CONFIG,
} from './MotionPrimitives';

const FOOTER_NAV_LINKS = [
  { href: '#produtos', label: 'Produtos' },
  { href: '#representacoes', label: 'Fábricas e Catálogos' },
  { href: '#atuacao', label: 'Área de atuação' },
  { href: '#cotacao', label: 'Orçamento' },
  { href: '#quem-somos', label: 'Quem somos' },
  { href: '#faq', label: 'Dúvidas frequentes' },
];

export function FaqAndContactSection() {
  const [openFaqId, setOpenFaqId] = useState<string>(FAQS[0].id);
  const [copiedKey, setCopiedKey] = useState<'phone' | 'email' | null>(null);

  const handleCopy = async (key: 'phone' | 'email', text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedKey(key);
    window.setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2200);
  };

  const primaryWhatsAppUrl = buildWhatsAppUrl(
    PRIMARY_CONTACT.phoneRaw,
    'Olá! Gostaria de conversar sobre pedidos e representação com a Cluis Representações.',
  );

  return (
    <>
      {/* Band 1: Rounded Elevated FAQ Blocks with Depth Shadow & Hover-Scale */}
      <section id="faq" className="band-mist py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
            <div className="lg:col-span-4">
              <BlurReveal>
                <p className="font-mono text-xs font-semibold tracking-[0.08em] uppercase text-[#285E7B]">
                  Dúvidas frequentes
                </p>
                <h2 className="mt-1.5 font-display text-2xl font-bold tracking-[-0.03em] text-[#0D2534] sm:text-3xl lg:text-[34px]">
                  Como funciona comprar com a Cluis.
                </h2>
              </BlurReveal>
            </div>

            <div className="space-y-3.5 lg:col-span-8">
              {FAQS.map((faq, index) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 18, scale: 0.99 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    viewport={VIEWPORT_CONFIG}
                    transition={{
                      duration: 0.36,
                      delay: index * 0.05,
                      ease: FLUID_EASE,
                    }}
                    className={`cluis-block overflow-hidden rounded-2xl transition-shadow duration-200 ${
                      isOpen
                        ? 'border-[#285E7B]/42 shadow-[0_20px_42px_-8px_rgba(11,34,49,0.16)]'
                        : 'hover:border-[#285E7B]/38 hover:shadow-[0_18px_38px_-8px_rgba(11,34,49,0.14)]'
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${faq.id}`}
                      onClick={() => setOpenFaqId(isOpen ? '' : faq.id)}
                      className="group flex min-h-[64px] w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                    >
                      <span
                        className={`font-display text-sm font-bold transition-colors sm:text-[15.5px] ${
                          isOpen
                            ? 'text-[#0D2534]'
                            : 'text-[#1C2E3A] group-hover:text-[#285E7B]'
                        }`}
                      >
                        {faq.question}
                      </span>

                      <motion.span
                        animate={{
                          rotate: isOpen ? 45 : 0,
                          backgroundColor: isOpen ? '#0D2534' : '#EAF3F8',
                          color: isOpen ? '#FFFFFF' : '#285E7B',
                        }}
                        transition={FLUID_SPRING}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                        aria-hidden="true"
                      >
                        <Plus className="h-4 w-4" />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`faq-panel-${faq.id}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.24, ease: FLUID_EASE }}
                          className="overflow-hidden"
                        >
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2, ease: FLUID_EASE }}
                            className="border-t border-[#EDF3F7] px-5 pt-3.5 pb-5 text-sm leading-relaxed text-[#425663] sm:px-6 sm:pr-14"
                          >
                            {faq.answer}
                          </motion.p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Band 2: Direct Personalized Contact — Rounded Depth-Shadow Blocks with Hover-Scale */}
      <section id="contato" className="band-slate py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
          <BlurReveal>
            <p className="font-mono text-xs font-semibold tracking-[0.08em] uppercase text-[#285E7B]">
              Atendimento comercial
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-bold tracking-[-0.03em] text-[#0D2534] sm:text-3xl lg:text-[34px]">
              Fale direto com a Cluis Representações.
            </h2>
          </BlurReveal>

          {/* Rounded Elevated Cards with Depth Shadow & Hover-Scale — Zero Clutter */}
          <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Primary WhatsApp Commercial Card (6 Cols) */}
            <motion.article
              initial={{ opacity: 0, y: 20, scale: 0.985 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ scale: 1.015, y: -3 }}
              viewport={VIEWPORT_CONFIG}
              transition={{ duration: 0.38, ease: FLUID_EASE }}
              className="flex lg:col-span-6"
            >
              <SpotlightSurface
                tone="light"
                className="cluis-block cluis-block-interactive flex w-full flex-col justify-between gap-5 rounded-3xl p-6 sm:p-7"
              >
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <span
                      aria-hidden="true"
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0D2534] text-[#A8D1E7] shadow-[0_10px_22px_rgba(13,37,52,0.22)]"
                    >
                      <WhatsAppBubbleSvg className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold text-[#0D2534]">
                        WhatsApp Comercial
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy('phone', PRIMARY_CONTACT.phoneDisplay)
                        }
                        aria-label={`Copiar número do WhatsApp: ${PRIMARY_CONTACT.phoneDisplay}`}
                        className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-[#285E7B] tabular-nums transition-colors hover:text-[#0D2534]"
                      >
                        {copiedKey === 'phone' ? (
                          <>
                            <CheckDrawSvg className="h-3.5 w-3.5 text-[#1F6A4A]" />
                            <span className="font-sans text-xs text-[#1F6A4A]">
                              Número copiado
                            </span>
                          </>
                        ) : (
                          <>
                            <span>{PRIMARY_CONTACT.phoneDisplay}</span>
                            <CopySheetSvg className="h-3.5 w-3.5 opacity-75" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="relative z-10 text-sm leading-relaxed text-[#425663]">
                  Envie sua lista de códigos, tire dúvidas sobre as linhas ou combine uma
                  visita presencial no balcão da sua loja.
                </p>

                <div className="relative z-10 flex flex-wrap items-center gap-3 pt-1">
                  <motion.a
                    href={primaryWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    transition={TACTILE_SPRING}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#0D2534] px-5 py-2.5 text-sm font-bold text-white whitespace-nowrap shadow-[0_10px_24px_rgba(13,37,52,0.2)] transition-colors hover:bg-[#285E7B]"
                  >
                    <WhatsAppBubbleSvg className="h-4 w-4 shrink-0 text-[#A8D1E7]" />
                    <span>Conversar no WhatsApp</span>
                  </motion.a>

                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#586B78]">
                    <Clock3 className="h-3.5 w-3.5 text-[#285E7B]" aria-hidden="true" />
                    <span>{COMPANY_CONTACT.serviceHours}</span>
                  </span>
                </div>
              </SpotlightSurface>
            </motion.article>

            {/* E-mail Card (3 Cols) */}
            <motion.article
              initial={{ opacity: 0, y: 20, scale: 0.985 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ scale: 1.018, y: -3 }}
              viewport={VIEWPORT_CONFIG}
              transition={{ duration: 0.38, delay: 0.06, ease: FLUID_EASE }}
              className="flex lg:col-span-3"
            >
              <SpotlightSurface
                tone="light"
                className="cluis-block cluis-block-interactive flex w-full flex-col justify-between gap-4 rounded-3xl p-6"
              >
                <div className="relative z-10">
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF3F8] text-[#285E7B] ring-1 ring-[#D1E1EC]"
                  >
                    <Mail className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-[#0D2534]">
                    E-mail comercial
                  </h3>
                  <p className="mt-1.5 break-all text-xs font-medium leading-relaxed text-[#425663]">
                    {COMPANY_CONTACT.email}
                  </p>
                </div>

                <div className="relative z-10 flex items-center justify-between gap-2 border-t border-[#EAF1F6] pt-3.5">
                  <a
                    href={`mailto:${COMPANY_CONTACT.email}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#16394E] transition-colors hover:text-[#285E7B]"
                  >
                    <span>Enviar e-mail</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopy('email', COMPANY_CONTACT.email)}
                    aria-label="Copiar endereço de e-mail"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#586B78] transition-colors hover:text-[#0D2534]"
                  >
                    {copiedKey === 'email' ? (
                      <>
                        <CheckDrawSvg className="h-3 w-3 text-[#1F6A4A]" />
                        <span className="text-[#1F6A4A]">Copiado</span>
                      </>
                    ) : (
                      <>
                        <CopySheetSvg className="h-3 w-3" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </SpotlightSurface>
            </motion.article>

            {/* Instagram Card (3 Cols) */}
            <motion.article
              initial={{ opacity: 0, y: 20, scale: 0.985 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ scale: 1.018, y: -3 }}
              viewport={VIEWPORT_CONFIG}
              transition={{ duration: 0.38, delay: 0.12, ease: FLUID_EASE }}
              className="flex lg:col-span-3"
            >
              <SpotlightSurface
                tone="light"
                className="cluis-block cluis-block-interactive flex w-full flex-col justify-between gap-4 rounded-3xl p-6"
              >
                <div className="relative z-10">
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF3F8] text-[#285E7B] ring-1 ring-[#D1E1EC]"
                  >
                    <Instagram className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-[#0D2534]">
                    Instagram
                  </h3>
                  <p className="mt-1.5 text-sm font-semibold text-[#285E7B]">
                    {COMPANY_CONTACT.instagramHandle}
                  </p>
                </div>

                <div className="relative z-10 border-t border-[#EAF1F6] pt-3.5">
                  <a
                    href={COMPANY_CONTACT.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#16394E] transition-colors hover:text-[#285E7B]"
                  >
                    <span>Acompanhar perfil</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </SpotlightSurface>
            </motion.article>
          </div>
        </div>
      </section>

      {/* Compact, Structured Obsidian Footer — No Empty Logo Void, Essential B2B Info Only */}
      <footer className="band-obsidian pt-12 pb-24 text-white sm:pt-14 sm:pb-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-start">
            {/* Column 1: Essential B2B Information */}
            <div className="md:col-span-5">
              <h3 className="font-display text-lg font-bold tracking-tight text-white">
                Cluis Representações
              </h3>
              <p className="mt-2.5 max-w-md text-sm leading-relaxed text-[#BED4E1]">
                Representação comercial oficial da Roma Pincéis, Soprano e Carbografite
                com faturamento direto das fábricas para empresas com CNPJ e Inscrição
                Estadual.
              </p>

              <div className="mt-4 space-y-2 text-xs text-[#9EC1D5]">
                <p className="inline-flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[#8FC5E3]" aria-hidden="true" />
                  <span>Baixada Santista e Vale do Ribeira</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock3 className="h-3.5 w-3.5 shrink-0 text-[#8FC5E3]" aria-hidden="true" />
                  <span>Atendimento comercial: {COMPANY_CONTACT.serviceHours}</span>
                </p>
              </div>
            </div>

            {/* Column 2: Clean Navigation */}
            <div className="md:col-span-3">
              <h3 className="font-display text-sm font-semibold tracking-tight text-white">
                Navegação
              </h3>
              <ul className="mt-3.5 space-y-2 text-sm text-[#C9DCE7]">
                {FOOTER_NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="group inline-flex items-center gap-2 transition-colors hover:text-white"
                    >
                      <ChevronRight
                        className="h-3.5 w-3.5 text-[#7CAFC9] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-white"
                        aria-hidden="true"
                      />
                      <span>{link.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Direct Channels (Carlos Only) */}
            <div className="md:col-span-4">
              <h3 className="font-display text-sm font-semibold tracking-tight text-white">
                Canais diretos
              </h3>
              <ul className="mt-3.5 space-y-2.5 text-sm text-[#C9DCE7]">
                <li>
                  <a
                    href={primaryWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 transition-colors hover:text-white"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] text-[#A8D1E7] ring-1 ring-white/10 transition-colors group-hover:bg-[#285E7B] group-hover:text-white">
                      <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="flex items-baseline gap-2">
                      <span className="font-semibold text-white">WhatsApp</span>
                      <span className="font-mono text-xs text-[#B6D0DF] tabular-nums">
                        {PRIMARY_CONTACT.phoneDisplay}
                      </span>
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${COMPANY_CONTACT.email}`}
                    className="group inline-flex items-center gap-3 transition-colors hover:text-white"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] text-[#A8D1E7] ring-1 ring-white/10 transition-colors group-hover:bg-[#285E7B] group-hover:text-white">
                      <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="break-all text-xs sm:text-sm">
                      {COMPANY_CONTACT.email}
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={COMPANY_CONTACT.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 transition-colors hover:text-white"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] text-[#A8D1E7] ring-1 ring-white/10 transition-colors group-hover:bg-[#285E7B] group-hover:text-white">
                      <Instagram className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span>{COMPANY_CONTACT.instagramHandle}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-white/12 pt-5 text-xs text-[#9EB9C8]">
            <p>
              © 2026 Cluis Representações · Atendimento exclusivo para empresas com CNPJ e
              IE.
            </p>
            <a
              href="#inicio"
              className="group inline-flex items-center gap-2 font-semibold text-[#C9DCE7] transition-colors hover:text-white"
            >
              <span>Voltar ao topo</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.08] text-[#A8D1E7] ring-1 ring-white/10 transition-all group-hover:-translate-y-0.5 group-hover:bg-[#285E7B] group-hover:text-white">
                <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
