import axios from 'axios';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

const aiClient = axios.create({
  baseURL: env.aiServiceUrl,
  timeout: 15000,
});

export interface AiSearchFilters {
  bedrooms: number | null;
  min_price: number | null;
  max_price: number | null;
  city: string | null;
  property_type: string | null;
}

export interface AiSearchResult {
  filters_used: AiSearchFilters;
  ai_parsed: boolean;
  results: Record<string, unknown>[];
}

export interface AiSummaryResult {
  summary: string;
  pros: string[];
  cons: string[];
  investment_score: number | null;
  investment_note: string | null;
  cached: boolean;
  generated_at: string;
}

function handleAiServiceError(err: unknown): never {
  if (axios.isAxiosError(err)) {
    // AI service is unreachable entirely (not running, wrong port, network issue)
    if (!err.response) {
      throw new AppError(
        'AI features are temporarily unavailable. Please try again shortly.',
        503
      );
    }
    // AI service responded with an error (e.g. Groq down, bad request, property not found)
    const detail = err.response.data?.detail || 'AI service error';
    throw new AppError(detail, err.response.status);
  }
  throw err;
}

export async function aiSearch(query: string): Promise<AiSearchResult> {
  try {
    const { data } = await aiClient.post<AiSearchResult>('/ai/search', { query });
    return data;
  } catch (err) {
    handleAiServiceError(err);
  }
}

export async function aiSummary(propertyId: string): Promise<AiSummaryResult> {
  try {
    const { data } = await aiClient.post<AiSummaryResult>(`/ai/summary/${propertyId}`);
    return data;
  } catch (err) {
    handleAiServiceError(err);
  }
}