/**
 * Infrastructure Configs Management API
 * Endpoints for TLS, pprof, metrics, logs-rotation, semantic_cache, model_capabilities
 */

import { apiClient } from './client';
import type {
  TLSConfig,
  PprofConfig,
  MetricsConfig,
  LogsRotationConfig,
  SemanticCacheConfig,
  ModelCapabilityConfig,
} from '@/types/visualConfig';

export const infrastructureApi = {
  // TLS Config
  async getTLSConfig(): Promise<TLSConfig> {
    return await apiClient.get<TLSConfig>('/tls');
  },

  async putTLSConfig(config: TLSConfig): Promise<void> {
    await apiClient.put('/tls', config);
  },

  async patchTLSConfig(config: Partial<TLSConfig>): Promise<void> {
    await apiClient.patch('/tls', config);
  },

  // Pprof Config
  async getPprofConfig(): Promise<PprofConfig> {
    return await apiClient.get<PprofConfig>('/pprof');
  },

  async putPprofConfig(config: PprofConfig): Promise<void> {
    await apiClient.put('/pprof', config);
  },

  async patchPprofConfig(config: Partial<PprofConfig>): Promise<void> {
    await apiClient.patch('/pprof', config);
  },

  // Metrics Config
  async getMetricsConfig(): Promise<MetricsConfig> {
    return await apiClient.get<MetricsConfig>('/metrics');
  },

  async putMetricsConfig(config: MetricsConfig): Promise<void> {
    await apiClient.put('/metrics', config);
  },

  async patchMetricsConfig(config: Partial<MetricsConfig>): Promise<void> {
    await apiClient.patch('/metrics', config);
  },

  // Logs Rotation Config
  async getLogsRotationConfig(): Promise<LogsRotationConfig> {
    return await apiClient.get<LogsRotationConfig>('/logs-rotation');
  },

  async putLogsRotationConfig(config: LogsRotationConfig): Promise<void> {
    await apiClient.put('/logs-rotation', config);
  },

  async patchLogsRotationConfig(config: Partial<LogsRotationConfig>): Promise<void> {
    await apiClient.patch('/logs-rotation', config);
  },

  // Semantic Cache Config
  async getSemanticCacheConfig(): Promise<SemanticCacheConfig> {
    return await apiClient.get<SemanticCacheConfig>('/semantic-cache');
  },

  async putSemanticCacheConfig(config: SemanticCacheConfig): Promise<void> {
    await apiClient.put('/semantic-cache', config);
  },

  async patchSemanticCacheConfig(config: Partial<SemanticCacheConfig>): Promise<void> {
    await apiClient.patch('/semantic-cache', config);
  },

  // Model Capabilities Config
  async getModelCapabilitiesConfig(): Promise<ModelCapabilityConfig> {
    return await apiClient.get<ModelCapabilityConfig>('/model-capabilities');
  },

  async putModelCapabilitiesConfig(config: ModelCapabilityConfig): Promise<void> {
    await apiClient.put('/model-capabilities', config);
  },

  async patchModelCapabilitiesConfig(config: Partial<ModelCapabilityConfig>): Promise<void> {
    await apiClient.patch('/model-capabilities', config);
  },
};