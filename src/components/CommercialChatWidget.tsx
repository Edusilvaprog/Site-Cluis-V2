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
  ExternalLink,
  Loader2,
  MapPin,
  MessageSquare,
  RotateCcw,
  Send,
  X,
} from 'lucide-react';
import { ATTENDANTS } from '../data/cluisData';
import {
  type ChatMessageItem,
  type MapsSourceLink,
} from '../utils/chatLogic';
import { buildWhatsAppUrl } from '../utils/quoteLogic';
import { WhatsAppBubbleSvg } from './CluisIcons';
import { FLUID_EASE, FLUID_SPRING, TACTILE_SPRING } from './MotionPrimitives';

type ActiveDockPanel = 'none' | 'whatsapp' | 'chat';

const INITIAL_ASSISTANT_MESSAGE: ChatMessageItem = {
  id: 'welcome',
  role: 'model',
  text: 'Olá! Posso ajudar com dúvidas sobre produtos da Roma Pincéis, Soprano e Carbografite, compras direto da fábrica ou cidades que atendemos na Baixada Santista e no Vale do Ribeira.',
};

const QUICK_PROMPTS = [
  'Quais linhas da Soprano resistem à maresia?',
  'Qual a distância de Praia Grande até Registro?',
  'Como funciona o pedido mínimo nas fábricas?',
];

const MAGNETIC_SPRING = { stiffness: 360, damping: 24, mass: 0.45 };

interface MagneticDockButtonProps {
  icon: ReactNode;
  label: string;
  active: boolean;
  alwaysShowLabelOnTouch?: boolean;
  controlsId: string;
  ariaLabel: string;
  variant: 'secondary' | 'primary';
  onClick: () => void;
}

