/**
 * Quota Extended Management API
 * Endpoints for daily-limit, token-limit, cache
 */

import { apiClient } from './client';
import type {
  QuotaConfig,
  QuotaCacheConfig,
} from '@/types/visualConfig';

export const quotaExtendedApi = {
  // Full Quota Config
  async getQuotaConfig(): Promise<QuotaConfig> {
    return await apiClient.get<QuotaConfig>('/quota/config');
  },

  async putQuotaConfig(config: QuotaConfig): Promise<void> {
    await apiClient.put('/quota/config', config);
  },

  async patchQuotaConfig(config: Partial<QuotaConfig>): Promise<void> {
    await apiClient.patch('/quota/config', config);
  },

  // Daily Limit (simple field)
  async getQuotaDailyLimit(): Promise<{ dailyLimit: number }> {
    return await apiClient.get<{ dailyLimit: number }>('/quota/daily-limit');
  },

  async putQuotaDailyLimit(dailyLimit: number): Promise<void> {
    await apiClient.put('/quota/daily-limit', { dailyLimit });
  },

  // Token Limit (simple field)
  async getQuotaTokenLimit(): Promise<{ tokenLimit: number }> {
    return await apiClient.get<{ tokenLimit: number }>('/quota/token-limit');
  },

  async putQuotaTokenLimit(tokenLimit: number): Promise<void> {
    await apiClient.put('/quota/token-limit', { tokenLimit });
  },

  // Quota Cache
  async getQuotaCache(): Promise<QuotaCacheConfig> {
    return await apiClient.get<QuotaCacheConfig>('/quota/cache');
  },

  async putQuotaCache(config: QuotaCacheConfig): Promise<void> {
    await apiClient.put('/quota/cache', config);
  },

  async patchQuotaCache(config: Partial<QuotaCacheConfig>): Promise<void> {
    await apiClient.patch('/quota/cache', config);
  },
};