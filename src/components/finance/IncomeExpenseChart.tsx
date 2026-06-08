import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { MonthlyIncomeExpensePoint } from '../../types';
import { EmptyState } from '../EmptyState';

type Props = {
  data: MonthlyIncomeExpensePoint[];
};

const MONTH_NAMES: Record<string, string> = {
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
};

function formatMonthLabel(month: string): string {
  const [year, m] = month.split('-');
  return `${MONTH_NAMES[m] ?? m} ${year.slice(2)}`;
}

function formatAmount(value: number, currency: string): string {
  return new Intl.NumberFormat('es-AR', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value) + ` ${currency}`;
}

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
              <BarChart data={currencyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e5e7eb)" />
                <XAxis dataKey="month" tickFormatter={formatMonthLabel} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 }).format(v)} />
                <Tooltip
                  formatter={(value) => formatAmount(Number(value), currency)}
                  labelFormatter={(label: unknown) => formatMonthLabel(String(label))}
                />
                <Legend />
                <Bar dataKey="income" name="Ingresos" fill="#22c55e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expense" name="Egresos" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
}
