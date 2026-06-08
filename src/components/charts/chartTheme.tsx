import type { ReactNode } from 'react';
import type { Currency } from '../../types';

export const CHART_AXIS_TICK = {
  fill: 'var(--text-dim)',
  fontSize: 11,
};

export const CHART_GRID_STROKE = 'rgba(136, 146, 164, 0.18)';
export const CHART_AXIS_STROKE = 'rgba(136, 146, 164, 0.24)';

export const INCOME_COLOR = '#4ade80';
export const EXPENSE_COLOR = '#fb7185';

export const CATEGORY_COLORS = [
  '#7dd3fc',
  '#a78bfa',
  '#f0abfc',
  '#fbbf24',
  '#5eead4',
  '#c4b5fd',
  '#93c5fd',
  '#fca5a5',
];

export const BALANCE_COLORS: Partial<Record<Currency, string>> = {
  ARS: '#8b9bff',
  USD: '#fbbf24',
};

const MONTH_NAMES: Record<string, string> = {
  '01': 'Ene',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Abr',
  '05': 'May',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Ago',
  '09': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dic',
};

export function formatMonthLabel(month: string): string {
  const [year, m] = month.split('-');
  return `${MONTH_NAMES[m] ?? m} ${year.slice(2)}`;
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatMoneyCompact(value: number, currency: string): string {
  const abs = Math.abs(value);
  const prefix = currency === 'ARS' ? '$' : currency;
  const formatter = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: abs >= 1000000 ? 1 : 0,
    maximumFractionDigits: abs >= 1000000 ? 1 : 0,
  });

  if (abs >= 1000000) return `${prefix} ${formatter.format(value / 1000000)} M`;
  if (abs >= 1000) return `${prefix} ${formatter.format(value / 1000)} K`;
  return `${prefix} ${formatter.format(value)}`;
}

export function formatMoneyFull(value: number, currency: string): string {
  const prefix = currency === 'ARS' ? '$' : currency;
  const amount = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  return `${prefix} ${amount}`;
}

type TooltipRow = {
  label: string;
  value: ReactNode;
  color?: string;
};

type ChartTooltipProps = {
  active?: boolean;
  label?: ReactNode;
  title?: string;
  rows: TooltipRow[];
};

export function ChartTooltip({ active, label, title, rows }: ChartTooltipProps): React.ReactElement | null {
  if (!active) return null;

  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__label">{title ?? label}</div>
      <div className="chart-tooltip__rows">
        {rows.map((row) => (
          <div className="chart-tooltip__row" key={row.label}>
            <span className="chart-tooltip__name">
              {row.color && <span className="chart-tooltip__dot" style={{ background: row.color }} />}
              {row.label}
            </span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
