import {
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  Search,
  X,
} from 'lucide-react';
import {
  BRANDS,
  PRIMARY_CONTACT,
  PRODUCT_LINES,
  type BrandId,
} from '../data/cluisData';
import { BAIXADA_POLYGONS, VALE_POLYGONS } from '../data/mapPolygons';
import {
  addQuoteLineItem,
  buildB2BQuoteMessage,
  buildWhatsAppUrl,
  formatCepInput,
  formatCnpjInput,
  formatCompanyDisplayName,
  formatPhoneInput,
  getQuoteProgress,
  hasValidationErrors,
  matchRegionalCity,
  removeQuoteLineItem,
  toggleArrayValue,
  validateQuoteRequest,
  type B2BQuoteDraft,
  type QuoteValidationErrors,
} from '../utils/quoteLogic';
import {
  CheckDrawSvg,
  IndustryBadgeSvg,
  ResetSvg,
  WhatsAppBubbleSvg,
} from './CluisIcons';
import { BlurReveal, SpotlightSurface } from './FluidMotion';
import { FLUID_SPRING, TACTILE_SPRING } from './MotionPrimitives';

interface QuoteSectionProps {
  draft: B2BQuoteDraft;
  onDraftChange: (patch: Partial<B2BQuoteDraft>) => void;
  onResetDraft: () => void;
}

const BAIXADA_CITY_NAMES = BAIXADA_POLYGONS.map((c) => c.name);
const VALE_CITY_NAMES = VALE_POLYGONS.map((c) => c.name);
const ALL_REGIONAL_CITIES = [...BAIXADA_CITY_NAMES, ...VALE_CITY_NAMES];

const QUOTE_LOGO_SIZE: Record<BrandId, string> = {
  roma: 'h-[20px] sm:h-[22px]',
  soprano: 'h-[15px] sm:h-[16px]',
  carbografite: 'h-[17px] sm:h-[19px]',
};

const QUICK_LINE_DEFAULT_IDS = [
  'roma-rolos',
  'roma-trinchas',
  'soprano-fechaduras',
  'soprano-eletricos',
  'carbografite-epis',
  'carbografite-ferramentas',
];

