/**
 * Missing Sections Management API
 * Endpoints for prompts, rtk, caveman, prompt_norm
 */

import { apiClient } from './client';
import type {
  PromptsConfig,
  PromptNormConfig,
  RTKConfig,
  CavemanConfig,
} from '@/types/visualConfig';

export const missingSectionsApi = {
  // Prompts Config
  async getPromptsConfig(): Promise<PromptsConfig> {
    return await apiClient.get<PromptsConfig>('/prompts');
  },

  async putPromptsConfig(config: PromptsConfig): Promise<void> {
    await apiClient.put('/prompts', config);
  },

  async patchPromptsConfig(config: Partial<PromptsConfig>): Promise<void> {
    await apiClient.patch('/prompts', config);
  },

  // PromptNorm Config
  async getPromptNormConfig(): Promise<PromptNormConfig> {
    return await apiClient.get<PromptNormConfig>('/prompt-norm');
  },

  async putPromptNormConfig(config: PromptNormConfig): Promise<void> {
    await apiClient.put('/prompt-norm', config);
  },

  async patchPromptNormConfig(config: Partial<PromptNormConfig>): Promise<void> {
    await apiClient.patch('/prompt-norm', config);
  },

  // RTK Config
  async getRTKConfig(): Promise<RTKConfig> {
    return await apiClient.get<RTKConfig>('/rtk');
  },

  async putRTKConfig(config: RTKConfig): Promise<void> {
    await apiClient.put('/rtk', config);
  },

  async patchRTKConfig(config: Partial<RTKConfig>): Promise<void> {
    await apiClient.patch('/rtk', config);
  },

  // Caveman Config
  async getCavemanConfig(): Promise<CavemanConfig> {
    return await apiClient.get<CavemanConfig>('/caveman');
  },

  async putCavemanConfig(config: CavemanConfig): Promise<void> {
    await apiClient.put('/caveman', config);
  },

  async patchCavemanConfig(config: Partial<CavemanConfig>): Promise<void> {
    await apiClient.patch('/caveman', config);
  },
};