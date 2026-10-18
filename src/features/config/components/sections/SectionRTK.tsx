import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/Input';
import type { ConfigSectionProps } from '../../types';
import { CONFIG_TAB_ICONS, SECTION_INDEX_LABELS } from '../../constants';
import { SectionCard } from '../SectionCard';
import {
  FieldAnchor,
  FieldGrid,
  FieldGroup,
  FieldShell,
  FieldStack,
  ToggleRow,
} from '../fields/FieldPrimitives';

const Icon = CONFIG_TAB_ICONS.rtk;

/** RTK Config: Real-Time Kommand binary integration. */
export function SectionRTK({
  values,
  disabled,
  animateIn,
  onChange,
}: ConfigSectionProps) {
  const { t } = useTranslation();

  const handleRTKChange = useCallback(
    (patch: Partial<typeof values.rtk>) =>
      onChange({ rtk: { ...values.rtk, ...patch } }),
    [onChange, values.rtk]
  );

  return (
    <SectionCard
      indexLabel={SECTION_INDEX_LABELS.rtk}
      icon={<Icon size={16} />}
      title={t('config_management.visual.sections.rtk.title')}
      description={t('config_management.visual.sections.rtk.description')}
      animateIn={animateIn}
    >
      <FieldStack>
        <FieldAnchor fieldId="rtkEnabled">
          <FieldGroup
            title={t('config_management.visual.sections.rtk.enabled')}
            description={t('config_management.visual.sections.rtk.enabled_desc')}
          >
            <FieldShell
              label={t('config_management.visual.sections.rtk.enabled_label')}
            >
              <ToggleRow
                title={t('config_management.visual.sections.rtk.enabled')}
                description={t('config_management.visual.sections.rtk.enabled_desc')}
                checked={values.rtk.enabled}
                disabled={disabled}
                onChange={(enabled) => handleRTKChange({ enabled })}
              />
            </FieldShell>
          </FieldGroup>
        </FieldAnchor>

        <FieldGrid>
          <FieldAnchor fieldId="rtkBinary">
            <FieldGroup
              title={t('config_management.visual.sections.rtk.binary')}
              description={t('config_management.visual.sections.rtk.binary_desc')}
            >
              <FieldShell
                label={t('config_management.visual.sections.rtk.binary_label')}
              >
                <Input
                  placeholder="rtk"
                  value={values.rtk.binary}
                  onChange={(e) => handleRTKChange({ binary: e.target.value })}
                  disabled={disabled}
                />
              </FieldShell>
            </FieldGroup>
          </FieldAnchor>

          <FieldAnchor fieldId="rtkUltraMode">
            <FieldGroup
              title={t('config_management.visual.sections.rtk.ultra_mode')}
              description={t('config_management.visual.sections.rtk.ultra_mode_desc')}
            >
              <FieldShell
                label={t('config_management.visual.sections.rtk.ultra_mode_label')}
              >
                <ToggleRow
                  title={t('config_management.visual.sections.rtk.ultra_mode')}
                  description={t('config_management.visual.sections.rtk.ultra_mode_desc')}
                  checked={values.rtk.ultraMode}
                  disabled={disabled}
                  onChange={(ultraMode) => handleRTKChange({ ultraMode })}
                />
              </FieldShell>
            </FieldGroup>
          </FieldAnchor>

          <FieldAnchor fieldId="rtkPoolSize">
            <FieldGroup
              title={t('config_management.visual.sections.rtk.pool_size')}
              description={t('config_management.visual.sections.rtk.pool_size_desc')}
            >
              <FieldShell
                label={t('config_management.visual.sections.rtk.pool_size_label')}
              >
                <Input
                  placeholder="4"
                  value={values.rtk.poolSize}
                  onChange={(e) => handleRTKChange({ poolSize: e.target.value })}
                  disabled={disabled}
                />
              </FieldShell>
            </FieldGroup>
          </FieldAnchor>

          <FieldAnchor fieldId="rtkTimeout">
            <FieldGroup
              title={t('config_management.visual.sections.rtk.timeout')}
              description={t('config_management.visual.sections.rtk.timeout_desc')}
            >
              <FieldShell
                label={t('config_management.visual.sections.rtk.timeout_label')}
              >
                <Input
                  placeholder="30s"
                  value={values.rtk.timeout}
                  onChange={(e) => handleRTKChange({ timeout: e.target.value })}
                  disabled={disabled}
                />
              </FieldShell>
            </FieldGroup>
          </FieldAnchor>
        </FieldGrid>
      </FieldStack>
    </SectionCard>
  );
}