interface LookupFeedback {
  tone: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

export function QuoteSection({
  draft,
  onDraftChange,
  onResetDraft,
}: QuoteSectionProps) {
  const [errors, setErrors] = useState<QuoteValidationErrors>({});
  const [newItemName, setNewItemName] = useState('');
  const [cnpjLookup, setCnpjLookup] = useState<LookupFeedback>({
    tone: 'idle',
    message: '',
  });
  const [cepLookup, setCepLookup] = useState<LookupFeedback>({
    tone: 'idle',
    message: '',
  });
  const lastFetchedCnpjRef = useRef<string>('');
  const lastFetchedCepRef = useRef<string>('');

  const quoteItems = draft.quoteItems ?? [];

  const progress = useMemo(() => getQuoteProgress(draft), [draft]);
  const formattedMessage = useMemo(() => buildB2BQuoteMessage(draft), [draft]);

  const whatsappUrl = useMemo(
    () => buildWhatsAppUrl(PRIMARY_CONTACT.phoneRaw, formattedMessage),
    [formattedMessage],
  );

  const selectedBrandObjects = useMemo(
    () =>
      draft.selectedBrands
        .map((id) => BRANDS.find((b) => b.id === id))
        .filter((b): b is (typeof BRANDS)[number] => Boolean(b)),
    [draft.selectedBrands],
  );

  const suggestedLines = useMemo(() => {
    if (draft.selectedBrands.length === 0) {
      return PRODUCT_LINES.filter((line) =>
        QUICK_LINE_DEFAULT_IDS.includes(line.id),
      );
    }
    return PRODUCT_LINES.filter((line) =>
      draft.selectedBrands.includes(line.brandId),
    );
  }, [draft.selectedBrands]);

  const handleFieldChange = (patch: Partial<B2BQuoteDraft>) => {
    onDraftChange(patch);
    if (Object.keys(errors).length > 0) {
      setErrors((prev) => ({
        ...prev,
        ...(patch.cnpj !== undefined ? { cnpj: undefined } : {}),
        ...(patch.companyName !== undefined ? { companyName: undefined } : {}),
        ...(patch.city !== undefined ? { city: undefined } : {}),
        ...(patch.whatsapp !== undefined ? { whatsapp: undefined } : {}),
        ...(patch.email !== undefined ? { email: undefined } : {}),
        ...(patch.selectedBrands !== undefined ||
        patch.quoteItems !== undefined ||
        patch.itemsDescription !== undefined
          ? { scope: undefined }
          : {}),
      }));
    }
  };

  const fetchCnpjDetails = async (rawCnpj: string) => {
    const digits = rawCnpj.replace(/\D/g, '');
    if (digits.length !== 14) {
      setCnpjLookup({
        tone: 'error',
        message: 'Digite os 14 números do CNPJ para buscar.',
      });
      return;
    }

    lastFetchedCnpjRef.current = digits;
    setCnpjLookup({ tone: 'loading', message: 'Consultando CNPJ...' });

    try {
      const response = await fetch(`/api/cnpj/${digits}`);
      const data = (await response.json()) as {
        razaoSocial?: string;
        nomeFantasia?: string;
        municipio?: string;
        uf?: string;
        cep?: string;
        email?: string;
        telefone?: string;
        situacao?: string;
        error?: string;
      };

      if (!response.ok) {
        setCnpjLookup({
          tone: 'error',
          message:
            data.error ||
            'CNPJ não localizado. Preencha os dados manualmente.',
        });
        return;
      }

      const displayName = formatCompanyDisplayName(
        data.nomeFantasia || '',
        data.razaoSocial || '',
      );
      const matchedCity = data.municipio
        ? matchRegionalCity(data.municipio, ALL_REGIONAL_CITIES)
        : '';

      const patch: Partial<B2BQuoteDraft> = {};
      if (displayName) patch.companyName = displayName;
      if (matchedCity) patch.city = matchedCity;
      if (data.cep) patch.cep = formatCepInput(data.cep);
      if (data.email && !draft.email.trim()) patch.email = data.email;
      if (data.telefone && !draft.whatsapp.trim()) {
        patch.whatsapp = formatPhoneInput(data.telefone);
      }

      handleFieldChange(patch);

      const statusText = data.situacao ? ` · ${data.situacao}` : '';
      const cityHint = data.municipio
        ? ` (${data.municipio}${data.uf ? `/${data.uf}` : ''})`
        : '';
      setCnpjLookup({
        tone: 'success',
        message: `Dados preenchidos automaticamente${cityHint}${statusText}`,
      });
    } catch {
      setCnpjLookup({
        tone: 'error',
        message: 'Falha ao consultar CNPJ. Preencha manualmente.',
      });
    }
  };

  const fetchCepDetails = async (rawCep: string) => {
    const digits = rawCep.replace(/\D/g, '');
    if (digits.length !== 8) {
      setCepLookup({
        tone: 'error',
        message: 'Digite os 8 números do CEP.',
      });
      return;
    }

    lastFetchedCepRef.current = digits;
    setCepLookup({ tone: 'loading', message: 'Consultando CEP...' });

    try {
      const response = await fetch(`/api/cep/${digits}`);
      const data = (await response.json()) as {
        localidade?: string;
        bairro?: string;
        uf?: string;
        error?: string;
      };

      if (!response.ok) {
        setCepLookup({
          tone: 'error',
          message: data.error || 'CEP não encontrado.',
        });
        return;
      }

      if (data.localidade) {
        const matchedCity = matchRegionalCity(
          data.localidade,
          ALL_REGIONAL_CITIES,
        );
        handleFieldChange({ city: matchedCity });
      }

      const locationLabel = [data.bairro, data.localidade, data.uf]
        .filter(Boolean)
        .join(' · ');
      setCepLookup({
        tone: 'success',
        message: locationLabel || 'Cidade preenchida pelo CEP.',
      });
    } catch {
      setCepLookup({
        tone: 'error',
        message: 'Não foi possível consultar o CEP agora.',
      });
    }
  };

  const handleCnpjChange = (value: string) => {
    const formatted = formatCnpjInput(value);
    handleFieldChange({ cnpj: formatted });
    const digits = formatted.replace(/\D/g, '');
    if (digits.length < 14 && cnpjLookup.tone !== 'idle') {
      setCnpjLookup({ tone: 'idle', message: '' });
      lastFetchedCnpjRef.current = '';
    }
    if (digits.length === 14 && digits !== lastFetchedCnpjRef.current) {
      void fetchCnpjDetails(digits);
    }
  };

  const handleCepChange = (value: string) => {
    const formatted = formatCepInput(value);
    handleFieldChange({ cep: formatted });
    const digits = formatted.replace(/\D/g, '');
    if (digits.length < 8 && cepLookup.tone !== 'idle') {
      setCepLookup({ tone: 'idle', message: '' });
      lastFetchedCepRef.current = '';
    }
    if (digits.length === 8 && digits !== lastFetchedCepRef.current) {
      void fetchCepDetails(digits);
    }
  };

  const handleToggleBrand = (brandId: BrandId) => {
    handleFieldChange({
      selectedBrands: toggleArrayValue(draft.selectedBrands, brandId),
    });
  };

  const handleQuickAddLine = (lineName: string, brandId: BrandId) => {
    const existing = quoteItems.find(
      (item) => item.name.toLowerCase() === lineName.toLowerCase(),
    );
    const nextBrands = draft.selectedBrands.includes(brandId)
      ? draft.selectedBrands
      : [...draft.selectedBrands, brandId];

    if (existing) {
      handleFieldChange({
        quoteItems: removeQuoteLineItem(quoteItems, existing.id),
      });
    } else {
      handleFieldChange({
        selectedBrands: nextBrands,
        quoteItems: addQuoteLineItem(quoteItems, lineName),
      });
    }
  };

  const handleAddCustomItem = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newItemName.trim();
    if (!trimmed) return;
    handleFieldChange({
      quoteItems: addQuoteLineItem(quoteItems, trimmed),
    });
    setNewItemName('');
  };

