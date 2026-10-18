import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
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

const Icon = CONFIG_TAB_ICONS.promptNorm;

/** PromptNorm Config: Context normalization before sending upstream. */
export function SectionPromptNorm({
  values,
  disabled,
  animateIn,
  onChange,
}: ConfigSectionProps) {
  const { t } = useTranslation();

  const handlePromptNormChange = useCallback(
    (patch: Partial<typeof values.promptNorm>) =>
      onChange({ promptNorm: { ...values.promptNorm, ...patch } }),
    [onChange, values.promptNorm]
  );

  const systemPromptModes: { value: string; label: string }[] = [
    { value: 'off', label: 'Off' },
    { value: 'if-missing', label: 'If Missing' },
    { value: 'merge', label: 'Merge' },
    { value: 'replace', label: 'Replace' },
    { value: 'tail', label: 'Tail' },
  ];

  return (
    <SectionCard
      indexLabel={SECTION_INDEX_LABELS.promptNorm}
      icon={<Icon size={16} />}
      title={t('config_management.visual.sections.promptNorm.title')}
      description={t('config_management.visual.sections.promptNorm.description')}
      animateIn={animateIn}
    >
      <FieldStack>
        <FieldAnchor fieldId="promptNormEnabled">
          <FieldGroup
            title={t('config_management.visual.sections.promptNorm.enabled')}
            description={t('config_management.visual.sections.promptNorm.enabled_desc')}
          >
            <FieldShell
              label={t('config_management.visual.sections.promptNorm.enabled_label')}
            >
              <ToggleRow
                title={t('config_management.visual.sections.promptNorm.enabled')}
                description={t('config_management.visual.sections.promptNorm.enabled_desc')}
                checked={values.promptNorm.enabled}
                disabled={disabled}
                onChange={(enabled) => handlePromptNormChange({ enabled })}
              />
            </FieldShell>
          </FieldGroup>
        </FieldAnchor>

        <FieldGroupHeading title={t('config_management.visual.sections.promptNorm.context_limits')} />

        <FieldGrid>
          <FieldAnchor fieldId="promptNormMaxContextTokens">
            <FieldGroup
              title={t('config_management.visual.sections.promptNorm.max_context_tokens')}
              description={t('config_management.visual.sections.promptNorm.max_context_tokens_desc')}
            >
              <FieldShell
                label={t('config_management.visual.sections.promptNorm.max_context_tokens_label')}
              >
                <Input
                  type="number"
                  placeholder="0"
                  value={values.promptNorm.maxContextTokens ?? ''}
                  onChange={(e) => handlePromptNormChange({ maxContextTokens: parseInt(e.target.value) || 0 })}
                  disabled={disabled}
                />
              </FieldShell>
            </FieldGroup>
          </FieldAnchor>

          <FieldAnchor fieldId="promptNormPreserveLastNBlocks">
            <FieldGroup
              title={t('config_management.visual.sections.promptNorm.preserve_last_n_blocks')}
              description={t('config_management.visual.sections.promptNorm.preserve_last_n_blocks_desc')}
            >
              <FieldShell
                label={t('config_management.visual.sections.promptNorm.preserve_last_n_blocks_label')}
              >
                <Input
                  type="number"
                  placeholder="0"
                  value={values.promptNorm.preserveLastNBlocks ?? ''}
                  onChange={(e) => handlePromptNormChange({ preserveLastNBlocks: parseInt(e.target.value) || 0 })}
                  disabled={disabled}
                />
              </FieldShell>
            </FieldGroup>
          </FieldAnchor>

          <FieldAnchor fieldId="promptNormMinDropTokens">
            <FieldGroup
              title={t('config_management.visual.sections.promptNorm.min_drop_tokens')}
              description={t('config_management.visual.sections.promptNorm.min_drop_tokens_desc')}
            >
              <FieldShell
                label={t('config_management.visual.sections.promptNorm.min_drop_tokens_label')}
              >
                <Input
                  type="number"
                  placeholder="0"
                  value={values.promptNorm.minDropTokens ?? ''}
                  onChange={(e) => handlePromptNormChange({ minDropTokens: parseInt(e.target.value) || 0 })}
                  disabled={disabled}
                />
              </FieldShell>
            </FieldGroup>
          </FieldAnchor>

          <FieldAnchor fieldId="promptNormMaxDropRatio">
            <FieldGroup
              title={t('config_management.visual.sections.promptNorm.max_drop_ratio')}
              description={t('config_management.visual.sections.promptNorm.max_drop_ratio_desc')}
            >
              <FieldShell
                label={t('config_management.visual.sections.promptNorm.max_drop_ratio_label')}
              >
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  placeholder="0"
                  value={values.promptNorm.maxDropRatio ?? ''}
                  onChange={(e) => handlePromptNormChange({ maxDropRatio: parseFloat(e.target.value) || 0 })}
                  disabled={disabled}
                />
              </FieldShell>
            </FieldGroup>
          </FieldAnchor>
        </FieldGrid>

        <FieldGrid>
          <FieldAnchor fieldId="promptNormTruncateHeadKeep">
            <FieldGroup
              title={t('config_management.visual.sections.promptNorm.truncate_head_keep')}
              description={t('config_management.visual.sections.promptNorm.truncate_head_keep_desc')}
            >
              <FieldShell
                label={t('config_management.visual.sections.promptNorm.truncate_head_keep_label')}
              >
                <Input
                  type="number"
                  placeholder="0"
                  value={values.promptNorm.truncateHeadKeep ?? ''}
                  onChange={(e) => handlePromptNormChange({ truncateHeadKeep: parseInt(e.target.value) || 0 })}
                  disabled={disabled}
                />
              </FieldShell>
            </FieldGroup>
          </FieldAnchor>

          <FieldAnchor fieldId="promptNormTruncateTailKeep">
            <FieldGroup
              title={t('config_management.visual.sections.promptNorm.truncate_tail_keep')}
              description={t('config_management.visual.sections.promptNorm.truncate_tail_keep_desc')}
            >
              <FieldShell
                label={t('config_management.visual.sections.promptNorm.truncate_tail_keep_label')}
              >
                <Input
                  type="number"
                  placeholder="0"
                  value={values.promptNorm.truncateTailKeep ?? ''}
                  onChange={(e) => handlePromptNormChange({ truncateTailKeep: parseInt(e.target.value) || 0 })}
                  disabled={disabled}
                />
              </FieldShell>
            </FieldGroup>
          </FieldAnchor>

          <FieldAnchor fieldId="promptNormPruneToolResults">
            <FieldGroup
              title={t('config_management.visual.sections.promptNorm.prune_tool_results')}
              description={t('config_management.visual.sections.promptNorm.prune_tool_results_desc')}
            >
              <FieldShell
                label={t('config_management.visual.sections.promptNorm.prune_tool_results_label')}
              >
                <ToggleRow
                  title={t('config_management.visual.sections.promptNorm.prune_tool_results')}
                  description={t('config_management.visual.sections.promptNorm.prune_tool_results_desc')}
                  checked={values.promptNorm.pruneToolResults}
                  disabled={disabled}
                  onChange={(pruneToolResults) => handlePromptNormChange({ pruneToolResults })}
                />
              </FieldShell>
            </FieldGroup>
          </FieldAnchor>

          <FieldAnchor fieldId="promptNormSelectSystemPrompt">
            <FieldGroup
              title={t('config_management.visual.sections.promptNorm.select_system_prompt')}
              description={t('config_management.visual.sections.promptNorm.select_system_prompt_desc')}
            >
              <FieldShell
                label={t('config_management.visual.sections.promptNorm.select_system_prompt_label')}
              >
                <ToggleRow
                  title={t('config_management.visual.sections.promptNorm.select_system_prompt')}
                  description={t('config_management.visual.sections.promptNorm.select_system_prompt_desc')}
                  checked={values.promptNorm.selectSystemPrompt}
                  disabled={disabled}
                  onChange={(selectSystemPrompt) => handlePromptNormChange({ selectSystemPrompt })}
                />
              </FieldShell>
            </FieldGroup>
          </FieldAnchor>
        </FieldGrid>

        <FieldGrid>
          <FieldAnchor fieldId="promptNormSystemPromptMode">
            <FieldGroup
              title={t('config_management.visual.sections.promptNorm.system_prompt_mode')}
              description={t('config_management.visual.sections.promptNorm.system_prompt_mode_desc')}
            >
              <FieldShell
                label={t('config_management.visual.sections.promptNorm.system_prompt_mode_label')}
              >
                <Select
                  value={values.promptNorm.systemPromptMode}
                  onChange={(mode) => handlePromptNormChange({ systemPromptMode: mode })}
                  disabled={disabled}
                  options={systemPromptModes}
                />
              </FieldShell>
            </FieldGroup>
          </FieldAnchor>

          <FieldAnchor fieldId="promptNormAllowPrefixMutation">
            <FieldGroup
              title={t('config_management.visual.sections.promptNorm.allow_prefix_mutation')}
              description={t('config_management.visual.sections.promptNorm.allow_prefix_mutation_desc')}
            >
              <FieldShell
                label={t('config_management.visual.sections.promptNorm.allow_prefix_mutation_label')}
              >
                <ToggleRow
                  title={t('config_management.visual.sections.promptNorm.allow_prefix_mutation')}
                  description={t('config_management.visual.sections.promptNorm.allow_prefix_mutation_desc')}
                  checked={values.promptNorm.allowPrefixMutation}
                  disabled={disabled}
                  onChange={(allowPrefixMutation) => handlePromptNormChange({ allowPrefixMutation })}
                />
              </FieldShell>
            </FieldGroup>
          </FieldAnchor>

          <FieldAnchor fieldId="promptNormDebugLog">
            <FieldGroup
              title={t('config_management.visual.sections.promptNorm.debug_log')}
              description={t('config_management.visual.sections.promptNorm.debug_log_desc')}
            >
              <FieldShell
                label={t('config_management.visual.sections.promptNorm.debug_log_label')}
              >
                <ToggleRow
                  title={t('config_management.visual.sections.promptNorm.debug_log')}
                  description={t('config_management.visual.sections.promptNorm.debug_log_desc')}
                  checked={values.promptNorm.debugLog}
                  disabled={disabled}
                  onChange={(debugLog) => handlePromptNormChange({ debugLog })}
                />
              </FieldShell>
            </FieldGroup>
          </FieldAnchor>
        </FieldGrid>

        <Divider />

        <FieldGroupHeading title={t('config_management.visual.sections.promptNorm.prompt_overrides')} />

        <FieldAnchor fieldId="promptNormPromptOverrides">
          <FieldGroup
            title={t('config_management.visual.sections.promptNorm.prompt_overrides')}
            description={t('config_management.visual.sections.promptNorm.prompt_overrides_desc')}
          >
            <FieldShell
              label={t('config_management.visual.sections.promptNorm.prompt_overrides_label')}
              hint={t('config_management.visual.sections.promptNorm.prompt_overrides_hint')}
            >
              <textarea
                placeholder='JSON object: {"gpt": "System prompt for GPT models...", "claude": "System prompt for Claude models..."}'
                value={JSON.stringify(values.promptNorm.promptOverrides, null, 2)}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handlePromptNormChange({ promptOverrides: parsed });
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
    </SectionCard>
  );
}