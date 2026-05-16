import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cashAccountsApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { DataTable } from '../components/DataTable';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { CashAccount } from '../types';
import { cashAccountTypeLabels } from '../utils/labels';

export function CashAccountsPage(): React.ReactElement {
  const [accounts, setAccounts] = useState<CashAccount[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(): Promise<void> {
    try {
      setLoading(true);
      const data = await cashAccountsApi.list();
      setAccounts(data.cashAccounts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las cajas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function confirmDelete(): Promise<void> {
    if (!deleteId) return;
    try {
      await cashAccountsApi.remove(deleteId);
      setDeleteId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la caja.');
      setDeleteId(null);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Cajas / Cuentas"
        action={<Link to="/cash-accounts/new" className="btn btn--primary">+ Nueva caja</Link>}
      />
      {error && <ErrorMessage message={error} />}
      <DataTable
        columns={[
          { key: 'name', header: 'Nombre', render: (a) => <><strong>{a.name}</strong>{a.isDefault ? <span className="badge-default"> · Predeterminada</span> : null}</> },
          { key: 'type', header: 'Tipo', render: (a) => cashAccountTypeLabels[a.type] || a.type },
          { key: 'currency', header: 'Moneda', render: (a) => a.currency },
          { key: 'currentBalance', header: 'Saldo actual', render: (a) => <CurrencyAmount amount={a.currentBalance} currency={a.currency} /> },
          { key: 'enabled', header: 'Estado', render: (a) => <StatusBadge label={a.enabled ? 'Habilitada' : 'Deshabilitada'} tone={a.enabled ? 'success' : 'neutral'} /> },
          {
            key: 'actions', header: '', render: (a) => (
              <div className="table-actions">
                <Link to={`/cash-accounts/${a._id}/edit`} className="btn btn--sm btn--secondary">Editar</Link>
                <button className="btn btn--sm btn--danger" onClick={() => setDeleteId(a._id)}>Eliminar</button>
              </div>
            ),
          },
        ]}
        rows={accounts}
        getRowKey={(a) => a._id}
        emptyTitle="No hay cajas configuradas."
      />
      {deleteId && (
        <ConfirmDialog
          open
          title="Eliminar caja"
          message="¿Eliminar esta caja? Solo se puede eliminar si no tiene movimientos confirmados."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
          danger
        />
      )}
    </div>
  );
}
