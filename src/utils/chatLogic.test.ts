import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractMapsGroundingSources,
  sanitizeChatHistory,
} from './chatLogic';

test('extractMapsGroundingSources extracts place and review URIs without duplicates', () => {
  const sources = extractMapsGroundingSources([
    {
      maps: {
        title: 'Praia Grande, SP',
        uri: 'https://maps.google.com/?cid=1001',
        placeAnswerSources: {
          reviewSnippets: [
            {
              title: 'Avaliação local',
              uri: 'https://maps.google.com/?cid=1002',
              content: 'Ótimo acesso pela Rodovia Padre Manoel da Nóbrega.',
            },
            {
              title: 'Duplicado',
              uri: 'https://maps.google.com/?cid=1001',
            },
          ],
        },
      },
    },
    {
      maps: {
        uri: 'https://maps.google.com/?cid=1003',
      },
    },
  ]);

  assert.equal(sources.length, 3);
  assert.deepEqual(sources[0], {
    title: 'Praia Grande, SP',
    uri: 'https://maps.google.com/?cid=1001',
  });
  assert.equal(sources[1].uri, 'https://maps.google.com/?cid=1002');
  assert.equal(
    sources[1].snippet,
    'Ótimo acesso pela Rodovia Padre Manoel da Nóbrega.',
  );
  assert.equal(sources[2].title, 'Ver local no Google Maps');
});

test('extractMapsGroundingSources returns empty array for missing or empty input', () => {
  assert.deepEqual(extractMapsGroundingSources(undefined), []);
  assert.deepEqual(extractMapsGroundingSources([]), []);
});

test('sanitizeChatHistory filters invalid entries and bounds message count', () => {
  const noisyInput = [
    { role: 'system', text: 'invalid role' },
    { role: 'user', text: '   ' },
    { role: 'user', text: '  Quais marcas vocês representam?  ' },
    { role: 'model', text: 'Roma Pincéis, Soprano e Carbografite.' },
    null,
    42,
  ];

  const sanitized = sanitizeChatHistory(noisyInput);
  assert.deepEqual(sanitized, [
    { role: 'user', text: 'Quais marcas vocês representam?' },
    { role: 'model', text: 'Roma Pincéis, Soprano e Carbografite.' },
  ]);

  const longHistory = Array.from({ length: 25 }, (_, i) => ({
    role: i % 2 === 0 ? 'user' : 'model',
    text: `Mensagem ${i}`,
  }));
  const bounded = sanitizeChatHistory(longHistory);
  assert.equal(bounded.length, 20);
  assert.equal(bounded[0].text, 'Mensagem 5');
});
