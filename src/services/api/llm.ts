/**
 * TiRouter LLM Features Management API
 * Endpoints for LLM status, analysis, routing, diagnostics and config generation
 */

import { apiClient } from './client';

export interface LLMFeatureStatus {
  health_query: boolean;
  routing: boolean;
  diagnostics: boolean;
  fix_suggester: boolean;
}

export interface LLMProviderModel {
  id: string;
  display_name?: string;
}

export interface LLMProviderStatus {
  models: LLMProviderModel[];
  model_count: number;
  has_credentials: boolean;
}

export interface LLMStatus {
  features: LLMFeatureStatus;
  providers: Record<string, LLMProviderStatus>;
}

export const llmApi = {
  /**
   * Get LLM feature flags and providers holding usable credentials
   */
  async getStatus(): Promise<LLMStatus> {
    return await apiClient.get<LLMStatus>('/llm/status');
  },
};
