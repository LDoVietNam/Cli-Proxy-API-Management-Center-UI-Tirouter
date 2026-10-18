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

const Icon = CONFIG_TAB_ICONS.advancedConfigs;

/** 13 Advanced Configs: Credential Concurrency, Credential In-Flight, AI Agent, Simple Fields. */
export function SectionAdvancedConfigs({
  values,
  disabled,
  animateIn,
  onChange,
}: ConfigSectionProps) {
  const { t } = useTranslation();

  const handleCredentialConcurrencyChange = useCallback(
    (patch: Partial<typeof values.credentialConcurrency>) =>
      onChange({ credentialConcurrency: { ...values.credentialConcurrency, ...patch } }),
    [onChange, values.credentialConcurrency]
  );

  const handleCredentialInFlightChange = useCallback(
    (patch: Partial<typeof values.credentialInFlight>) =>
      onChange({ credentialInFlight: { ...values.credentialInFlight, ...patch } }),
    [onChange, values.credentialInFlight]
  );

  const handleAIAgentChange = useCallback(
    (patch: Partial<typeof values.aiAgent>) =>
      onChange({ aiAgent: { ...values.aiAgent, ...patch } }),
    [onChange, values.aiAgent]
  );

  return (
    <SectionCard
      indexLabel={SECTION_INDEX_LABELS.advancedConfigs}
      icon={<Icon size={16} />}
      title={t('config_management.visual.sections.advancedConfigs.title')}
      description={t('config_management.visual.sections.advancedConfigs.description')}
      animateIn={animateIn}
    >
      <FieldStack>
        <Collapsible
          label={t('config_management.visual.sections.advancedConfigs.credential_concurrency_title')}
          defaultOpen={true}
        >
          <FieldStack>
            <FieldGroupHeading title={t('config_management.visual.sections.advancedConfigs.lifecycle_revisions')} />

            <FieldGrid>
              <FieldAnchor fieldId="credentialConcurrencyLifecycleConfigRevision">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.lifecycle_config_revision')}
                  description={t('config_management.visual.sections.advancedConfigs.lifecycle_config_revision_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.lifecycle_config_revision_label')}
                  >
                    <Input
                      type="number"
                      value={values.credentialConcurrency.lifecycleConfigRevision}
                      onChange={(e) => handleCredentialConcurrencyChange({ lifecycleConfigRevision: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="credentialConcurrencyObservationBarrierRevision">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.observation_barrier_revision')}
                  description={t('config_management.visual.sections.advancedConfigs.observation_barrier_revision_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.observation_barrier_revision_label')}
                  >
                    <Input
                      type="number"
                      value={values.credentialConcurrency.observationBarrierRevision}
                      onChange={(e) => handleCredentialConcurrencyChange({ observationBarrierRevision: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>

            <FieldGroupHeading title={t('config_management.visual.sections.advancedConfigs.cpa_timing')} />

            <FieldGrid>
              <FieldAnchor fieldId="credentialConcurrencyCPAHeartbeatTimeout">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.cpa_heartbeat_timeout')}
                  description={t('config_management.visual.sections.advancedConfigs.cpa_heartbeat_timeout_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.cpa_heartbeat_timeout_label')}
                  >
                    <Input
                      placeholder="3s"
                      value={values.credentialConcurrency.cpaHeartbeatTimeout}
                      onChange={(e) => handleCredentialConcurrencyChange({ cpaHeartbeatTimeout: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="credentialConcurrencyCPACancelBound">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.cpa_cancel_bound')}
                  description={t('config_management.visual.sections.advancedConfigs.cpa_cancel_bound_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.cpa_cancel_bound_label')}
                  >
                    <Input
                      placeholder="5s"
                      value={values.credentialConcurrency.cpaCancelBound}
                      onChange={(e) => handleCredentialConcurrencyChange({ cpaCancelBound: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="credentialConcurrencyReclaimGrace">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.reclaim_grace')}
                  description={t('config_management.visual.sections.advancedConfigs.reclaim_grace_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.reclaim_grace_label')}
                  >
                    <Input
                      placeholder="5s"
                      value={values.credentialConcurrency.reclaimGrace}
                      onChange={(e) => handleCredentialConcurrencyChange({ reclaimGrace: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="credentialConcurrencyCleanupInterval">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.cleanup_interval')}
                  description={t('config_management.visual.sections.advancedConfigs.cleanup_interval_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.cleanup_interval_label')}
                  >
                    <Input
                      placeholder="5s"
                      value={values.credentialConcurrency.cleanupInterval}
                      onChange={(e) => handleCredentialConcurrencyChange({ cleanupInterval: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>

            <FieldGroupHeading title={t('config_management.visual.sections.advancedConfigs.release_timing')} />

            <FieldGrid>
              <FieldAnchor fieldId="credentialConcurrencyReleaseFlushInterval">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.release_flush_interval')}
                  description={t('config_management.visual.sections.advancedConfigs.release_flush_interval_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.release_flush_interval_label')}
                  >
                    <Input
                      placeholder="250ms"
                      value={values.credentialConcurrency.releaseFlushInterval}
                      onChange={(e) => handleCredentialConcurrencyChange({ releaseFlushInterval: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="credentialConcurrencyReleaseMaxBackoff">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.release_max_backoff')}
                  description={t('config_management.visual.sections.advancedConfigs.release_max_backoff_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.release_max_backoff_label')}
                  >
                    <Input
                      placeholder="2s"
                      value={values.credentialConcurrency.releaseMaxBackoff}
                      onChange={(e) => handleCredentialConcurrencyChange({ releaseMaxBackoff: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="credentialConcurrencyBusyRetryMin">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.busy_retry_min')}
                  description={t('config_management.visual.sections.advancedConfigs.busy_retry_min_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.busy_retry_min_label')}
                  >
                    <Input
                      placeholder="250ms"
                      value={values.credentialConcurrency.busyRetryMin}
                      onChange={(e) => handleCredentialConcurrencyChange({ busyRetryMin: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="credentialConcurrencyBusyRetryMax">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.busy_retry_max')}
                  description={t('config_management.visual.sections.advancedConfigs.busy_retry_max_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.busy_retry_max_label')}
                  >
                    <Input
                      placeholder="1s"
                      value={values.credentialConcurrency.busyRetryMax}
                      onChange={(e) => handleCredentialConcurrencyChange({ busyRetryMax: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>

            <FieldAnchor fieldId="credentialConcurrencyMaxLimit">
              <FieldGroup
                title={t('config_management.visual.sections.advancedConfigs.max_limit')}
                description={t('config_management.visual.sections.advancedConfigs.max_limit_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.advancedConfigs.max_limit_label')}
                >
                  <Input
                    type="number"
                    value={values.credentialConcurrency.maxLimit}
                    onChange={(e) => handleCredentialConcurrencyChange({ maxLimit: parseInt(e.target.value) || 0 })}
                    disabled={disabled}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>
          </FieldStack>
        </Collapsible>

        <Divider />

        <Collapsible
          label={t('config_management.visual.sections.advancedConfigs.credential_in_flight_title')}
          defaultOpen={false}
        >
          <FieldStack>
            <FieldGrid>
              <FieldAnchor fieldId="credentialInFlightSnapshotInterval">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.snapshot_interval')}
                  description={t('config_management.visual.sections.advancedConfigs.snapshot_interval_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.snapshot_interval_label')}
                  >
                    <Input
                      placeholder="2s"
                      value={values.credentialInFlight.snapshotInterval}
                      onChange={(e) => handleCredentialInFlightChange({ snapshotInterval: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="credentialInFlightStaleAfter">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.stale_after')}
                  description={t('config_management.visual.sections.advancedConfigs.stale_after_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.stale_after_label')}
                  >
                    <Input
                      placeholder="10s"
                      value={values.credentialInFlight.staleAfter}
                      onChange={(e) => handleCredentialInFlightChange({ staleAfter: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="credentialInFlightMaxPartBytes">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.max_part_bytes')}
                  description={t('config_management.visual.sections.advancedConfigs.max_part_bytes_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.max_part_bytes_label')}
                  >
                    <Input
                      type="number"
                      value={values.credentialInFlight.maxPartBytes}
                      onChange={(e) => handleCredentialInFlightChange({ maxPartBytes: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="credentialInFlightMaxPartCount">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.max_part_count')}
                  description={t('config_management.visual.sections.advancedConfigs.max_part_count_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.max_part_count_label')}
                  >
                    <Input
                      type="number"
                      value={values.credentialInFlight.maxPartCount}
                      onChange={(e) => handleCredentialInFlightChange({ maxPartCount: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>

            <FieldGrid>
              <FieldAnchor fieldId="credentialInFlightMaxRevisionBytes">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.max_revision_bytes')}
                  description={t('config_management.visual.sections.advancedConfigs.max_revision_bytes_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.max_revision_bytes_label')}
                  >
                    <Input
                      type="number"
                      value={values.credentialInFlight.maxRevisionBytes}
                      onChange={(e) => handleCredentialInFlightChange({ maxRevisionBytes: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="credentialInFlightMaxAggregateGroups">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.max_aggregate_groups')}
                  description={t('config_management.visual.sections.advancedConfigs.max_aggregate_groups_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.max_aggregate_groups_label')}
                  >
                    <Input
                      type="number"
                      value={values.credentialInFlight.maxAggregateGroups}
                      onChange={(e) => handleCredentialInFlightChange({ maxAggregateGroups: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="credentialInFlightMaxDetails">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.max_details')}
                  description={t('config_management.visual.sections.advancedConfigs.max_details_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.max_details_label')}
                  >
                    <Input
                      type="number"
                      value={values.credentialInFlight.maxDetails}
                      onChange={(e) => handleCredentialInFlightChange({ maxDetails: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="credentialInFlightMaxStringBytes">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.max_string_bytes')}
                  description={t('config_management.visual.sections.advancedConfigs.max_string_bytes_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.max_string_bytes_label')}
                  >
                    <Input
                      type="number"
                      value={values.credentialInFlight.maxStringBytes}
                      onChange={(e) => handleCredentialInFlightChange({ maxStringBytes: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>

            <FieldAnchor fieldId="credentialInFlightStagingRetention">
              <FieldGroup
                title={t('config_management.visual.sections.advancedConfigs.staging_retention')}
                description={t('config_management.visual.sections.advancedConfigs.staging_retention_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.advancedConfigs.staging_retention_label')}
                >
                  <Input
                    placeholder="1m"
                    value={values.credentialInFlight.stagingRetention}
                    onChange={(e) => handleCredentialInFlightChange({ stagingRetention: e.target.value })}
                    disabled={disabled}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>
          </FieldStack>
        </Collapsible>

        <Divider />

        <Collapsible
          label={t('config_management.visual.sections.advancedConfigs.ai_agent_title')}
          defaultOpen={false}
        >
          <FieldStack>
            <FieldAnchor fieldId="aiAgentEnabled">
              <FieldGroup
                title={t('config_management.visual.sections.advancedConfigs.ai_agent_enabled')}
                description={t('config_management.visual.sections.advancedConfigs.ai_agent_enabled_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.advancedConfigs.ai_agent_enabled_label')}
                >
                  <ToggleRow
                    title={t('config_management.visual.sections.advancedConfigs.ai_agent_enabled')}
                    description={t('config_management.visual.sections.advancedConfigs.ai_agent_enabled_desc')}
                    checked={values.aiAgent.enabled}
                    disabled={disabled}
                    onChange={(enabled) => handleAIAgentChange({ enabled })}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldGrid>
              <FieldAnchor fieldId="aiAgentMode">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.mode')}
                  description={t('config_management.visual.sections.advancedConfigs.mode_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.mode_label')}
                  >
                    <Input
                      placeholder="integrated"
                      value={values.aiAgent.mode}
                      onChange={(e) => handleAIAgentChange({ mode: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="aiAgentRoutingBackend">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.routing_backend')}
                  description={t('config_management.visual.sections.advancedConfigs.routing_backend_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.routing_backend_label')}
                  >
                    <Input
                      placeholder="tiagent"
                      value={values.aiAgent.routingBackend}
                      onChange={(e) => handleAIAgentChange({ routingBackend: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="aiAgentTiAgentURL">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.tiagent_url')}
                  description={t('config_management.visual.sections.advancedConfigs.tiagent_url_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.tiagent_url_label')}
                  >
                    <Input
                      placeholder="http://localhost:3005"
                      value={values.aiAgent.tiAgentURL}
                      onChange={(e) => handleAIAgentChange({ tiAgentURL: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="aiAgentTiAgentTimeout">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.tiagent_timeout')}
                  description={t('config_management.visual.sections.advancedConfigs.tiagent_timeout_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.tiagent_timeout_label')}
                  >
                    <Input
                      type="number"
                      value={values.aiAgent.tiAgentTimeout}
                      onChange={(e) => handleAIAgentChange({ tiAgentTimeout: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>

            <FieldGrid>
              <FieldAnchor fieldId="aiAgentFallbackToStatic">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.fallback_to_static')}
                  description={t('config_management.visual.sections.advancedConfigs.fallback_to_static_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.fallback_to_static_label')}
                  >
                    <ToggleRow
                      title={t('config_management.visual.sections.advancedConfigs.fallback_to_static')}
                      description={t('config_management.visual.sections.advancedConfigs.fallback_to_static_desc')}
                      checked={values.aiAgent.fallbackToStatic}
                      disabled={disabled}
                      onChange={(fallbackToStatic) => handleAIAgentChange({ fallbackToStatic })}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="aiAgentCacheTTLSeconds">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.cache_ttl_seconds')}
                  description={t('config_management.visual.sections.advancedConfigs.cache_ttl_seconds_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.cache_ttl_seconds_label')}
                  >
                    <Input
                      type="number"
                      value={values.aiAgent.cacheTTLSeconds}
                      onChange={(e) => handleAIAgentChange({ cacheTTLSeconds: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="aiAgentDefaultProvider">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.default_provider')}
                  description={t('config_management.visual.sections.advancedConfigs.default_provider_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.default_provider_label')}
                  >
                    <Input
                      placeholder="openrouter"
                      value={values.aiAgent.defaultProvider}
                      onChange={(e) => handleAIAgentChange({ defaultProvider: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>

            <FieldGroupHeading title={t('config_management.visual.sections.advancedConfigs.routing_weights')} />

            <FieldGrid>
              <FieldAnchor fieldId="aiAgentCostWeight">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.cost_weight')}
                  description={t('config_management.visual.sections.advancedConfigs.cost_weight_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.cost_weight_label')}
                  >
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={values.aiAgent.costWeight}
                      onChange={(e) => handleAIAgentChange({ costWeight: parseFloat(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="aiAgentLatencyWeight">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.latency_weight')}
                  description={t('config_management.visual.sections.advancedConfigs.latency_weight_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.latency_weight_label')}
                  >
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={values.aiAgent.latencyWeight}
                      onChange={(e) => handleAIAgentChange({ latencyWeight: parseFloat(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="aiAgentQualityWeight">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.quality_weight')}
                  description={t('config_management.visual.sections.advancedConfigs.quality_weight_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.quality_weight_label')}
                  >
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={values.aiAgent.qualityWeight}
                      onChange={(e) => handleAIAgentChange({ qualityWeight: parseFloat(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>
          </FieldStack>
        </Collapsible>

        <Divider />

        <Collapsible
          label={t('config_management.visual.sections.advancedConfigs.simple_fields_title')}
          defaultOpen={false}
        >
          <FieldStack>
            <FieldGroupHeading title={t('config_management.visual.sections.advancedConfigs.cooldown_settings')} />

            <FieldGrid>
              <FieldAnchor fieldId="transientErrorCooldownSeconds">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.transient_error_cooldown_seconds')}
                  description={t('config_management.visual.sections.advancedConfigs.transient_error_cooldown_seconds_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.transient_error_cooldown_seconds_label')}
                  >
                    <Input
                      type="number"
                      value={values.transientErrorCooldownSeconds}
                      onChange={(e) => onChange({ transientErrorCooldownSeconds: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="authAutoRefreshWorkers">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.auth_auto_refresh_workers')}
                  description={t('config_management.visual.sections.advancedConfigs.auth_auto_refresh_workers_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.auth_auto_refresh_workers_label')}
                  >
                    <Input
                      type="number"
                      value={String(values.authAutoRefreshWorkers)}
                      onChange={(e) => onChange({ authAutoRefreshWorkers: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>

            <FieldGroupHeading title={t('config_management.visual.sections.advancedConfigs.token_rotation')} />

            <FieldGrid>
              <FieldAnchor fieldId="tokenRotationEnabled">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.token_rotation_enabled')}
                  description={t('config_management.visual.sections.advancedConfigs.token_rotation_enabled_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.token_rotation_enabled_label')}
                  >
                    <ToggleRow
                      title={t('config_management.visual.sections.advancedConfigs.token_rotation_enabled')}
                      description={t('config_management.visual.sections.advancedConfigs.token_rotation_enabled_desc')}
                      checked={values.tokenRotationEnabled}
                      disabled={disabled}
                      onChange={(tokenRotationEnabled) => onChange({ tokenRotationEnabled })}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="tokenRotationRefreshBufferSeconds">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.token_rotation_refresh_buffer_seconds')}
                  description={t('config_management.visual.sections.advancedConfigs.token_rotation_refresh_buffer_seconds_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.token_rotation_refresh_buffer_seconds_label')}
                  >
                    <Input
                      type="number"
                      value={values.tokenRotationRefreshBufferSeconds}
                      onChange={(e) => onChange({ tokenRotationRefreshBufferSeconds: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>

            <FieldGroupHeading title={t('config_management.visual.sections.advancedConfigs.misc')} />

            <FieldGrid>
              <FieldAnchor fieldId="commercialMode">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.commercial_mode')}
                  description={t('config_management.visual.sections.advancedConfigs.commercial_mode_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.commercial_mode_label')}
                  >
                    <ToggleRow
                      title={t('config_management.visual.sections.advancedConfigs.commercial_mode')}
                      description={t('config_management.visual.sections.advancedConfigs.commercial_mode_desc')}
                      checked={values.commercialMode}
                      disabled={disabled}
                      onChange={(commercialMode) => onChange({ commercialMode })}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="antigravitySignatureCacheEnabled">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.antigravity_signature_cache_enabled')}
                  description={t('config_management.visual.sections.advancedConfigs.antigravity_signature_cache_enabled_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.antigravity_signature_cache_enabled_label')}
                  >
                    <ToggleRow
                      title={t('config_management.visual.sections.advancedConfigs.antigravity_signature_cache_enabled')}
                      description={t('config_management.visual.sections.advancedConfigs.antigravity_signature_cache_enabled_desc')}
                      checked={values.antigravitySignatureCacheEnabled ?? false}
                      disabled={disabled}
                      onChange={(value) => onChange({ antigravitySignatureCacheEnabled: value })}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="antigravitySignatureBypassStrict">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.antigravity_signature_bypass_strict')}
                  description={t('config_management.visual.sections.advancedConfigs.antigravity_signature_bypass_strict_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.antigravity_signature_bypass_strict_label')}
                  >
                    <ToggleRow
                      title={t('config_management.visual.sections.advancedConfigs.antigravity_signature_bypass_strict')}
                      description={t('config_management.visual.sections.advancedConfigs.antigravity_signature_bypass_strict_desc')}
                      checked={values.antigravitySignatureBypassStrict ?? false}
                      disabled={disabled}
                      onChange={(value) => onChange({ antigravitySignatureBypassStrict: value })}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="disableClaudeCloakMode">
                <FieldGroup
                  title={t('config_management.visual.sections.advancedConfigs.disable_claude_cloak_mode')}
                  description={t('config_management.visual.sections.advancedConfigs.disable_claude_cloak_mode_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.advancedConfigs.disable_claude_cloak_mode_label')}
                  >
                    <ToggleRow
                      title={t('config_management.visual.sections.advancedConfigs.disable_claude_cloak_mode')}
                      description={t('config_management.visual.sections.advancedConfigs.disable_claude_cloak_mode_desc')}
                      checked={values.disableClaudeCloakMode}
                      disabled={disabled}
                      onChange={(disableClaudeCloakMode) => onChange({ disableClaudeCloakMode })}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>
          </FieldStack>
        </Collapsible>
      </FieldStack>
    </SectionCard>
  );
}