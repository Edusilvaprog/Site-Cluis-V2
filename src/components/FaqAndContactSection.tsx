import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUp,
  ChevronRight,
  Instagram,
  Mail,
  Phone,
  Plus,
} from 'lucide-react';
import {
  ATTENDANTS,
  COMPANY_CONTACT,
  FAQS,
  MEDIA_ASSETS,
} from '../data/cluisData';
import { buildWhatsAppUrl } from '../utils/quoteLogic';
import {
  CheckDrawSvg,
  CopySheetSvg,
  WhatsAppBubbleSvg,
} from './CluisIcons';
import { BlurReveal } from './FluidMotion';
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
];

export function FaqAndContactSection() {
  const [openFaqId, setOpenFaqId] = useState<string>(FAQS[0].id);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  const handleCopyPhone = async (attendantId: string, phoneDisplay: string) => {
    try {
      await navigator.clipboard.writeText(phoneDisplay);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = phoneDisplay;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedPhoneId(attendantId);
    window.setTimeout(() => {
      setCopiedPhoneId((prev) => (prev === attendantId ? null : prev));
    }, 2200);
  };

  return (
    <>
      {/* Band 1: Soft-Rounded FAQ Accordion */}
      <section id="faq" className="band-mist py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
            {/* Left 4 Cols */}
            <div className="lg:col-span-4">
              <BlurReveal>
                <p className="font-mono text-xs font-semibold tracking-[0.08em] uppercase text-[#285E7B]">
                  Dúvidas frequentes
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.03em] text-[#0D2534] sm:text-3xl lg:text-[34px]">
                  Como funciona comprar com a Cluis.
                </h2>
              </BlurReveal>

              <p className="mt-3 text-sm leading-relaxed text-[#425663]">
                As principais respostas sobre cadastro, faturamento direto das fábricas e
                visitas na região.
              </p>
            </div>

            {/* Right 8 Cols: Softly Rounded Borderless Accordion */}
            <div className="space-y-3 lg:col-span-8">
              {FAQS.map((faq, index) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={VIEWPORT_CONFIG}
                    transition={{
                      duration: 0.36,
                      delay: index * 0.05,
                      ease: FLUID_EASE,
                    }}
                    className={`overflow-hidden rounded-2xl transition-all duration-200 ${
                      isOpen
                        ? 'bg-white shadow-[0_14px_34px_rgba(13,37,52,0.09)] ring-1 ring-[#285E7B]/18'
                        : 'bg-white/85 shadow-[0_4px_16px_rgba(13,37,52,0.04)] hover:bg-white hover:shadow-[0_10px_24px_rgba(13,37,52,0.07)]'
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${faq.id}`}
                      onClick={() => setOpenFaqId(isOpen ? '' : faq.id)}
                      className="group flex min-h-[60px] w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
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
                          backgroundColor: isOpen ? '#0D2534' : '#EDF4F8',
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
                            className="px-5 pb-5 text-sm leading-relaxed text-[#425663] sm:px-6 sm:pr-14"
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

      {/* Band 2: Direct Contact — Luminous Shadow-Elevated Cards (WhatsApp Only, No Extra Subtitles) */}
      <section id="contato" className="band-slate py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <BlurReveal>
              <p className="font-mono text-xs font-semibold tracking-[0.08em] uppercase text-[#285E7B]">
                Fale com a gente
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.03em] text-[#0D2534] sm:text-3xl lg:text-[34px]">
                Atendimento direto com Carlos e Eduardo.
              </h2>
            </BlurReveal>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#334A57]">
              <a
                href={`mailto:${COMPANY_CONTACT.email}`}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-[#285E7B]"
              >
                <Mail className="h-3.5 w-3.5 text-[#285E7B]" aria-hidden="true" />
                <span>{COMPANY_CONTACT.email}</span>
              </a>
              <span aria-hidden="true" className="text-[#B4C4CF]">
                ·
              </span>
              <a
                href={COMPANY_CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-[#285E7B]"
              >
                <Instagram
                  className="h-3.5 w-3.5 text-[#285E7B]"
                  aria-hidden="true"
                />
                <span>{COMPANY_CONTACT.instagramHandle}</span>
              </a>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {ATTENDANTS.map((person, idx) => {
              const directUrl = buildWhatsAppUrl(
                person.phoneRaw,
                `Olá ${person.name}! Gostaria de conversar sobre um orçamento com a Cluis Representações.`,
              );
              const isCopied = copiedPhoneId === person.id;

              return (
                <motion.article
                  key={person.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT_CONFIG}
                  transition={{
                    duration: 0.42,
                    delay: idx * 0.08,
                    ease: FLUID_EASE,
                  }}
                  whileHover={{ y: -3 }}
                  className="group flex flex-col justify-between gap-6 rounded-2xl bg-white p-6 shadow-[0_22px_50px_rgba(13,37,52,0.11),0_4px_14px_rgba(13,37,52,0.05)] ring-1 ring-[#0D2534]/[0.06] transition-shadow duration-200 hover:shadow-[0_28px_64px_rgba(13,37,52,0.15),0_6px_18px_rgba(13,37,52,0.06)] sm:p-7"
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      aria-hidden="true"
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF5FA] font-display text-lg font-bold text-[#0D2534] ring-1 ring-[#D4E2EC]"
                    >
                      {person.name.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-xl font-bold leading-tight text-[#0D2534]">
                        {person.name}
                      </h3>
                      <p className="mt-0.5 text-sm font-medium text-[#285E7B]">
                        {person.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EDF3F7] pt-5">
                    <motion.a
                      href={directUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={TACTILE_SPRING}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#0D2534] px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(13,37,52,0.16)] transition-colors hover:bg-[#285E7B]"
                    >
                      <WhatsAppBubbleSvg className="h-4 w-4 shrink-0 text-[#A8D1E7]" />
                      <span>Chamar no WhatsApp</span>
                    </motion.a>

                    <button
                      type="button"
                      onClick={() => handleCopyPhone(person.id, person.phoneDisplay)}
                      aria-label={`Copiar telefone de ${person.name}: ${person.phoneDisplay}`}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#F4F8FB] px-3.5 py-2 font-mono text-xs font-semibold text-[#0D2534] tabular-nums ring-1 ring-[#DCE6EE] transition-colors hover:bg-[#E7F0F6]"
                    >
                      {isCopied ? (
                        <>
                          <CheckDrawSvg className="h-3.5 w-3.5 text-[#285E7B]" />
                          <span className="font-sans text-xs text-[#285E7B]">
                            Copiado
                          </span>
                        </>
                      ) : (
                        <>
                          <span>{person.phoneDisplay}</span>
                          <CopySheetSvg className="h-3.5 w-3.5 text-[#586B78]" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Standardized Obsidian Footer — Logo-Only Left Column & Crisp Uniform Symbols */}
      <footer className="band-obsidian pt-14 pb-24 text-white sm:pt-16 sm:pb-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-start">
            {/* Left Column: Slightly Larger Cluis Logo Only */}
            <div className="flex items-center md:col-span-5">
              <a
                href="#inicio"
                aria-label="Cluis Representações — voltar ao início"
                className="inline-flex items-center transition-opacity hover:opacity-90"
              >
                <img
                  src={MEDIA_ASSETS.logoCluis}
                  alt="Cluis Representações"
                  data-testid="footer-cluis-logo"
                  className="h-14 w-auto object-contain brightness-0 invert opacity-95 sm:h-16"
                />
              </a>
            </div>

            {/* Middle Column: Standardized Navigation */}
            <div className="md:col-span-3">
              <h3 className="font-display text-sm font-semibold tracking-tight text-white">
                Navegação
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-[#C9DCE7]">
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

            {/* Right Column: Standardized Direct Channels with Uniform Icon Badges */}
            <div className="md:col-span-4">
              <h3 className="font-display text-sm font-semibold tracking-tight text-white">
                Canais diretos
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-[#C9DCE7]">
                {ATTENDANTS.map((person) => (
                  <li key={person.id}>
                    <a
                      href={buildWhatsAppUrl(
                        person.phoneRaw,
                        `Olá ${person.name}! Gostaria de falar com a Cluis Representações.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-3 transition-colors hover:text-white"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-[#A8D1E7] ring-1 ring-white/10 transition-colors group-hover:bg-[#285E7B] group-hover:text-white">
                        <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="flex items-baseline gap-2">
                        <span className="font-semibold text-white">
                          {person.name}
                        </span>
                        <span className="font-mono text-xs text-[#B6D0DF] tabular-nums">
                          {person.phoneDisplay}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href={`mailto:${COMPANY_CONTACT.email}`}
                    className="group inline-flex items-center gap-3 transition-colors hover:text-white"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-[#A8D1E7] ring-1 ring-white/10 transition-colors group-hover:bg-[#285E7B] group-hover:text-white">
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
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-[#A8D1E7] ring-1 ring-white/10 transition-colors group-hover:bg-[#285E7B] group-hover:text-white">
                      <Instagram className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span>{COMPANY_CONTACT.instagramHandle}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/12 pt-5 text-xs text-[#9EB9C8]">
            <p>
              © 2026 Cluis Representações · Atendimento exclusivo para empresas com CNPJ e
              IE.
            </p>
            <a
              href="#inicio"
              className="group inline-flex items-center gap-2 font-semibold text-[#C9DCE7] transition-colors hover:text-white"
            >
              <span>Voltar ao topo</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.08] text-[#A8D1E7] ring-1 ring-white/10 transition-all group-hover:-translate-y-0.5 group-hover:bg-[#285E7B] group-hover:text-white">
                <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
