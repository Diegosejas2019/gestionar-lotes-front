import { formatCurrency } from '../utils/format';
import type { Currency } from '../types';

type CurrencyAmountProps = {
  amount?: number;
  currency?: string;
};

export function CurrencyAmount({ amount = 0, currency = 'ARS' }: CurrencyAmountProps): React.ReactElement {
  return <span className="amount">{formatCurrency(amount, currency)}</span>;
}

export function CurrencyTotals({ totals }: { totals?: Partial<Record<Currency, number>> }): React.ReactElement {
  const rows = Object.entries(totals || {}).filter(([, value]) => Number(value || 0) !== 0);
  if (!rows.length) return <CurrencyAmount amount={0} />;
  return (
    <span className="amount-list">
      {rows.map(([currency, amount]) => (
        <span key={currency}><CurrencyAmount amount={Number(amount || 0)} currency={currency} /></span>
      ))}
    </span>
  );
}
