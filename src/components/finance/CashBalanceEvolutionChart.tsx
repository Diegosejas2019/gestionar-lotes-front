import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CashBalanceEvolutionPoint } from '../../types';
import { EmptyState } from '../EmptyState';

type Props = {
  data: CashBalanceEvolutionPoint[];
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

const AREA_COLORS: Record<string, string> = {
  ARS: '#6366f1',
  USD: '#f59e0b',
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
        const color = AREA_COLORS[currency] ?? '#6366f1';

        return (
          <div key={currency} className="finance-chart-block">
            <p className="finance-chart-currency-label">Evolución de saldo de caja — {currency}</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={currencyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${currency}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e5e7eb)" />
                <XAxis dataKey="month" tickFormatter={formatMonthLabel} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(v))} />
                <Tooltip
                  formatter={(value) => formatAmount(Number(value), currency)}
                  labelFormatter={(label: unknown) => formatMonthLabel(String(label))}
                />
                <Area type="monotone" dataKey="balance" name="Saldo" stroke={color} strokeWidth={2} fill={`url(#grad-${currency})`} dot={{ r: 3, fill: color }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
}
