import { memo, type ReactElement, type CSSProperties } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Meter } from './Meter';
import styles from './StatTile.module.scss';

export interface StatTileProps {
  label: string;
  value: string;
  hint: string;
  pending?: boolean;
  meter?: number | null;
  tone?: 'good' | 'warning' | 'critical' | 'idle';
  children?: ReactElement;
  style?: CSSProperties;
}

const StatTileComponent = memo(function StatTile({
  label,
  value,
  hint,
  pending,
  meter,
  tone,
  children,
  style,
}: StatTileProps) {
  return (
    <article className={styles.statTile} data-reveal style={style}>
      <span className={styles.statLabel}>{label}</span>
      {pending ? (
        <Skeleton className={styles.statValueSkeleton} rounded={6} aria-hidden="true" />
      ) : (
        <>
          {children ? children : <strong className={styles.statValue}>{value}</strong>}
        </>
      )}
      {meter !== null && meter !== undefined && (
        <Meter value={meter} tone={tone} ariaLabel={label} className={styles.statMeter} />
      )}
      <span className={styles.statHint}>{hint}</span>
    </article>
  );
});

export { StatTileComponent as StatTile };