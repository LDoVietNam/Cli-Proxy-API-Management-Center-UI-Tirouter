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
import { StringListEditor } from '../blocks/StringListEditor';

const Icon = CONFIG_TAB_ICONS.llmFeatures;

/** 08 LLM Features: Intelligent Routing, LLM Routing, Diagnostics, Fix Suggester, Health Query, LLM Client. */
export function SectionLLMFeatures({
  values,
  disabled,
  animateIn,
  onChange,
}: ConfigSectionProps) {
  const { t } = useTranslation();

  const handleIntelligentRoutingChange = useCallback(
    (patch: Partial<typeof values.intelligentRouting>) =>
      onChange({ intelligentRouting: { ...values.intelligentRouting, ...patch } }),
    [onChange, values.intelligentRouting]
  );

  const handleLLMRoutingChange = useCallback(
    (patch: Partial<typeof values.llmRouting>) =>
      onChange({ llmRouting: { ...values.llmRouting, ...patch } }),
    [onChange, values.llmRouting]
  );

  const handleLLMDiagnosticsChange = useCallback(
    (patch: Partial<typeof values.llmDiagnostics>) =>
      onChange({ llmDiagnostics: { ...values.llmDiagnostics, ...patch } }),
    [onChange, values.llmDiagnostics]
  );

  const handleLLMFixSuggesterChange = useCallback(
    (patch: Partial<typeof values.llmFixSuggester>) =>
      onChange({ llmFixSuggester: { ...values.llmFixSuggester, ...patch } }),
    [onChange, values.llmFixSuggester]
  );

  const handleLLMHealthQueryChange = useCallback(
    (patch: Partial<typeof values.llmHealthQuery>) =>
      onChange({ llmHealthQuery: { ...values.llmHealthQuery, ...patch } }),
    [onChange, values.llmHealthQuery]
  );

  const handleLLMClientChange = useCallback(
    (patch: Partial<typeof values.llmClient>) =>
      onChange({ llmClient: { ...values.llmClient, ...patch } }),
    [onChange, values.llmClient]
  );

  return (
    <SectionCard
      indexLabel={SECTION_INDEX_LABELS.llmFeatures}
      icon={<Icon size={16} />}
      title={t('config_management.visual.sections.llmFeatures.title')}
      description={t('config_management.visual.sections.llmFeatures.description')}
      animateIn={animateIn}
    >
      <FieldStack>
        <Collapsible
          label={t('config_management.visual.sections.llmFeatures.intelligent_routing_title')}
          defaultOpen={true}
        >
          <FieldStack>
            <FieldAnchor fieldId="intelligentRoutingEnabled">
              <FieldGroup
                title={t('config_management.visual.sections.llmFeatures.intelligent_routing_enabled')}
                description={t('config_management.visual.sections.llmFeatures.intelligent_routing_enabled_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.llmFeatures.intelligent_routing_enabled_label')}
                >
                  <ToggleRow
                    title={t('config_management.visual.sections.llmFeatures.intelligent_routing_enabled')}
                    description={t('config_management.visual.sections.llmFeatures.intelligent_routing_enabled_desc')}
                    checked={values.intelligentRouting.enabled}
                    disabled={disabled}
                    onChange={(enabled) => handleIntelligentRoutingChange({ enabled })}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldAnchor fieldId="intelligentRoutingMode">
              <FieldGroup
                title={t('config_management.visual.sections.llmFeatures.mode')}
                description={t('config_management.visual.sections.llmFeatures.mode_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.llmFeatures.mode_label')}
                  hint={t('config_management.visual.sections.llmFeatures.mode_hint')}
                >
                  <Input
                    placeholder="local"
                    value={values.intelligentRouting.mode}
                    onChange={(e) => handleIntelligentRoutingChange({ mode: e.target.value })}
                    disabled={disabled}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldAnchor fieldId="intelligentRoutingTriggerModels">
              <FieldGroup
                title={t('config_management.visual.sections.llmFeatures.trigger_models')}
                description={t('config_management.visual.sections.llmFeatures.trigger_models_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.llmFeatures.trigger_models_label')}
                  hint={t('config_management.visual.sections.llmFeatures.trigger_models_hint')}
                >
                  <StringListEditor
                    value={values.intelligentRouting.triggerModels}
                    disabled={disabled}
                    placeholder={t('config_management.visual.sections.llmFeatures.trigger_models_placeholder')}
                    inputAriaLabel={t('config_management.visual.sections.llmFeatures.trigger_models_label')}
                    onChange={(triggerModels) => handleIntelligentRoutingChange({ triggerModels })}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldAnchor fieldId="intelligentRoutingPreferredProviders">
              <FieldGroup
                title={t('config_management.visual.sections.llmFeatures.preferred_providers')}
                description={t('config_management.visual.sections.llmFeatures.preferred_providers_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.llmFeatures.preferred_providers_label')}
                  hint={t('config_management.visual.sections.llmFeatures.preferred_providers_hint')}
                >
                  <StringListEditor
                    value={values.intelligentRouting.preferredProviders}
                    disabled={disabled}
                    placeholder={t('config_management.visual.sections.llmFeatures.preferred_providers_placeholder')}
                    inputAriaLabel={t('config_management.visual.sections.llmFeatures.preferred_providers_label')}
                    onChange={(preferredProviders) => handleIntelligentRoutingChange({ preferredProviders })}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldGrid>
              <FieldAnchor fieldId="intelligentRoutingDefaultBudget">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.default_budget')}
                  description={t('config_management.visual.sections.llmFeatures.default_budget_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.default_budget_label')}
                    hint={t('config_management.visual.sections.llmFeatures.default_budget_hint')}
                  >
                    <Input
                      placeholder="balanced"
                      value={values.intelligentRouting.defaultBudget}
                      onChange={(e) => handleIntelligentRoutingChange({ defaultBudget: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="intelligentRoutingConfidenceThreshold">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.confidence_threshold')}
                  description={t('config_management.visual.sections.llmFeatures.confidence_threshold_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.confidence_threshold_label')}
                    hint={t('config_management.visual.sections.llmFeatures.confidence_threshold_hint')}
                  >
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={values.intelligentRouting.confidenceThreshold}
                      onChange={(e) => handleIntelligentRoutingChange({ confidenceThreshold: parseFloat(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="intelligentRoutingDecisionCacheTTL">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.decision_cache_ttl')}
                  description={t('config_management.visual.sections.llmFeatures.decision_cache_ttl_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.decision_cache_ttl_label')}
                    hint={t('config_management.visual.sections.llmFeatures.decision_cache_ttl_hint')}
                  >
                    <Input
                      placeholder="10m"
                      value={values.intelligentRouting.decisionCacheTTL}
                      onChange={(e) => handleIntelligentRoutingChange({ decisionCacheTTL: e.target.value })}
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
          label={t('config_management.visual.sections.llmFeatures.llm_routing_title')}
          defaultOpen={false}
        >
          <FieldStack>
            <FieldAnchor fieldId="llmRoutingEnabled">
              <FieldGroup
                title={t('config_management.visual.sections.llmFeatures.llm_routing_enabled')}
                description={t('config_management.visual.sections.llmFeatures.llm_routing_enabled_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.llmFeatures.llm_routing_enabled_label')}
                >
                  <ToggleRow
                    title={t('config_management.visual.sections.llmFeatures.llm_routing_enabled')}
                    description={t('config_management.visual.sections.llmFeatures.llm_routing_enabled_desc')}
                    checked={values.llmRouting.enabled}
                    disabled={disabled}
                    onChange={(enabled) => handleLLMRoutingChange({ enabled })}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldGrid>
              <FieldAnchor fieldId="llmRoutingLLMProvider">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.llm_provider')}
                  description={t('config_management.visual.sections.llmFeatures.llm_provider_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.llm_provider_label')}
                    hint={t('config_management.visual.sections.llmFeatures.llm_provider_hint')}
                  >
                    <Input
                      placeholder="openrouter"
                      value={values.llmRouting.llmProvider}
                      onChange={(e) => handleLLMRoutingChange({ llmProvider: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="llmRoutingLLMModel">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.llm_model')}
                  description={t('config_management.visual.sections.llmFeatures.llm_model_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.llm_model_label')}
                    hint={t('config_management.visual.sections.llmFeatures.llm_model_hint')}
                  >
                    <Input
                      placeholder="google/gemini-2.5-flash"
                      value={values.llmRouting.llmModel}
                      onChange={(e) => handleLLMRoutingChange({ llmModel: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>

            <FieldGrid>
              <FieldAnchor fieldId="llmRoutingCacheTTLSeconds">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.cache_ttl_seconds')}
                  description={t('config_management.visual.sections.llmFeatures.cache_ttl_seconds_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.cache_ttl_seconds_label')}
                  >
                    <Input
                      type="number"
                      value={values.llmRouting.cacheTTLSeconds}
                      onChange={(e) => handleLLMRoutingChange({ cacheTTLSeconds: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="llmRoutingTimeoutSeconds">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.timeout_seconds')}
                  description={t('config_management.visual.sections.llmFeatures.timeout_seconds_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.timeout_seconds_label')}
                  >
                    <Input
                      type="number"
                      value={values.llmRouting.timeoutSeconds}
                      onChange={(e) => handleLLMRoutingChange({ timeoutSeconds: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>

            <FieldAnchor fieldId="llmRoutingFallbackToStatic">
              <FieldGroup
                title={t('config_management.visual.sections.llmFeatures.fallback_to_static')}
                description={t('config_management.visual.sections.llmFeatures.fallback_to_static_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.llmFeatures.fallback_to_static_label')}
                >
                  <ToggleRow
                    title={t('config_management.visual.sections.llmFeatures.fallback_to_static')}
                    description={t('config_management.visual.sections.llmFeatures.fallback_to_static_desc')}
                    checked={values.llmRouting.fallbackToStatic}
                    disabled={disabled}
                    onChange={(fallbackToStatic) => handleLLMRoutingChange({ fallbackToStatic })}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldGroupHeading title={t('config_management.visual.sections.llmFeatures.routing_weights')} />

            <FieldGrid>
              <FieldAnchor fieldId="llmRoutingCostWeight">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.cost_weight')}
                  description={t('config_management.visual.sections.llmFeatures.cost_weight_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.cost_weight_label')}
                  >
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={values.llmRouting.costWeight}
                      onChange={(e) => handleLLMRoutingChange({ costWeight: parseFloat(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="llmRoutingLatencyWeight">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.latency_weight')}
                  description={t('config_management.visual.sections.llmFeatures.latency_weight_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.latency_weight_label')}
                  >
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={values.llmRouting.latencyWeight}
                      onChange={(e) => handleLLMRoutingChange({ latencyWeight: parseFloat(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="llmRoutingQualityWeight">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.quality_weight')}
                  description={t('config_management.visual.sections.llmFeatures.quality_weight_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.quality_weight_label')}
                  >
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={values.llmRouting.qualityWeight}
                      onChange={(e) => handleLLMRoutingChange({ qualityWeight: parseFloat(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>

            <FieldGroupHeading title={t('config_management.visual.sections.llmFeatures.analysis_compression')} />

            <FieldAnchor fieldId="llmRoutingAnalysisCompressionEnabled">
              <FieldGroup
                title={t('config_management.visual.sections.llmFeatures.analysis_compression_enabled')}
                description={t('config_management.visual.sections.llmFeatures.analysis_compression_enabled_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.llmFeatures.analysis_compression_enabled_label')}
                >
                  <ToggleRow
                    title={t('config_management.visual.sections.llmFeatures.analysis_compression_enabled')}
                    description={t('config_management.visual.sections.llmFeatures.analysis_compression_enabled_desc')}
                    checked={values.llmRouting.analysisCompression.enabled}
                    disabled={disabled}
                    onChange={(enabled) => handleLLMRoutingChange({ analysisCompression: { ...values.llmRouting.analysisCompression, enabled } })}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldGrid>
              <FieldAnchor fieldId="llmRoutingAnalysisCompressionStripNoise">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.strip_noise')}
                  description={t('config_management.visual.sections.llmFeatures.strip_noise_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.strip_noise_label')}
                  >
                    <ToggleRow
                      title={t('config_management.visual.sections.llmFeatures.strip_noise')}
                      description={t('config_management.visual.sections.llmFeatures.strip_noise_desc')}
                      checked={values.llmRouting.analysisCompression.stripNoise}
                      disabled={disabled}
                      onChange={(stripNoise) => handleLLMRoutingChange({ analysisCompression: { ...values.llmRouting.analysisCompression, stripNoise } })}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="llmRoutingAnalysisCompressionCompressRepeats">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.compress_repeats')}
                  description={t('config_management.visual.sections.llmFeatures.compress_repeats_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.compress_repeats_label')}
                  >
                    <ToggleRow
                      title={t('config_management.visual.sections.llmFeatures.compress_repeats')}
                      description={t('config_management.visual.sections.llmFeatures.compress_repeats_desc')}
                      checked={values.llmRouting.analysisCompression.compressRepeats}
                      disabled={disabled}
                      onChange={(compressRepeats) => handleLLMRoutingChange({ analysisCompression: { ...values.llmRouting.analysisCompression, compressRepeats } })}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="llmRoutingAnalysisCompressionMaxPromptChars">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.max_prompt_chars')}
                  description={t('config_management.visual.sections.llmFeatures.max_prompt_chars_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.max_prompt_chars_label')}
                  >
                    <Input
                      type="number"
                      value={values.llmRouting.analysisCompression.maxPromptChars}
                      onChange={(e) => handleLLMRoutingChange({ analysisCompression: { ...values.llmRouting.analysisCompression, maxPromptChars: parseInt(e.target.value) || 0 } })}
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
          label={t('config_management.visual.sections.llmFeatures.llm_diagnostics_title')}
          defaultOpen={false}
        >
          <FieldStack>
            <FieldAnchor fieldId="llmDiagnosticsEnabled">
              <FieldGroup
                title={t('config_management.visual.sections.llmFeatures.llm_diagnostics_enabled')}
                description={t('config_management.visual.sections.llmFeatures.llm_diagnostics_enabled_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.llmFeatures.llm_diagnostics_enabled_label')}
                >
                  <ToggleRow
                    title={t('config_management.visual.sections.llmFeatures.llm_diagnostics_enabled')}
                    description={t('config_management.visual.sections.llmFeatures.llm_diagnostics_enabled_desc')}
                    checked={values.llmDiagnostics.enabled}
                    disabled={disabled}
                    onChange={(enabled) => handleLLMDiagnosticsChange({ enabled })}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldGrid>
              <FieldAnchor fieldId="llmDiagnosticsModelHint">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.model_hint')}
                  description={t('config_management.visual.sections.llmFeatures.model_hint_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.model_hint_label')}
                  >
                    <Input
                      placeholder="gpt-4o-mini"
                      value={values.llmDiagnostics.modelHint}
                      onChange={(e) => handleLLMDiagnosticsChange({ modelHint: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="llmDiagnosticsProviderHint">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.provider_hint')}
                  description={t('config_management.visual.sections.llmFeatures.provider_hint_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.provider_hint_label')}
                  >
                    <Input
                      placeholder="openrouter"
                      value={values.llmDiagnostics.providerHint}
                      onChange={(e) => handleLLMDiagnosticsChange({ providerHint: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>

            <FieldGroupHeading title={t('config_management.visual.sections.llmFeatures.error_diagnosis')} />

            <FieldAnchor fieldId="llmDiagnosticsErrorDiagnosisEnabled">
              <FieldGroup
                title={t('config_management.visual.sections.llmFeatures.error_diagnosis_enabled')}
                description={t('config_management.visual.sections.llmFeatures.error_diagnosis_enabled_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.llmFeatures.error_diagnosis_enabled_label')}
                >
                  <ToggleRow
                    title={t('config_management.visual.sections.llmFeatures.error_diagnosis_enabled')}
                    description={t('config_management.visual.sections.llmFeatures.error_diagnosis_enabled_desc')}
                    checked={values.llmDiagnostics.errorDiagnosis.enabled}
                    disabled={disabled}
                    onChange={(enabled) => handleLLMDiagnosticsChange({ errorDiagnosis: { ...values.llmDiagnostics.errorDiagnosis, enabled } })}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldGrid>
              <FieldAnchor fieldId="llmDiagnosticsErrorDiagnosisCaptureStackTrace">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.capture_stack_trace')}
                  description={t('config_management.visual.sections.llmFeatures.capture_stack_trace_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.capture_stack_trace_label')}
                  >
                    <ToggleRow
                      title={t('config_management.visual.sections.llmFeatures.capture_stack_trace')}
                      description={t('config_management.visual.sections.llmFeatures.capture_stack_trace_desc')}
                      checked={values.llmDiagnostics.errorDiagnosis.captureStackTrace}
                      disabled={disabled}
                      onChange={(captureStackTrace) => handleLLMDiagnosticsChange({ errorDiagnosis: { ...values.llmDiagnostics.errorDiagnosis, captureStackTrace } })}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="llmDiagnosticsErrorDiagnosisLogContextLines">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.log_context_lines')}
                  description={t('config_management.visual.sections.llmFeatures.log_context_lines_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.log_context_lines_label')}
                  >
                    <Input
                      type="number"
                      value={values.llmDiagnostics.errorDiagnosis.logContextLines}
                      onChange={(e) => handleLLMDiagnosticsChange({ errorDiagnosis: { ...values.llmDiagnostics.errorDiagnosis, logContextLines: parseInt(e.target.value) || 0 } })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="llmDiagnosticsErrorDiagnosisMinSeverity">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.min_severity')}
                  description={t('config_management.visual.sections.llmFeatures.min_severity_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.min_severity_label')}
                  >
                    <Input
                      placeholder="medium"
                      value={values.llmDiagnostics.errorDiagnosis.minSeverity}
                      onChange={(e) => handleLLMDiagnosticsChange({ errorDiagnosis: { ...values.llmDiagnostics.errorDiagnosis, minSeverity: e.target.value } })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="llmDiagnosticsErrorDiagnosisCooldown">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.cooldown')}
                  description={t('config_management.visual.sections.llmFeatures.cooldown_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.cooldown_label')}
                  >
                    <Input
                      placeholder="1h"
                      value={values.llmDiagnostics.errorDiagnosis.cooldown}
                      onChange={(e) => handleLLMDiagnosticsChange({ errorDiagnosis: { ...values.llmDiagnostics.errorDiagnosis, cooldown: e.target.value } })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>

            <FieldGroupHeading title={t('config_management.visual.sections.llmFeatures.log_analysis')} />

            <FieldAnchor fieldId="llmDiagnosticsLogAnalysisEnabled">
              <FieldGroup
                title={t('config_management.visual.sections.llmFeatures.log_analysis_enabled')}
                description={t('config_management.visual.sections.llmFeatures.log_analysis_enabled_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.llmFeatures.log_analysis_enabled_label')}
                >
                  <ToggleRow
                    title={t('config_management.visual.sections.llmFeatures.log_analysis_enabled')}
                    description={t('config_management.visual.sections.llmFeatures.log_analysis_enabled_desc')}
                    checked={values.llmDiagnostics.logAnalysis.enabled}
                    disabled={disabled}
                    onChange={(enabled) => handleLLMDiagnosticsChange({ logAnalysis: { ...values.llmDiagnostics.logAnalysis, enabled } })}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldGrid>
              <FieldAnchor fieldId="llmDiagnosticsLogAnalysisInterval">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.interval')}
                  description={t('config_management.visual.sections.llmFeatures.interval_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.interval_label')}
                  >
                    <Input
                      placeholder="5m"
                      value={values.llmDiagnostics.logAnalysis.interval}
                      onChange={(e) => handleLLMDiagnosticsChange({ logAnalysis: { ...values.llmDiagnostics.logAnalysis, interval: e.target.value } })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="llmDiagnosticsLogAnalysisWindowSize">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.window_size')}
                  description={t('config_management.visual.sections.llmFeatures.window_size_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.window_size_label')}
                  >
                    <Input
                      placeholder="5m"
                      value={values.llmDiagnostics.logAnalysis.windowSize}
                      onChange={(e) => handleLLMDiagnosticsChange({ logAnalysis: { ...values.llmDiagnostics.logAnalysis, windowSize: e.target.value } })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="llmDiagnosticsLogAnalysisMaxEntries">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.max_entries')}
                  description={t('config_management.visual.sections.llmFeatures.max_entries_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.max_entries_label')}
                  >
                    <Input
                      type="number"
                      value={values.llmDiagnostics.logAnalysis.maxEntries}
                      onChange={(e) => handleLLMDiagnosticsChange({ logAnalysis: { ...values.llmDiagnostics.logAnalysis, maxEntries: parseInt(e.target.value) || 0 } })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="llmDiagnosticsLogAnalysisMinSeverity">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.min_severity')}
                  description={t('config_management.visual.sections.llmFeatures.min_severity_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.min_severity_label')}
                  >
                    <Input
                      placeholder="warn"
                      value={values.llmDiagnostics.logAnalysis.minSeverity}
                      onChange={(e) => handleLLMDiagnosticsChange({ logAnalysis: { ...values.llmDiagnostics.logAnalysis, minSeverity: e.target.value } })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="llmDiagnosticsLogAnalysisAlertOnAnomaly">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.alert_on_anomaly')}
                  description={t('config_management.visual.sections.llmFeatures.alert_on_anomaly_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.alert_on_anomaly_label')}
                  >
                    <ToggleRow
                      title={t('config_management.visual.sections.llmFeatures.alert_on_anomaly')}
                      description={t('config_management.visual.sections.llmFeatures.alert_on_anomaly_desc')}
                      checked={values.llmDiagnostics.logAnalysis.alertOnAnomaly}
                      disabled={disabled}
                      onChange={(alertOnAnomaly) => handleLLMDiagnosticsChange({ logAnalysis: { ...values.llmDiagnostics.logAnalysis, alertOnAnomaly } })}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>
          </FieldStack>
        </Collapsible>

        <Divider />

        <Collapsible
          label={t('config_management.visual.sections.llmFeatures.llm_fix_suggester_title')}
          defaultOpen={false}
        >
          <FieldStack>
            <FieldAnchor fieldId="llmFixSuggesterEnabled">
              <FieldGroup
                title={t('config_management.visual.sections.llmFeatures.llm_fix_suggester_enabled')}
                description={t('config_management.visual.sections.llmFeatures.llm_fix_suggester_enabled_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.llmFeatures.llm_fix_suggester_enabled_label')}
                >
                  <ToggleRow
                    title={t('config_management.visual.sections.llmFeatures.llm_fix_suggester_enabled')}
                    description={t('config_management.visual.sections.llmFeatures.llm_fix_suggester_enabled_desc')}
                    checked={values.llmFixSuggester.enabled}
                    disabled={disabled}
                    onChange={(enabled) => handleLLMFixSuggesterChange({ enabled })}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldGrid>
              <FieldAnchor fieldId="llmFixSuggesterRecurrenceThreshold">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.recurrence_threshold')}
                  description={t('config_management.visual.sections.llmFeatures.recurrence_threshold_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.recurrence_threshold_label')}
                  >
                    <Input
                      type="number"
                      value={values.llmFixSuggester.recurrenceThreshold}
                      onChange={(e) => handleLLMFixSuggesterChange({ recurrenceThreshold: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="llmFixSuggesterTimeWindowHours">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.time_window_hours')}
                  description={t('config_management.visual.sections.llmFeatures.time_window_hours_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.time_window_hours_label')}
                  >
                    <Input
                      type="number"
                      value={values.llmFixSuggester.timeWindowHours}
                      onChange={(e) => handleLLMFixSuggesterChange({ timeWindowHours: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="llmFixSuggesterModelHint">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.model_hint')}
                  description={t('config_management.visual.sections.llmFeatures.model_hint_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.model_hint_label')}
                  >
                    <Input
                      placeholder="gpt-4o-mini"
                      value={values.llmFixSuggester.modelHint}
                      onChange={(e) => handleLLMFixSuggesterChange({ modelHint: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="llmFixSuggesterProviderHint">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.provider_hint')}
                  description={t('config_management.visual.sections.llmFeatures.provider_hint_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.provider_hint_label')}
                  >
                    <Input
                      placeholder="openrouter"
                      value={values.llmFixSuggester.providerHint}
                      onChange={(e) => handleLLMFixSuggesterChange({ providerHint: e.target.value })}
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
          label={t('config_management.visual.sections.llmFeatures.llm_health_query_title')}
          defaultOpen={false}
        >
          <FieldStack>
            <FieldAnchor fieldId="llmHealthQueryEnabled">
              <FieldGroup
                title={t('config_management.visual.sections.llmFeatures.llm_health_query_enabled')}
                description={t('config_management.visual.sections.llmFeatures.llm_health_query_enabled_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.llmFeatures.llm_health_query_enabled_label')}
                >
                  <ToggleRow
                    title={t('config_management.visual.sections.llmFeatures.llm_health_query_enabled')}
                    description={t('config_management.visual.sections.llmFeatures.llm_health_query_enabled_desc')}
                    checked={values.llmHealthQuery.enabled}
                    disabled={disabled}
                    onChange={(enabled) => handleLLMHealthQueryChange({ enabled })}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldGrid>
              <FieldAnchor fieldId="llmHealthQueryModelHint">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.model_hint')}
                  description={t('config_management.visual.sections.llmFeatures.model_hint_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.model_hint_label')}
                  >
                    <Input
                      placeholder="gpt-4o-mini"
                      value={values.llmHealthQuery.modelHint}
                      onChange={(e) => handleLLMHealthQueryChange({ modelHint: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="llmHealthQueryProviderHint">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.provider_hint')}
                  description={t('config_management.visual.sections.llmFeatures.provider_hint_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.provider_hint_label')}
                  >
                    <Input
                      placeholder="openai"
                      value={values.llmHealthQuery.providerHint}
                      onChange={(e) => handleLLMHealthQueryChange({ providerHint: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="llmHealthQueryTimeoutSeconds">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.timeout_seconds')}
                  description={t('config_management.visual.sections.llmFeatures.timeout_seconds_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.timeout_seconds_label')}
                  >
                    <Input
                      type="number"
                      value={values.llmHealthQuery.timeoutSeconds}
                      onChange={(e) => handleLLMHealthQueryChange({ timeoutSeconds: parseInt(e.target.value) || 0 })}
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
          label={t('config_management.visual.sections.llmFeatures.llm_client_title')}
          defaultOpen={false}
        >
          <FieldStack>
            <FieldAnchor fieldId="llmClientCacheEnabled">
              <FieldGroup
                title={t('config_management.visual.sections.llmFeatures.llm_client_cache_enabled')}
                description={t('config_management.visual.sections.llmFeatures.llm_client_cache_enabled_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.llmFeatures.llm_client_cache_enabled_label')}
                >
                  <ToggleRow
                    title={t('config_management.visual.sections.llmFeatures.llm_client_cache_enabled')}
                    description={t('config_management.visual.sections.llmFeatures.llm_client_cache_enabled_desc')}
                    checked={values.llmClient.cacheEnabled}
                    disabled={disabled}
                    onChange={(cacheEnabled) => handleLLMClientChange({ cacheEnabled })}
                  />
                </FieldShell>
              </FieldGroup>
            </FieldAnchor>

            <FieldGrid>
              <FieldAnchor fieldId="llmClientCacheTTL">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.cache_ttl')}
                  description={t('config_management.visual.sections.llmFeatures.cache_ttl_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.cache_ttl_label')}
                  >
                    <Input
                      placeholder="5m"
                      value={values.llmClient.cacheTTL}
                      onChange={(e) => handleLLMClientChange({ cacheTTL: e.target.value })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>

              <FieldAnchor fieldId="llmClientCacheMaxItems">
                <FieldGroup
                  title={t('config_management.visual.sections.llmFeatures.cache_max_items')}
                  description={t('config_management.visual.sections.llmFeatures.cache_max_items_desc')}
                >
                  <FieldShell
                    label={t('config_management.visual.sections.llmFeatures.cache_max_items_label')}
                  >
                    <Input
                      type="number"
                      value={values.llmClient.cacheMaxItems}
                      onChange={(e) => handleLLMClientChange({ cacheMaxItems: parseInt(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </FieldShell>
                </FieldGroup>
              </FieldAnchor>
            </FieldGrid>

            <FieldAnchor fieldId="llmClientModelHints">
              <FieldGroup
                title={t('config_management.visual.sections.llmFeatures.model_hints')}
                description={t('config_management.visual.sections.llmFeatures.model_hints_desc')}
              >
                <FieldShell
                  label={t('config_management.visual.sections.llmFeatures.model_hints_label')}
                  hint={t('config_management.visual.sections.llmFeatures.model_hints_hint')}
                >
                  <StringListEditor
                    value={Object.entries(values.llmClient.modelHints).map(([k, v]) => `${k}:${v}`)}
                    disabled={disabled}
                    placeholder={t('config_management.visual.sections.llmFeatures.model_hints_placeholder')}
                    inputAriaLabel={t('config_management.visual.sections.llmFeatures.model_hints_label')}
                    onChange={(items) => {
                      const modelHints: Record<string, string> = {};
                      items.forEach((item) => {
                        const [k, v] = item.split(':');
                        if (k && v) modelHints[k] = v;
                      });
                      handleLLMClientChange({ modelHints });
                    }}
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