/**
 * 额度查询页：页级 tabs（管理 | 监控）壳层。
 *
 * 页级 tab 契约（TASK B 合并 /quota-monitoring）：
 * - URL query `?tab=monitoring` deep-linkable（parse/serialize 见 quotaTabState.ts）；
 * - tab 2 = <QuotaMonitoringDashboard />，mount-on-open：只在用户首次选中时
 *   渲染（hasOpenedMonitoring），未打开前不打任何监控 API；
 * - useHeaderRefresh 单槽位：仅管理 tab 注册（全局刷新 = 重取文件列表）。
 *
 * 管理 tab 数据契约（QuotaManagementPanel 消费，重设计不改）：
 * - 点击加载：卡片挂载为 idle，额度只在用户点击/刷新时才打上游；
 * - cacheGeneration 会话隔离 + request-id 去重（见 useQuotaBatchLoader）；
 * - 文件列表变化后按 provider 剪枝额度缓存（已删文件不残留）。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { authFilesApi } from '@/services/api';
import { IconSearch, IconX } from '@/components/ui/icons';
import { Select } from '@/components/ui/Select';
import { useHeaderRefresh } from '@/hooks/useHeaderRefresh';
import { useNow } from '@/hooks/useNow';
import { useRevealGroup } from '@/hooks/motion';
import { useAuthStore, useQuotaStore, useThemeStore } from '@/stores';
import type { AuthFileItem } from '@/types';
import { ProviderTabs } from '@/features/authFiles/components/ProviderTabs';
import { QuotaMonitoringDashboard } from '@/features/quota-monitoring/QuotaMonitoringDashboard';
import { QuotaHeader } from './components/QuotaHeader';
import { QuotaManagementPanel } from './components/QuotaManagementPanel';
import {
  CARD_ENTRANCE_BUDGET_MS,
  QUOTA_PAGE_SIZE,
  QUOTA_SORT_MODES,
  QUOTA_TAB_ORDER,
  type QuotaSortMode,
  type QuotaTabId,
} from './constants';
import {
  buildTabCounts,
  classifyQuotaFiles,
  filterEntriesBySearch,
  filterEntriesByTab,
  paginate,
  sortQuotaEntries,
  type QuotaFileEntry,
} from './logic';
import { QUOTA_ADAPTERS, getQuotaSetter, type QuotaCardState } from './providers';
import type { QuotaProviderType } from './providers/types';
import { nextRecoveryMs } from './resetSchedule';
import { useQuotaActions } from './hooks/useQuotaActions';
import { useQuotaBatchLoader } from './hooks/useQuotaBatchLoader';
import { readQuotaUiState, writeQuotaUiState } from './uiState';
import { parseQuotaPageTab, serializeQuotaPageTab, type QuotaPageTab } from './quotaTabState';
import styles from './QuotaPage.module.scss';

/** 页级 tabs 定义：id ↔ aria 配对 + i18n key（TASK B）。 */
const PAGE_TABS: readonly { id: QuotaPageTab; labelKey: string }[] = [
  { id: 'management', labelKey: 'nav.quota_management' },
  { id: 'monitoring', labelKey: 'nav.quota_monitoring' },
];

const MANAGEMENT_TAB_ID = 'quota-page-tab-management';
const MONITORING_TAB_ID = 'quota-page-tab-monitoring';
const MANAGEMENT_PANEL_ID = 'quota-page-panel-management';
const MONITORING_PANEL_ID = 'quota-page-panel-monitoring';

