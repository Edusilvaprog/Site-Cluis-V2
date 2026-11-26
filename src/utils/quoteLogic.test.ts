import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addQuoteLineItem,
  buildB2BQuoteMessage,
  buildWhatsAppUrl,
  DEFAULT_QUOTE_DRAFT,
  formatCnpjInput,
  getQuoteProgress,
  hasValidationErrors,
  removeQuoteLineItem,
  toggleArrayValue,
  validateQuoteRequest,
} from './quoteLogic.ts';

test('formatCnpjInput formats partial and complete CNPJ digits', () => {
  assert.equal(formatCnpjInput('12'), '12');
  assert.equal(formatCnpjInput('12345'), '12.345');
  assert.equal(formatCnpjInput('12345678000195'), '12.345.678/0001-95');
  assert.equal(formatCnpjInput('12.345.678/0001-95999'), '12.345.678/0001-95');
});

test('toggleArrayValue adds and removes values immutably', () => {
  const a = toggleArrayValue(['roma'], 'soprano');
  assert.deepEqual(a, ['roma', 'soprano']);
  const b = toggleArrayValue(a, 'roma');
  assert.deepEqual(b, ['soprano']);
});

test('addQuoteLineItem and removeQuoteLineItem manage structured quote items', () => {
  const added = addQuoteLineItem([], 'Rolo antigota 23cm', '30 un');
  assert.equal(added.length, 1);
  assert.equal(added[0].name, 'Rolo antigota 23cm');
  assert.equal(added[0].quantity, '30 un');

  const updated = addQuoteLineItem(added, 'rolo antigota 23cm', '50 un');
  assert.equal(updated.length, 1);
  assert.equal(updated[0].quantity, '50 un');

  const removed = removeQuoteLineItem(updated, updated[0].id);
  assert.equal(removed.length, 0);
});

test('validateQuoteRequest catches missing company, city, and empty quote scope', () => {
  const emptyErrors = validateQuoteRequest(DEFAULT_QUOTE_DRAFT);
  assert.equal(hasValidationErrors(emptyErrors), true);
  assert.ok(emptyErrors.companyName);
  assert.ok(emptyErrors.city);
  assert.ok(emptyErrors.scope);

  const validDraft = {
    ...DEFAULT_QUOTE_DRAFT,
    companyName: 'Casa das Ferragens Santos',
    city: 'Santos',
    selectedBrands: ['soprano' as const],
  };
  assert.equal(hasValidationErrors(validateQuoteRequest(validDraft)), false);

  const notesOnlyScopeDraft = {
    ...DEFAULT_QUOTE_DRAFT,
    companyName: 'Depósito Litoral',
    city: 'Praia Grande',
    itemsDescription: '30 rolos antigota 23cm',
  };
  assert.equal(hasValidationErrors(validateQuoteRequest(notesOnlyScopeDraft)), false);
});

test('getQuoteProgress computes live completion across 3 essential steps', () => {
  const initial = getQuoteProgress(DEFAULT_QUOTE_DRAFT);
  assert.equal(initial.percent, 0);
  assert.equal(initial.completedCount, 0);
  assert.equal(initial.totalCount, 3);
  assert.equal(initial.isReady, false);

  const withScope = getQuoteProgress({
    ...DEFAULT_QUOTE_DRAFT,
    selectedBrands: ['soprano'],
  });
  assert.equal(withScope.percent, 33);
  assert.equal(withScope.completedCount, 1);
  assert.equal(withScope.steps[0].completed, true);
  assert.equal(withScope.steps[0].detail, 'Soprano');

  const withCompany = getQuoteProgress({
    ...DEFAULT_QUOTE_DRAFT,
    selectedBrands: ['soprano'],
    companyName: 'Depósito Litoral',
  });
  assert.equal(withCompany.percent, 67);
  assert.equal(withCompany.isReady, false);
  assert.ok(withCompany.statusHeadline.includes('cidade'));

  const ready = getQuoteProgress({
    ...DEFAULT_QUOTE_DRAFT,
    selectedBrands: ['soprano'],
    companyName: 'Depósito Litoral',
    city: 'Praia Grande',
  });
  assert.equal(ready.percent, 100);
  assert.equal(ready.completedCount, 3);
  assert.equal(ready.isReady, true);
});

test('buildB2BQuoteMessage and buildWhatsAppUrl format clean structured quote', () => {
  const message = buildB2BQuoteMessage({
    selectedBrands: ['roma', 'soprano'],
    quoteItems: [{ id: '1', name: 'Fechadura inox externa', quantity: '15 un' }],
    companyName: 'Casa de Tintas Praia Sul',
    cnpj: '12.345.678/0001-95',
    contactName: 'Marcos',
    city: 'Praia Grande',
    itemsDescription: '30 rolos antigota 23cm e 15 fechaduras inox',
    attendantId: 'carlos',
  });

  assert.ok(message.includes('solicitar um orçamento'));
  assert.ok(message.includes('Empresa: Casa de Tintas Praia Sul'));
  assert.ok(message.includes('CNPJ: 12.345.678/0001-95'));
  assert.ok(message.includes('Contato: Marcos'));
  assert.ok(message.includes('Cidade: Praia Grande'));
  assert.ok(message.includes('Fábricas: Roma Pincéis, Soprano'));
  assert.ok(message.includes('- Fechadura inox externa (Qtd.: 15 un)'));
  assert.ok(message.includes('30 rolos antigota 23cm'));

  const url = buildWhatsAppUrl('(13) 99804-5406', message);
  assert.ok(url.startsWith('https://api.whatsapp.com/send?phone=13998045406&text='));
});
