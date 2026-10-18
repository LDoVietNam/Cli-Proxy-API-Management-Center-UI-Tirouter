/**
 * Advanced Configs Management API
 * Endpoints for credential_concurrency, credential_in_flight, ai_agent, and simple fields
 */

import { apiClient } from './client';
import type {
  CredentialConcurrencyConfig,
  CredentialInFlightConfig,
  AIAgentConfig,
} from '@/types/visualConfig';

export const advancedConfigsApi = {
  // Credential Concurrency Config
  async getCredentialConcurrencyConfig(): Promise<CredentialConcurrencyConfig> {
    return await apiClient.get<CredentialConcurrencyConfig>('/credential-concurrency');
  },

  async putCredentialConcurrencyConfig(config: CredentialConcurrencyConfig): Promise<void> {
    await apiClient.put('/credential-concurrency', config);
  },

  async patchCredentialConcurrencyConfig(config: Partial<CredentialConcurrencyConfig>): Promise<void> {
    await apiClient.patch('/credential-concurrency', config);
  },

  // Credential In-Flight Config
  async getCredentialInFlightConfig(): Promise<CredentialInFlightConfig> {
    return await apiClient.get<CredentialInFlightConfig>('/credential-in-flight');
  },

  async putCredentialInFlightConfig(config: CredentialInFlightConfig): Promise<void> {
    await apiClient.put('/credential-in-flight', config);
  },

  async patchCredentialInFlightConfig(config: Partial<CredentialInFlightConfig>): Promise<void> {
    await apiClient.patch('/credential-in-flight', config);
  },

  // AI Agent Config
  async getAIAgentConfig(): Promise<AIAgentConfig> {
    return await apiClient.get<AIAgentConfig>('/ai-agent');
  },

  async putAIAgentConfig(config: AIAgentConfig): Promise<void> {
    await apiClient.put('/ai-agent', config);
  },

  async patchAIAgentConfig(config: Partial<AIAgentConfig>): Promise<void> {
    await apiClient.patch('/ai-agent', config);
  },

  // Simple Field Configs
  // Disable Cooling
  async getDisableCooling(): Promise<boolean> {
    const res = await apiClient.get<{ 'disable-cooling': boolean }>('/disable-cooling');
    return res['disable-cooling'];
  },

  async putDisableCooling(value: boolean): Promise<void> {
    await apiClient.put('/disable-cooling', { value });
  },

  // Save Cooldown Status
  async getSaveCooldownStatus(): Promise<boolean> {
    const res = await apiClient.get<{ 'save-cooldown-status': boolean }>('/save-cooldown-status');
    return res['save-cooldown-status'];
  },

  async putSaveCooldownStatus(value: boolean): Promise<void> {
    await apiClient.put('/save-cooldown-status', { value });
  },

  // Transient Error Cooldown Seconds
  async getTransientErrorCooldownSeconds(): Promise<number> {
    const res = await apiClient.get<{ 'transient-error-cooldown-seconds': number }>('/transient-error-cooldown-seconds');
    return res['transient-error-cooldown-seconds'];
  },

  async putTransientErrorCooldownSeconds(value: number): Promise<void> {
    await apiClient.put('/transient-error-cooldown-seconds', { value });
  },

  // Auth Auto Refresh Workers
  async getAuthAutoRefreshWorkers(): Promise<number> {
    const res = await apiClient.get<{ 'auth-auto-refresh-workers': number }>('/auth-auto-refresh-workers');
    return res['auth-auto-refresh-workers'];
  },

  async putAuthAutoRefreshWorkers(value: number): Promise<void> {
    await apiClient.put('/auth-auto-refresh-workers', { value });
  },

  // Token Rotation Enabled
  async getTokenRotationEnabled(): Promise<boolean> {
    const res = await apiClient.get<{ 'token-rotation-enabled': boolean }>('/token-rotation-enabled');
    return res['token-rotation-enabled'];
  },

  async putTokenRotationEnabled(value: boolean): Promise<void> {
    await apiClient.put('/token-rotation-enabled', { value });
  },

  // Token Rotation Refresh Buffer Seconds
  async getTokenRotationRefreshBufferSeconds(): Promise<number> {
    const res = await apiClient.get<{ 'token-rotation-refresh-buffer-seconds': number }>('/token-rotation-refresh-buffer-seconds');
    return res['token-rotation-refresh-buffer-seconds'];
  },

  async putTokenRotationRefreshBufferSeconds(value: number): Promise<void> {
    await apiClient.put('/token-rotation-refresh-buffer-seconds', { value });
  },

  // Commercial Mode
  async getCommercialMode(): Promise<boolean> {
    const res = await apiClient.get<{ 'commercial-mode': boolean }>('/commercial-mode');
    return res['commercial-mode'];
  },

  async putCommercialMode(value: boolean): Promise<void> {
    await apiClient.put('/commercial-mode', { value });
  },

  // Antigravity Signature Cache Enabled
  async getAntigravitySignatureCacheEnabled(): Promise<boolean | null> {
    const res = await apiClient.get<{ 'antigravity-signature-cache-enabled': boolean | null }>('/antigravity-signature-cache-enabled');
    return res['antigravity-signature-cache-enabled'];
  },

  async putAntigravitySignatureCacheEnabled(value: boolean): Promise<void> {
    await apiClient.put('/antigravity-signature-cache-enabled', { value });
  },

  // Antigravity Signature Bypass Strict
  async getAntigravitySignatureBypassStrict(): Promise<boolean | null> {
    const res = await apiClient.get<{ 'antigravity-signature-bypass-strict': boolean | null }>('/antigravity-signature-bypass-strict');
    return res['antigravity-signature-bypass-strict'];
  },

  async putAntigravitySignatureBypassStrict(value: boolean): Promise<void> {
    await apiClient.put('/antigravity-signature-bypass-strict', { value });
  },

  // Disable Claude Cloak Mode
  async getDisableClaudeCloakMode(): Promise<boolean> {
    const res = await apiClient.get<{ 'disable-claude-cloak-mode': boolean }>('/disable-claude-cloak-mode');
    return res['disable-claude-cloak-mode'];
  },

  async putDisableClaudeCloakMode(value: boolean): Promise<void> {
    await apiClient.put('/disable-claude-cloak-mode', { value });
  },
};