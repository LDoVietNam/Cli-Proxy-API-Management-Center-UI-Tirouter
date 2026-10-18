import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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

const Icon = CONFIG_TAB_ICONS.prompts;

/** Prompts Config: Prompt injection rules. */
export function SectionPrompts({
  values,
  disabled,
  animateIn,
  onChange,
}: ConfigSectionProps) {
  const { t } = useTranslation();

  const handlePromptsChange = useCallback(
    (patch: Partial<typeof values.prompts>) =>
      onChange({ prompts: { ...values.prompts, ...patch } }),
    [onChange, values.prompts]
  );

  const handleDefaultInjectChange = useCallback(
    (patch: Partial<typeof values.prompts.default>) =>
      onChange({ prompts: { ...values.prompts, default: { ...values.prompts.default, ...patch } } }),
    [onChange, values.prompts]
  );

  return (
    <SectionCard
      indexLabel={SECTION_INDEX_LABELS.prompts}
      icon={<Icon size={16} />}
      title={t('config_management.visual.sections.prompts.title')}
      description={t('config_management.visual.sections.prompts.description')}
      animateIn={animateIn}
    >
      <FieldStack>
        <FieldAnchor fieldId="promptsEnabled">
          <FieldGroup
            title={t('config_management.visual.sections.prompts.enabled')}
            description={t('config_management.visual.sections.prompts.enabled_desc')}
          >
            <FieldShell
              label={t('config_management.visual.sections.prompts.enabled_label')}
            >
              <ToggleRow
                title={t('config_management.visual.sections.prompts.enabled')}
                description={t('config_management.visual.sections.prompts.enabled_desc')}
                checked={values.prompts.enabled ?? false}
                disabled={disabled}
                onChange={(enabled) => handlePromptsChange({ enabled })}
              />
            </FieldShell>
          </FieldGroup>
        </FieldAnchor>

        <FieldGroupHeading title={t('config_management.visual.sections.prompts.default_injection')} />

        <FieldAnchor fieldId="promptsDefaultSystem">
          <FieldGroup
            title={t('config_management.visual.sections.prompts.default_system')}
            description={t('config_management.visual.sections.prompts.default_system_desc')}
          >
            <FieldShell
              label={t('config_management.visual.sections.prompts.default_system_label')}
            >
              <textarea
                placeholder="System prompt to inject..."
                value={values.prompts.default.system}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleDefaultInjectChange({ system: e.target.value })}
                disabled={disabled}
                rows={4}
                style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px', padding: '8px' }}
              />
            </FieldShell>
          </FieldGroup>
        </FieldAnchor>

        <FieldAnchor fieldId="promptsDefaultSystemMode">
          <FieldGroup
            title={t('config_management.visual.sections.prompts.default_system_mode')}
            description={t('config_management.visual.sections.prompts.default_system_mode_desc')}
          >
            <FieldShell
              label={t('config_management.visual.sections.prompts.default_system_mode_label')}
            >
              <Input
                placeholder="merge"
                value={values.prompts.default.systemMode}
                onChange={(e) => handleDefaultInjectChange({ systemMode: e.target.value })}
                disabled={disabled}
              />
            </FieldShell>
          </FieldGroup>
        </FieldAnchor>

        <FieldGrid>
          <FieldAnchor fieldId="promptsDefaultPrependUser">
            <FieldGroup
              title={t('config_management.visual.sections.prompts.default_prepend_user')}
              description={t('config_management.visual.sections.prompts.default_prepend_user_desc')}
            >
              <FieldShell
                label={t('config_management.visual.sections.prompts.default_prepend_user_label')}
              >
                <textarea
                  placeholder="Text to prepend to user messages..."
                  value={values.prompts.default.prependUser}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleDefaultInjectChange({ prependUser: e.target.value })}
                  disabled={disabled}
                  rows={3}
                  style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px', padding: '8px' }}
                />
              </FieldShell>
            </FieldGroup>
          </FieldAnchor>

          <FieldAnchor fieldId="promptsDefaultAppendUser">
            <FieldGroup
              title={t('config_management.visual.sections.prompts.default_append_user')}
              description={t('config_management.visual.sections.prompts.default_append_user_desc')}
            >
              <FieldShell
                label={t('config_management.visual.sections.prompts.default_append_user_label')}
              >
                <textarea
                  placeholder="Text to append to user messages..."
                  value={values.prompts.default.appendUser}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleDefaultInjectChange({ appendUser: e.target.value })}
                  disabled={disabled}
                  rows={3}
                  style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px', padding: '8px' }}
                />
              </FieldShell>
            </FieldGroup>
          </FieldAnchor>
        </FieldGrid>

        <Divider />

        <FieldGroupHeading title={t('config_management.visual.sections.prompts.presets')} />

        <FieldAnchor fieldId="promptsPresets">
          <FieldGroup
            title={t('config_management.visual.sections.prompts.presets')}
            description={t('config_management.visual.sections.prompts.presets_desc')}
          >
            <FieldShell
              label={t('config_management.visual.sections.prompts.presets_label')}
              hint={t('config_management.visual.sections.prompts.presets_hint')}
            >
              <textarea
                placeholder="JSON array of prompt presets"
                value={JSON.stringify(values.prompts.presets, null, 2)}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handlePromptsChange({ presets: parsed });
                  } catch {
                    // ignore invalid JSON
                  }
                }}
                disabled={disabled}
                rows={8}
                style={{ fontFamily: 'monospace', width: '100%', fontSize: '12px' }}
              />
            </FieldShell>
          </FieldGroup>
        </FieldAnchor>
      </FieldStack>
    </SectionCard>
  );
}