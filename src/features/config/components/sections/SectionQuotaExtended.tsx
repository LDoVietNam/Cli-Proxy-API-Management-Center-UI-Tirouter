import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapsible } from '@/components/ui/Collapsible';
import { Input } from '@/components/ui/Input';
import type { ConfigSectionProps } from '../../types';
import { CONFIG_TAB_ICONS, SECTION_INDEX_LABELS } from '../../constants';
import { SectionCard } from '../SectionCard';
import {
  Divider,
  FieldAnchor,
  FieldGrid,
  FieldGroup,
  FieldGroupHeading,
  FieldShell,
  FieldStack,
  ToggleRow,
} from '../fields/FieldPrimitives';

const Icon = CONFIG_TAB_ICONS.quotaExtended;

/** 10 Quota Extended: Daily Limit, Token Limit, Cache. */
export function SectionQuotaExtended({
  values,
  disabled,
  animateIn,
  onChange,
}: ConfigSectionProps) {
  const { t } = useTranslation();

  const handleQuotaChange = useCallback(
    (patch: Partial<typeof values.quota>) =>
      onChange({ quota: { ...values.quota, ...patch } }),
    [onChange, values.quota]
  );

  const handleQuotaCacheChange = useCallback(
    (patch: Partial<typeof values.quota.cache>) =>
      onChange({ quota: { ...values.quota, cache: { ...values.quota.cache, ...patch } } }),
    [onChange, values.quota]
  );

  return (
    <SectionCard
      indexLabel={SECTION_INDEX_LABELS.quotaExtended}
      icon={<Icon size={16} />}
      title={t('config_management.visual.sections.quotaExtended.title')}
      description={t('config_management.visual.sections.quotaExtended.description')}
      animateIn={animateIn}
    >
      <FieldStack>
        <Collapsible
          label={t('config_management.visual.sections.quotaExtended.quota_config_title')}
          defaultOpen={true}
        >
          <FieldStack>
            <FieldAnchor fieldId="quotaEnabled">
              <FieldGroup
                title={t('config_management.visual.sections.quotaExtended.quota_enabled')}
                description={t('config_management.visual.sections.quotaExtended.quota_enabled_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.quotaExtended.quota_enabled_label')}
                >
                  <ToggleRow
                    title={t('config_management.visual.sections.quotaExtended.quota_enabled')}
                    description={t('config_management.visual.sections.quotaExtended.quota_enabled_desc')}
                    checked={values.quota.enabled}
                    disabled={disabled}
                    onChange={(enabled) => handleQuotaChange({ enabled })}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldGrid>
              <FieldAnchor fieldId="quotaDailyLimit">
                <FieldGroup
                  title={t('config_management.visual.sections.quotaExtended.daily_limit')}
                  description={t('config_management.visual.sections.quotaExtended.daily_limit_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.quotaExtended.daily_limit_label')}
                    hint={t('config_management.visual.sections.quotaExtended.daily_limit_hint')}
                  >
                    <Input
                      type="number"
                      value={values.quota.dailyLimit}
                      onChange={(e) => handleQuotaChange({ dailyLimit: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="quotaTokenLimit">
                <FieldGroup
                  title={t('config_management.visual.sections.quotaExtended.token_limit')}
                  description={t('config_management.visual.sections.quotaExtended.token_limit_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.quotaExtended.token_limit_label')}
                    hint={t('config_management.visual.sections.quotaExtended.token_limit_hint')}
                  >
                    <Input
                      type="number"
                      value={values.quota.tokenLimit}
                      onChange={(e) => handleQuotaChange({ tokenLimit: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="quotaStoreDir">
                <FieldGroup
                  title={t('config_management.visual.sections.quotaExtended.store_dir')}
                  description={t('config_management.visual.sections.quotaExtended.store_dir_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.quotaExtended.store_dir_label')}
                  >
                    <Input
                      placeholder="/data/quota"
                      value={values.quota.storeDir}
                      onChange={(e) => handleQuotaChange({ storeDir: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>

            <FieldGroupHeading title={t('config_management.visual.sections.quotaExtended.antigravity')} />

            <FieldAnchor fieldId="quotaAntigravityFamilyWindows">
              <FieldGroup
                title={t('config_management.visual.sections.quotaExtended.family_windows')}
                description={t('config_management.visual.sections.quotaExtended.family_windows_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.quotaExtended.family_windows_label')}
                >
                  <ToggleRow
                    title={t('config_management.visual.sections.quotaExtended.family_windows')}
                    description={t('config_management.visual.sections.quotaExtended.family_windows_desc')}
                    checked={values.quota.antigravity.familyWindows}
                    disabled={disabled}
                    onChange={(familyWindows) => handleQuotaChange({ antigravity: { ...values.quota.antigravity, familyWindows } })}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldGroupHeading title={t('config_management.visual.sections.quotaExtended.codex')} />

            <FieldGrid>
              <FieldAnchor fieldId="quotaCodexSessionScope">
                <FieldGroup
                  title={t('config_management.visual.sections.quotaExtended.session_scope')}
                  description={t('config_management.visual.sections.quotaExtended.session_scope_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.quotaExtended.session_scope_label')}
                  >
                    <ToggleRow
                      title={t('config_management.visual.sections.quotaExtended.session_scope')}
                      description={t('config_management.visual.sections.quotaExtended.session_scope_desc')}
                      checked={values.quota.codex.sessionScope}
                      disabled={disabled}
                      onChange={(sessionScope) => handleQuotaChange({ codex: { ...values.quota.codex, sessionScope } })}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="quotaCodexWeeklyScope">
                <FieldGroup
                  title={t('config_management.visual.sections.quotaExtended.weekly_scope')}
                  description={t('config_management.visual.sections.quotaExtended.weekly_scope_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.quotaExtended.weekly_scope_label')}
                  >
                    <ToggleRow
                      title={t('config_management.visual.sections.quotaExtended.weekly_scope')}
                      description={t('config_management.visual.sections.quotaExtended.weekly_scope_desc')}
                      checked={values.quota.codex.weeklyScope}
                      disabled={disabled}
                      onChange={(weeklyScope) => handleQuotaChange({ codex: { ...values.quota.codex, weeklyScope } })}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>
          </FieldStack>
        </Collapsible>

        <Divider />

        <Collapsible
          label={t('config_management.visual.sections.quotaExtended.cache_title')}
          defaultOpen={false}
        >
          <FieldStack>
            <FieldAnchor fieldId="quotaCacheActiveTTL">
              <FieldGroup
                title={t('config_management.visual.sections.quotaExtended.active_ttl')}
                description={t('config_management.visual.sections.quotaExtended.active_ttl_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.quotaExtended.active_ttl_label')}
                  hint={t('config_management.visual.sections.quotaExtended.active_ttl_hint')}
                >
                  <Input
                    placeholder="5m"
                    value={values.quota.cache.activeTTL}
                    onChange={(e) => handleQuotaCacheChange({ activeTTL: e.target.value })}
                    disabled={disabled}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldAnchor fieldId="quotaCacheExhaustedTTL">
              <FieldGroup
                title={t('config_management.visual.sections.quotaExtended.exhausted_ttl')}
                description={t('config_management.visual.sections.quotaExtended.exhausted_ttl_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.quotaExtended.exhausted_ttl_label')}
                  hint={t('config_management.visual.sections.quotaExtended.exhausted_ttl_hint')}
                >
                  <Input
                    placeholder="5m"
                    value={values.quota.cache.exhaustedTTL}
                    onChange={(e) => handleQuotaCacheChange({ exhaustedTTL: e.target.value })}
                    disabled={disabled}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldAnchor fieldId="quotaCacheRefreshInterval">
              <FieldGroup
                title={t('config_management.visual.sections.quotaExtended.refresh_interval')}
                description={t('config_management.visual.sections.quotaExtended.refresh_interval_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.quotaExtended.refresh_interval_label')}
                  hint={t('config_management.visual.sections.quotaExtended.refresh_interval_hint')}
                >
                  <Input
                    placeholder="1m"
                    value={values.quota.cache.refreshInterval}
                    onChange={(e) => handleQuotaCacheChange({ refreshInterval: e.target.value })}
                    disabled={disabled}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldAnchor fieldId="quotaCacheMaxConcurrentRefreshes">
              <FieldGroup
                title={t('config_management.visual.sections.quotaExtended.max_concurrent_refreshes')}
                description={t('config_management.visual.sections.quotaExtended.max_concurrent_refreshes_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.quotaExtended.max_concurrent_refreshes_label')}
                >
                  <Input
                    type="number"
                    value={values.quota.cache.maxConcurrentRefreshes}
                    onChange={(e) => handleQuotaCacheChange({ maxConcurrentRefreshes: parseInt(e.target.value) || 0 })}
                    disabled={disabled}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldAnchor fieldId="quotaCachePersistToSQLite">
              <FieldGroup
                title={t('config_management.visual.sections.quotaExtended.persist_to_sqlite')}
                description={t('config_management.visual.sections.quotaExtended.persist_to_sqlite_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.quotaExtended.persist_to_sqlite_label')}
                >
                  <ToggleRow
                    title={t('config_management.visual.sections.quotaExtended.persist_to_sqlite')}
                    description={t('config_management.visual.sections.quotaExtended.persist_to_sqlite_desc')}
                    checked={values.quota.cache.persistToSQLite}
                    disabled={disabled}
                    onChange={(persistToSQLite) => handleQuotaCacheChange({ persistToSQLite })}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>
          </FieldStack>
        </Collapsible>
      </FieldStack>
    </SectionCard>
  );
}