import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CashBalanceEvolutionPoint } from '../../types';
import { EmptyState } from '../EmptyState';
import {
  BALANCE_COLORS,
  CHART_AXIS_STROKE,
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  FinanceTooltip,
  formatMoneyCompact,
  formatMoneyFull,
  formatMonthLabel,
} from './chartTheme';

type Props = {
  data: CashBalanceEvolutionPoint[];
};

export function CashBalanceEvolutionChart({ data }: Props): React.ReactElement {
  if (data.length === 0) {
    return <EmptyState title="No hay datos suficientes para mostrar la evolución de saldo." />;
  }

  const currencies = [...new Set(data.map((d) => d.currency))].sort();

  return (
    <div className="finance-charts-stack">
      {currencies.map((currency) => {
        const currencyData = data.filter((d) => d.currency === currency);
        const color = BALANCE_COLORS[currency] ?? '#8b9bff';
        const gradientId = `finance-balance-${currency}`;

        return (
          <div key={currency} className="finance-chart-block">
            <p className="finance-chart-currency-label">Evolución de saldo de caja — {currency}</p>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={currencyData} margin={{ top: 8, right: 10, left: 6, bottom: 8 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.24} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 6" stroke={CHART_GRID_STROKE} vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonthLabel}
                  tick={CHART_AXIS_TICK}
                  axisLine={{ stroke: CHART_AXIS_STROKE }}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  tick={CHART_AXIS_TICK}
                  tickFormatter={(value) => formatMoneyCompact(Number(value), currency)}
                  axisLine={false}
                  tickLine={false}
                  width={58}
                />
                <Tooltip
                  cursor={{ stroke: 'rgba(226, 232, 240, 0.24)', strokeDasharray: '4 4' }}
                  content={({ active, payload, label }) => {
                    const point = payload?.[0]?.payload as CashBalanceEvolutionPoint | undefined;
                    if (!point) return null;

                    return (
                      <FinanceTooltip
                        active={active}
                        title={formatMonthLabel(String(label))}
                        rows={[
                          { label: 'Saldo', value: formatMoneyFull(point.balance, currency), color },
                        ]}
                      />
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  name="Saldo"
                  stroke={color}
                  strokeWidth={2.4}
                  fill={`url(#${gradientId})`}
                  dot={{ r: 2.5, fill: 'var(--surface)', stroke: color, strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: color, stroke: 'var(--surface)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
}
