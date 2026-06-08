import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { MonthlyIncomeExpensePoint } from '../../types';
import { EmptyState } from '../EmptyState';
import {
  CHART_AXIS_STROKE,
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  ChartTooltip,
  EXPENSE_COLOR,
  INCOME_COLOR,
  formatMoneyCompact,
  formatMoneyFull,
  formatMonthLabel,
} from '../charts/chartTheme';

type Props = {
  data: MonthlyIncomeExpensePoint[];
};

export function IncomeExpenseChart({ data }: Props): React.ReactElement {
  if (data.length === 0) {
    return <EmptyState title="No hay movimientos suficientes para mostrar la evolución." />;
  }

  const currencies = [...new Set(data.map((d) => d.currency))].sort();

  return (
    <div className="finance-charts-stack">
      {currencies.map((currency) => {
        const currencyData = data.filter((d) => d.currency === currency);

        return (
          <div key={currency} className="finance-chart-block">
            <p className="finance-chart-currency-label">Ingresos vs Egresos — {currency}</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={currencyData} barGap={8} barCategoryGap="34%" margin={{ top: 8, right: 10, left: 6, bottom: 8 }}>
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
                  cursor={{ fill: 'rgba(123, 139, 255, 0.08)' }}
                  content={({ active, payload, label }) => {
                    const point = payload?.[0]?.payload as MonthlyIncomeExpensePoint | undefined;
                    if (!point) return null;

                    return (
                      <ChartTooltip
                        active={active}
                        title={formatMonthLabel(String(label))}
                        rows={[
                          { label: 'Ingresos', value: formatMoneyFull(point.income, currency), color: INCOME_COLOR },
                          { label: 'Egresos', value: formatMoneyFull(point.expense, currency), color: EXPENSE_COLOR },
                          { label: 'Neto', value: formatMoneyFull(point.net, currency) },
                        ]}
                      />
                    );
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={26}
                  iconType="circle"
                  wrapperStyle={{ color: 'var(--text-muted)', fontSize: 12, paddingTop: 8 }}
                />
                <Bar dataKey="income" name="Ingresos" fill={INCOME_COLOR} radius={[6, 6, 0, 0]} maxBarSize={42} />
                <Bar dataKey="expense" name="Egresos" fill={EXPENSE_COLOR} radius={[6, 6, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
}
