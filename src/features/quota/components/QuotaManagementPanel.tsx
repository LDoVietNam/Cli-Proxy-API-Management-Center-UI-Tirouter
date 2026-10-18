/**
 * 管理 tab 内容（QuotaPage tab 1 原主体，props 化提取）。
 * 数据全部由 QuotaPage 提供，本组件纯展示 —— 便于测试与文件大小控制。
 */

import type { RefObject } from 'react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProviderTabs } from '@/features/authFiles/components/ProviderTabs';
import type { AuthFileItem, ResolvedTheme } from '@/types';
import { QUOTA_PAGE_SIZE, QUOTA_TAB_ORDER, type QuotaTabId } from '../constants';
import type { QuotaFileEntry } from '../logic';
import { QUOTA_ADAPTERS, type QuotaCardState } from '../providers';
import type { QuotaProviderType } from '../providers/types';
import { QuotaHeader } from './QuotaHeader';
import { QuotaCard } from './QuotaCard';
import { QuotaTimeline } from './QuotaTimeline';
import styles from './QuotaManagementPanel.module.scss';

export const SKELETON_CARD_COUNT = 6;

/** 时间线泳道名 = 卡片标题（恒等映射，引用稳定以进 memo 依赖数组）。 */
export const displayNameFor = (name: string) => name;

type QuotaAdapter = (typeof QUOTA_ADAPTERS)[QuotaProviderType];

export type QuotaManagementPanelProps = {
  revealRef: RefObject<HTMLDivElement | null>;
  loading: boolean;
  error: string;
  isEmpty: boolean;
  tab: QuotaTabId;
  tabCounts: Record<string, number>;
  filteredEntries: QuotaFileEntry[];
  pageItems: QuotaFileEntry[];
  currentPage: number;
  totalPages: number;
  entries: QuotaFileEntry[];
  loadedCount: number;
  attentionCount: number;
  refreshing: boolean;
  disableControls: boolean;
  canUseActions: boolean;
  resolvedTheme: ResolvedTheme;
  resettingQuotaName: string | null;
  getQuota: (entry: QuotaFileEntry) => QuotaCardState | undefined;
  cardEntranceDelay: (index: number) => number | null;
  onRefreshAll: () => void;
  onTabChange: (next: string) => void;
  onRefresh: (file: AuthFileItem, adapter: QuotaAdapter) => Promise<void>;
  onReset: (file: AuthFileItem, adapter: QuotaAdapter) => void;
  onPageChange: (next: number) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
};

export function QuotaManagementPanel(props: QuotaManagementPanelProps) {
  const {
    revealRef,
    loading,
    error,
    isEmpty,
    tab,
    tabCounts,
    filteredEntries,
    pageItems,
    currentPage,
    totalPages,
    entries,
    loadedCount,
    attentionCount,
    refreshing,
    disableControls,
    canUseActions,
    resolvedTheme,
    resettingQuotaName,
    getQuota,
    cardEntranceDelay,
    onRefreshAll,
    onTabChange,
    onRefresh,
    onReset,
    onPageChange,
    t,
  } = props;

  return (
    <div ref={revealRef}>
      <QuotaHeader
        totalCount={entries.length}
        loadedCount={loadedCount}
        attentionCount={attentionCount}
        refreshing={refreshing}
        disableControls={disableControls}
        onRefreshAll={onRefreshAll}
      />

      <section className={styles.workbench}>
        {/* tabs 作为一个整体入场（不做逐 tab 级差 —— 克制优先） */}
        <div data-reveal>
          <ProviderTabs
            types={['all', ...QUOTA_TAB_ORDER]}
            counts={tabCounts}
            active={tab}
            resolvedTheme={resolvedTheme}
            onChange={onTabChange}
          />
        </div>

        {error && (
          <div className={styles.errorBanner} role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className={styles.grid} aria-hidden="true">
            {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
              <Skeleton key={index} height={168} rounded={14} />
            ))}
          </div>
        ) : isEmpty ? (
          <EmptyState
            title={
              tab === 'all'
                ? t('quota_management.empty_title')
                : t(`${QUOTA_ADAPTERS[tab].i18nPrefix}.empty_title`)
            }
            description={
              tab === 'all'
                ? t('quota_management.empty_desc')
                : t(`${QUOTA_ADAPTERS[tab].i18nPrefix}.empty_desc`)
            }
            action={
              tab === 'all' ? undefined : (
                <Button variant="secondary" size="sm" onClick={() => onTabChange('all')}>
                  {t('auth_files.filter_all')}
                </Button>
              )
            }
          />
        ) : (
          <div className={styles.grid}>
            {pageItems.map((entry, index) => (
              <QuotaCard
                key={`${entry.type}:${entry.file.name}`}
                entry={entry}
                quota={getQuota(entry)}
                resolvedTheme={resolvedTheme}
                canRefresh={canUseActions && !entry.file.disabled}
                resetting={resettingQuotaName === entry.file.name}
                entranceDelayMs={cardEntranceDelay(index)}
                onRefresh={() => void onRefresh(entry.file, QUOTA_ADAPTERS[entry.type])}
                onReset={() => onReset(entry.file, QUOTA_ADAPTERS[entry.type])}
              />
            ))}
          </div>
        )}

        {!loading && filteredEntries.length > QUOTA_PAGE_SIZE && (
          <div className={styles.pagination}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
            >
              {t('auth_files.pagination_prev')}
            </Button>
            <div className={styles.pageInfo}>
              {t('auth_files.pagination_info', {
                current: currentPage,
                total: totalPages,
                count: filteredEntries.length,
              })}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
            >
              {t('auth_files.pagination_next')}
            </Button>
          </div>
        )}

        {/* 时间线只比较当前页凭证，避免大量凭证一次性生成无界泳道。 */}
        <QuotaTimeline
          entries={pageItems}
          quotaFor={getQuota}
          displayNameFor={displayNameFor}
          resolvedTheme={resolvedTheme}
        />
      </section>
    </div>
  );
}
