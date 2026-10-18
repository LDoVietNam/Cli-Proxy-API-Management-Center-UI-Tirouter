/**
 * 模型列表状态管理（带缓存）
 *
 * 参数化调用按连接（apiBase + apiKey）缓存，通过单调请求序号实现隔离：
 * - clearCache() 会使所有在途请求过期，其后续结算不再发布；
 * - 后发起的请求结算优先，先发起的过期结算被忽略；
 * - 缓存命中同样使在途刷新过期，保证界面停留在已确认的数据上。
 *
 * 无参调用（dashboard 聚合页）沿用既有行为：从已连接的认证凭据
 * （auth-files）派生模型列表。
 */

import { create } from 'zustand';
import { modelsApi } from '@/services/api/models';
import { CACHE_EXPIRY_MS } from '@/utils/constants';
import type { ModelInfo } from '@/utils/models';

interface ModelsCache {
  data: ModelInfo[];
  timestamp: number;
  apiBase: string;
  apiKey: string;
}

interface ModelsState {
  models: ModelInfo[];
  loading: boolean;
  error: string | null;
  cache: ModelsCache | null;

  fetchModels: (
    apiBase?: string,
    apiKey?: string,
    forceRefresh?: boolean
  ) => Promise<ModelInfo[]>;
  clearCache: () => void;
  isCacheValid: () => boolean;
}

export const useModelsStore = create<ModelsState>((set, get) => {
  let requestSeq = 0;
  const isCurrent = (id: number) => id === requestSeq;

  return {
    models: [],
    loading: false,
    error: null,
    cache: null,

    fetchModels: async (apiBase = '', apiKey = '', forceRefresh = false) => {
      const base = apiBase.trim();
      const key = apiKey.trim();
      requestSeq += 1;
      const id = requestSeq;

      const { cache, isCacheValid } = get();

      if (
        !forceRefresh &&
        isCacheValid() &&
        cache &&
        cache.apiBase === base &&
        cache.apiKey === key
      ) {
        set({ models: cache.data, error: null, loading: false });
        return cache.data;
      }

      set({ loading: true, error: null });

      try {
        const list = base
          ? await modelsApi.fetchModels(base, key ? key : undefined)
          : await modelsApi.fetchConnectedModels();
        // 过期结算只返回值，不再发布到 store，避免覆盖更新的数据或复活已清理的缓存。
        if (!isCurrent(id)) return list;
        const now = Date.now();

        set({
          models: list,
          loading: false,
          error: null,
          cache: { data: list, timestamp: now, apiBase: base, apiKey: key },
        });

        return list;
      } catch (error: unknown) {
        // 过期失败不清除更新请求的 loading，也不写入 error，但仍向调用方抛出原错误。
        if (!isCurrent(id)) throw error;
        const message =
          error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : 'Failed to fetch models';
        set({
          error: message,
          loading: false,
          models: [],
        });
        throw error;
      }
    },

    clearCache: () => {
      requestSeq += 1;
      set({ cache: null, models: [], error: null, loading: false });
    },

    isCacheValid: () => {
      const { cache } = get();
      if (!cache) return false;
      return Date.now() - cache.timestamp < CACHE_EXPIRY_MS;
    },
  };
});
