import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapsible } from '@/components/ui/Collapsible';
import { Input } from '@/components/ui/Input';
import type { ConfigSectionProps } from '../../types';
import type { PayloadRule, PayloadFilterRule } from '@/types/visualConfig';
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

const Icon = CONFIG_TAB_ICONS.protocolConfigs;

/** 11 Protocol Configs: Payload, Codex/Claude Headers, XAI Live Media Relay. */
export function SectionProtocolConfigs({
  values,
  disabled,
  animateIn,
  onChange,
}: ConfigSectionProps) {
  const { t } = useTranslation();

  const handlePayloadChange = useCallback(
    (patch: Partial<{
      payloadDefaultRules: PayloadRule[];
      payloadDefaultRawRules: PayloadRule[];
      payloadOverrideRules: PayloadRule[];
      payloadOverrideRawRules: PayloadRule[];
      payloadFilterRules: PayloadFilterRule[];
    }>) =>
      onChange(patch as Partial<typeof values>),
    [onChange]
  );

  const handleCodexHeaderChange = useCallback(
    (patch: Partial<typeof values.codexHeaderDefaults>) =>
      onChange({ codexHeaderDefaults: { ...values.codexHeaderDefaults, ...patch } }),
    [onChange, values.codexHeaderDefaults]
  );

  const handleClaudeHeaderChange = useCallback(
    (patch: Partial<typeof values.claudeHeaderDefaults>) =>
      onChange({ claudeHeaderDefaults: { ...values.claudeHeaderDefaults, ...patch } }),
    [onChange, values.claudeHeaderDefaults]
  );

  const handleXAIChange = useCallback(
    (patch: Partial<typeof values.xai.liveMediaRelay>) =>
      onChange({ xai: { ...values.xai, liveMediaRelay: { ...values.xai.liveMediaRelay, ...patch } } }),
    [onChange, values.xai]
  );

  return (
    <SectionCard
      indexLabel={SECTION_INDEX_LABELS.protocolConfigs}
      icon={<Icon size={16} />}
      title={t('config_management.visual.sections.protocolConfigs.title')}
      description={t('config_management.visual.sections.protocolConfigs.description')}
      animateIn={animateIn}
    >
      <FieldStack>
        <Collapsible
          label={t('config_management.visual.sections.protocolConfigs.payload_title')}
          defaultOpen={true}
        >
          <FieldStack>
            <FieldGroupHeading title={t('config_management.visual.sections.protocolConfigs.payload_default_rules')} />
            <FieldAnchor fieldId="payloadDefaultRules">
              <FieldGroup
                title={t('config_management.visual.sections.protocolConfigs.default_rules')}
                description={t('config_management.visual.sections.protocolConfigs.default_rules_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.protocolConfigs.default_rules_label')}
                  hint={t('config_management.visual.sections.protocolConfigs.default_rules_hint')}
                >
                  <textarea
                    placeholder="JSON array of default payload rules"
                    value={JSON.stringify(values.payloadDefaultRules, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        handlePayloadChange({ payloadDefaultRules: parsed });
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

            <FieldGroupHeading title={t('config_management.visual.sections.protocolConfigs.payload_default_raw_rules')} />
            <FieldAnchor fieldId="payloadDefaultRawRules">
              <FieldGroup
                title={t('config_management.visual.sections.protocolConfigs.default_raw_rules')}
                description={t('config_management.visual.sections.protocolConfigs.default_raw_rules_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.protocolConfigs.default_raw_rules_label')}
                  hint={t('config_management.visual.sections.protocolConfigs.default_raw_rules_hint')}
                >
                  <textarea
                    placeholder="JSON array of default raw payload rules"
                    value={JSON.stringify(values.payloadDefaultRawRules, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        handlePayloadChange({ payloadDefaultRawRules: parsed });
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

            <FieldGroupHeading title={t('config_management.visual.sections.protocolConfigs.payload_override_rules')} />
            <FieldAnchor fieldId="payloadOverrideRules">
              <FieldGroup
                title={t('config_management.visual.sections.protocolConfigs.override_rules')}
                description={t('config_management.visual.sections.protocolConfigs.override_rules_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.protocolConfigs.override_rules_label')}
                  hint={t('config_management.visual.sections.protocolConfigs.override_rules_hint')}
                >
                  <textarea
                    placeholder="JSON array of override payload rules"
                    value={JSON.stringify(values.payloadOverrideRules, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        handlePayloadChange({ payloadOverrideRules: parsed });
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

            <FieldGroupHeading title={t('config_management.visual.sections.protocolConfigs.payload_override_raw_rules')} />
            <FieldAnchor fieldId="payloadOverrideRawRules">
              <FieldGroup
                title={t('config_management.visual.sections.protocolConfigs.override_raw_rules')}
                description={t('config_management.visual.sections.protocolConfigs.override_raw_rules_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.protocolConfigs.override_raw_rules_label')}
                  hint={t('config_management.visual.sections.protocolConfigs.override_raw_rules_hint')}
                >
                  <textarea
                    placeholder="JSON array of override raw payload rules"
                    value={JSON.stringify(values.payloadOverrideRawRules, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        handlePayloadChange({ payloadOverrideRawRules: parsed });
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

            <FieldGroupHeading title={t('config_management.visual.sections.protocolConfigs.payload_filter_rules')} />
            <FieldAnchor fieldId="payloadFilterRules">
              <FieldGroup
                title={t('config_management.visual.sections.protocolConfigs.filter_rules')}
                description={t('config_management.visual.sections.protocolConfigs.filter_rules_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.protocolConfigs.filter_rules_label')}
                  hint={t('config_management.visual.sections.protocolConfigs.filter_rules_hint')}
                >
                  <textarea
                    placeholder="JSON array of payload filter rules"
                    value={JSON.stringify(values.payloadFilterRules, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        handlePayloadChange({ payloadFilterRules: parsed });
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
          label={t('config_management.visual.sections.protocolConfigs.codex_header_title')}
          defaultOpen={false}
        >
          <FieldStack>
            <FieldAnchor fieldId="codexHeaderUserAgent">
              <FieldGroup
                title={t('config_management.visual.sections.protocolConfigs.user_agent')}
                description={t('config_management.visual.sections.protocolConfigs.user_agent_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.protocolConfigs.user_agent_label')}
                >
                  <Input
                    placeholder="codex_cli_rs/0.114.0 (Mac OS 14.2.0; x86_64) vscode/1.111.0"
                    value={values.codexHeaderDefaults.userAgent}
                    onChange={(e) => handleCodexHeaderChange({ userAgent: e.target.value })}
                    disabled={disabled}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldAnchor fieldId="codexHeaderBetaFeatures">
              <FieldGroup
                title={t('config_management.visual.sections.protocolConfigs.beta_features')}
                description={t('config_management.visual.sections.protocolConfigs.beta_features_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.protocolConfigs.beta_features_label')}
                >
                  <Input
                    placeholder="multi_agent"
                    value={values.codexHeaderDefaults.betaFeatures}
                    onChange={(e) => handleCodexHeaderChange({ betaFeatures: e.target.value })}
                    disabled={disabled}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>
          </FieldStack>
        </Collapsible>

        <Divider />

        <Collapsible
          label={t('config_management.visual.sections.protocolConfigs.claude_header_title')}
          defaultOpen={false}
        >
          <FieldStack>
            <FieldGrid>
              <FieldAnchor fieldId="claudeHeaderUserAgent">
                <FieldGroup
                  title={t('config_management.visual.sections.protocolConfigs.user_agent')}
                  description={t('config_management.visual.sections.protocolConfigs.user_agent_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.protocolConfigs.user_agent_label')}
                  >
                    <Input
                      placeholder="claude-cli/2.1.44 (external, sdk-cli)"
                      value={values.claudeHeaderDefaults.userAgent}
                      onChange={(e) => handleClaudeHeaderChange({ userAgent: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="claudeHeaderPackageVersion">
                <FieldGroup
                  title={t('config_management.visual.sections.protocolConfigs.package_version')}
                  description={t('config_management.visual.sections.protocolConfigs.package_version_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.protocolConfigs.package_version_label')}
                  >
                    <Input
                      placeholder="0.74.0"
                      value={values.claudeHeaderDefaults.packageVersion}
                      onChange={(e) => handleClaudeHeaderChange({ packageVersion: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="claudeHeaderRuntimeVersion">
                <FieldGroup
                  title={t('config_management.visual.sections.protocolConfigs.runtime_version')}
                  description={t('config_management.visual.sections.protocolConfigs.runtime_version_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.protocolConfigs.runtime_version_label')}
                  >
                    <Input
                      placeholder="v24.3.0"
                      value={values.claudeHeaderDefaults.runtimeVersion}
                      onChange={(e) => handleClaudeHeaderChange({ runtimeVersion: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="claudeHeaderOs">
                <FieldGroup
                  title={t('config_management.visual.sections.protocolConfigs.os')}
                  description={t('config_management.visual.sections.protocolConfigs.os_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.protocolConfigs.os_label')}
                  >
                    <Input
                      placeholder="MacOS"
                      value={values.claudeHeaderDefaults.os}
                      onChange={(e) => handleClaudeHeaderChange({ os: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="claudeHeaderArch">
                <FieldGroup
                  title={t('config_management.visual.sections.protocolConfigs.arch')}
                  description={t('config_management.visual.sections.protocolConfigs.arch_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.protocolConfigs.arch_label')}
                  >
                    <Input
                      placeholder="arm64"
                      value={values.claudeHeaderDefaults.arch}
                      onChange={(e) => handleClaudeHeaderChange({ arch: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="claudeHeaderTimeout">
                <FieldGroup
                  title={t('config_management.visual.sections.protocolConfigs.timeout')}
                  description={t('config_management.visual.sections.protocolConfigs.timeout_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.protocolConfigs.timeout_label')}
                  >
                    <Input
                      placeholder="600"
                      value={values.claudeHeaderDefaults.timeout}
                      onChange={(e) => handleClaudeHeaderChange({ timeout: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>

            <FieldGrid>
              <FieldAnchor fieldId="claudeHeaderStabilizeDeviceProfile">
                <FieldGroup
                  title={t('config_management.visual.sections.protocolConfigs.stabilize_device')}
                  description={t('config_management.visual.sections.protocolConfigs.stabilize_device_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.protocolConfigs.stabilize_device_label')}
                  >
                    <ToggleRow
                      title={t('config_management.visual.sections.protocolConfigs.stabilize_device')}
                      description={t('config_management.visual.sections.protocolConfigs.stabilize_device_desc')}
                      checked={values.claudeHeaderDefaults.stabilizeDeviceProfile ?? false}
                      disabled={disabled}
                      onChange={(stabilizeDeviceProfile) => handleClaudeHeaderChange({ stabilizeDeviceProfile })}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>
          </FieldStack>
        </Collapsible>

        <Divider />

        <Collapsible
          label={t('config_management.visual.sections.protocolConfigs.xai_title')}
          defaultOpen={false}
        >
          <FieldStack>
            <FieldAnchor fieldId="xaiLiveMediaRelayEnabled">
              <FieldGroup
                title={t('config_management.visual.sections.protocolConfigs.live_media_relay_enabled')}
                description={t('config_management.visual.sections.protocolConfigs.live_media_relay_enabled_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.protocolConfigs.live_media_relay_enabled_label')}
                >
                  <ToggleRow
                    title={t('config_management.visual.sections.protocolConfigs.live_media_relay_enabled')}
                    description={t('config_management.visual.sections.protocolConfigs.live_media_relay_enabled_desc')}
                    checked={values.xai.liveMediaRelay.enabled}
                    disabled={disabled}
                    onChange={(enabled) => handleXAIChange({ enabled })}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldGrid>
              <FieldAnchor fieldId="xaiLiveMediaRelayMaxSessions">
                <FieldGroup
                  title={t('config_management.visual.sections.protocolConfigs.max_sessions')}
                  description={t('config_management.visual.sections.protocolConfigs.max_sessions_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.protocolConfigs.max_sessions_label')}
                  >
                    <Input
                      type="number"
                      value={values.xai.liveMediaRelay.maxSessions}
                      onChange={(e) => handleXAIChange({ maxSessions: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="xaiLiveMediaRelayDisablePrivateRemoteIPs">
                <FieldGroup
                  title={t('config_management.visual.sections.protocolConfigs.disable_private_remote_ips')}
                  description={t('config_management.visual.sections.protocolConfigs.disable_private_remote_ips_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.protocolConfigs.disable_private_remote_ips_label')}
                  >
                    <ToggleRow
                      title={t('config_management.visual.sections.protocolConfigs.disable_private_remote_ips')}
                      description={t('config_management.visual.sections.protocolConfigs.disable_private_remote_ips_desc')}
                      checked={values.xai.liveMediaRelay.disablePrivateRemoteIPs}
                      disabled={disabled}
                      onChange={(disablePrivateRemoteIPs) => handleXAIChange({ disablePrivateRemoteIPs })}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="xaiLiveMediaRelayPublicIP">
                <FieldGroup
                  title={t('config_management.visual.sections.protocolConfigs.public_ip')}
                  description={t('config_management.visual.sections.protocolConfigs.public_ip_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.protocolConfigs.public_ip_label')}
                  >
                    <Input
                      placeholder="1.2.3.4"
                      value={values.xai.liveMediaRelay.publicIP}
                      onChange={(e) => handleXAIChange({ publicIP: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="xaiLiveMediaRelayUDPPortMin">
                <FieldGroup
                  title={t('config_management.visual.sections.protocolConfigs.udp_port_min')}
                  description={t('config_management.visual.sections.protocolConfigs.udp_port_min_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.protocolConfigs.udp_port_min_label')}
                  >
                    <Input
                      type="number"
                      value={values.xai.liveMediaRelay.udpPortMin}
                      onChange={(e) => handleXAIChange({ udpPortMin: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="xaiLiveMediaRelayUDPPortMax">
                <FieldGroup
                  title={t('config_management.visual.sections.protocolConfigs.udp_port_max')}
                  description={t('config_management.visual.sections.protocolConfigs.udp_port_max_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.protocolConfigs.udp_port_max_label')}
                  >
                    <Input
                      type="number"
                      value={values.xai.liveMediaRelay.udpPortMax}
                      onChange={(e) => handleXAIChange({ udpPortMax: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>

            <FieldAnchor fieldId="xaiLiveMediaRelayICEServers">
              <FieldGroup
                title={t('config_management.visual.sections.protocolConfigs.ice_servers')}
                description={t('config_management.visual.sections.protocolConfigs.ice_servers_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.protocolConfigs.ice_servers_label')}
                  hint={t('config_management.visual.sections.protocolConfigs.ice_servers_hint')}
                >
                  <textarea
                    placeholder="JSON array of ICE servers"
                    value={JSON.stringify(values.xai.liveMediaRelay.iceServers, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        handleXAIChange({ iceServers: parsed });
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
      </FieldStack>
    </SectionCard>
  );
}