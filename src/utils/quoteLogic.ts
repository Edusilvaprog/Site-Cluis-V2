import { BRANDS, type BrandId } from '../data/cluisData';

export interface QuoteLineItem {
  id: string;
  name: string;
  quantity: string;
}

export interface B2BQuoteDraft {
  selectedBrands: BrandId[];
  quoteItems?: QuoteLineItem[];
  companyName: string;
  cnpj: string;
  contactName: string;
  city: string;
  itemsDescription: string;
  attendantId: 'carlos' | 'eduardo';
}

export interface QuoteValidationErrors {
  companyName?: string;
  city?: string;
  scope?: string;
}

export const QUOTE_STORAGE_KEY = 'cluis-b2b-quote-v5';

export const DEFAULT_QUOTE_DRAFT: B2BQuoteDraft = {
  selectedBrands: [],
  quoteItems: [],
  companyName: '',
  cnpj: '',
  contactName: '',
  city: '',
  itemsDescription: '',
  attendantId: 'eduardo',
};

export function formatCnpjInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function toggleArrayValue<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export function addQuoteLineItem(
  items: QuoteLineItem[] | undefined,
  name: string,
  quantity = '',
): QuoteLineItem[] {
  const trimmedName = name.trim();
  if (!trimmedName) return items ?? [];
  const list = items ?? [];
  const trimmedQty = quantity.trim();
  const existingIdx = list.findIndex(
    (item) => item.name.toLowerCase() === trimmedName.toLowerCase(),
  );
  if (existingIdx >= 0) {
    return list.map((item, idx) =>
      idx === existingIdx
        ? { ...item, quantity: trimmedQty || item.quantity }
        : item,
    );
  }
  return [
    ...list,
    {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: trimmedName,
      quantity: trimmedQty,
    },
  ];
}

export function removeQuoteLineItem(
  items: QuoteLineItem[] | undefined,
  id: string,
): QuoteLineItem[] {
  return (items ?? []).filter((item) => item.id !== id);
}

export function validateQuoteRequest(draft: B2BQuoteDraft): QuoteValidationErrors {
  const errors: QuoteValidationErrors = {};

  if (!draft.companyName.trim()) {
    errors.companyName = 'Informe o nome ou razão social da empresa.';
  }

  if (!draft.city.trim()) {
    errors.city = 'Selecione a cidade da empresa.';
  }

  const hasStructuredItems = (draft.quoteItems ?? []).length > 0;
  const hasScope =
    draft.selectedBrands.length > 0 ||
    hasStructuredItems ||
    draft.itemsDescription.trim().length > 0;

  if (!hasScope) {
    errors.scope =
      'Selecione ao menos uma fábrica ou adicione os itens para orçamento.';
  }

  return errors;
}

export function hasValidationErrors(errors: QuoteValidationErrors): boolean {
  return Boolean(errors.companyName || errors.city || errors.scope);
}

export interface QuoteChecklistStep {
  id: 'escopo' | 'empresa' | 'cidade';
  label: string;
  detail: string;
  completed: boolean;
  targetFieldId: string;
}

export interface QuoteProgressSummary {
  percent: number;
  completedCount: number;
  totalCount: number;
  isReady: boolean;
  statusHeadline: string;
  steps: QuoteChecklistStep[];
}

