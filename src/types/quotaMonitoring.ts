/**
 * Quota Monitoring Dashboard Types
 * Matches the backend /v0/management/quota-monitor/ API responses
 */

export interface QuotaSnapshot {
  provider: string;
  account: string;
  model: string;
  used: number;
  limit: number;
  unit: string;
  resetTime: string;
  collectedAt: string;
  status: 'healthy' | 'warning' | 'critical' | 'error' | 'unknown';
  errorMessage?: string;
}

export interface QuotaHistoryResponse {
  provider: string;
  account: string;
  model: string;
  since: string;
  history: QuotaSnapshot[];
  count: number;
}

export interface RunwayPrediction {
  provider: string;
  account: string;
  model: string;
  hoursRemaining: number | null;
  depletionTime: string | null;
  currentUsagePercent: number;
  consumptionRatePerHour: number;
  confidence: number;
  dataPoints: number;
  status: 'healthy' | 'warning' | 'critical' | 'error' | 'unknown';
  lastUpdated: string;
}

export interface RunwayPredictionResponse {
  predictions: RunwayPrediction[];
  count: number;
  generated: string;
}

export interface ProviderSummary {
  provider: string;
  totalAccounts: number;
  healthyCount: number;
  warningCount: number;
  criticalCount: number;
  errorCount: number;
  avgUsagePercent: number;
}

export interface QuotaSummary {
  totalAccounts: number;
  healthyAccounts: number;
  warningAccounts: number;
  criticalAccounts: number;
  errorAccounts: number;
  unknownAccounts: number;
  byProvider: Record<string, ProviderSummary>;
  predictions: RunwayPrediction[];
  generatedAt: string;
}

export interface ForceCollectionResponse {
  message: string;
  snapshots: QuotaSnapshot[];
  count: number;
  collected: string;
}

export interface TrackerStatus {
  running: boolean;
  interval: string;
  accounts: AccountConfig[];
  count: number;
}

export interface AccountConfig {
  provider: string;
  accountId: string;
  model: string;
  baseUrl?: string;
  authType?: string;
  enabled: boolean;
}

export interface QuotaSnapshotsResponse {
  snapshots: QuotaSnapshot[];
  count: number;
  generated: string;
}