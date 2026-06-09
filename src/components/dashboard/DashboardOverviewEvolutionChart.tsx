import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Currency, DashboardOverviewEvolutionPoint } from '../../types';
import { EmptyState } from '../EmptyState';
import {
  CHART_AXIS_STROKE,
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  ChartTooltip,
  EXPENSE_COLOR,
  INCOME_COLOR,
  formatCompactNumber,
  formatMoneyCompact,
  formatMoneyFull,
  formatMonthLabel,
} from '../charts/chartTheme';

type Props = {
  data: DashboardOverviewEvolutionPoint[];
};

type ChartPoint = DashboardOverviewEvolutionPoint & {
  salesAmount: number;
  collectedAmount: number;
};

function getCurrencies(data: DashboardOverviewEvolutionPoint[]): Currency[] {
  const currencies = new Set<Currency>();
  data.forEach((point) => {
    Object.keys(point.salesByCurrency ?? {}).forEach((currency) => currencies.add(currency as Currency));
    Object.keys(point.collectedByCurrency ?? {}).forEach((currency) => currencies.add(currency as Currency));
  });
  if (currencies.size === 0 && data.some((point) => point.sales > 0 || point.collected > 0)) currencies.add('ARS');
  return [...currencies].sort();
}

export function DashboardOverviewEvolutionChart({ data }: Props): React.ReactElement {
  if (data.length === 0) return <EmptyState title="Sin datos suficientes para mostrar la evolucion general." />;

  const currencies = getCurrencies(data);
  const hasOnlyCounts = currencies.length === 0;
  const visibleCurrencies = hasOnlyCounts ? ['ARS' as Currency] : currencies;

  return (
    <div className="dashboard-charts-stack">
      {visibleCurrencies.map((currency) => {
        const chartData: ChartPoint[] = data.map((point) => ({
          ...point,
          salesAmount: point.salesByCurrency?.[currency] ?? (currencies.length <= 1 ? point.sales : 0),
          collectedAmount: point.collectedByCurrency?.[currency] ?? (currencies.length <= 1 ? point.collected : 0),
        }));

        return (
          <div key={currency} className="dashboard-chart-block">
            {!hasOnlyCounts && <p className="dashboard-chart-currency-label">Evolucion general - {currency}</p>}
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={chartData} barGap={8} barCategoryGap="32%" margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
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
                  yAxisId="money"
                  tick={CHART_AXIS_TICK}
                  tickFormatter={(value) => formatMoneyCompact(Number(value), currency)}
                  axisLine={false}
                  tickLine={false}
                  width={58}
                />
                <YAxis
                  yAxisId="count"
                  orientation="right"
                  tick={CHART_AXIS_TICK}
                  tickFormatter={(value) => formatCompactNumber(Number(value))}
                  axisLine={false}
                  tickLine={false}
                  width={34}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(123, 139, 255, 0.08)' }}
                  content={({ active, payload, label }) => {
                    const point = payload?.[0]?.payload as ChartPoint | undefined;
                    if (!point) return null;

                    return (
                      <ChartTooltip
                        active={active}
                        title={formatMonthLabel(String(label))}
                        rows={[
                          { label: 'Vendido', value: formatMoneyFull(point.salesAmount, currency), color: INCOME_COLOR },
                          { label: 'Cobrado', value: formatMoneyFull(point.collectedAmount, currency), color: '#7dd3fc' },
                          { label: 'Cuotas vencidas', value: point.overdueInstallments, color: EXPENSE_COLOR },
                        ]}
                      />
                    );
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={28}
                  iconType="circle"
                  wrapperStyle={{ color: 'var(--text-muted)', fontSize: 12, paddingTop: 10 }}
                />
                <Bar yAxisId="money" dataKey="salesAmount" name="Vendido" fill={INCOME_COLOR} radius={[6, 6, 0, 0]} maxBarSize={38} />
                <Bar yAxisId="money" dataKey="collectedAmount" name="Cobrado" fill="#7dd3fc" radius={[6, 6, 0, 0]} maxBarSize={38} />
                <Line
                  yAxisId="count"
                  type="monotone"
                  dataKey="overdueInstallments"
                  name="Cuotas vencidas"
                  stroke={EXPENSE_COLOR}
                  strokeWidth={2.2}
                  dot={{ r: 2.5, fill: 'var(--surface)', stroke: EXPENSE_COLOR, strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: EXPENSE_COLOR, stroke: 'var(--surface)', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
}
