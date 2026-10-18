/**
 * TiRouter-specific API endpoints
 */

import { apiClient } from './client';
import type {
  CLIProviderStatus,
  CLIProvidersListResponse,
  CompressionStatsResponse,
  CavemanConfig,
  RTKConfig,
  RTKStats,
  PromptsConfig,
  RoutingTestRequest,
  RoutingTestResponse,
} from '@/types';

export const tirouterApi = {
  // CLI Providers
  async listCLIProviders(): Promise<CLIProvidersListResponse> {
    return apiClient.get('/cli-providers');
  },

  async getCLIProviderStatus(provider: string): Promise<CLIProviderStatus> {
    return apiClient.get(`/cli-providers/${provider}`);
  },

  async getKiloStatus(): Promise<CLIProviderStatus> {
    return apiClient.get('/kilo-status');
  },

  async getOpenCodeStatus(): Promise<CLIProviderStatus> {
    return apiClient.get('/opencode-status');
  },

  async getClaudeCodeStatus(): Promise<CLIProviderStatus> {
    return apiClient.get('/claude-code-status');
  },

  async getCodexCLIStatus(): Promise<CLIProviderStatus> {
    return apiClient.get('/codex-cli-status');
  },

  async getAiderStatus(): Promise<CLIProviderStatus> {
    return apiClient.get('/aider-status');
  },

  async getClineStatus(): Promise<CLIProviderStatus> {
    return apiClient.get('/cline-status');
  },

  async getKiroCLIStatus(): Promise<CLIProviderStatus> {
    return apiClient.get('/kiro-cli-status');
  },

  async getMimoStatus(): Promise<CLIProviderStatus> {
    return apiClient.get('/mimo-status');
  },

  async getQwenStatus(): Promise<CLIProviderStatus> {
    return apiClient.get('/qwen-status');
  },

  async getQoderCLIStatus(): Promise<CLIProviderStatus> {
    return apiClient.get('/qodercli-status');
  },

  async getDevinStatus(): Promise<CLIProviderStatus> {
    return apiClient.get('/devin-status');
  },

  async getFreebuffStatus(): Promise<CLIProviderStatus> {
    return apiClient.get('/freebuff-status');
  },

  // Saves a pasted Freebuff auth token into cli-providers.freebuff.accounts
  // and enables the provider (persisted to config.yaml + hot-reloaded).
  async setFreebuffCredential(apiKey: string, name?: string): Promise<{ status: string }> {
    return apiClient.post('/freebuff-credential', { api_key: apiKey, name });
  },

  // Compression Stats (Caveman + RTK)
  async getCompressionStats(): Promise<CompressionStatsResponse> {
    return apiClient.get('/compression-stats');
  },

  async getCavemanConfig(): Promise<CavemanConfig> {
    return apiClient.get('/caveman');
  },

  async updateCavemanConfig(config: CavemanConfig): Promise<CavemanConfig> {
    return apiClient.put('/caveman', config);
  },

  async getRTKConfig(): Promise<RTKConfig> {
    return apiClient.get('/rtk');
  },

  async updateRTKConfig(config: RTKConfig): Promise<RTKConfig> {
    return apiClient.put('/rtk', config);
  },

  async getRTKStats(): Promise<RTKStats> {
    const response = await apiClient.get<{ rtk: RTKStats }>('/compression-stats');
    return response.rtk;
  },

  // Prompts
  async getPromptsConfig(): Promise<PromptsConfig> {
    return apiClient.get('/prompts');
  },

  async updatePromptsConfig(config: PromptsConfig): Promise<PromptsConfig> {
    return apiClient.put('/prompts', config);
  },

  // Routing Test
  async testRouting(request: RoutingTestRequest): Promise<RoutingTestResponse> {
    return apiClient.post('/routing/test', request);
  },
};