import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import {
  ChevronRight,
  ExternalLink,
  Loader2,
  MapPin,
  MessageCircleQuestion,
  Navigation,
  PackageCheck,
  RotateCcw,
  Send,
  ShieldCheck,
  X,
} from 'lucide-react';
import { PRIMARY_CONTACT } from '../data/cluisData';
import {
  type ChatMessageItem,
  type MapsSourceLink,
} from '../utils/chatLogic';
import { buildWhatsAppUrl } from '../utils/quoteLogic';
import { WhatsAppBubbleSvg } from './CluisIcons';
import { FLUID_EASE, FLUID_SPRING, TACTILE_SPRING } from './MotionPrimitives';

const INITIAL_ASSISTANT_MESSAGE: ChatMessageItem = {
  id: 'welcome',
  role: 'model',
  text: 'Olá! Posso ajudar com dúvidas sobre linhas da Roma Pincéis, Soprano e Carbografite, faturamento direto de fábrica ou cidades atendidas na Baixada Santista e no Vale do Ribeira.',
};

const QUICK_PROMPTS = [
  {
    text: 'Quais linhas da Soprano resistem à maresia?',
    icon: ShieldCheck,
  },
  {
    text: 'Qual a distância de Praia Grande até Registro?',
    icon: Navigation,
  },
  {
    text: 'Como funciona o pedido mínimo nas fábricas?',
    icon: PackageCheck,
  },
];

const MAGNETIC_SPRING = { stiffness: 360, damping: 24, mass: 0.45 };

interface MagneticDockControlProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  alwaysShowLabelOnTouch?: boolean;
  controlsId?: string;
  ariaLabel: string;
  variant: 'secondary' | 'whatsapp';
  href?: string;
  onClick?: () => void;
}

function MagneticDockControl({
  icon,
  label,
  active = false,
  alwaysShowLabelOnTouch = false,
  controlsId,
  ariaLabel,
  variant,
  href,
  onClick,
}: MagneticDockControlProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [isTouchPrimary, setIsTouchPrimary] = useState(false);

  const elRef = useRef<HTMLElement | null>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, MAGNETIC_SPRING);
  const springY = useSpring(rawY, MAGNETIC_SPRING);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setIsTouchPrimary(!finePointer.matches);
    sync();
    finePointer.addEventListener('change', sync);
    return () => finePointer.removeEventListener('change', sync);
  }, []);

  const handleMouseMove = (e: ReactMouseEvent<HTMLElement>) => {
    if (isTouchPrimary) return;
    const rect = elRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    rawX.set(Math.max(-1, Math.min(1, relX)) * 3.5);
    rawY.set(Math.max(-1, Math.min(1, relY)) * 3.5);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    rawX.set(0);
    rawY.set(0);
  };

  const showLabel =
    hovered ||
    focused ||
    active ||
    (isTouchPrimary && alwaysShowLabelOnTouch);

  const toneClasses = active
    ? 'bg-white text-[#0D2534] shadow-[0_6px_18px_rgba(0,0,0,0.22)]'
    : variant === 'whatsapp'
      ? 'bg-[#285E7B] text-white shadow-[0_6px_18px_rgba(40,94,123,0.34)] hover:bg-[#327396]'
      : 'text-[#DCEBF4] hover:bg-white/12 hover:text-white';

  const sharedClassName = `inline-flex h-11 min-w-[44px] items-center justify-center rounded-full px-3.5 text-xs font-bold whitespace-nowrap transition-colors duration-150 ${toneClasses}`;

  const innerContent = (
    <>
      <span className="inline-flex shrink-0 items-center justify-center">
        {icon}
      </span>
      <motion.span
        initial={false}
        animate={{
          maxWidth: showLabel ? 140 : 0,
          opacity: showLabel ? 1 : 0,
          marginLeft: showLabel ? 8 : 0,
        }}
        transition={{ duration: 0.22, ease: FLUID_EASE }}
        className="overflow-hidden whitespace-nowrap"
      >
        {label}
      </motion.span>
    </>
  );

  if (href) {
    return (
      <motion.a
        ref={(node) => {
          elRef.current = node;
        }}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ x: springX, y: springY }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        transition={TACTILE_SPRING}
        onMouseEnter={() => setHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label={ariaLabel}
        className={sharedClassName}
      >
        {innerContent}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={(node) => {
        elRef.current = node;
      }}
      type="button"
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      transition={TACTILE_SPRING}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      aria-expanded={active}
      aria-controls={controlsId}
      aria-label={ariaLabel}
      className={sharedClassName}
    >
      {innerContent}
    </motion.button>
  );
}