export function QuotaPage() {
  const { t } = useTranslation();
  const connectionStatus = useAuthStore((state) => state.connectionStatus);
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);

  /* ---------- 页级 tab：URL query 驱动（deep-linkable） ---------- */

  const [searchParams, setSearchParams] = useSearchParams();
  const pageTab = useMemo(() => parseQuotaPageTab(searchParams), [searchParams]);

  // mount-on-open：首次选中监控 tab 后才渲染 dashboard（之后保持挂载，
  // 避免来回切换重置其内部轮询状态），未打开前零监控请求。
  const [hasOpenedMonitoring, setHasOpenedMonitoring] = useState(pageTab === 'monitoring');
  useEffect(() => {
    if (pageTab === 'monitoring') setHasOpenedMonitoring(true);
  }, [pageTab]);

  const setPageTab = useCallback(
    (next: QuotaPageTab) => {
      const serialized = serializeQuotaPageTab(next);
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (serialized === null) params.delete('tab');
          else params.set('tab', serialized);
          return params;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // 键盘导航：ArrowLeft/Right 在页级 tabs 间轮转（WAI-ARIA tabs pattern）
  const tabListRef = useRef<HTMLDivElement>(null);

  const handleTabListKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const index = PAGE_TABS.findIndex((entry) => entry.id === pageTab);
      if (index < 0) return;
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      const next = PAGE_TABS[(index + delta + PAGE_TABS.length) % PAGE_TABS.length];
      setPageTab(next.id);
      // roving focus：移焦到新激活的 tab
      const container = tabListRef.current;
      if (container) {
        const targetId = next.id === 'monitoring' ? MONITORING_TAB_ID : MANAGEMENT_TAB_ID;
        container.querySelector<HTMLButtonElement>(`#${targetId}`)?.focus();
      }
    },
    [pageTab, setPageTab]
  );

  const [files, setFiles] = useState<AuthFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<QuotaTabId>(() => readQuotaUiState()?.tab ?? 'all');
  const [sortMode, setSortMode] = useState<QuotaSortMode>(
    () => readQuotaUiState()?.sortMode ?? 'default'
  );
  const [search, setSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  // 管理 tab 主体的入场级联（标题 → meta → 动作 → tabs，级差 70ms）
  const revealRef = useRevealGroup<HTMLDivElement>();

  const disableControls = connectionStatus !== 'connected';

  /* ---------- 文件列表 ---------- */

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authFilesApi.list();
      setFiles(data?.files || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('notification.refresh_failed');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  // 单槽位：仅管理 tab 注册全局刷新（监控 tab 有自己的 header 刷新按钮）
  useHeaderRefresh(pageTab === 'management' ? loadFiles : null);

  useEffect(() => {
    if (pageTab !== 'management') return;
    void loadFiles();
  }, [loadFiles, pageTab]);

  /* ---------- 归类 / 过滤 / 分页 ---------- */

  const entries = useMemo(() => classifyQuotaFiles(files), [files]);
  const tabCounts = useMemo(() => buildTabCounts(entries), [entries]);
  const filteredEntries = useMemo(
    () => filterEntriesBySearch(filterEntriesByTab(entries, tab), search),
    [entries, tab, search]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  // provider tab（'all'/'claude'/...）旧逻辑原样保留 —— 与页级 tab 互不相干
  const handleTabChange = useCallback((next: string) => {
    setTab(next as QuotaTabId);
    setPage(1);
    writeQuotaUiState({ tab: next as QuotaTabId });
  }, []);

  const handleSortModeChange = useCallback((next: string) => {
    setSortMode(next as QuotaSortMode);
    setPage(1);
    writeQuotaUiState({ sortMode: next as QuotaSortMode });
  }, []);

  const sortOptions = useMemo(
    () =>
      QUOTA_SORT_MODES.map((mode) => ({ value: mode, label: t(`quota_management.sort_${mode}`) })),
    [t]
  );

  /* ---------- 额度缓存 ---------- */

  const antigravityQuota = useQuotaStore((state) => state.antigravityQuota);
  const claudeQuota = useQuotaStore((state) => state.claudeQuota);
  const codexQuota = useQuotaStore((state) => state.codexQuota);
  const kimiQuota = useQuotaStore((state) => state.kimiQuota);
  const xaiQuota = useQuotaStore((state) => state.xaiQuota);

  const quotaByType = useMemo<Record<QuotaProviderType, Record<string, QuotaCardState>>>(
    () =>
      ({
        antigravity: antigravityQuota,
        claude: claudeQuota,
        codex: codexQuota,
        kimi: kimiQuota,
        xai: xaiQuota,
      }) as unknown as Record<QuotaProviderType, Record<string, QuotaCardState>>,
    [antigravityQuota, claudeQuota, codexQuota, kimiQuota, xaiQuota]
  );

  const getQuota = useCallback(
    (entry: QuotaFileEntry): QuotaCardState | undefined => quotaByType[entry.type][entry.file.name],
    [quotaByType]
  );

  // 只在「最快恢复优先」下订阅分钟时钟，避免默认序每分钟换一次 pageItems 身份。
  const tick = useNow(sortMode !== 'default');
  const sortNow = sortMode === 'default' ? 0 : tick;

  const resolveNextRecovery = useCallback(
    (entry: QuotaFileEntry) => nextRecoveryMs(entry.type, getQuota(entry), sortNow),
    [getQuota, sortNow]
  );
  // 排序在分页之前：否则「最快恢复」只在当前页内成立。
  const sortedEntries = useMemo(
    () => sortQuotaEntries(filteredEntries, sortMode, resolveNextRecovery),
    [filteredEntries, sortMode, resolveNextRecovery]
  );

  const { pageItems, currentPage, totalPages } = useMemo(
    () => paginate(sortedEntries, page, QUOTA_PAGE_SIZE),
    [sortedEntries, page]
  );

  const { loadedCount, attentionCount } = useMemo(() => {
    let loaded = 0;
    let attention = 0;
    entries.forEach((entry) => {
      const status = quotaByType[entry.type][entry.file.name]?.status;
      if (status === 'success') loaded += 1;
      else if (status === 'error') attention += 1;
    });
    return { loadedCount: loaded, attentionCount: attention };
  }, [entries, quotaByType]);

  // 剪枝：文件列表落定后，各 provider 缓存只保留仍存在的凭证
  useEffect(() => {
    if (loading) return;
    const survivorsByType = new Map<QuotaProviderType, Set<string>>(
      QUOTA_TAB_ORDER.map((type) => [type, new Set<string>()])
    );
    entries.forEach((entry) => survivorsByType.get(entry.type)?.add(entry.file.name));

    QUOTA_TAB_ORDER.forEach((type) => {
      const survivors = survivorsByType.get(type) ?? new Set<string>();
      const setQuota = getQuotaSetter(QUOTA_ADAPTERS[type]);
      setQuota((prev) => {
        const staleKeys = Object.keys(prev).filter((name) => !survivors.has(name));
        if (staleKeys.length === 0) return prev;
        const next = { ...prev };
        staleKeys.forEach((name) => delete next[name]);
        return next;
      });
    });
  }, [entries, loading]);

  /* ---------- 加载与操作 ---------- */

  const { batchLoading, loadQuota } = useQuotaBatchLoader();
  const { resettingQuotaName, refreshQuota, resetQuota } = useQuotaActions(disableControls);

  const pendingRefreshRef = useRef(false);
  const prevLoadingRef = useRef(loading);

  // 刷新全部：先重取文件列表，待其落定（loading 下降沿）再批量拉当前页额度
  const handleRefreshAll = useCallback(() => {
    if (disableControls) return;
    pendingRefreshRef.current = true;
    void loadFiles();
  }, [disableControls, loadFiles]);

  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    prevLoadingRef.current = loading;

    if (!pendingRefreshRef.current) return;
    if (loading || !wasLoading) return;

    pendingRefreshRef.current = false;
    void loadQuota(pageItems);
  }, [loading, loadQuota, pageItems]);

  const canUseActions = !disableControls && !loading;

  /* ---------- 首屏卡片一次性级联入场 ---------- */

  const [cardsAnimated, setCardsAnimated] = useState(false);
  const enableCardEntrance = !cardsAnimated && !loading && pageItems.length > 0;
  useEffect(() => {
    if (enableCardEntrance) {
      setCardsAnimated(true);
    }
  }, [enableCardEntrance]);
  const cardEntranceDelay = (index: number): number | null => {
    if (!enableCardEntrance) return null;
    if (pageItems.length <= 1) return 0;
    return Math.round((index / (pageItems.length - 1)) * CARD_ENTRANCE_BUDGET_MS);
  };

  /* ---------- 渲染 ---------- */

  const isEmpty = !loading && filteredEntries.length === 0;

  // 页级 tabs（管理 | 监控）—— 合并 /quota-monitoring 的入口
  const pageTabs = (
    <div
      ref={tabListRef}
      className={styles.pageTabs}
      role="tablist"
      aria-label={t('nav.quota_management')}
      onKeyDown={handleTabListKeyDown}
    >
      {PAGE_TABS.map(({ id, labelKey }) => {
        const isActive = pageTab === id;
        return (
          <button
            key={id}
            id={id === 'monitoring' ? MONITORING_TAB_ID : MANAGEMENT_TAB_ID}
            type="button"
            role="tab"
            className={`${styles.pageTab} ${isActive ? styles.pageTabActive : ''}`}
            aria-selected={isActive}
            aria-controls={id === 'monitoring' ? MONITORING_PANEL_ID : MANAGEMENT_PANEL_ID}
            tabIndex={isActive ? 0 : -1}
            onClick={() => setPageTab(id)}
          >
            {t(labelKey)}
          </button>
        );
      })}
    </div>
  );

  if (pageTab === 'monitoring') {
    return (
      <div className={styles.page}>
        {pageTabs}
        <div
          id={MONITORING_PANEL_ID}
          role="tabpanel"
          aria-labelledby={MONITORING_TAB_ID}
          tabIndex={-1}
        >
          {hasOpenedMonitoring && <QuotaMonitoringDashboard />}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {pageTabs}

      <div
        id={MANAGEMENT_PANEL_ID}
        ref={revealRef}
        role="tabpanel"
        aria-labelledby={MANAGEMENT_TAB_ID}
        tabIndex={-1}
        className={styles.workbench}
      >
        <QuotaHeader
          totalCount={entries.length}
          loadedCount={loadedCount}
          attentionCount={attentionCount}
          refreshing={loading || batchLoading}
          disableControls={disableControls}
          onRefreshAll={handleRefreshAll}
        />

        {/* 提供商导航与搜索工具栏分层，避免不同控件争夺视觉焦点。 */}
        <div className={styles.tabsRow} data-reveal>
          <ProviderTabs
            types={['all', ...QUOTA_TAB_ORDER]}
            counts={tabCounts}
            active={tab}
            resolvedTheme={resolvedTheme}
            onChange={handleTabChange}
          />
        </div>

        <div className={styles.toolbar}>
          <div className={styles.search}>
            <IconSearch size={16} className={styles.searchIcon} aria-hidden="true" />
            <input
              ref={searchInputRef}
              className={styles.searchInput}
              type="search"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder={t('quota_management.search_placeholder')}
              aria-label={t('quota_management.search_label')}
            />
            {search && (
              <button
                type="button"
                className={styles.clearSearch}
                aria-label={t('quota_management.search_clear')}
                title={t('quota_management.search_clear')}
                onClick={() => {
                  handleSearchChange('');
                  searchInputRef.current?.focus();
                }}
              >
                <IconX size={14} aria-hidden="true" />
              </button>
            )}
          </div>
          <div className={styles.sort}>
            <Select
              value={sortMode}
              options={sortOptions}
              onChange={handleSortModeChange}
              ariaLabel={t('quota_management.sort_label')}
              size="sm"
            />
          </div>
        </div>

        <QuotaManagementPanel
          loading={loading}
          error={error}
          isEmpty={isEmpty}
          tab={tab}
          filteredEntries={filteredEntries}
          pageItems={pageItems}
          currentPage={currentPage}
          totalPages={totalPages}
          canUseActions={canUseActions}
          resolvedTheme={resolvedTheme}
          resettingQuotaName={resettingQuotaName}
          getQuota={getQuota}
          cardEntranceDelay={cardEntranceDelay}
          searchActive={search.trim().length > 0}
          onClearSearch={() => handleSearchChange('')}
          onTabChange={handleTabChange}
          onRefresh={refreshQuota}
          onReset={resetQuota}
          onPageChange={setPage}
          t={t}
        />
      </div>
    </div>
  );
}

export default QuotaPage;