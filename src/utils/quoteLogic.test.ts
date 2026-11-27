import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addQuoteLineItem,
  buildB2BQuoteMessage,
  buildWhatsAppUrl,
  DEFAULT_QUOTE_DRAFT,
  formatCepInput,
  formatCnpjInput,
  formatCompanyDisplayName,
  formatPhoneInput,
  getQuoteProgress,
  hasValidationErrors,
  isValidEmail,
  matchRegionalCity,
  removeQuoteLineItem,
  toggleArrayValue,
  validateQuoteRequest,
} from './quoteLogic.ts';

test('formatCnpjInput and formatPhoneInput format Brazilian masks cleanly', () => {
  assert.equal(formatCnpjInput('12'), '12');
  assert.equal(formatCnpjInput('12345'), '12.345');
  assert.equal(formatCnpjInput('12345678000195'), '12.345.678/0001-95');
  assert.equal(formatCnpjInput('12.345.678/0001-95999'), '12.345.678/0001-95');

  assert.equal(formatPhoneInput('13998045406'), '(13) 99804-5406');
  assert.equal(formatPhoneInput('1334721000'), '(13) 3472-1000');
  assert.equal(isValidEmail('compras@loja.com.br'), true);
  assert.equal(isValidEmail('invalido@'), false);
});

test('formatCepInput, matchRegionalCity and formatCompanyDisplayName normalize API data', () => {
  assert.equal(formatCepInput('11700100'), '11700-100');
  assert.equal(formatCepInput('11700'), '11700');
  assert.equal(
    matchRegionalCity('SAO VICENTE', ['Santos', 'São Vicente', 'Praia Grande']),
    'São Vicente',
  );
  assert.equal(
    matchRegionalCity('Campinas', ['Santos', 'São Vicente']),
    'Outra cidade da região',
  );
  assert.equal(
    formatCompanyDisplayName('', 'DEPOSITO PRAIA SUL LTDA'),
    'Deposito Praia Sul LTDA',
  );
});

test('toggleArrayValue adds and removes values immutably', () => {
  const a = toggleArrayValue(['roma'], 'soprano');
  assert.deepEqual(a, ['roma', 'soprano']);
  const b = toggleArrayValue(a, 'roma');
  assert.deepEqual(b, ['soprano']);
});

test('addQuoteLineItem and removeQuoteLineItem deduplicate items without quantity', () => {
  const added = addQuoteLineItem([], 'Rolo antigota 23cm');
  assert.equal(added.length, 1);
  assert.equal(added[0].name, 'Rolo antigota 23cm');

  const duplicate = addQuoteLineItem(added, 'rolo antigota 23cm');
  assert.equal(duplicate.length, 1);

  const removed = removeQuoteLineItem(duplicate, duplicate[0].id);
  assert.equal(removed.length, 0);
});

test('validateQuoteRequest enforces CNPJ, company, city, WhatsApp, email, and scope', () => {
  const emptyErrors = validateQuoteRequest(DEFAULT_QUOTE_DRAFT);
  assert.equal(hasValidationErrors(emptyErrors), true);
  assert.ok(emptyErrors.scope);
  assert.ok(emptyErrors.cnpj);
  assert.ok(emptyErrors.companyName);
  assert.ok(emptyErrors.city);
  assert.ok(emptyErrors.whatsapp);
  assert.ok(emptyErrors.email);

  const validDraft = {
    ...DEFAULT_QUOTE_DRAFT,
    selectedBrands: ['soprano' as const],
    cnpj: '52.400.807/0001-15',
    companyName: 'Casa das Ferragens Santos',
    city: 'Santos',
    whatsapp: '(13) 99804-5406',
    email: 'compras@ferragenssantos.com.br',
  };
  assert.equal(hasValidationErrors(validateQuoteRequest(validDraft)), false);
});

test('getQuoteProgress tracks all 5 mandatory milestones cleanly', () => {
  const initial = getQuoteProgress(DEFAULT_QUOTE_DRAFT);
  assert.equal(initial.percent, 0);
  assert.equal(initial.completedCount, 0);
  assert.equal(initial.totalCount, 5);
  assert.equal(initial.isReady, false);

  const partial = getQuoteProgress({
    ...DEFAULT_QUOTE_DRAFT,
    selectedBrands: ['roma'],
    cnpj: '52.400.807/0001-15',
    companyName: 'Casa de Tintas Litoral',
    city: 'Praia Grande',
  });
  assert.equal(partial.completedCount, 4);
  assert.equal(partial.percent, 80);
  assert.ok(partial.statusHeadline.includes('WhatsApp e e-mail'));

  const ready = getQuoteProgress({
    ...DEFAULT_QUOTE_DRAFT,
    selectedBrands: ['roma'],
    cnpj: '52.400.807/0001-15',
    companyName: 'Casa de Tintas Litoral',
    city: 'Praia Grande',
    whatsapp: '(13) 99804-5406',
    email: 'compras@tintaslitoral.com.br',
  });
  assert.equal(ready.percent, 100);
  assert.equal(ready.isReady, true);
});

test('buildB2BQuoteMessage and buildWhatsAppUrl format clean structured quote', () => {
  const message = buildB2BQuoteMessage({
    selectedBrands: ['roma', 'soprano'],
    quoteItems: [{ id: '1', name: 'Fechadura inox externa' }],
    companyName: 'Casa de Tintas Praia Sul',
    cnpj: '52.400.807/0001-15',
    cep: '11724-730',
    city: 'Praia Grande',
    whatsapp: '(13) 99804-5406',
    email: 'compras@praiasul.com.br',
    itemsDescription: 'Entrega para próxima semana',
    attendantId: 'carlos',
  });

  assert.ok(message.includes('solicitar uma cotação'));
  assert.ok(message.includes('Empresa: Casa de Tintas Praia Sul'));
  assert.ok(message.includes('CNPJ: 52.400.807/0001-15'));
  assert.ok(message.includes('CEP: 11724-730'));
  assert.ok(message.includes('Cidade: Praia Grande'));
  assert.ok(message.includes('WhatsApp: (13) 99804-5406'));
  assert.ok(message.includes('E-mail: compras@praiasul.com.br'));
  assert.ok(message.includes('Fábricas: Roma Pincéis, Soprano'));
  assert.ok(message.includes('- Fechadura inox externa'));
  assert.ok(message.includes('Entrega para próxima semana'));

  const url = buildWhatsAppUrl('(13) 99804-5406', message);
  assert.ok(url.startsWith('https://api.whatsapp.com/send?phone=13998045406&text='));
});
