import { Link } from 'react-router-dom';
import type { CashAccountSummaryItem } from '../../types';
import { CurrencyAmount } from '../CurrencyAmount';
import { DataTable } from '../DataTable';
import { EmptyState } from '../EmptyState';
import { StatusBadge } from '../StatusBadge';

type Props = {
  accounts: CashAccountSummaryItem[];
};

export function CashAccountsTable({ accounts }: Props): React.ReactElement {
  if (accounts.length === 0) {
    return (
      <EmptyState
        title="No hay cajas configuradas."
        message="Podés crear una caja desde el módulo de Cajas."
      />
    );
  }

  return (
    <DataTable<CashAccountSummaryItem>
      rows={accounts}
      getRowKey={(a) => a.id}
      emptyTitle="No hay cajas."
      columns={[
        {
          key: 'name',
          header: 'Caja / Cuenta',
          render: (a) => <span className="fw-medium">{a.name}</span>,
        },
        {
          key: 'typeLabel',
          header: 'Tipo',
          render: (a) => a.typeLabel,
        },
        {
          key: 'developmentName',
          header: 'Barrio',
          render: (a) => a.developmentName || '—',
        },
        {
          key: 'currency',
          header: 'Moneda',
          render: (a) => a.currency,
        },
        {
          key: 'currentBalance',
          header: 'Saldo actual',
          className: 'text-right',
          render: (a) => (
            <CurrencyAmount amount={a.currentBalance} currency={a.currency as 'ARS' | 'USD'} />
          ),
        },
        {
          key: 'enabled',
          header: 'Estado',
          render: (a) => (
            <StatusBadge label={a.enabled ? 'Activa' : 'Inactiva'} tone={a.enabled ? 'success' : 'neutral'} />
          ),
        },
        {
          key: 'actions',
          header: '',
          render: (a) => (
            <Link to={`/cash-accounts/${a.id}/movements`} className="btn-link-small">
              Ver movimientos
            </Link>
          ),
        },
      ]}
    />
  );
}
