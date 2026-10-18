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

const Icon = CONFIG_TAB_ICONS.routingExtended;

/** 09 Routing Extended: Health Check, Circuit Breaker, Fallback, Chains, Priority Failover. */
export function SectionRoutingExtended({
  values,
  disabled,
  animateIn,
  onChange,
}: ConfigSectionProps) {
  const { t } = useTranslation();

  const handleHealthCheckChange = useCallback(
    (patch: Partial<typeof values.routingHealthCheck>) =>
      onChange({ routingHealthCheck: { ...values.routingHealthCheck, ...patch } }),
    [onChange, values.routingHealthCheck]
  );

  const handleCircuitBreakerChange = useCallback(
    (patch: Partial<typeof values.routingCircuitBreaker>) =>
      onChange({ routingCircuitBreaker: { ...values.routingCircuitBreaker, ...patch } }),
    [onChange, values.routingCircuitBreaker]
  );

  const handleFallbackChange = useCallback(
    (patch: Partial<typeof values.routingFallback>) =>
      onChange({ routingFallback: { ...values.routingFallback, ...patch } }),
    [onChange, values.routingFallback]
  );

  const handlePriorityFailoverChange = useCallback(
    (patch: Partial<typeof values.routingPriorityFailover>) =>
      onChange({ routingPriorityFailover: { ...values.routingPriorityFailover, ...patch } }),
    [onChange, values.routingPriorityFailover]
  );

  return (
    <SectionCard
      indexLabel={SECTION_INDEX_LABELS.routingExtended}
      icon={<Icon size={16} />}
      title={t('config_management.visual.sections.routingExtended.title')}
      description={t('config_management.visual.sections.routingExtended.description')}
      animateIn={animateIn}
    >
      <FieldStack>
        <Collapsible
          label={t('config_management.visual.sections.routingExtended.health_check_title')}
          defaultOpen={true}
        >
          <FieldStack>
            <FieldAnchor fieldId="routingHealthCheckEnabled">
              <FieldGroup
                title={t('config_management.visual.sections.routingExtended.health_check_enabled')}
                description={t('config_management.visual.sections.routingExtended.health_check_enabled_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.routingExtended.health_check_enabled_label')}
                >
                  <ToggleRow
                    title={t('config_management.visual.sections.routingExtended.health_check_enabled')}
                    description={t('config_management.visual.sections.routingExtended.health_check_enabled_desc')}
                    checked={values.routingHealthCheck.enabled}
                    disabled={disabled}
                    onChange={(enabled) => handleHealthCheckChange({ enabled })}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldGrid>
              <FieldAnchor fieldId="routingHealthCheckInterval">
                <FieldGroup
                  title={t('config_management.visual.sections.routingExtended.interval')}
                  description={t('config_management.visual.sections.routingExtended.interval_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.routingExtended.interval_label')}
                    hint={t('config_management.visual.sections.routingExtended.interval_hint')}
                  >
                    <Input
                      placeholder="30s"
                      value={values.routingHealthCheck.interval}
                      onChange={(e) => handleHealthCheckChange({ interval: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="routingHealthCheckTimeout">
                <FieldGroup
                  title={t('config_management.visual.sections.routingExtended.timeout')}
                  description={t('config_management.visual.sections.routingExtended.timeout_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.routingExtended.timeout_label')}
                    hint={t('config_management.visual.sections.routingExtended.timeout_hint')}
                  >
                    <Input
                      placeholder="5s"
                      value={values.routingHealthCheck.timeout}
                      onChange={(e) => handleHealthCheckChange({ timeout: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="routingHealthCheckFailureThreshold">
                <FieldGroup
                  title={t('config_management.visual.sections.routingExtended.failure_threshold')}
                  description={t('config_management.visual.sections.routingExtended.failure_threshold_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.routingExtended.failure_threshold_label')}
                  >
                    <Input
                      type="number"
                      value={values.routingHealthCheck.failureThreshold}
                      onChange={(e) => handleHealthCheckChange({ failureThreshold: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="routingHealthCheckSuccessThreshold">
                <FieldGroup
                  title={t('config_management.visual.sections.routingExtended.success_threshold')}
                  description={t('config_management.visual.sections.routingExtended.success_threshold_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.routingExtended.success_threshold_label')}
                  >
                    <Input
                      type="number"
                      value={values.routingHealthCheck.successThreshold}
                      onChange={(e) => handleHealthCheckChange({ successThreshold: parseInt(e.target.value) || 0 })}
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
          label={t('config_management.visual.sections.routingExtended.circuit_breaker_title')}
          defaultOpen={false}
        >
          <FieldStack>
            <FieldAnchor fieldId="routingCircuitBreakerEnabled">
              <FieldGroup
                title={t('config_management.visual.sections.routingExtended.circuit_breaker_enabled')}
                description={t('config_management.visual.sections.routingExtended.circuit_breaker_enabled_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.routingExtended.circuit_breaker_enabled_label')}
                >
                  <ToggleRow
                    title={t('config_management.visual.sections.routingExtended.circuit_breaker_enabled')}
                    description={t('config_management.visual.sections.routingExtended.circuit_breaker_enabled_desc')}
                    checked={values.routingCircuitBreaker.enabled}
                    disabled={disabled}
                    onChange={(enabled) => handleCircuitBreakerChange({ enabled })}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldGrid>
              <FieldAnchor fieldId="routingCircuitBreakerFailureThreshold">
                <FieldGroup
                  title={t('config_management.visual.sections.routingExtended.failure_threshold')}
                  description={t('config_management.visual.sections.routingExtended.failure_threshold_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.routingExtended.failure_threshold_label')}
                  >
                    <Input
                      type="number"
                      value={values.routingCircuitBreaker.failureThreshold}
                      onChange={(e) => handleCircuitBreakerChange({ failureThreshold: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="routingCircuitBreakerSuccessThreshold">
                <FieldGroup
                  title={t('config_management.visual.sections.routingExtended.success_threshold')}
                  description={t('config_management.visual.sections.routingExtended.success_threshold_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.routingExtended.success_threshold_label')}
                  >
                    <Input
                      type="number"
                      value={values.routingCircuitBreaker.successThreshold}
                      onChange={(e) => handleCircuitBreakerChange({ successThreshold: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="routingCircuitBreakerTimeout">
                <FieldGroup
                  title={t('config_management.visual.sections.routingExtended.timeout')}
                  description={t('config_management.visual.sections.routingExtended.timeout_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.routingExtended.timeout_label')}
                    hint={t('config_management.visual.sections.routingExtended.timeout_hint')}
                  >
                    <Input
                      placeholder="60s"
                      value={values.routingCircuitBreaker.timeout}
                      onChange={(e) => handleCircuitBreakerChange({ timeout: e.target.value })}
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
          label={t('config_management.visual.sections.routingExtended.fallback_title')}
          defaultOpen={false}
        >
          <FieldStack>
            <FieldAnchor fieldId="routingFallbackEnabled">
              <FieldGroup
                title={t('config_management.visual.sections.routingExtended.fallback_enabled')}
                description={t('config_management.visual.sections.routingExtended.fallback_enabled_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.routingExtended.fallback_enabled_label')}
                >
                  <ToggleRow
                    title={t('config_management.visual.sections.routingExtended.fallback_enabled')}
                    description={t('config_management.visual.sections.routingExtended.fallback_enabled_desc')}
                    checked={values.routingFallback.enabled}
                    disabled={disabled}
                    onChange={(enabled) => handleFallbackChange({ enabled })}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldAnchor fieldId="routingFallbackPersistToSQLite">
              <FieldGroup
                title={t('config_management.visual.sections.routingExtended.persist_to_sqlite')}
                description={t('config_management.visual.sections.routingExtended.persist_to_sqlite_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.routingExtended.persist_to_sqlite_label')}
                >
                  <ToggleRow
                    title={t('config_management.visual.sections.routingExtended.persist_to_sqlite')}
                    description={t('config_management.visual.sections.routingExtended.persist_to_sqlite_desc')}
                    checked={values.routingFallback.persistToSQLite}
                    disabled={disabled}
                    onChange={(persistToSQLite) => handleFallbackChange({ persistToSQLite })}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldGroupHeading title={t('config_management.visual.sections.routingExtended.default_chains')} />

            <FieldAnchor fieldId="routingFallbackDefaultChains">
              <FieldGroup
                title={t('config_management.visual.sections.routingExtended.default_chains')}
                description={t('config_management.visual.sections.routingExtended.default_chains_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.routingExtended.default_chains_label')}
                  hint={t('config_management.visual.sections.routingExtended.default_chains_hint')}
                >
                  <textarea
                    placeholder="JSON object mapping model to provider chains"
                    value={JSON.stringify(values.routingFallback.defaultChains, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        handleFallbackChange({ defaultChains: parsed });
                      } catch {
                        // ignore invalid JSON
                      }
                    }}
                    disabled={disabled}
                    rows={6}
                    style={{ fontFamily: 'monospace', width: '100%', fontSize: '12px' }}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>
          </FieldStack>
        </Collapsible>

        <Divider />

        <Collapsible
          label={t('config_management.visual.sections.routingExtended.chains_title')}
          defaultOpen={false}
        >
          <FieldStack>
            <FieldAnchor fieldId="routingChains">
              <FieldGroup
                title={t('config_management.visual.sections.routingExtended.chains')}
                description={t('config_management.visual.sections.routingExtended.chains_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.routingExtended.chains_label')}
                  hint={t('config_management.visual.sections.routingExtended.chains_hint')}
                >
                  <textarea
                    placeholder="JSON object mapping chain name to entries"
                    value={JSON.stringify(values.routingChains, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        onChange({ routingChains: parsed });
                      } catch {
                        // ignore invalid JSON
                      }
                    }}
                    disabled={disabled}
                    rows={6}
                    style={{ fontFamily: 'monospace', width: '100%', fontSize: '12px' }}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>
          </FieldStack>
        </Collapsible>

        <Divider />

        <Collapsible
          label={t('config_management.visual.sections.routingExtended.priority_failover_title')}
          defaultOpen={false}
        >
          <FieldStack>
            <FieldAnchor fieldId="routingPriorityFailoverEnabled">
              <FieldGroup
                title={t('config_management.visual.sections.routingExtended.priority_failover_enabled')}
                description={t('config_management.visual.sections.routingExtended.priority_failover_enabled_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.routingExtended.priority_failover_enabled_label')}
                >
                  <ToggleRow
                    title={t('config_management.visual.sections.routingExtended.priority_failover_enabled')}
                    description={t('config_management.visual.sections.routingExtended.priority_failover_enabled_desc')}
                    checked={values.routingPriorityFailover.enabled}
                    disabled={disabled}
                    onChange={(enabled) => handlePriorityFailoverChange({ enabled })}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldGrid>
              <FieldAnchor fieldId="routingPriorityFailoverDefaultChain">
                <FieldGroup
                  title={t('config_management.visual.sections.routingExtended.default_chain')}
                  description={t('config_management.visual.sections.routingExtended.default_chain_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.routingExtended.default_chain_label')}
                  >
                    <Input
                      placeholder=""
                      value={values.routingPriorityFailover.defaultChain}
                      onChange={(e) => handlePriorityFailoverChange({ defaultChain: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="routingPriorityFailoverHealthCheckInterval">
                <FieldGroup
                  title={t('config_management.visual.sections.routingExtended.health_check_interval')}
                  description={t('config_management.visual.sections.routingExtended.health_check_interval_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.routingExtended.health_check_interval_label')}
                  >
                    <Input
                      placeholder=""
                      value={values.routingPriorityFailover.healthCheckInterval}
                      onChange={(e) => handlePriorityFailoverChange({ healthCheckInterval: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>

            <FieldAnchor fieldId="routingPriorityFailoverEnableManagementAPI">
              <FieldGroup
                title={t('config_management.visual.sections.routingExtended.enable_management_api')}
                description={t('config_management.visual.sections.routingExtended.enable_management_api_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.routingExtended.enable_management_api_label')}
                >
                  <ToggleRow
                    title={t('config_management.visual.sections.routingExtended.enable_management_api')}
                    description={t('config_management.visual.sections.routingExtended.enable_management_api_desc')}
                    checked={values.routingPriorityFailover.enableManagementAPI}
                    disabled={disabled}
                    onChange={(enableManagementAPI) => handlePriorityFailoverChange({ enableManagementAPI })}
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