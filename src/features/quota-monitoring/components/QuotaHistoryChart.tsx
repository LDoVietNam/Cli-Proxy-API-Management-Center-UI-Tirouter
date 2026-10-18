/**
 * Quota History Chart
 * Displays historical quota data as a line chart
 */

import { useMemo, useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { QuotaHistoryResponse } from '@/types/quotaMonitoring';
import styles from './QuotaHistoryChart.module.scss';

interface ChartPoint {
  x: number;
  y: number;
  label: string;
  value: number;
  limit: number;
  percent: number;
  timestamp: string;
}

export function QuotaHistoryChart({ history }: { history: QuotaHistoryResponse }) {
  const { t } = useTranslation();
  const chartRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const dataPoints = useMemo((): ChartPoint[] => {
    return history.history
      .slice()
      .sort((a, b) => new Date(a.collectedAt).getTime() - new Date(b.collectedAt).getTime())
      .map((snap, index) => {
        const percent = snap.limit > 0 ? (snap.used / snap.limit) * 100 : 0;
        return {
          x: index,
          y: percent,
          label: new Date(snap.collectedAt).toLocaleTimeString(),
          value: snap.used,
          limit: snap.limit,
          percent,
          timestamp: snap.collectedAt,
        };
      });
  }, [history.history]);

  // Draw chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = chartRef.current;
    if (!canvas || !container || dataPoints.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = 280;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const padding = { top: 20, right: 40, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'var(--border-color)';
    ctx.lineWidth = 1;

    // Horizontal grid lines (0%, 25%, 50%, 75%, 100%)
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight * i) / 4;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Y-axis labels
      ctx.fillStyle = 'var(--text-tertiary)';
      ctx.font = '11px var(--font-mono)';
      ctx.textAlign = 'right';
      ctx.fillText(`${100 - i * 25}%`, padding.left - 8, y + 4);
    }

    // Vertical grid lines (based on data points)
    const maxPoints = Math.min(dataPoints.length, 10);
    const step = Math.max(1, Math.floor(dataPoints.length / maxPoints));
    for (let i = 0; i < dataPoints.length; i += step) {
      const x = padding.left + (chartWidth * i) / Math.max(1, dataPoints.length - 1);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();
    }

    // Y-axis line
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.stroke();

    // X-axis line
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(width - padding.right, padding.top + chartHeight);
    ctx.stroke();

    // Area fill
    if (dataPoints.length > 1) {
      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.02)');

      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top + chartHeight);

      dataPoints.forEach((point, i) => {
        const x = padding.left + (chartWidth * i) / Math.max(1, dataPoints.length - 1);
        const y = padding.top + chartHeight - (point.y / 100) * chartHeight;
        if (i === 0) {
          ctx.lineTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Line
    ctx.beginPath();
    ctx.strokeStyle = 'var(--viz-primary)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    dataPoints.forEach((point, i) => {
      const x = padding.left + (chartWidth * i) / Math.max(1, dataPoints.length - 1);
      const y = padding.top + chartHeight - (point.y / 100) * chartHeight;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Points
    dataPoints.forEach((point, i) => {
      const x = padding.left + (chartWidth * i) / Math.max(1, dataPoints.length - 1);
      const y = padding.top + chartHeight - (point.y / 100) * chartHeight;

      // Point background
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'var(--surface-primary)';
      ctx.fill();

      // Point border
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.strokeStyle = point.y >= 90 ? 'var(--viz-failure)' : point.y >= 70 ? 'var(--amber-color)' : 'var(--viz-primary)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // X-axis labels
    ctx.fillStyle = 'var(--text-tertiary)';
    ctx.font = '10px var(--font-mono)';
    ctx.textAlign = 'center';

    dataPoints.forEach((point, i) => {
      if (i % step === 0 || i === dataPoints.length - 1) {
        const x = padding.left + (chartWidth * i) / Math.max(1, dataPoints.length - 1);
        ctx.fillText(point.label, x, padding.top + chartHeight + 20);
      }
    });

    // Legend
    ctx.font = '11px var(--font-sans)';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'var(--text-primary)';
    ctx.fillText(`${t('quota_monitoring.usage_history')}: ${history.provider} / ${history.account} / ${history.model}`, padding.left, padding.top - 4);
  }, [dataPoints, history.provider, history.account, history.model, t]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Tooltip on hover
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = chartRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || dataPoints.length === 0) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = { left: 60, right: 40, top: 20, bottom: 40 };
    const chartWidth = rect.width - padding.left - padding.right;

    const relativeX = x - padding.left;
    if (relativeX < 0 || relativeX > chartWidth) {
      setHoveredPoint(null);
      return;
    }

    const index = Math.round((relativeX / chartWidth) * (dataPoints.length - 1));
    const clampedIndex = Math.max(0, Math.min(dataPoints.length - 1, index));
    setHoveredPoint(dataPoints[clampedIndex]);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div
      ref={chartRef}
      className={styles.chartContainer}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="img"
      aria-label={t('quota_monitoring.history_chart_aria', {
        provider: history.provider,
        account: history.account,
        model: history.model,
        count: history.count,
      })}
    >
      <canvas ref={canvasRef} className={styles.chartCanvas} />
      {hoveredPoint && (
        <div className={styles.tooltip} style={{ left: `${hoveredPoint.x * (100 / Math.max(1, dataPoints.length - 1))}%` }}>
          <div className={styles.tooltipHeader}>{hoveredPoint.label}</div>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipLabel}>{t('quota_monitoring.used')}</span>
            <span className={styles.tooltipValue}>{formatNumber(hoveredPoint.value)} {history.history[0]?.unit || 'tokens'}</span>
          </div>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipLabel}>{t('quota_monitoring.limit')}</span>
            <span className={styles.tooltipValue}>{formatNumber(hoveredPoint.limit)} {history.history[0]?.unit || 'tokens'}</span>
          </div>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipLabel}>{t('quota_monitoring.usage_percent')}</span>
            <span className={`${styles.tooltipValue} ${hoveredPoint.percent >= 90 ? styles.tooltipCritical : hoveredPoint.percent >= 70 ? styles.tooltipWarning : ''}`}>
              {hoveredPoint.percent.toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}