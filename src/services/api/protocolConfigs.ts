/**
 * Protocol Configs Management API
 * Endpoints for payload, codex/claude headers, xai live-media-relay
 */

import { apiClient } from './client';
import type {
  PayloadRule,
  PayloadFilterRule,
  CodexHeaderDefaults,
  ClaudeHeaderDefaults,
  XAIConfig,
} from '@/types/visualConfig';

export const protocolConfigsApi = {
  // Payload Config
  async getPayloadConfig(): Promise<{
    default: PayloadRule[];
    defaultRaw: PayloadRule[];
    override: PayloadRule[];
    overrideRaw: PayloadRule[];
    filter: PayloadFilterRule[];
  }> {
    return await apiClient.get('/payload');
  },

  async putPayloadConfig(config: {
    default: PayloadRule[];
    defaultRaw: PayloadRule[];
    override: PayloadRule[];
    overrideRaw: PayloadRule[];
    filter: PayloadFilterRule[];
  }): Promise<void> {
    await apiClient.put('/payload', config);
  },

  async patchPayloadConfig(config: Partial<{
    default: PayloadRule[];
    defaultRaw: PayloadRule[];
    override: PayloadRule[];
    overrideRaw: PayloadRule[];
    filter: PayloadFilterRule[];
  }>): Promise<void> {
    await apiClient.patch('/payload', config);
  },

  // Codex Header Defaults
  async getCodexHeaderDefaults(): Promise<CodexHeaderDefaults> {
    return await apiClient.get<CodexHeaderDefaults>('/codex-header-defaults');
  },

  async putCodexHeaderDefaults(config: CodexHeaderDefaults): Promise<void> {
    await apiClient.put('/codex-header-defaults', config);
  },

  async patchCodexHeaderDefaults(config: Partial<CodexHeaderDefaults>): Promise<void> {
    await apiClient.patch('/codex-header-defaults', config);
  },

  // Claude Header Defaults
  async getClaudeHeaderDefaults(): Promise<ClaudeHeaderDefaults> {
    return await apiClient.get<ClaudeHeaderDefaults>('/claude-header-defaults');
  },

  async putClaudeHeaderDefaults(config: ClaudeHeaderDefaults): Promise<void> {
    await apiClient.put('/claude-header-defaults', config);
  },

  async patchClaudeHeaderDefaults(config: Partial<ClaudeHeaderDefaults>): Promise<void> {
    await apiClient.patch('/claude-header-defaults', config);
  },

  // XAI Config
  async getXAIConfig(): Promise<XAIConfig> {
    return await apiClient.get<XAIConfig>('/xai');
  },

  async putXAIConfig(config: XAIConfig): Promise<void> {
    await apiClient.put('/xai', config);
  },

  async patchXAIConfig(config: Partial<XAIConfig>): Promise<void> {
    await apiClient.patch('/xai', config);
  },
};