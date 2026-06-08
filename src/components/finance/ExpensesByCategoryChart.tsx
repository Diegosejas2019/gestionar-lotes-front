import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ExpenseByCategoryItem } from '../../types';
import { EmptyState } from '../EmptyState';
import {
  CATEGORY_COLORS,
  CHART_AXIS_STROKE,
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  FinanceTooltip,
  formatMoneyCompact,
  formatMoneyFull,
} from './chartTheme';

type Props = {
  data: ExpenseByCategoryItem[];
};

export function ExpensesByCategoryChart({ data }: Props): React.ReactElement {
  if (data.length === 0) {
    return <EmptyState title="No hay gastos registrados para mostrar la composición." />;
  }

  const currencies = [...new Set(data.map((d) => d.currency))].sort();

  return (
    <div className="finance-charts-stack">
      {currencies.map((currency) => {
        const currencyData = data
          .filter((d) => d.currency === currency)
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 8);

        return (
          <div key={currency} className="finance-chart-block">
            <p className="finance-chart-currency-label">Gastos por categoría — {currency}</p>
            <ResponsiveContainer width="100%" height={232}>
              <BarChart data={currencyData} layout="vertical" barCategoryGap={10} margin={{ top: 6, right: 18, left: 16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="4 6" stroke={CHART_GRID_STROKE} horizontal={false} />
                <XAxis
                  type="number"
                  tick={CHART_AXIS_TICK}
                  tickFormatter={(value) => formatMoneyCompact(Number(value), currency)}
                  axisLine={{ stroke: CHART_AXIS_STROKE }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ ...CHART_AXIS_TICK, fontSize: 11 }}
                  width={132}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(123, 139, 255, 0.08)' }}
                  content={({ active, payload }) => {
                    const point = payload?.[0]?.payload as ExpenseByCategoryItem | undefined;
                    if (!point) return null;

                    return (
                      <FinanceTooltip
                        active={active}
                        title={point.label}
                        rows={[
                          {
                            label: 'Monto',
                            value: formatMoneyFull(point.amount, currency),
                            color: payload?.[0]?.color,
                          },
                        ]}
                      />
                    );
                  }}
                />
                <Bar dataKey="amount" name="Monto" radius={[0, 6, 6, 0]} maxBarSize={22}>
                  {currencyData.map((_, index) => (
                    <Cell key={index} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
}
