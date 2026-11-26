import { useMemo, useState, type FormEvent, type MouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Plus, X } from 'lucide-react';
import {
  ATTENDANTS,
  BRANDS,
  PRODUCT_LINES,
  type BrandId,
} from '../data/cluisData';
import { BAIXADA_POLYGONS, VALE_POLYGONS } from '../data/mapPolygons';
import {
  addQuoteLineItem,
  buildB2BQuoteMessage,
  buildWhatsAppUrl,
  formatCnpjInput,
  getQuoteProgress,
  hasValidationErrors,
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
import {
  FLUID_EASE,
  FLUID_SPRING,
  TACTILE_SPRING,
} from './MotionPrimitives';

interface QuoteSectionProps {
  draft: B2BQuoteDraft;
  onDraftChange: (patch: Partial<B2BQuoteDraft>) => void;
  onResetDraft: () => void;
}

const BAIXADA_CITY_NAMES = BAIXADA_POLYGONS.map((c) => c.name);
const VALE_CITY_NAMES = VALE_POLYGONS.filter(
  (c) => c.featured || c.name === 'Pedro de Toledo',
).map((c) => c.name);

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

export function QuoteSection({
  draft,
  onDraftChange,
  onResetDraft,
}: QuoteSectionProps) {
  const [errors, setErrors] = useState<QuoteValidationErrors>({});
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');

  const quoteItems = draft.quoteItems ?? [];

  const selectedAttendant =
    ATTENDANTS.find((a) => a.id === draft.attendantId) ?? ATTENDANTS[1];

  const progress = useMemo(() => getQuoteProgress(draft), [draft]);
  const formattedMessage = useMemo(() => buildB2BQuoteMessage(draft), [draft]);

  const whatsappUrl = useMemo(
    () => buildWhatsAppUrl(selectedAttendant.phoneRaw, formattedMessage),
    [selectedAttendant.phoneRaw, formattedMessage],
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
        ...(patch.companyName !== undefined ? { companyName: undefined } : {}),
        ...(patch.city !== undefined ? { city: undefined } : {}),
        ...(patch.selectedBrands !== undefined ||
        patch.quoteItems !== undefined ||
        patch.itemsDescription !== undefined
          ? { scope: undefined }
          : {}),
      }));
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
        quoteItems: addQuoteLineItem(quoteItems, lineName, ''),
      });
    }
  };

  const handleAddCustomItem = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newItemName.trim();
    if (!trimmed) return;
    handleFieldChange({
      quoteItems: addQuoteLineItem(quoteItems, trimmed, newItemQty),
    });
    setNewItemName('');
    setNewItemQty('');
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
    draft.contactName.trim() !== '' ||
    draft.city.trim() !== '' ||
    draft.itemsDescription.trim() !== '' ||
    draft.selectedBrands.length > 0 ||
    quoteItems.length > 0;

  return (
    <section id="cotacao" className="band-mist py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-10">
        {/* Header + Subtle Live Progress */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <BlurReveal>
            <p className="font-mono text-xs font-semibold tracking-[0.08em] uppercase text-[#285E7B]">
              Orçamento
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.03em] text-[#0D2534] sm:text-3xl lg:text-[34px]">
              Monte seu pedido de cotação.
            </h2>
          </BlurReveal>

          <div className="w-full max-w-[290px]">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span
                data-testid="quote-progress-headline"
                className="font-semibold text-[#0D2534]"
              >
                {progress.statusHeadline}
              </span>
              <span
                data-testid="quote-progress-percent"
                className="font-mono font-bold text-[#285E7B] tabular-nums"
              >
                {progress.percent}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Progresso do preenchimento do orçamento"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress.percent}
              className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#D3E0EA]"
            >
              <motion.div
                initial={false}
                animate={{ width: `${progress.percent}%` }}
                transition={FLUID_SPRING}
                className={`h-full rounded-full ${
                  progress.isReady ? 'bg-[#0D2534]' : 'bg-[#285E7B]'
                }`}
              />
            </div>
          </div>
        </div>

        {/* 2-Column Quotation Desk */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
          {/* LEFT: Rounded Interactive Form Surface (7 Cols) */}
          <div className="flex flex-col gap-6 rounded-2xl bg-white p-5 shadow-[0_14px_38px_rgba(13,37,52,0.07)] ring-1 ring-[#0D2534]/[0.06] sm:p-7 lg:col-span-7">
            {/* Step 1: Rounded Factory Logo Cards */}
            <div id="quote-step-scope">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-sm font-bold text-[#0D2534] sm:text-[15px]">
                  1. Escolha as fábricas
                </h3>
                <span className="text-xs text-[#586B78]">
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
                      className={`group relative flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-2xl border px-4 py-3.5 text-center transition-all duration-150 ${
                        active
                          ? 'border-[#285E7B] bg-[#EEF5FA] shadow-[0_8px_20px_rgba(40,94,123,0.12)] ring-1 ring-[#285E7B]/20'
                          : 'border-[#DCE5EC] bg-[#F8FAFC] hover:border-[#9EBACA] hover:bg-white'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${
                          active
                            ? 'border-[#0D2534] bg-[#0D2534] text-white'
                            : 'border-[#C1D1DC] bg-white group-hover:border-[#285E7B]'
                        }`}
                      >
                        {active && <CheckDrawSvg className="h-2.5 w-2.5" />}
                      </span>

                      <div className="flex h-7 items-center justify-center">
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className={`${QUOTE_LOGO_SIZE[brand.id]} w-auto max-w-[116px] object-contain transition-opacity ${
                            active ? 'opacity-100' : 'opacity-85 group-hover:opacity-100'
                          }`}
                        />
                      </div>

                      <span className="text-[11px] font-medium text-[#546875]">
                        {brand.specialty}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Interactive Item List Builder */}
            <div className="border-t border-[#E8EFF4] pt-5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-sm font-bold text-[#0D2534] sm:text-[15px]">
                  2. Monte sua lista de itens
                </h3>
                <span className="text-xs text-[#586B78]">
                  Toque nas linhas ou adicione códigos
                </span>
              </div>

              {/* Quick-add product line chips */}
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
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isAdded
                          ? 'border-[#0D2534] bg-[#0D2534] text-white'
                          : 'border-[#D7E2EA] bg-[#F5F9FC] text-[#243B49] hover:border-[#285E7B] hover:bg-white'
                      }`}
                    >
                      {isAdded ? (
                        <CheckDrawSvg className="h-3 w-3 shrink-0 text-[#A8D1E7]" />
                      ) : (
                        <Plus
                          className="h-3 w-3 shrink-0 text-[#285E7B]"
                          aria-hidden="true"
                        />
                      )}
                      <span>{line.name}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Structured Item + Quantity Adder */}
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
                  placeholder="Digite o produto ou código (ex.: Rolo antigota 23cm)"
                  aria-label="Produto ou código para adicionar à lista"
                  className="h-10 flex-1 rounded-xl border border-[#D4DFE6] bg-[#F8FAFC] px-3.5 text-[13px] text-[#0D2534] placeholder:text-[#6B7E8A] transition-all focus:border-[#285E7B] focus:bg-white focus:ring-2 focus:ring-[#285E7B]/15 focus:outline-none"
                />
                <div className="flex gap-2">
                  <input
                    id="quote-item-qty"
                    type="text"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomItem();
                      }
                    }}
                    placeholder="Qtd."
                    aria-label="Quantidade do item"
                    className="h-10 w-24 rounded-xl border border-[#D4DFE6] bg-[#F8FAFC] px-3 text-[13px] text-[#0D2534] placeholder:text-[#6B7E8A] transition-all focus:border-[#285E7B] focus:bg-white focus:ring-2 focus:ring-[#285E7B]/15 focus:outline-none"
                  />
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    transition={TACTILE_SPRING}
                    onClick={() => handleAddCustomItem()}
                    disabled={!newItemName.trim()}
                    data-testid="quote-add-item-btn"
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#0D2534] px-4 text-xs font-bold text-white transition-colors hover:bg-[#285E7B] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Adicionar</span>
                  </motion.button>
                </div>
              </div>

              {/* Active Added Items List */}
              <AnimatePresence initial={false}>
                {quoteItems.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: FLUID_EASE }}
                    data-testid="quote-items-list"
                    className="mt-3 space-y-1.5 overflow-hidden"
                  >
                    {quoteItems.map((item) => (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.16, ease: FLUID_EASE }}
                        className="flex items-center justify-between gap-2 rounded-xl border border-[#DCE6EE] bg-[#F5F9FC] px-3.5 py-2 text-xs text-[#0D2534]"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#285E7B]" />
                          <span className="truncate font-semibold">
                            {item.name}
                          </span>
                          {item.quantity && (
                            <span className="shrink-0 rounded-md bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-[#285E7B] ring-1 ring-[#D7E3EC]">
                              {item.quantity}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          aria-label={`Remover ${item.name}`}
                          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[#607380] transition-colors hover:bg-white hover:text-[#0D2534]"
                        >
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>

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
                  className="mt-1.5 w-full resize-none rounded-xl border border-[#D4DFE6] bg-[#F8FAFC] px-3.5 py-2.5 text-[13px] text-[#0D2534] placeholder:text-[#6B7E8A] transition-all focus:border-[#285E7B] focus:bg-white focus:ring-2 focus:ring-[#285E7B]/15 focus:outline-none"
                />
              </div>
            </div>

            {/* Step 3: Store Details */}
            <div className="border-t border-[#E8EFF4] pt-5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-sm font-bold text-[#0D2534] sm:text-[15px]">
                  3. Dados da loja
                </h3>
                <span className="text-xs text-[#586B78]">
                  Campos com * são obrigatórios
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="quote-company-name"
                    className="block text-xs font-semibold text-[#0D2534]"
                  >
                    Nome da loja ou Razão Social <span className="text-[#285E7B]">*</span>
                  </label>
                  <input
                    id="quote-company-name"
                    type="text"
                    value={draft.companyName}
                    onChange={(e) =>
                      handleFieldChange({ companyName: e.target.value })
                    }
                    placeholder="Ex.: Depósito Praia Sul Ltda"
                    aria-invalid={Boolean(errors.companyName)}
                    className={`mt-1.5 h-10 w-full rounded-xl border px-3.5 text-[13px] text-[#0D2534] placeholder:text-[#6B7E8A] transition-all focus:bg-white focus:ring-2 focus:outline-none ${
                      errors.companyName
                        ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-500/15'
                        : 'border-[#D4DFE6] bg-[#F8FAFC] focus:border-[#285E7B] focus:ring-[#285E7B]/15'
                    }`}
                  />
                  {errors.companyName && (
                    <p role="alert" className="mt-1 text-[11px] font-medium text-red-700">
                      {errors.companyName}
                    </p>
                  )}
                </div>

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
                        : 'border-[#D4DFE6] bg-[#F8FAFC] focus:border-[#285E7B] focus:ring-[#285E7B]/15'
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

                <div>
                  <label
                    htmlFor="quote-cnpj"
                    className="block text-xs font-semibold text-[#0D2534]"
                  >
                    CNPJ (opcional)
                  </label>
                  <input
                    id="quote-cnpj"
                    type="text"
                    inputMode="numeric"
                    value={draft.cnpj}
                    onChange={(e) =>
                      handleFieldChange({ cnpj: formatCnpjInput(e.target.value) })
                    }
                    placeholder="00.000.000/0001-00"
                    className="mt-1.5 h-10 w-full rounded-xl border border-[#D4DFE6] bg-[#F8FAFC] px-3.5 font-mono text-[13px] text-[#0D2534] placeholder:font-sans placeholder:text-[#6B7E8A] transition-all focus:border-[#285E7B] focus:bg-white focus:ring-2 focus:ring-[#285E7B]/15 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="quote-contact-name"
                    className="block text-xs font-semibold text-[#0D2534]"
                  >
                    Seu nome (opcional)
                  </label>
                  <input
                    id="quote-contact-name"
                    type="text"
                    value={draft.contactName}
                    onChange={(e) =>
                      handleFieldChange({ contactName: e.target.value })
                    }
                    placeholder="Ex.: Marcos Silva"
                    className="mt-1.5 h-10 w-full rounded-xl border border-[#D4DFE6] bg-[#F8FAFC] px-3.5 text-[13px] text-[#0D2534] placeholder:text-[#6B7E8A] transition-all focus:border-[#285E7B] focus:bg-white focus:ring-2 focus:ring-[#285E7B]/15 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Clean Structured Quote Summary & Single Dispatch CTA (5 Cols) */}
          <SpotlightSurface className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#193A4F] bg-[#0D2534] text-white shadow-[0_18px_46px_rgba(7,23,34,0.18)] lg:col-span-5">
            <div className="relative z-10 flex flex-1 flex-col p-5 sm:p-7">
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-[#9ECBE2]">
                    Seu pedido
                  </p>
                  <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-white">
                    Resumo do orçamento
                  </h3>
                </div>
                {hasAnyFilledField && (
                  <button
                    type="button"
                    onClick={() => {
                      onResetDraft();
                      setErrors({});
                      setNewItemName('');
                      setNewItemQty('');
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
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9ECBE2]">
                      Fábricas
                    </span>
                    <span className="font-mono text-[11px] text-[#8FB4C9] tabular-nums">
                      {selectedBrandObjects.length > 0
                        ? `${selectedBrandObjects.length} selecionada${selectedBrandObjects.length > 1 ? 's' : ''}`
                        : 'Opcional se listar itens'}
                    </span>
                  </div>
                  {selectedBrandObjects.length > 0 ? (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {selectedBrandObjects.map((brand) => (
                        <span
                          key={brand.id}
                          className="inline-flex items-center rounded-lg bg-white/12 px-2.5 py-1 text-xs font-semibold text-white"
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

                {/* Itens listados */}
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9ECBE2]">
                      Itens do pedido
                    </span>
                    <span className="font-mono text-[11px] text-[#8FB4C9] tabular-nums">
                      {quoteItems.length}{' '}
                      {quoteItems.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>

                  {quoteItems.length > 0 ? (
                    <ul className="mt-2.5 space-y-1.5 text-xs text-[#E4EFF5]">
                      {quoteItems.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="truncate">• {item.name}</span>
                          {item.quantity && (
                            <span className="shrink-0 font-mono text-[11px] text-[#A8D1E7]">
                              {item.quantity}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-[#9EB9C8]">
                      Nenhum item adicionado ainda.
                    </p>
                  )}

                  {draft.itemsDescription.trim() && (
                    <p className="mt-2.5 border-t border-white/10 pt-2.5 text-xs leading-relaxed text-[#C7DBE6]">
                      {draft.itemsDescription.trim()}
                    </p>
                  )}
                </div>

                {/* Dados da loja */}
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9ECBE2]">
                    Identificação da loja
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
                            Informar nome
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
                    {draft.cnpj.trim() && (
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-[#9EB9C8]">CNPJ</dt>
                        <dd className="font-mono text-[#DCEBF4] tabular-nums">
                          {draft.cnpj.trim()}
                        </dd>
                      </div>
                    )}
                    {draft.contactName.trim() && (
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-[#9EB9C8]">Contato</dt>
                        <dd className="truncate text-[#DCEBF4]">
                          {draft.contactName.trim()}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>

            {/* Bottom Representative Selector + Single Action Button */}
            <div className="relative z-10 space-y-4 border-t border-white/10 bg-[#081A26] p-5 sm:p-6">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9ECBE2]">
                  Atendimento
                </p>
                <div
                  role="radiogroup"
                  aria-label="Escolher representante para atendimento"
                  className="mt-2 grid grid-cols-2 gap-1.5 rounded-xl bg-white/[0.06] p-1"
                >
                  {ATTENDANTS.map((person) => {
                    const selected = draft.attendantId === person.id;
                    return (
                      <button
                        key={person.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => handleFieldChange({ attendantId: person.id })}
                        className={`relative rounded-lg px-3 py-2 text-left transition-colors duration-150 ${
                          selected
                            ? 'text-white'
                            : 'text-[#A9C4D4] hover:text-white'
                        }`}
                      >
                        {selected && (
                          <motion.span
                            layoutId="quote-attendant-active"
                            transition={FLUID_SPRING}
                            className="absolute inset-0 rounded-lg bg-[#285E7B]"
                          />
                        )}
                        <div className="relative z-10 flex items-center justify-between gap-1">
                          <span className="text-xs font-bold">{person.name}</span>
                          {selected && (
                            <CheckDrawSvg className="h-3 w-3 text-[#DCEBF4]" />
                          )}
                        </div>
                        <p className="relative z-10 font-mono text-[10px] text-[#DCEBF4]/90 tabular-nums">
                          {person.phoneDisplay}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <motion.a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppClick}
                whileHover={{ y: -1.5 }}
                whileTap={{ scale: 0.98 }}
                transition={TACTILE_SPRING}
                data-testid="quote-submit-button"
                className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#0D2534] shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition-colors duration-150 hover:bg-[#DCEBF4]"
              >
                <WhatsAppBubbleSvg className="h-4 w-4 shrink-0 text-[#285E7B]" />
                <span>Enviar orçamento</span>
              </motion.a>

              <p className="flex items-center gap-1.5 text-[11px] text-[#9EB9C8]">
                <IndustryBadgeSvg className="h-3.5 w-3.5 shrink-0 text-[#A8D1E7]" />
                <span>Atendimento exclusivo para lojas e empresas com CNPJ e IE.</span>
              </p>
            </div>
          </SpotlightSurface>
        </div>
      </div>
    </section>
  );
}
