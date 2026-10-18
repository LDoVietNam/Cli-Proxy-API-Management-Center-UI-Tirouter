import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { ConfigSectionProps } from '../../types';
import { CavemanLevel } from '@/types/visualConfig';
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

const Icon = CONFIG_TAB_ICONS.caveman;

/** Caveman Config: Text compression engine. */
export function SectionCaveman({
  values,
  disabled,
  animateIn,
  onChange,
}: ConfigSectionProps) {
  const { t } = useTranslation();

  const handleCavemanChange = useCallback(
    (patch: Partial<typeof values.caveman>) =>
      onChange({ caveman: { ...values.caveman, ...patch } }),
    [onChange, values.caveman]
  );

  const cavemanLevels: { value: CavemanLevel; label: string }[] = [
    { value: 'lite', label: 'Lite' },
    { value: 'full', label: 'Full' },
    { value: 'ultra', label: 'Ultra' },
  ];

  return (
    <SectionCard
      indexLabel={SECTION_INDEX_LABELS.caveman}
      icon={<Icon size={16} />}
      title={t('config_management.visual.sections.caveman.title')}
      description={t('config_management.visual.sections.caveman.description')}
      animateIn={animateIn}
    >
      <FieldStack>
        <FieldAnchor fieldId="cavemanEnabled">
          <FieldGroup
            title={t('config_management.visual.sections.caveman.enabled')}
            description={t('config_management.visual.sections.caveman.enabled_desc')}
          >
            <FieldShell
              label={t('config_management.visual.sections.caveman.enabled_label')}
            >
              <ToggleRow
                title={t('config_management.visual.sections.caveman.enabled')}
                description={t('config_management.visual.sections.caveman.enabled_desc')}
                checked={values.caveman.enabled}
                disabled={disabled}
                onChange={(enabled) => handleCavemanChange({ enabled })}
              />
            </FieldShell>
          </FieldGroup>
        </FieldAnchor>

        <FieldGrid>
          <FieldAnchor fieldId="cavemanLevel">
            <FieldGroup
              title={t('config_management.visual.sections.caveman.level')}
              description={t('config_management.visual.sections.caveman.level_desc')}
            >
              <FieldShell
                label={t('config_management.visual.sections.caveman.level_label')}
              >
                <Select
                  value={values.caveman.level as CavemanLevel}
                  onChange={(level) => handleCavemanChange({ level: level as CavemanLevel })}
                  disabled={disabled}
                  options={cavemanLevels}
                />
              </FieldShell>
            </FieldGroup>
          </FieldAnchor>

          <FieldAnchor fieldId="cavemanCacheSize">
            <FieldGroup
              title={t('config_management.visual.sections.caveman.cache_size')}
              description={t('config_management.visual.sections.caveman.cache_size_desc')}
            >
              <FieldShell
                label={t('config_management.visual.sections.caveman.cache_size_label')}
              >
                <Input
                  placeholder="1000"
                  value={values.caveman.cacheSize}
                  onChange={(e) => handleCavemanChange({ cacheSize: e.target.value })}
                  disabled={disabled}
                />
              </FieldShell>
            </FieldGroup>
          </FieldAnchor>

          <FieldAnchor fieldId="cavemanThreshold">
            <FieldGroup
              title={t('config_management.visual.sections.caveman.threshold')}
              description={t('config_management.visual.sections.caveman.threshold_desc')}
            >
              <FieldShell
                label={t('config_management.visual.sections.caveman.threshold_label')}
              >
                <Input
                  type="number"
                  placeholder="0"
                  value={values.caveman.threshold ?? ''}
                  onChange={(e) => handleCavemanChange({ threshold: parseInt(e.target.value) || 0 })}
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