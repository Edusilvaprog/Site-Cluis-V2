export interface MapsSourceLink {
  title: string;
  uri: string;
  snippet?: string;
}

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'model';
  text: string;
  mapsSources?: MapsSourceLink[];
}

export interface RawGroundingChunk {
  maps?: {
    uri?: string;
    title?: string;
    placeAnswerSources?: {
      reviewSnippets?: Array<{
        uri?: string;
        title?: string;
        content?: string;
      }>;
    };
  };
}

/**
 * Extracts and deduplicates all Google Maps URLs from Gemini groundingChunks,
 * including both primary place URIs and review snippet URIs.
 */
export function extractMapsGroundingSources(
  chunks: RawGroundingChunk[] | undefined | null,
): MapsSourceLink[] {
  if (!Array.isArray(chunks) || chunks.length === 0) return [];

  const seenUris = new Set<string>();
  const results: MapsSourceLink[] = [];

  for (const chunk of chunks) {
    const maps = chunk?.maps;
    if (!maps) continue;

    if (maps.uri && !seenUris.has(maps.uri)) {
      seenUris.add(maps.uri);
      results.push({
        title: maps.title?.trim() || 'Ver local no Google Maps',
        uri: maps.uri,
      });
    }

    const reviewSnippets = maps.placeAnswerSources?.reviewSnippets;
    if (Array.isArray(reviewSnippets)) {
      for (const snippet of reviewSnippets) {
        if (snippet?.uri && !seenUris.has(snippet.uri)) {
          seenUris.add(snippet.uri);
          results.push({
            title:
              snippet.title?.trim() ||
              maps.title?.trim() ||
              'Avaliação no Google Maps',
            uri: snippet.uri,
            snippet: snippet.content?.trim() || undefined,
          });
        }
      }
    }
  }

  return results;
}

export interface SanitizedTurn {
  role: 'user' | 'model';
  text: string;
}

const MAX_HISTORY_TURNS = 20;
const MAX_TURN_LENGTH = 2000;

/**
 * Validates and bounds incoming multi-turn chat history before sending to the API.
 */
export function sanitizeChatHistory(input: unknown): SanitizedTurn[] {
  if (!Array.isArray(input)) return [];

  const cleaned: SanitizedTurn[] = [];
  for (const entry of input) {
    if (!entry || typeof entry !== 'object') continue;
    const role = (entry as { role?: unknown }).role;
    const text = (entry as { text?: unknown }).text;
    if (role !== 'user' && role !== 'model') continue;
    if (typeof text !== 'string') continue;

    const trimmed = text.trim().slice(0, MAX_TURN_LENGTH);
    if (!trimmed) continue;

    cleaned.push({ role, text: trimmed });
  }

  return cleaned.slice(-MAX_HISTORY_TURNS);
}
