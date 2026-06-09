import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Currency, DashboardSummary } from '../../types';
import { EmptyState } from '../EmptyState';
import {
  CHART_AXIS_STROKE,
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  ChartTooltip,
  EXPENSE_COLOR,
  INCOME_COLOR,
  formatCompactNumber,
  formatMoneyFull,
} from '../charts/chartTheme';

type Props = {
  summary: DashboardSummary | null;
};

type ChartPoint = {
  currency: Currency;
  sold: number;
  collected: number;
  pending: number;
};

function getCurrencies(summary: DashboardSummary | null): Currency[] {
  const currencies = new Set<Currency>();
  Object.keys(summary?.totalSoldByCurrency ?? {}).forEach((currency) => currencies.add(currency as Currency));
  Object.keys(summary?.totalCollectedByCurrency ?? {}).forEach((currency) => currencies.add(currency as Currency));
  Object.keys(summary?.pendingBalanceByCurrency ?? {}).forEach((currency) => currencies.add(currency as Currency));
  return [...currencies].sort();
}

export function DashboardSalesCollectionChart({ summary }: Props): React.ReactElement {
  const currencies = getCurrencies(summary);
  const chartData: ChartPoint[] = currencies.map((currency) => ({
    currency,
    sold: Number(summary?.totalSoldByCurrency?.[currency] || 0),
    collected: Number(summary?.totalCollectedByCurrency?.[currency] || 0),
    pending: Number(summary?.pendingBalanceByCurrency?.[currency] || 0),
  })).filter((point) => point.sold > 0 || point.collected > 0 || point.pending > 0);

  if (!summary || chartData.length === 0) return <EmptyState title="Sin ventas ni cobranza para mostrar." />;

  return (
    <div className="dashboard-chart-block">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} barGap={8} barCategoryGap="34%" margin={{ top: 8, right: 18, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="4 6" stroke={CHART_GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="currency"
            tick={CHART_AXIS_TICK}
            axisLine={{ stroke: CHART_AXIS_STROKE }}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tick={CHART_AXIS_TICK}
            tickFormatter={(value) => formatCompactNumber(Number(value))}
            axisLine={false}
            tickLine={false}
            width={58}
          />
          <Tooltip
            cursor={{ fill: 'rgba(123, 139, 255, 0.08)' }}
            content={({ active, payload, label }) => {
              const point = payload?.[0]?.payload as ChartPoint | undefined;
              if (!point) return null;

              return (
                <ChartTooltip
                  active={active}
                  title={String(label)}
                  rows={[
                    { label: 'Vendido', value: formatMoneyFull(point.sold, point.currency), color: INCOME_COLOR },
                    { label: 'Cobrado', value: formatMoneyFull(point.collected, point.currency), color: '#7dd3fc' },
                    { label: 'Saldo pendiente', value: formatMoneyFull(point.pending, point.currency), color: EXPENSE_COLOR },
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
          <Bar dataKey="sold" name="Vendido" fill={INCOME_COLOR} radius={[6, 6, 0, 0]} maxBarSize={34} />
          <Bar dataKey="collected" name="Cobrado" fill="#7dd3fc" radius={[6, 6, 0, 0]} maxBarSize={34} />
          <Bar dataKey="pending" name="Saldo pendiente" fill={EXPENSE_COLOR} radius={[6, 6, 0, 0]} maxBarSize={34} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
