/**
 * LLM Features Management API
 * Endpoints for intelligent-routing, llm_routing, llm_diagnostics, llm_fix_suggester, llm_health_query, llm_client
 */

import { apiClient } from './client';
import type {
  IntelligentRoutingConfig,
  LLMRoutingConfig,
  LLMDiagnosticsConfig,
  LLMFixSuggesterConfig,
  LLMHealthQueryConfig,
  LLMClientConfig,
} from '@/types/visualConfig';

export const llmFeaturesApi = {
  // Intelligent Routing
  async getIntelligentRouting(): Promise<IntelligentRoutingConfig> {
    return await apiClient.get<IntelligentRoutingConfig>('/llm/intelligent-routing');
  },

  async putIntelligentRouting(config: IntelligentRoutingConfig): Promise<void> {
    await apiClient.put('/llm/intelligent-routing', config);
  },

  async patchIntelligentRouting(config: Partial<IntelligentRoutingConfig>): Promise<void> {
    await apiClient.patch('/llm/intelligent-routing', config);
  },

  // LLM Routing
  async getLLMRouting(): Promise<LLMRoutingConfig> {
    return await apiClient.get<LLMRoutingConfig>('/llm/routing');
  },

  async putLLMRouting(config: LLMRoutingConfig): Promise<void> {
    await apiClient.put('/llm/routing', config);
  },

  async patchLLMRouting(config: Partial<LLMRoutingConfig>): Promise<void> {
    await apiClient.patch('/llm/routing', config);
  },

  // LLM Diagnostics
  async getLLMDiagnostics(): Promise<LLMDiagnosticsConfig> {
    return await apiClient.get<LLMDiagnosticsConfig>('/llm/diagnostics');
  },

  async putLLMDiagnostics(config: LLMDiagnosticsConfig): Promise<void> {
    await apiClient.put('/llm/diagnostics', config);
  },

  async patchLLMDiagnostics(config: Partial<LLMDiagnosticsConfig>): Promise<void> {
    await apiClient.patch('/llm/diagnostics', config);
  },

  // LLM Fix Suggester
  async getLLMFixSuggester(): Promise<LLMFixSuggesterConfig> {
    return await apiClient.get<LLMFixSuggesterConfig>('/llm/fix-suggester');
  },

  async putLLMFixSuggester(config: LLMFixSuggesterConfig): Promise<void> {
    await apiClient.put('/llm/fix-suggester', config);
  },

  async patchLLMFixSuggester(config: Partial<LLMFixSuggesterConfig>): Promise<void> {
    await apiClient.patch('/llm/fix-suggester', config);
  },

  // LLM Health Query
  async getLLMHealthQuery(): Promise<LLMHealthQueryConfig> {
    return await apiClient.get<LLMHealthQueryConfig>('/llm/health-query');
  },

  async putLLMHealthQuery(config: LLMHealthQueryConfig): Promise<void> {
    await apiClient.put('/llm/health-query', config);
  },

  async patchLLMHealthQuery(config: Partial<LLMHealthQueryConfig>): Promise<void> {
    await apiClient.patch('/llm/health-query', config);
  },

  // LLM Client (shared)
  async getLLMClient(): Promise<LLMClientConfig> {
    return await apiClient.get<LLMClientConfig>('/llm/client');
  },

  async putLLMClient(config: LLMClientConfig): Promise<void> {
    await apiClient.put('/llm/client', config);
  },

  async patchLLMClient(config: Partial<LLMClientConfig>): Promise<void> {
    await apiClient.patch('/llm/client', config);
  },
};