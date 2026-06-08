import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ExpenseByCategoryItem } from '../../types';
import { EmptyState } from '../EmptyState';

type Props = {
  data: ExpenseByCategoryItem[];
};

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6'];

function formatAmount(value: number, currency: string): string {
  return new Intl.NumberFormat('es-AR', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value) + ` ${currency}`;
}

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
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={currencyData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e5e7eb)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(v))} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={110} />
                <Tooltip formatter={(value) => formatAmount(Number(value), currency)} />
                <Bar dataKey="amount" name="Monto" radius={[0, 3, 3, 0]}>
                  {currencyData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
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
