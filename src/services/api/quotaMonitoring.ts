/**
 * Quota Monitoring Dashboard API
 * Connects to the new /quota-monitor/ endpoints
 */

import { apiClient } from './client';
import type {
  QuotaSnapshot,
  QuotaHistoryResponse,
  RunwayPrediction,
  RunwayPredictionResponse,
  QuotaSummary,
  ForceCollectionResponse,
  TrackerStatus,
} from '@/types/quotaMonitoring';

export const quotaMonitoringApi = {
  /**
   * Get all current quota snapshots
   */
  async getSnapshots(): Promise<{ snapshots: QuotaSnapshot[]; count: number; generated: string }> {
    const data = await apiClient.get<{ snapshots: QuotaSnapshot[]; count: number; generated: string }>('/quota-monitor/snapshots');
    return data;
  },

  /**
   * Get quota snapshot for a specific provider/account/model
   */
  async getSnapshot(provider: string, account: string, model: string): Promise<QuotaSnapshot> {
    const data = await apiClient.get<QuotaSnapshot>(`/quota-monitor/snapshots/${provider}/${account}/${model}`);
    return data;
  },

  /**
   * Get historical quota data for a specific account
   */
  async getHistory(provider: string, account: string, model: string, since: string = '24h'): Promise<QuotaHistoryResponse> {
    const data = await apiClient.get<QuotaHistoryResponse>(`/quota-monitor/history/${provider}/${account}/${model}?since=${since}`);
    return data;
  },

  /**
   * Get runway predictions for all tracked accounts
   */
  async getPredictions(): Promise<RunwayPredictionResponse> {
    const data = await apiClient.get<RunwayPredictionResponse>('/quota-monitor/predictions');
    return data;
  },

  /**
   * Get runway prediction for a specific account
   */
  async getPrediction(provider: string, account: string, model: string): Promise<RunwayPrediction> {
    const data = await apiClient.get<RunwayPrediction>(`/quota-monitor/predictions/${provider}/${account}/${model}`);
    return data;
  },

  /**
   * Get high-level quota summary
   */
  async getSummary(): Promise<QuotaSummary> {
    const data = await apiClient.get<QuotaSummary>('/quota-monitor/summary');
    return data;
  },

  /**
   * Trigger an immediate quota collection
   */
  async forceCollection(): Promise<ForceCollectionResponse> {
    const data = await apiClient.post<ForceCollectionResponse>('/quota-monitor/collect', {});
    return data;
  },

  /**
   * Get quota tracker status
   */
  async getTrackerStatus(): Promise<TrackerStatus> {
    const data = await apiClient.get<TrackerStatus>('/quota-monitor/status');
    return data;
  },
};