export function getQuoteProgress(draft: B2BQuoteDraft): QuoteProgressSummary {
  const brandsCount = draft.selectedBrands.length;
  const structuredCount = (draft.quoteItems ?? []).length;
  const hasNotes = draft.itemsDescription.trim().length > 0;
  const scopeCompleted = brandsCount > 0 || structuredCount > 0 || hasNotes;

  let scopeDetail = 'Selecione as fábricas ou adicione itens';
  if (brandsCount > 0) {
    const names = draft.selectedBrands
      .map((id) => BRANDS.find((b) => b.id === id)?.shortName)
      .filter(Boolean)
      .join(', ');
    if (structuredCount > 0) {
      scopeDetail = `${names} · ${structuredCount} ${structuredCount === 1 ? 'item' : 'itens'}`;
    } else if (hasNotes) {
      scopeDetail = `${names} + observações`;
    } else {
      scopeDetail = names;
    }
  } else if (structuredCount > 0) {
    scopeDetail = `${structuredCount} ${structuredCount === 1 ? 'item adicionado' : 'itens adicionados'}`;
  } else if (hasNotes) {
    scopeDetail = 'Itens informados';
  }

  const companyCompleted = draft.companyName.trim().length >= 2;
  const cityCompleted = draft.city.trim().length >= 2;

  const steps: QuoteChecklistStep[] = [
    {
      id: 'escopo',
      label: 'Fábricas e itens',
      detail: scopeDetail,
      completed: scopeCompleted,
      targetFieldId: 'quote-step-scope',
    },
    {
      id: 'empresa',
      label: 'Empresa',
      detail: companyCompleted
        ? draft.companyName.trim()
        : 'Razão social ou nome fantasia',
      completed: companyCompleted,
      targetFieldId: 'quote-company-name',
    },
    {
      id: 'cidade',
      label: 'Cidade',
      detail: cityCompleted ? draft.city.trim() : 'Município de atendimento',
      completed: cityCompleted,
      targetFieldId: 'quote-city',
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const totalCount = steps.length;
  const percent = Math.round((completedCount / totalCount) * 100);
  const isReady = completedCount === totalCount;

  const missingLabels = steps
    .filter((s) => !s.completed)
    .map((s) => s.label.toLowerCase());

  const statusHeadline = isReady
    ? 'Tudo pronto para enviar'
    : missingLabels.length === 1
      ? `Falta informar: ${missingLabels[0]}`
      : `Preencha ${missingLabels.length} campos essenciais`;

  return {
    percent,
    completedCount,
    totalCount,
    isReady,
    statusHeadline,
    steps,
  };
}

export function buildB2BQuoteMessage(draft: B2BQuoteDraft): string {
  const brandNames = draft.selectedBrands
    .map((id) => BRANDS.find((b) => b.id === id)?.name)
    .filter(Boolean) as string[];

  const lines: string[] = [
    'Olá! Gostaria de solicitar um orçamento — Cluis Representações.',
    '',
    `Empresa: ${draft.companyName.trim() || '(não informada)'}`,
    `Cidade: ${draft.city.trim() || '(não informada)'}`,
  ];

  if (draft.cnpj.trim()) {
    lines.push(`CNPJ: ${draft.cnpj.trim()}`);
  }

  if (draft.contactName.trim()) {
    lines.push(`Contato: ${draft.contactName.trim()}`);
  }

  if (brandNames.length > 0) {
    lines.push(`Fábricas: ${brandNames.join(', ')}`);
  }

  const structuredItems = draft.quoteItems ?? [];
  if (structuredItems.length > 0) {
    lines.push('');
    lines.push('Itens solicitados:');
    for (const item of structuredItems) {
      lines.push(
        item.quantity
          ? `- ${item.name} (Qtd.: ${item.quantity})`
          : `- ${item.name}`,
      );
    }
  }

  if (draft.itemsDescription.trim()) {
    lines.push('');
    lines.push(`Observações: ${draft.itemsDescription.trim()}`);
  }

  return lines.join('\n');
}

export function buildWhatsAppUrl(phoneRaw: string, message: string): string {
  const cleanPhone = phoneRaw.replace(/\D/g, '');
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
}

export function loadPersistedQuoteDraft(): B2BQuoteDraft {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return DEFAULT_QUOTE_DRAFT;
    }
    const raw = window.localStorage.getItem(QUOTE_STORAGE_KEY);
    if (!raw) return DEFAULT_QUOTE_DRAFT;
    const parsed = JSON.parse(raw) as Partial<B2BQuoteDraft>;
    return {
      ...DEFAULT_QUOTE_DRAFT,
      ...parsed,
      selectedBrands: Array.isArray(parsed.selectedBrands)
        ? parsed.selectedBrands
        : [],
      quoteItems: Array.isArray(parsed.quoteItems) ? parsed.quoteItems : [],
    };
  } catch {
    return DEFAULT_QUOTE_DRAFT;
  }
}

export function savePersistedQuoteDraft(draft: B2BQuoteDraft): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}
