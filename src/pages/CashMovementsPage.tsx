import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cashAccountsApi, cashMovementsApi } from '../api/services';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { CashAccount, CashMovement, Currency } from '../types';
import { getId } from '../utils/format';
import { movementCategoryLabels, movementStatusLabels, movementTypeLabels } from '../utils/labels';
import { ConfirmDialog } from '../components/ConfirmDialog';

function statusTone(status: string): 'success' | 'danger' | 'warning' | 'neutral' {
  if (status === 'confirmed') return 'success';
  if (status === 'cancelled') return 'danger';
  return 'warning';
}

export function CashMovementsPage(): React.ReactElement {
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [accounts, setAccounts] = useState<CashAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ cashAccountId: '', type: '', status: '', from: '', to: '' });

  async function load(): Promise<void> {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const [movData, accData] = await Promise.all([cashMovementsApi.list(params), cashAccountsApi.list()]);
      setMovements(movData.cashMovements || []);
      setAccounts(accData.cashAccounts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los movimientos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [filters]);

  function accountName(id: string | CashAccount | undefined): string {
    if (!id) return '-';
    if (typeof id === 'object') return id.name;
    const found = accounts.find((a) => a._id === id);
    return found ? found.name : String(id).slice(-6);
  }

  async function doConfirm(): Promise<void> {
    if (!confirmId) return;
    try {
      await cashMovementsApi.confirm(confirmId);
      setConfirmId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo confirmar el movimiento.');
      setConfirmId(null);
    }
  }

  async function doCancel(): Promise<void> {
    if (!cancelId) return;
    try {
      await cashMovementsApi.cancel(cancelId);
      setCancelId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cancelar el movimiento.');
      setCancelId(null);
    }
  }

  function setFilter(key: string, value: string): void {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Movimientos de caja"
        action={<Link to="/cash-movements/new" className="btn btn--primary">+ Nuevo movimiento</Link>}
      />
      {error && <ErrorMessage message={error} />}
      <div className="filter-row">
        <select value={filters.cashAccountId} onChange={(e) => setFilter('cashAccountId', e.target.value)}>
          <option value="">Todas las cajas</option>
          {accounts.map((a) => <option key={a._id} value={a._id}>{a.name} ({a.currency})</option>)}
        </select>
        <select value={filters.type} onChange={(e) => setFilter('type', e.target.value)}>
          <option value="">Todos los tipos</option>
          {(Object.entries(movementTypeLabels) as [string, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
          <option value="">Todos los estados</option>
          {(Object.entries(movementStatusLabels) as [string, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input type="date" value={filters.from} onChange={(e) => setFilter('from', e.target.value)} placeholder="Desde" />
        <input type="date" value={filters.to} onChange={(e) => setFilter('to', e.target.value)} placeholder="Hasta" />
      </div>
      <DataTable
        columns={[
          { key: 'date', header: 'Fecha', render: (m) => <DateDisplay value={m.movementDate} /> },
          { key: 'account', header: 'Caja', render: (m) => accountName(m.cashAccountId as string | CashAccount) },
          { key: 'type', header: 'Tipo', render: (m) => movementTypeLabels[m.type] || m.type },
          { key: 'category', header: 'Categoría', render: (m) => movementCategoryLabels[m.category] || m.category },
          { key: 'concept', header: 'Concepto', render: (m) => m.concept },
          { key: 'amount', header: 'Monto', render: (m) => <CurrencyAmount amount={m.amount} currency={m.currency as Currency} /> },
          { key: 'status', header: 'Estado', render: (m) => <StatusBadge label={movementStatusLabels[m.status] || m.status} tone={statusTone(m.status)} /> },
          { key: 'source', header: 'Origen', render: (m) => m.sourceType ? 'Pago comprador' : '-' },
          {
            key: 'actions', header: '', render: (m) => (
              <div className="table-actions">
                <Link to={`/cash-movements/${m._id}`} className="btn btn--sm btn--secondary">Ver</Link>
                {m.status === 'draft' && <button className="btn btn--sm btn--primary" onClick={() => setConfirmId(m._id)}>Confirmar</button>}
                {m.status === 'confirmed' && !m.sourceType && <button className="btn btn--sm btn--danger" onClick={() => setCancelId(m._id)}>Cancelar</button>}
              </div>
            ),
          },
        ]}
        rows={movements}
        getRowKey={(m) => m._id}
        emptyTitle="No hay movimientos registrados."
      />
      {confirmId && (
        <ConfirmDialog
          open
          title="Confirmar movimiento"
          message="¿Confirmar este movimiento? El saldo de la caja se actualizará."
          onConfirm={doConfirm}
          onCancel={() => setConfirmId(null)}
        />
      )}
      {cancelId && (
        <ConfirmDialog
          open
          title="Cancelar movimiento"
          message="¿Cancelar este movimiento? Si estaba confirmado, el saldo de la caja será revertido."
          onConfirm={doCancel}
          onCancel={() => setCancelId(null)}
          danger
        />
      )}
    </div>
  );
}