function renderInlineBold(line: string, keyPrefix: string) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={`${keyPrefix}-b-${idx}`} className="font-semibold text-[#0D2534]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-t-${idx}`}>{part}</span>;
  });
}

function renderFormattedReply(text: string) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((rawLine, idx) => {
        const trimmed = rawLine.trim();
        if (!trimmed) return null;
        if (/^[-*•]\s+/.test(trimmed)) {
          const itemText = trimmed.replace(/^[-*•]\s+/, '');
          return (
            <div key={`line-${idx}`} className="flex items-start gap-1.5">
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#285E7B]"
                aria-hidden="true"
              />
              <span>{renderInlineBold(itemText, `li-${idx}`)}</span>
            </div>
          );
        }
        return (
          <p key={`line-${idx}`}>{renderInlineBold(trimmed, `p-${idx}`)}</p>
        );
      })}
    </div>
  );
}

export function CommercialChatWidget() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    INITIAL_ASSISTANT_MESSAGE,
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);

  const dockRef = useRef<HTMLDivElement | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const directWhatsAppUrl = buildWhatsAppUrl(
    PRIMARY_CONTACT.phoneRaw,
    'Olá! Gostaria de conversar sobre pedidos e produtos com a Cluis Representações.',
  );

  useEffect(() => {
    if (!chatOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setChatOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setChatOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [chatOpen]);

  useEffect(() => {
    if (!chatOpen) return;
    const el = threadRef.current;
    if (el) {
      el.scrollTop = messages.length <= 1 ? 0 : el.scrollHeight;
    }
  }, [messages, sending, chatOpen]);

  useEffect(() => {
    if (chatOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 140);
    }
  }, [chatOpen]);

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setErrorMsg('Geolocalização não disponível neste navegador.');
      return;
    }
    if (userLocation) {
      setUserLocation(null);
      return;
    }
    setLocating(true);
    setErrorMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setErrorMsg('Não foi possível obter sua localização atual.');
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  const sendMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || sending) return;

    const userMsg: ChatMessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const nextThread = [...messages, userMsg];
    setMessages(nextThread);
    setInput('');
    setErrorMsg(null);
    setSending(true);

    try {
      const apiMessages = nextThread
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, text: m.text }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          ...(userLocation ? { userLocation } : {}),
        }),
      });

      const data = (await response.json()) as {
        reply?: string;
        mapsSources?: MapsSourceLink[];
        error?: string;
      };

      if (!response.ok || !data.reply) {
        throw new Error(
          data.error ||
            'Não foi possível completar sua consulta agora. Tente novamente.',
        );
      }

      const modelMsg: ChatMessageItem = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.reply,
        mapsSources: Array.isArray(data.mapsSources) ? data.mapsSources : [],
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Erro de comunicação com o atendimento.',
      );
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleReset = () => {
    setMessages([INITIAL_ASSISTANT_MESSAGE]);
    setErrorMsg(null);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 sm:bottom-5">
      <div className="mx-auto flex max-w-[1280px] justify-end px-4 sm:px-8 lg:px-10">
        <div
          ref={dockRef}
          data-testid="floating-contact-dock"
          className="pointer-events-auto flex flex-col items-end gap-3"
        >
          {/* High-Contrast Site-Matched Tira-Dúvidas Drawer */}
          <AnimatePresence>
            {chatOpen && (
              <motion.section
                key="chat-panel"
                id="cluis-commercial-chat"
                data-testid="commercial-chat-drawer"
                aria-label="Tira-dúvidas Cluis"
                initial={{ opacity: 0, y: 16, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                transition={FLUID_SPRING}
                style={{ transformOrigin: 'bottom right' }}
                className="flex h-[540px] max-h-[78vh] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-3xl border border-[#16394E]/25 bg-white shadow-[0_28px_70px_rgba(7,23,34,0.38)]"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#0B2231] px-5 py-3.5 text-white">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#285E7B] text-white shadow-[0_6px_14px_rgba(0,0,0,0.22)]"
                    >
                      <MessageCircleQuestion className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <h2 className="font-display text-sm font-bold tracking-tight">
                        Tira-dúvidas Cluis
                      </h2>
                      <p className="text-[11px] text-[#B8D9EA]">
                        Produtos, pedidos e rotas na região
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleReset}
                      title="Reiniciar conversa"
                      aria-label="Reiniciar conversa"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#C2D4DF] transition-colors hover:bg-white/12 hover:text-white"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatOpen(false)}
                      aria-label="Fechar tira-dúvidas"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#C2D4DF] transition-colors hover:bg-white/12 hover:text-white"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Coastal-Slate Thread Backdrop so White Elevated Blocks Stand Out Clearly */}
                <div
                  ref={threadRef}
                  data-testid="chat-thread"
                  className="flex-1 space-y-3.5 overflow-y-auto bg-[#DAE6F0] p-4"
                >
                  {messages.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[90%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                            isUser
                              ? 'whitespace-pre-wrap bg-[#0D2534] text-white shadow-[0_8px_20px_rgba(11,34,49,0.22)]'
                              : 'cluis-block text-[#1C2E3A]'
                          }`}
                        >
                          {isUser ? msg.text : renderFormattedReply(msg.text)}
                        </div>

                        {!isUser &&
                          msg.mapsSources &&
                          msg.mapsSources.length > 0 && (
                            <div className="cluis-block mt-2 w-full max-w-[90%] rounded-2xl px-3.5 py-2.5">
                              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#285E7B]">
                                Referências no Google Maps
                              </p>
                              <ul className="mt-1.5 space-y-1.5">
                                {msg.mapsSources.map((src) => (
                                  <li key={src.uri}>
                                    <a
                                      href={src.uri}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16394E] hover:text-[#285E7B] hover:underline"
                                    >
                                      <MapPin
                                        className="h-3.5 w-3.5 shrink-0 text-[#EA7317]"
                                        aria-hidden="true"
                                      />
                                      <span>{src.title}</span>
                                      <ExternalLink
                                        className="h-3 w-3 shrink-0 opacity-70"
                                        aria-hidden="true"
                                      />
                                    </a>
                                    {src.snippet && (
                                      <p className="mt-0.5 pl-5 text-[11px] leading-snug text-[#586B78]">
                                        {src.snippet}
                                      </p>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    );
                  })}

                  {sending && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-[#16394E] shadow-sm">
                      <Loader2
                        className="h-3.5 w-3.5 animate-spin text-[#285E7B]"
                        aria-hidden="true"
                      />
                      <span>Consultando informações...</span>
                    </div>
                  )}

                  {errorMsg && (
                    <div
                      role="alert"
                      className="rounded-2xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-950 shadow-sm"
                    >
                      {errorMsg}
                    </div>
                  )}

                  {messages.length === 1 && !sending && (
                    <div className="pt-1">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.06em] text-[#285E7B]">
                        Perguntas rápidas
                      </p>
                      <div className="flex flex-col gap-2">
                        {QUICK_PROMPTS.map((item) => {
                          const Icon = item.icon;
                          return (
                            <motion.button
                              key={item.text}
                              type="button"
                              whileHover={{ scale: 1.015, y: -1 }}
                              whileTap={{ scale: 0.98 }}
                              transition={TACTILE_SPRING}
                              onClick={() => void sendMessage(item.text)}
                              className="cluis-block cluis-block-interactive group flex items-center justify-between gap-2.5 rounded-2xl px-3.5 py-2.5 text-left text-xs font-semibold text-[#0D2534]"
                            >
                              <span className="flex items-center gap-2.5">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#EAF3F8] text-[#285E7B] transition-colors group-hover:bg-[#0D2534] group-hover:text-white">
                                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                                </span>
                                <span className="leading-snug">{item.text}</span>
                              </span>
                              <ChevronRight
                                className="h-3.5 w-3.5 shrink-0 text-[#6F8796] transition-transform group-hover:translate-x-0.5 group-hover:text-[#0D2534]"
                                aria-hidden="true"
                              />
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Composer */}
                <form
                  onSubmit={handleSubmit}
                  className="border-t border-[#C6D5E0] bg-white px-3.5 pt-2.5 pb-3.5"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={requestLocation}
                      disabled={locating}
                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${
                        userLocation
                          ? 'text-[#EA7317]'
                          : 'text-[#4C6270] hover:text-[#0D2534]'
                      }`}
                    >
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>
                        {locating
                          ? 'Obtendo localização...'
                          : userLocation
                            ? 'Localização ativa (clique para desativar)'
                            : 'Usar minha localização para rotas'}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Digite sua dúvida ou cidade..."
                      aria-label="Mensagem para o tira-dúvidas Cluis"
                      disabled={sending}
                      className="min-h-[40px] flex-1 rounded-full border border-[#B8CAD6] bg-[#F4F8FB] px-4 text-sm text-[#0D2534] placeholder:text-[#667B88] transition-colors focus:border-[#16394E] focus:bg-white focus:outline-none disabled:opacity-60"
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.94 }}
                      transition={TACTILE_SPRING}
                      disabled={sending || !input.trim()}
                      aria-label="Enviar mensagem"
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0D2534] text-white shadow-[0_6px_16px_rgba(13,37,52,0.22)] transition-colors hover:bg-[#285E7B] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Send className="h-4 w-4" aria-hidden="true" />
                    </motion.button>
                  </div>
                </form>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Sleek Rounded-Full Magnetic Dock (React Bits Dock Inspired) */}
          <motion.div
            role="group"
            aria-label="Atalhos de contato Cluis"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, delay: 0.2, ease: FLUID_EASE }}
            className="flex items-center gap-1.5 rounded-full border border-white/18 bg-[#071722]/94 p-1.5 shadow-[0_18px_42px_rgba(7,23,34,0.42)] backdrop-blur-md"
          >
            <MagneticDockControl
              icon={
                chatOpen ? (
                  <X className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                ) : (
                  <MessageCircleQuestion
                    className="h-4.5 w-4.5 shrink-0 text-[#A8D1E7]"
                    aria-hidden="true"
                  />
                )
              }
              label="Tira-dúvidas"
              active={chatOpen}
              controlsId="cluis-commercial-chat"
              ariaLabel={
                chatOpen
                  ? 'Fechar tira-dúvidas Cluis'
                  : 'Abrir tira-dúvidas Cluis'
              }
              variant="secondary"
              onClick={() => setChatOpen((prev) => !prev)}
            />

            <span aria-hidden="true" className="h-5 w-px bg-white/16" />

            <MagneticDockControl
              icon={<WhatsAppBubbleSvg className="h-4.5 w-4.5 shrink-0" />}
              label="WhatsApp"
              alwaysShowLabelOnTouch
              ariaLabel={`Abrir WhatsApp comercial ${PRIMARY_CONTACT.phoneDisplay}`}
              variant="whatsapp"
              href={directWhatsAppUrl}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
