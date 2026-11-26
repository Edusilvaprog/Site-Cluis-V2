import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  extractMapsGroundingSources,
  sanitizeChatHistory,
  type RawGroundingChunk,
} from './src/utils/chatLogic';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const CLUIS_SYSTEM_INSTRUCTION = `Você é o Assistente Comercial da Cluis Representações, representante comercial B2B oficial sediada em Praia Grande, SP.

Fatos oficiais da Cluis Representações:
- Atendimento exclusivo B2B para empresas com CNPJ e Inscrição Estadual ativa (depósitos de materiais de construção, casas de tintas, ferragens, elétricas, serralherias e comércios do setor).
- Faturamento e nota fiscal emitidos diretamente pelas indústrias representadas.
- Representantes diretos: Carlos — (13) 99804-5406 (visitas e negociação comercial, mais de 15 anos na região) e Eduardo — (13) 99634-2118 (cotações, conferência de códigos e pós-pedido).
- E-mail: contato@cluisrepresentacoes.com.br | Instagram: @cluisrep.
- 3 indústrias representadas e suas linhas:
  1. Roma Pincéis (Nova Roma do Sul, RS): Trinchas e Pincéis, Rolos de Pintura (lã, microfibra, antigota, espuma e textura), Desempenadeiras e Espátulas, Acessórios de Pintura (bandejas, garfos, extensores).
  2. Soprano (Farroupilha, RS): Fechaduras e Ferragens (mecânicas, digitais e inox para áreas litorâneas), Materiais Elétricos (disjuntores DIN, DR, DPS, quadros), Interruptores e Tomadas (linha Brava! Up e modulares), Componentes para Móveis (dobradiças com pistão/click, corrediças).
  3. Carbografite (Petrópolis, RJ): EPIs e Segurança com CA vigente, Solda e Acessórios (máscaras automáticas, kits de corte, maçaricos), Ferramentas Manuais (alicates, trenas, níveis, estiletes).
- Área de atuação (32 municípios):
  - Baixada Santista (9): Bertioga, Cubatão, Guarujá, Itanhaém, Mongaguá, Peruíbe, Praia Grande (base), Santos, São Vicente. Polos de maior demanda: Santos, Praia Grande, São Vicente e Guarujá.
  - Vale do Ribeira (23): Registro, Cajati, Jacupiranga, Iguape, Miracatu, Juquiá, Pariquera-Açu, Cananéia, Eldorado, Ilha Comprida, Pedro de Toledo, Sete Barras e demais municípios da região.

Diretrizes de atendimento:
- Responda sempre em português brasileiro claro, objetivo e profissional (respostas concisas de 2 a 5 frases, ou lista curta quando útil).
- Utilize a ferramenta do Google Maps quando o cliente perguntar sobre localização, distâncias, rotas, rodovias ou estabelecimentos comerciais na Baixada Santista e no Vale do Ribeira.
- Nunca invente preços, tabelas, prazos fixos de entrega ou endereços comerciais; para valores, pedido mínimo vigente e fechamento de orçamento, oriente o cliente a preencher a seção de Orçamento do site ou chamar Carlos/Eduardo no WhatsApp.`;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getMapsApiKey(): string {
  return (
    process.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    ''
  );
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/maps/config', (_req, res) => {
    const apiKey = getMapsApiKey();
    res.json({ apiKey, configured: Boolean(apiKey) });
  });

  app.post('/api/chat', async (req, res) => {
    const history = sanitizeChatHistory(req.body?.messages);
    if (history.length === 0 || history[history.length - 1].role !== 'user') {
      res.status(400).json({
        error: 'Envie uma mensagem válida para iniciar o atendimento.',
      });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error:
          'Assistente comercial indisponível no momento. Verifique a chave de API em Settings > Secrets.',
      });
      return;
    }

    const loc = req.body?.userLocation as
      | { latitude?: unknown; longitude?: unknown }
      | undefined;
    const hasValidLocation =
      loc &&
      typeof loc.latitude === 'number' &&
      typeof loc.longitude === 'number' &&
      Number.isFinite(loc.latitude) &&
      Number.isFinite(loc.longitude);

    const contents = history.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.text }],
    }));

    const callGemini = async (useMapsTool: boolean) => {
      return ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction: CLUIS_SYSTEM_INSTRUCTION,
          ...(useMapsTool
            ? {
                tools: [{ googleMaps: {} }],
                ...(hasValidLocation
                  ? {
                      toolConfig: {
                        retrievalConfig: {
                          latLng: {
                            latitude: loc.latitude as number,
                            longitude: loc.longitude as number,
                          },
                        },
                      },
                    }
                  : {}),
              }
            : {}),
        },
      });
    };

    try {
      let response;
      try {
        response = await callGemini(true);
      } catch (firstErr: unknown) {
        const errObj = firstErr as { status?: number; message?: string };
        const isQuota =
          errObj?.status === 429 ||
          (errObj?.message ?? '').includes('RESOURCE_EXHAUSTED');
        if (isQuota) {
          // Graceful retry without Maps grounding tool if Maps grounding quota is exhausted on free tier
          await new Promise((r) => setTimeout(r, 450));
          response = await callGemini(false);
        } else {
          throw firstErr;
        }
      }

      const replyText = (response.text ?? '').trim();
      const rawChunks = response.candidates?.[0]?.groundingMetadata
        ?.groundingChunks as RawGroundingChunk[] | undefined;
      const mapsSources = extractMapsGroundingSources(rawChunks);

      if (!replyText) {
        res.status(502).json({
          error: 'Não foi possível gerar uma resposta agora. Tente novamente.',
        });
        return;
      }

      res.json({
        reply: replyText,
        mapsSources,
      });
    } catch (error: unknown) {
      console.error('Chat API error:', error);
      const errObj = error as { status?: number; message?: string };
      const status = typeof errObj?.status === 'number' ? errObj.status : 500;
      const rawMessage = errObj?.message ?? '';

      if (status === 429 || rawMessage.includes('RESOURCE_EXHAUSTED')) {
        res.status(429).json({
          error:
            'Cota temporária da API excedida. Aguarde alguns instantes, verifique sua chave em Settings > Secrets ou fale direto no WhatsApp.',
        });
        return;
      }
      if (status === 403 || status === 400) {
        res.status(status).json({
          error:
            'Não foi possível autenticar o serviço de atendimento. Verifique a configuração da chave em Settings > Secrets.',
        });
        return;
      }

      res.status(502).json({
        error:
          'Ocorreu uma instabilidade ao consultar o assistente. Tente novamente em instantes.',
      });
    }
  });

  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cluis Representações server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
