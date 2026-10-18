import type { TFunction } from 'i18next';
import type { MetaQuotaData, MetaQuotaState } from '@/types';
import { apiCallApi } from '@/services/api/apiCall';
import { authFilesApi } from '@/services/api/authFiles';
import { captureQuotaCacheGeneration, commitIfQuotaCacheCurrent } from '@/stores/useQuotaStore';
import { isDisabledAuthFile, resolveAuthProvider } from '@/utils/quota';
import type { QuotaProviderData } from '../types';
import { createMetaQuotaFetcher, MetaQuotaError } from './requests';

const fetchMetaQuota = createMetaQuotaFetcher({
  request: (payload) => apiCallApi.request(payload),
  downloadText: (name) => authFilesApi.downloadText(name),
  captureCurrent: () => {
    const generation = captureQuotaCacheGeneration();
    return () => commitIfQuotaCacheCurrent(generation, () => {});
  },
});

const emptyData = (): MetaQuotaData => ({
  planType: null,
  windows: [],
});

export const META_CONFIG: QuotaProviderData<MetaQuotaState, MetaQuotaData> = {
  type: 'meta',
  i18nPrefix: 'meta_quota',
  filterFn: (file) => resolveAuthProvider(file) === 'meta' && !isDisabledAuthFile(file),
  fetchQuota: async (file, t: TFunction) => {
    try {
      return await fetchMetaQuota(file);
    } catch (error: unknown) {
      if (error instanceof MetaQuotaError) {
        error.message = t(`meta_quota.${error.code}`, { status: error.status });
      }
      throw error;
    }
  },
  storeSelector: (state) => state.metaQuota,
  storeSetter: 'setMetaQuota',
  buildLoadingState: () => ({ status: 'loading', ...emptyData() }),
  buildSuccessState: (data) => ({ status: 'success', ...data }),
  buildErrorState: (error, errorStatus) => ({
    status: 'error',
    ...emptyData(),
    error,
    errorStatus,
  }),
};