  const handleRemoveItem = (id: string) => {
    handleFieldChange({
      quoteItems: removeQuoteLineItem(quoteItems, id),
    });
  };

  const focusFieldById = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (
      el instanceof HTMLInputElement ||
      el instanceof HTMLSelectElement ||
      el instanceof HTMLTextAreaElement ||
      el instanceof HTMLButtonElement
    ) {
      el.focus({ preventScroll: true });
    }
  };

  const runValidation = () => {
    const nextErrors = validateQuoteRequest(draft);
    setErrors(nextErrors);
    return !hasValidationErrors(nextErrors);
  };

  const handleWhatsAppClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!runValidation()) {
      event.preventDefault();
    }
  };

  const hasAnyFilledField =
    draft.companyName.trim() !== '' ||
    draft.cnpj.trim() !== '' ||
    draft.cep.trim() !== '' ||
    draft.whatsapp.trim() !== '' ||
    draft.email.trim() !== '' ||
    draft.city.trim() !== '' ||
    draft.itemsDescription.trim() !== '' ||
    draft.selectedBrands.length > 0 ||
    quoteItems.length > 0;

  return (
    <section id="cotacao" className="band-mist py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
        {/* Clean, Direct Section Header */}
        <BlurReveal>
          <p className="font-mono text-xs font-semibold tracking-[0.08em] uppercase text-[#285E7B]">
            Orçamento comercial
          </p>
          <h2 className="mt-1.5 font-display text-2xl font-bold tracking-[-0.03em] text-[#0D2534] sm:text-3xl lg:text-[34px]">
            Solicite sua cotação direto com as fábricas.
          </h2>
          <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-[#425663] sm:text-[15.5px]">
            Escolha as marcas, selecione os produtos desejados e informe os
            dados da empresa para agilizar o atendimento.
          </p>
        </BlurReveal>

        {/* 2-Column Quotation Desk */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
          {/* LEFT: Interactive Form Surface (7 Cols) */}
          <div className="cluis-block flex flex-col gap-6 rounded-2xl p-5 sm:p-7 lg:col-span-7">
            {/* Step 1: High-Contrast Filled Factory Selection Blocks */}
            <div id="quote-step-scope">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-sm font-bold text-[#0D2534] sm:text-[15px]">
                  1. Escolha as fábricas
                </h3>
                <span className="text-xs font-medium text-[#546875]">
                  Uma ou mais opções
                </span>
              </div>

              {errors.scope && (
                <p
                  role="alert"
                  className="mt-2.5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{errors.scope}</span>
                </p>
              )}

              <div
                role="group"
                aria-label="Seleção de fábricas para orçamento"
                data-testid="quote-factory-checklist"
                className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3"
              >
                {BRANDS.map((brand) => {
                  const active = draft.selectedBrands.includes(brand.id);
                  return (
                    <motion.button
                      key={brand.id}
                      type="button"
                      role="checkbox"
                      aria-checked={active}
                      aria-label={brand.name}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={TACTILE_SPRING}
                      onClick={() => handleToggleBrand(brand.id)}
                      className={`group relative flex min-h-[96px] flex-col items-center justify-center gap-2.5 rounded-2xl border-2 px-4 py-3.5 text-center transition-all duration-150 ${
                        active
                          ? 'border-[#0D2534] bg-[#0D2534] text-white shadow-[0_14px_28px_rgba(13,37,52,0.24)]'
                          : 'border-[#BDD0DD] bg-white text-[#102A3A] shadow-[0_4px_12px_rgba(13,37,52,0.05)] hover:border-[#285E7B] hover:bg-[#F3F8FC]'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                          active
                            ? 'border-[#7BC2E5] bg-[#285E7B] text-white'
                            : 'border-[#AFC3D1] bg-[#F4F8FB] group-hover:border-[#285E7B]'
                        }`}
                      >
                        {active && <CheckDrawSvg className="h-3 w-3" />}
                      </span>

                      <div
                        className={`flex h-9 w-full max-w-[136px] items-center justify-center rounded-xl px-2.5 transition-colors ${
                          active ? 'bg-white shadow-xs' : 'bg-transparent'
                        }`}
                      >
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className={`${QUOTE_LOGO_SIZE[brand.id]} w-auto max-w-[114px] object-contain`}
                        />
                      </div>

                      <span
                        className={`text-[11.5px] font-semibold leading-tight ${
                          active ? 'text-[#CFE6F3]' : 'text-[#4B6170]'
                        }`}
                      >
                        {brand.specialty}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Clean Product & Line Selection — Sends Items Straight to Right Summary */}
            <div className="border-t border-[#E4EDF3] pt-5">
              <h3 className="font-display text-sm font-bold text-[#0D2534] sm:text-[15px]">
                2. Produtos de interesse
              </h3>

              {/* High-Contrast Filled Quick-Select Line Buttons */}
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestedLines.map((line) => {
                  const isAdded = quoteItems.some(
                    (item) =>
                      item.name.toLowerCase() === line.name.toLowerCase(),
                  );
                  return (
                    <motion.button
                      key={line.id}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      transition={TACTILE_SPRING}
                      onClick={() => handleQuickAddLine(line.name, line.brandId)}
                      className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border-2 px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                        isAdded
                          ? 'border-[#0D2534] bg-[#0D2534] text-white shadow-[0_6px_16px_rgba(13,37,52,0.2)]'
                          : 'border-[#BDD0DD] bg-white text-[#102A3A] shadow-[0_2px_6px_rgba(13,37,52,0.04)] hover:border-[#285E7B] hover:bg-[#EFF6FB]'
                      }`}
                    >
                      {isAdded ? (
                        <CheckDrawSvg className="h-3.5 w-3.5 shrink-0 text-[#8FD0F0]" />
                      ) : (
                        <Plus
                          className="h-3.5 w-3.5 shrink-0 text-[#285E7B]"
                          aria-hidden="true"
                        />
                      )}
                      <span>{line.name}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Single Clean Product Adder — Zero Quantity Field & Zero Duplicate List Below */}
              <div className="mt-3.5 flex flex-col gap-2 sm:flex-row">
                <input
                  id="quote-item-input"
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomItem();
                    }
                  }}
                  placeholder="Adicionar produto ou referência específica..."
                  aria-label="Adicionar produto ou referência à cotação"
                  className="h-11 flex-1 rounded-xl border border-[#C3D4E0] bg-white px-3.5 text-[13px] text-[#0D2534] placeholder:text-[#6B7E8A] transition-all focus:border-[#285E7B] focus:ring-2 focus:ring-[#285E7B]/15 focus:outline-none"
                />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  transition={TACTILE_SPRING}
                  onClick={() => handleAddCustomItem()}
                  disabled={!newItemName.trim()}
                  data-testid="quote-add-item-btn"
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#0D2534] px-5 text-xs font-bold text-white transition-colors hover:bg-[#285E7B] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Adicionar</span>
                </motion.button>
              </div>

              {/* Optional Compact Notes */}
              <div className="mt-3.5">
                <label
                  htmlFor="quote-items-description"
                  className="block text-xs font-semibold text-[#334A57]"
                >
                  Observações adicionais (opcional)
                </label>
                <textarea
                  id="quote-items-description"
                  rows={2}
                  value={draft.itemsDescription}
                  onChange={(e) =>
                    handleFieldChange({ itemsDescription: e.target.value })
                  }
                  placeholder="Prazo desejado, acabamentos ou detalhes extras..."
                  className="mt-1.5 w-full resize-none rounded-xl border border-[#C3D4E0] bg-white px-3.5 py-2.5 text-[13px] text-[#0D2534] placeholder:text-[#6B7E8A] transition-all focus:border-[#285E7B] focus:ring-2 focus:ring-[#285E7B]/15 focus:outline-none"
                />
              </div>
            </div>

            {/* Step 3: Exactly 6 Essential Company Identification Fields (Zero Stored Registration) */}
            <div className="border-t border-[#E4EDF3] pt-5">
              <h3 className="font-display text-sm font-bold text-[#0D2534] sm:text-[15px]">
                3. Identificação da empresa
              </h3>

              <div className="mt-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {/* 1. CNPJ (Mandatory, Auto-fills Receita Federal Fields Without Saving) */}
                <div>
                  <label
                    htmlFor="quote-cnpj"
                    className="block text-xs font-semibold text-[#0D2534]"
                  >
                    CNPJ <span className="text-[#285E7B]">*</span>
                  </label>
                  <div className="mt-1.5 flex gap-1.5">
                    <input
                      id="quote-cnpj"
                      type="text"
                      inputMode="numeric"
                      value={draft.cnpj}
                      onChange={(e) => handleCnpjChange(e.target.value)}
                      placeholder="00.000.000/0001-00"
                      aria-invalid={Boolean(errors.cnpj)}
                      className={`h-10 min-w-0 flex-1 rounded-xl border px-3.5 font-mono text-[13px] text-[#0D2534] placeholder:font-sans placeholder:text-[#6B7E8A] transition-all focus:bg-white focus:ring-2 focus:outline-none ${
                        errors.cnpj
                          ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-500/15'
                          : 'border-[#C3D4E0] bg-white focus:border-[#285E7B] focus:ring-[#285E7B]/15'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => void fetchCnpjDetails(draft.cnpj)}
                      disabled={cnpjLookup.tone === 'loading'}
                      aria-label="Consultar dados pelo CNPJ"
                      data-testid="cnpj-lookup-btn"
                      className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[#BDD0DD] bg-[#EAF3F8] px-3 text-xs font-semibold text-[#0D2534] transition-colors hover:border-[#285E7B] hover:bg-[#D8E9F4] disabled:opacity-50"
                    >
                      {cnpjLookup.tone === 'loading' ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <Search className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      <span className="hidden sm:inline">Buscar</span>
                    </button>
                  </div>
                  {errors.cnpj && (
                    <p role="alert" className="mt-1 text-[11px] font-medium text-red-700">
                      {errors.cnpj}
                    </p>
                  )}
                  {cnpjLookup.tone !== 'idle' && (
                    <p
                      data-testid="cnpj-lookup-status"
                      className={`mt-1 flex items-center gap-1 text-[11px] font-medium ${
                        cnpjLookup.tone === 'error'
                          ? 'text-red-700'
                          : cnpjLookup.tone === 'success'
                            ? 'text-[#1F6A4A]'
                            : 'text-[#285E7B]'
                      }`}
                    >
                      {cnpjLookup.tone === 'success' && (
                        <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden="true" />
                      )}
                      <span className="truncate">{cnpjLookup.message}</span>
                    </p>
                  )}
                </div>

                {/* 2. CEP (Optional, ViaCEP Auto-fill) */}
                <div>
                  <label
                    htmlFor="quote-cep"
                    className="block text-xs font-semibold text-[#0D2534]"
                  >
                    CEP
                  </label>
                  <div className="mt-1.5 flex gap-1.5">
                    <input
                      id="quote-cep"
                      type="text"
                      inputMode="numeric"
                      value={draft.cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      placeholder="11700-000"
                      className="h-10 min-w-0 flex-1 rounded-xl border border-[#C3D4E0] bg-white px-3.5 font-mono text-[13px] text-[#0D2534] placeholder:font-sans placeholder:text-[#6B7E8A] transition-all focus:border-[#285E7B] focus:ring-2 focus:ring-[#285E7B]/15 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => void fetchCepDetails(draft.cep)}
                      disabled={cepLookup.tone === 'loading'}
                      aria-label="Consultar cidade pelo CEP"
                      data-testid="cep-lookup-btn"
                      className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[#BDD0DD] bg-[#EAF3F8] px-3 text-xs font-semibold text-[#0D2534] transition-colors hover:border-[#285E7B] hover:bg-[#D8E9F4] disabled:opacity-50"
                    >
                      {cepLookup.tone === 'loading' ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <Search className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      <span className="hidden sm:inline">Buscar</span>
                    </button>
                  </div>
                  {cepLookup.tone !== 'idle' && (
                    <p
                      data-testid="cep-lookup-status"
                      className={`mt-1 flex items-center gap-1 text-[11px] font-medium ${
                        cepLookup.tone === 'error'
                          ? 'text-red-700'
                          : cepLookup.tone === 'success'
                            ? 'text-[#1F6A4A]'
                            : 'text-[#285E7B]'
                      }`}
                    >
                      {cepLookup.tone === 'success' && (
                        <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden="true" />
                      )}
                      <span className="truncate">{cepLookup.message}</span>
                    </p>
                  )}
                </div>

                {/* 3. Company Name (Mandatory) */}
                <div>
                  <label
                    htmlFor="quote-company-name"
                    className="block text-xs font-semibold text-[#0D2534]"
                  >
                    Empresa <span className="text-[#285E7B]">*</span>
                  </label>
                  <input
                    id="quote-company-name"
                    type="text"
                    value={draft.companyName}
                    onChange={(e) =>
                      handleFieldChange({ companyName: e.target.value })
                    }
                    placeholder="Razão social ou nome da loja"
                    aria-invalid={Boolean(errors.companyName)}
                    className={`mt-1.5 h-10 w-full rounded-xl border px-3.5 text-[13px] text-[#0D2534] placeholder:text-[#6B7E8A] transition-all focus:bg-white focus:ring-2 focus:outline-none ${
                      errors.companyName
                        ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-500/15'
                        : 'border-[#C3D4E0] bg-white focus:border-[#285E7B] focus:ring-[#285E7B]/15'
                    }`}
                  />
                  {errors.companyName && (
                    <p role="alert" className="mt-1 text-[11px] font-medium text-red-700">
                      {errors.companyName}
                    </p>
                  )}
                </div>

                {/* 4. City Selector (Mandatory) */}
                <div>
                  <label
                    htmlFor="quote-city"
                    className="block text-xs font-semibold text-[#0D2534]"
                  >
                    Cidade <span className="text-[#285E7B]">*</span>
                  </label>
                  <select
                    id="quote-city"
                    value={draft.city}
                    onChange={(e) => handleFieldChange({ city: e.target.value })}
                    aria-invalid={Boolean(errors.city)}
                    className={`mt-1.5 h-10 w-full rounded-xl border px-3 text-[13px] text-[#0D2534] transition-all focus:bg-white focus:ring-2 focus:outline-none ${
                      errors.city
                        ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-500/15'
                        : 'border-[#C3D4E0] bg-white focus:border-[#285E7B] focus:ring-[#285E7B]/15'
                    }`}
                  >
                    <option value="">Selecione a cidade</option>
                    <optgroup label="Baixada Santista">
                      {BAIXADA_CITY_NAMES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Vale do Ribeira">
                      {VALE_CITY_NAMES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </optgroup>
                    <option value="Outra cidade da região">
                      Outra cidade da região
                    </option>
                  </select>
                  {errors.city && (
                    <p role="alert" className="mt-1 text-[11px] font-medium text-red-700">
                      {errors.city}
                    </p>
                  )}
                </div>

                {/* 5. WhatsApp Contact (Mandatory) */}
                <div>
                  <label
                    htmlFor="quote-whatsapp"
                    className="block text-xs font-semibold text-[#0D2534]"
                  >
                    WhatsApp <span className="text-[#285E7B]">*</span>
                  </label>
                  <input
                    id="quote-whatsapp"
                    type="tel"
                    inputMode="tel"
                    value={draft.whatsapp}
                    onChange={(e) =>
                      handleFieldChange({
                        whatsapp: formatPhoneInput(e.target.value),
                      })
                    }
                    placeholder="(13) 99999-0000"
                    aria-invalid={Boolean(errors.whatsapp)}
                    className={`mt-1.5 h-10 w-full rounded-xl border px-3.5 font-mono text-[13px] text-[#0D2534] placeholder:font-sans placeholder:text-[#6B7E8A] transition-all focus:bg-white focus:ring-2 focus:outline-none ${
                      errors.whatsapp
                        ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-500/15'
                        : 'border-[#C3D4E0] bg-white focus:border-[#285E7B] focus:ring-[#285E7B]/15'
                    }`}
                  />
                  {errors.whatsapp && (
                    <p role="alert" className="mt-1 text-[11px] font-medium text-red-700">
                      {errors.whatsapp}
                    </p>
                  )}
                </div>

                {/* 6. Email Contact (Mandatory) */}
                <div>
                  <label
                    htmlFor="quote-email"
                    className="block text-xs font-semibold text-[#0D2534]"
                  >
                    E-mail <span className="text-[#285E7B]">*</span>
                  </label>
                  <input
                    id="quote-email"
                    type="email"
                    value={draft.email}
                    onChange={(e) => handleFieldChange({ email: e.target.value })}
                    placeholder="compras@suaempresa.com.br"
                    aria-invalid={Boolean(errors.email)}
                    className={`mt-1.5 h-10 w-full rounded-xl border px-3.5 text-[13px] text-[#0D2534] placeholder:text-[#6B7E8A] transition-all focus:bg-white focus:ring-2 focus:outline-none ${
                      errors.email
                        ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-500/15'
                        : 'border-[#C3D4E0] bg-white focus:border-[#285E7B] focus:ring-[#285E7B]/15'
                    }`}
                  />
                  {errors.email && (
                    <p role="alert" className="mt-1 text-[11px] font-medium text-red-700">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Structured Quote Summary & Direct Dispatch (5 Cols) */}
          <SpotlightSurface className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#193A4F] bg-[#0D2534] text-white shadow-[0_18px_46px_rgba(7,23,34,0.18)] lg:col-span-5">
            {/* Full-Width Progress Bar */}
            <div className="relative z-10 border-b border-white/10 bg-[#081A26] px-5 py-4 sm:px-7">
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span
                  data-testid="quote-progress-headline"
                  className="font-semibold text-[#E8F2F8]"
                >
                  {progress.statusHeadline}
                </span>
                <span
                  data-testid="quote-progress-percent"
                  className="font-mono font-bold text-[#A8D1E7] tabular-nums"
                >
                  {progress.percent}%
                </span>
              </div>
              <div
                role="progressbar"
                aria-label="Andamento da cotação"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress.percent}
                className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/12"
              >
                <motion.div
                  initial={false}
                  animate={{ width: `${progress.percent}%` }}
                  transition={FLUID_SPRING}
                  className={`h-full rounded-full ${
                    progress.isReady
                      ? 'bg-[#6ED4A8]'
                      : 'bg-gradient-to-r from-[#5EA6CA] to-[#A8D1E7]'
                  }`}
                />
              </div>
            </div>

            <div className="relative z-10 flex flex-1 flex-col p-5 sm:p-7">
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-[#9ECBE2]">
                    Resumo do pedido
                  </p>
                  <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-white">
                    Sua lista pronta para envio
                  </h3>
                </div>
                {hasAnyFilledField && (
                  <button
                    type="button"
                    onClick={() => {
                      onResetDraft();
                      setErrors({});
                      setNewItemName('');
                      setCnpjLookup({ tone: 'idle', message: '' });
                      setCepLookup({ tone: 'idle', message: '' });
                      lastFetchedCnpjRef.current = '';
                      lastFetchedCepRef.current = '';
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#A8D1E7] transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <ResetSvg className="h-3.5 w-3.5" />
                    <span>Limpar</span>
                  </button>
                )}
              </div>

              {/* Structured Live Summary Sections */}
              <div className="mt-5 flex-1 space-y-4">
                {/* Fábricas */}
                <div className="rounded-xl border border-white/12 bg-white/[0.05] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9ECBE2]">
                      Fábricas
                    </span>
                    <span className="font-mono text-[11px] text-[#8FB4C9] tabular-nums">
                      {selectedBrandObjects.length > 0
                        ? `${selectedBrandObjects.length} selecionada${selectedBrandObjects.length > 1 ? 's' : ''}`
                        : 'Nenhuma marcada'}
                    </span>
                  </div>
                  {selectedBrandObjects.length > 0 ? (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {selectedBrandObjects.map((brand) => (
                        <span
                          key={brand.id}
                          className="inline-flex items-center rounded-lg bg-white/14 px-2.5 py-1 text-xs font-semibold text-white"
                        >
                          {brand.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => focusFieldById('quote-step-scope')}
                      className="mt-2 text-left text-xs text-[#9EB9C8] transition-colors hover:text-white"
                    >
                      Selecione Roma Pincéis, Soprano ou Carbografite ao lado.
                    </button>
                  )}
                </div>

                {/* Produtos listados (Única lista de itens, com remoção direta) */}
                <div className="rounded-xl border border-white/12 bg-white/[0.05] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9ECBE2]">
                      Produtos na cotação
                    </span>
                    <span className="font-mono text-[11px] text-[#8FB4C9] tabular-nums">
                      {quoteItems.length}{' '}
                      {quoteItems.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>

                  {quoteItems.length > 0 ? (
                    <ul
                      data-testid="quote-summary-items"
                      className="mt-2.5 space-y-1.5 text-xs text-[#E4EFF5]"
                    >
                      {quoteItems.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.06] px-2.5 py-1.5"
                        >
                          <span className="truncate font-medium text-white">
                            {item.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            aria-label={`Remover ${item.name}`}
                            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[#9EB9C8] transition-colors hover:bg-white/15 hover:text-white"
                          >
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-[#9EB9C8]">
                      Os produtos escolhidos ao lado aparecem aqui.
                    </p>
                  )}

                  {draft.itemsDescription.trim() && (
                    <p className="mt-2.5 border-t border-white/10 pt-2.5 text-xs leading-relaxed text-[#C7DBE6]">
                      {draft.itemsDescription.trim()}
                    </p>
                  )}
                </div>

                {/* Identificação da empresa */}
                <div className="rounded-xl border border-white/12 bg-white/[0.05] p-4">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9ECBE2]">
                    Identificação da empresa
                  </span>
                  <dl className="mt-2.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-[#9EB9C8]">Empresa</dt>
                      <dd className="truncate font-semibold text-white">
                        {draft.companyName.trim() ? (
                          draft.companyName.trim()
                        ) : (
                          <button
                            type="button"
                            onClick={() => focusFieldById('quote-company-name')}
                            className="font-normal text-[#8FB4C9] underline decoration-white/25 underline-offset-2 hover:text-white"
                          >
                            Informar empresa
                          </button>
                        )}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-[#9EB9C8]">CNPJ</dt>
                      <dd className="font-mono text-[#DCEBF4] tabular-nums">
                        {draft.cnpj.trim() ? (
                          draft.cnpj.trim()
                        ) : (
                          <button
                            type="button"
                            onClick={() => focusFieldById('quote-cnpj')}
                            className="font-sans font-normal text-[#8FB4C9] underline decoration-white/25 underline-offset-2 hover:text-white"
                          >
                            Informar CNPJ
                          </button>
                        )}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-[#9EB9C8]">Cidade</dt>
                      <dd className="truncate font-semibold text-white">
                        {draft.city.trim() ? (
                          draft.city.trim()
                        ) : (
                          <button
                            type="button"
                            onClick={() => focusFieldById('quote-city')}
                            className="font-normal text-[#8FB4C9] underline decoration-white/25 underline-offset-2 hover:text-white"
                          >
                            Selecionar cidade
                          </button>
                        )}
                      </dd>
                    </div>
                    {draft.cep.trim() && (
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-[#9EB9C8]">CEP</dt>
                        <dd className="font-mono text-[#DCEBF4] tabular-nums">
                          {draft.cep.trim()}
                        </dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-[#9EB9C8]">WhatsApp</dt>
                      <dd className="font-mono text-[#DCEBF4] tabular-nums">
                        {draft.whatsapp.trim() ? (
                          draft.whatsapp.trim()
                        ) : (
                          <button
                            type="button"
                            onClick={() => focusFieldById('quote-whatsapp')}
                            className="font-sans font-normal text-[#8FB4C9] underline decoration-white/25 underline-offset-2 hover:text-white"
                          >
                            Informar WhatsApp
                          </button>
                        )}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-[#9EB9C8]">E-mail</dt>
                      <dd className="truncate text-[#DCEBF4]">
                        {draft.email.trim() ? (
                          draft.email.trim()
                        ) : (
                          <button
                            type="button"
                            onClick={() => focusFieldById('quote-email')}
                            className="font-normal text-[#8FB4C9] underline decoration-white/25 underline-offset-2 hover:text-white"
                          >
                            Informar e-mail
                          </button>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Bottom Direct Dispatch Action + Centered, Balanced CNPJ Notice */}
            <div className="relative z-10 space-y-4 border-t border-white/10 bg-[#081A26] p-5 sm:p-6">
              <motion.a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppClick}
                whileHover={{ y: -1.5, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={TACTILE_SPRING}
                data-testid="quote-submit-button"
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#0D2534] shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition-colors duration-150 hover:bg-[#DCEBF4]"
              >
                <WhatsAppBubbleSvg className="h-4 w-4 shrink-0 text-[#285E7B]" />
                <span>Enviar orçamento</span>
              </motion.a>

              <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-center">
                <IndustryBadgeSvg className="h-4 w-4 shrink-0 text-[#8FC5E3]" />
                <span className="text-[11.5px] font-medium text-[#C9DFEC]">
                  Exclusivo para empresas com CNPJ e Inscrição Estadual
                </span>
              </div>
            </div>
          </SpotlightSurface>
        </div>
      </div>
    </section>
  );
}
