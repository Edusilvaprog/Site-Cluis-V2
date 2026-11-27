import { BRANDS, type BrandId } from '../data/cluisData';

export interface QuoteLineItem {
  id: string;
  name: string;
}

export interface B2BQuoteDraft {
  selectedBrands: BrandId[];
  quoteItems: QuoteLineItem[];
  cnpj: string;
  cep: string;
  companyName: string;
  city: string;
  whatsapp: string;
  email: string;
  itemsDescription: string;
  attendantId: 'carlos';
}

export interface QuoteValidationErrors {
  scope?: string;
  cnpj?: string;
  companyName?: string;
  city?: string;
  whatsapp?: string;
  email?: string;
}

const LEGACY_QUOTE_STORAGE_KEYS = [
  'cluis-b2b-quote-v6',
  'cluis-b2b-quote-v5',
  'cluis-b2b-quote-v4',
];

export const DEFAULT_QUOTE_DRAFT: B2BQuoteDraft = {
  selectedBrands: [],
  quoteItems: [],
  cnpj: '',
  cep: '',
  companyName: '',
  city: '',
  whatsapp: '',
  email: '',
  itemsDescription: '',
  attendantId: 'carlos',
};

export function clearLegacySavedQuoteData(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    for (const key of LEGACY_QUOTE_STORAGE_KEYS) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage access restrictions
  }
}

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

export function formatCepInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function isValidEmail(raw: string): boolean {
  const trimmed = raw.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

export function normalizeCityName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function matchRegionalCity(
  rawCity: string,
  allowedCities: string[],
): string {
  const normalizedTarget = normalizeCityName(rawCity);
  if (!normalizedTarget) return '';
  const exact = allowedCities.find(
    (city) => normalizeCityName(city) === normalizedTarget,
  );
  return exact ?? 'Outra cidade da região';
}

export function formatCompanyDisplayName(
  nomeFantasia: string,
  razaoSocial: string,
): string {
  const preferred = (nomeFantasia || razaoSocial || '').trim();
  if (!preferred) return '';
  return preferred
    .toLowerCase()
    .replace(/(^|\s)([a-zà-ú])/g, (match) => match.toUpperCase())
    .replace(/\b(Ltda|Me|Epp|Eireli|S\/a)\b/gi, (abbr) => abbr.toUpperCase());
}

export function toggleArrayValue<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export function addQuoteLineItem(
  items: QuoteLineItem[] | undefined,
  name: string,
): QuoteLineItem[] {
  const trimmedName = name.trim();
  if (!trimmedName) return items ?? [];
  const list = items ?? [];
  const alreadyExists = list.some(
    (item) => item.name.toLowerCase() === trimmedName.toLowerCase(),
  );
  if (alreadyExists) return list;
  return [
    ...list,
    {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: trimmedName,
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

  const hasStructuredItems = (draft.quoteItems ?? []).length > 0;
  const hasScope =
    draft.selectedBrands.length > 0 ||
    hasStructuredItems ||
    draft.itemsDescription.trim().length > 0;

  if (!hasScope) {
    errors.scope =
      'Selecione ao menos uma fábrica ou informe os produtos para cotação.';
  }

  const cnpjDigits = draft.cnpj.replace(/\D/g, '');
  if (cnpjDigits.length !== 14) {
    errors.cnpj = 'Informe um CNPJ válido com 14 números.';
  }

  if (draft.companyName.trim().length < 2) {
    errors.companyName = 'Informe o nome ou razão social da empresa.';
  }

  if (!draft.city.trim()) {
    errors.city = 'Selecione a cidade da empresa.';
  }

  const phoneDigits = draft.whatsapp.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    errors.whatsapp = 'Informe um WhatsApp com DDD para retorno.';
  }

  if (!isValidEmail(draft.email)) {
    errors.email = 'Informe um e-mail válido para contato.';
  }

  return errors;
}

export function hasValidationErrors(errors: QuoteValidationErrors): boolean {
  return Boolean(
    errors.scope ||
      errors.cnpj ||
      errors.companyName ||
      errors.city ||
      errors.whatsapp ||
      errors.email,
  );
}

export interface QuoteChecklistStep {
  id: 'escopo' | 'cnpj' | 'empresa' | 'cidade' | 'contato';
  label: string;
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
  const scopeCompleted =
    draft.selectedBrands.length > 0 ||
    (draft.quoteItems ?? []).length > 0 ||
    draft.itemsDescription.trim().length > 0;
  const cnpjCompleted = draft.cnpj.replace(/\D/g, '').length === 14;
  const companyCompleted = draft.companyName.trim().length >= 2;
  const cityCompleted = draft.city.trim().length >= 2;
  const contactCompleted =
    draft.whatsapp.replace(/\D/g, '').length >= 10 && isValidEmail(draft.email);

  const steps: QuoteChecklistStep[] = [
    {
      id: 'escopo',
      label: 'fábricas ou itens',
      completed: scopeCompleted,
      targetFieldId: 'quote-step-scope',
    },
    {
      id: 'cnpj',
      label: 'CNPJ',
      completed: cnpjCompleted,
      targetFieldId: 'quote-cnpj',
    },
    {
      id: 'empresa',
      label: 'empresa',
      completed: companyCompleted,
      targetFieldId: 'quote-company-name',
    },
    {
      id: 'cidade',
      label: 'cidade',
      completed: cityCompleted,
      targetFieldId: 'quote-city',
    },
    {
      id: 'contato',
      label: 'WhatsApp e e-mail',
      completed: contactCompleted,
      targetFieldId: 'quote-whatsapp',
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const totalCount = steps.length;
  const percent = Math.round((completedCount / totalCount) * 100);
  const isReady = completedCount === totalCount;

  const missingLabels = steps
    .filter((s) => !s.completed)
    .map((s) => s.label);

  const statusHeadline = isReady
    ? 'Orçamento pronto para envio'
    : missingLabels.length === 1
      ? `Falta apenas: ${missingLabels[0]}`
      : `Preenchimento da cotação (${completedCount}/${totalCount})`;

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
    'Olá! Gostaria de solicitar uma cotação — Cluis Representações.',
    '',
    `Empresa: ${draft.companyName.trim() || '(não informada)'}`,
    `CNPJ: ${draft.cnpj.trim() || '(não informado)'}`,
    `Cidade: ${draft.city.trim() || '(não informada)'}`,
  ];

  if (draft.cep.trim()) {
    lines.push(`CEP: ${draft.cep.trim()}`);
  }

  if (draft.whatsapp.trim()) {
    lines.push(`WhatsApp: ${draft.whatsapp.trim()}`);
  }

  if (draft.email.trim()) {
    lines.push(`E-mail: ${draft.email.trim()}`);
  }

  if (brandNames.length > 0) {
    lines.push(`Fábricas: ${brandNames.join(', ')}`);
  }

  const structuredItems = draft.quoteItems ?? [];
  if (structuredItems.length > 0) {
    lines.push('');
    lines.push('Itens solicitados:');
    for (const item of structuredItems) {
      lines.push(`- ${item.name}`);
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