function MagneticDockButton({
  icon,
  label,
  active,
  alwaysShowLabelOnTouch = false,
  controlsId,
  ariaLabel,
  variant,
  onClick,
}: MagneticDockButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [isTouchPrimary, setIsTouchPrimary] = useState(false);

  const btnRef = useRef<HTMLButtonElement | null>(null);
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

  const handleMouseMove = (e: ReactMouseEvent<HTMLButtonElement>) => {
    if (isTouchPrimary) return;
    const rect = btnRef.current?.getBoundingClientRect();
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
    ? 'bg-white text-[#0D2534] shadow-[0_6px_18px_rgba(0,0,0,0.2)]'
    : variant === 'primary'
      ? 'bg-[#285E7B] text-white hover:bg-[#327396]'
      : 'text-[#DCEBF4] hover:bg-white/12 hover:text-white';

  return (
    <motion.button
      ref={btnRef}
      type="button"
      style={{ x: springX, y: springY }}
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
      className={`inline-flex h-10 min-w-[40px] items-center justify-center rounded-xl px-3 text-xs font-bold whitespace-nowrap transition-colors duration-150 ${toneClasses}`}
    >
      <span className="inline-flex shrink-0 items-center justify-center">
        {icon}
      </span>
      <motion.span
        initial={false}
        animate={{
          maxWidth: showLabel ? 128 : 0,
          opacity: showLabel ? 1 : 0,
          marginLeft: showLabel ? 8 : 0,
        }}
        transition={{ duration: 0.22, ease: FLUID_EASE }}
        className="overflow-hidden whitespace-nowrap"
      >
        {label}
      </motion.span>
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
  const [activePanel, setActivePanel] = useState<ActiveDockPanel>('none');
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

  const chatOpen = activePanel === 'chat';
  const whatsappOpen = activePanel === 'whatsapp';

  useEffect(() => {
    if (activePanel === 'none') return;
    const handleOutside = (e: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setActivePanel('none');
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePanel('none');
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [activePanel]);

  useEffect(() => {
    if (!chatOpen) return;
    const el = threadRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
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
          className="pointer-events-auto flex flex-col items-end gap-2.5"
        >
          {/* Mutually Exclusive Popups (WhatsApp Chooser OR Commercial Chat) */}
          <AnimatePresence mode="wait">
            {whatsappOpen && (
              <motion.div
                key="whatsapp-panel"
                id="whatsapp-chooser-popup"
                initial={{ opacity: 0, y: 12, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={FLUID_SPRING}
                style={{ transformOrigin: 'bottom right' }}
                className="w-[280px] overflow-hidden rounded-2xl border border-[#C6D5E0] bg-white shadow-[0_24px_56px_rgba(7,23,34,0.34)]"
              >
                <div className="flex items-center justify-between border-b border-white/10 bg-[#0D2534] px-4 py-3 text-white">
                  <div>
                    <p className="font-display text-sm font-bold">WhatsApp direto</p>
                    <p className="text-[11px] text-[#B8D9EA]">
                      Escolha com quem prefere falar agora
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    transition={TACTILE_SPRING}
                    onClick={() => setActivePanel('none')}
                    aria-label="Fechar contatos do WhatsApp"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#C2D4DF] transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </motion.button>
                </div>
                <div className="divide-y divide-[#E7EEF3]">
                  {ATTENDANTS.map((person, idx) => (
                    <motion.a
                      key={person.id}
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: idx * 0.05,
                        ease: FLUID_EASE,
                      }}
                      href={buildWhatsAppUrl(
                        person.phoneRaw,
                        `Olá ${person.name}! Gostaria de conversar sobre um orçamento com a Cluis Representações.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setActivePanel('none')}
                      className="group flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F3F7FA]"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#0D2534]">{person.name}</p>
                        <p className="truncate text-[11px] text-[#586B78]">
                          {person.role}
                        </p>
                        <p className="mt-0.5 font-mono text-xs font-semibold text-[#285E7B] tabular-nums">
                          {person.phoneDisplay}
                        </p>
                      </div>
                      <WhatsAppBubbleSvg className="h-4 w-4 shrink-0 text-[#285E7B] transition-transform duration-150 group-hover:scale-110" />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}

            {chatOpen && (
              <motion.section
                key="chat-panel"
                id="cluis-commercial-chat"
                data-testid="commercial-chat-drawer"
                aria-label="Atendimento rápido Cluis"
                initial={{ opacity: 0, y: 14, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={FLUID_SPRING}
                style={{ transformOrigin: 'bottom right' }}
                className="flex h-[460px] max-h-[70vh] w-[calc(100vw-2rem)] max-w-[384px] flex-col overflow-hidden rounded-2xl border border-[#C6D5E0] bg-white shadow-[0_24px_60px_rgba(7,23,34,0.34)]"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-[#0D2534] px-4 py-3 text-white">
                  <div>
                    <h2 className="font-display text-sm font-bold tracking-tight">
                      Tira-dúvidas Cluis
                    </h2>
                    <p className="text-[11px] text-[#B8D9EA]">
                      Produtos, pedidos e cidades atendidas
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleReset}
                      title="Reiniciar conversa"
                      aria-label="Reiniciar conversa"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#C2D4DF] transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePanel('none')}
                      aria-label="Fechar assistente comercial"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#C2D4DF] transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Scrollable Multi-Turn Thread */}
                <div
                  ref={threadRef}
                  data-testid="chat-thread"
                  className="flex-1 space-y-3 overflow-y-auto bg-[#F6F8FA] p-3.5"
                >
                  {messages.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[88%] rounded-xl px-3.5 py-2 text-[13px] leading-relaxed ${
                            isUser
                              ? 'whitespace-pre-wrap bg-[#16394E] text-white'
                              : 'border border-[#DCE6EE] bg-white text-[#1C2E3A]'
                          }`}
                        >
                          {isUser ? msg.text : renderFormattedReply(msg.text)}
                        </div>

                        {!isUser &&
                          msg.mapsSources &&
                          msg.mapsSources.length > 0 && (
                            <div className="mt-1.5 w-full max-w-[88%] rounded-xl border border-[#DCE6EE] bg-white px-3 py-2">
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
                    <div className="flex items-center gap-2 text-xs text-[#586B78]">
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
                      className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-950"
                    >
                      {errorMsg}
                    </div>
                  )}

                  {messages.length === 1 && !sending && (
                    <div className="pt-1">
                      <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#586B78]">
                        Perguntas rápidas
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {QUICK_PROMPTS.map((prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            onClick={() => void sendMessage(prompt)}
                            className="rounded-xl border border-[#D5DFE6] bg-white px-3 py-2 text-left text-xs font-medium text-[#0D2534] transition-colors hover:border-[#285E7B] hover:bg-[#EEF4F8]"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Composer */}
                <form
                  onSubmit={handleSubmit}
                  className="border-t border-[#DCE5EC] bg-white p-2.5"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={requestLocation}
                      disabled={locating}
                      className={`inline-flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
                        userLocation
                          ? 'text-[#EA7317]'
                          : 'text-[#586B78] hover:text-[#0D2534]'
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
                      aria-label="Mensagem para o assistente comercial"
                      disabled={sending}
                      className="min-h-[38px] flex-1 rounded-xl border border-[#C4D2DB] bg-white px-3 text-sm text-[#0D2534] placeholder:text-[#7D909E] focus:border-[#16394E] focus:outline-none disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={sending || !input.trim()}
                      aria-label="Enviar mensagem"
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0D2534] text-white transition-colors hover:bg-[#285E7B] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Send className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </form>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Grid-Aligned Magnetic Floating Dock with Smooth Expanding Labels */}
          <motion.div
            role="group"
            aria-label="Atalhos de contato Cluis"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, delay: 0.2, ease: FLUID_EASE }}
            className="flex items-center gap-1.5 rounded-2xl border border-white/16 bg-[#071722]/94 p-1.5 shadow-[0_16px_38px_rgba(7,23,34,0.38)] backdrop-blur-md"
          >
            <MagneticDockButton
              icon={
                chatOpen ? (
                  <X className="h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <MessageSquare
                    className="h-4 w-4 shrink-0 text-[#A8D1E7]"
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
              onClick={() =>
                setActivePanel((prev) => (prev === 'chat' ? 'none' : 'chat'))
              }
            />

            <span aria-hidden="true" className="h-5 w-px bg-white/14" />

            <MagneticDockButton
              icon={
                whatsappOpen ? (
                  <X className="h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <WhatsAppBubbleSvg className="h-4 w-4 shrink-0" />
                )
              }
              label="WhatsApp"
              active={whatsappOpen}
              alwaysShowLabelOnTouch
              controlsId="whatsapp-chooser-popup"
              ariaLabel={
                whatsappOpen
                  ? 'Fechar contatos do WhatsApp'
                  : 'Abrir contatos do WhatsApp'
              }
              variant="primary"
              onClick={() =>
                setActivePanel((prev) =>
                  prev === 'whatsapp' ? 'none' : 'whatsapp',
                )
              }
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
