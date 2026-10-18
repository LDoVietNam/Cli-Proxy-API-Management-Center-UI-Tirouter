/**
 * Quota cache that survives route switches.
 */

import { create } from 'zustand';
import type {
  AntigravityQuotaState,
  ClaudeQuotaState,
  CodexQuotaState,
  KimiQuotaState,
  XaiQuotaState,
  DevinQuotaState,
  MetaQuotaState,
} from '@/types';

type QuotaUpdater<T> = T | ((prev: T) => T);

interface QuotaStoreState {
  cacheGeneration: number;
  antigravityQuota: Record<string, AntigravityQuotaState>;
  claudeQuota: Record<string, ClaudeQuotaState>;
  codexQuota: Record<string, CodexQuotaState>;
  kimiQuota: Record<string, KimiQuotaState>;
  xaiQuota: Record<string, XaiQuotaState>;
  devinQuota: Record<string, DevinQuotaState>;
  metaQuota: Record<string, MetaQuotaState>;
  setAntigravityQuota: (updater: QuotaUpdater<Record<string, AntigravityQuotaState>>) => void;
  setClaudeQuota: (updater: QuotaUpdater<Record<string, ClaudeQuotaState>>) => void;
  setCodexQuota: (updater: QuotaUpdater<Record<string, CodexQuotaState>>) => void;
  setKimiQuota: (updater: QuotaUpdater<Record<string, KimiQuotaState>>) => void;
  setXaiQuota: (updater: QuotaUpdater<Record<string, XaiQuotaState>>) => void;
  setDevinQuota: (updater: QuotaUpdater<Record<string, DevinQuotaState>>) => void;
  setMetaQuota: (updater: QuotaUpdater<Record<string, MetaQuotaState>>) => void;
  clearQuotaCache: (files?: string[]) => void;
}

const resolveUpdater = <T>(updater: QuotaUpdater<T>, prev: T): T => {
  if (typeof updater === 'function') {
    return (updater as (value: T) => T)(prev);
  }
  return updater;
};

export const useQuotaStore = create<QuotaStoreState>((set) => ({
  cacheGeneration: 0,
  antigravityQuota: {},
  claudeQuota: {},
  codexQuota: {},
  kimiQuota: {},
  xaiQuota: {},
  devinQuota: {},
  metaQuota: {},
  setAntigravityQuota: (updater) =>
    set((state) => ({
      antigravityQuota: resolveUpdater(updater, state.antigravityQuota),
    })),
  setClaudeQuota: (updater) =>
    set((state) => ({
      claudeQuota: resolveUpdater(updater, state.claudeQuota),
    })),
  setCodexQuota: (updater) =>
    set((state) => ({
      codexQuota: resolveUpdater(updater, state.codexQuota),
    })),
  setKimiQuota: (updater) =>
    set((state) => ({
      kimiQuota: resolveUpdater(updater, state.kimiQuota),
    })),
  setXaiQuota: (updater) =>
    set((state) => ({
      xaiQuota: resolveUpdater(updater, state.xaiQuota),
    })),
  setDevinQuota: (updater) =>
    set((state) => ({
      devinQuota: resolveUpdater(updater, state.devinQuota),
    })),
  setMetaQuota: (updater) =>
    set((state) => ({
      metaQuota: resolveUpdater(updater, state.metaQuota),
    })),
  clearQuotaCache: (files?: string[]) =>
    set((state) => {
      if (!files || files.length === 0) {
        return {
          cacheGeneration: state.cacheGeneration + 1,
          antigravityQuota: {},
          claudeQuota: {},
          codexQuota: {},
          kimiQuota: {},
          xaiQuota: {},
          devinQuota: {},
          metaQuota: {},
        };
      }
      const newMetaQuota = { ...state.metaQuota };
      const newAntigravityQuota = { ...state.antigravityQuota };
      const newClaudeQuota = { ...state.claudeQuota };
      const newCodexQuota = { ...state.codexQuota };
      const newKimiQuota = { ...state.kimiQuota };
      const newXaiQuota = { ...state.xaiQuota };
      const newDevinQuota = { ...state.devinQuota };
      for (const file of files) {
        delete newMetaQuota[file];
        delete newAntigravityQuota[file];
        delete newClaudeQuota[file];
        delete newCodexQuota[file];
        delete newKimiQuota[file];
        delete newXaiQuota[file];
        delete newDevinQuota[file];
      }
      return {
        cacheGeneration: state.cacheGeneration + 1,
        antigravityQuota: newAntigravityQuota,
        claudeQuota: newClaudeQuota,
        codexQuota: newCodexQuota,
        kimiQuota: newKimiQuota,
        xaiQuota: newXaiQuota,
        devinQuota: newDevinQuota,
        metaQuota: newMetaQuota,
      };
    }),
}));

export const captureQuotaCacheGeneration = (): number =>
  useQuotaStore.getState().cacheGeneration;

export const commitIfQuotaCacheCurrent = (
  generation: number,
  commit: () => void
): boolean => {
  if (useQuotaStore.getState().cacheGeneration !== generation) return false;
  commit();
  return true;
};
