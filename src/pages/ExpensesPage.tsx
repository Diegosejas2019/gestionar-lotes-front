import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cashAccountsApi, developmentsApi, expensesApi, suppliersApi, workProjectsApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { CashAccount, Development, Expense, ExpenseStatus, Currency, Supplier, WorkProject } from '../types';
import { getId } from '../utils/format';
import { expenseCategoryLabels, expenseStatusLabels } from '../utils/labels';

function statusTone(status: ExpenseStatus): 'success' | 'danger' | 'warning' | 'neutral' {
  if (status === 'paid') return 'success';
  if (status === 'cancelled') return 'danger';
  return 'warning';
}

export function ExpensesPage(): React.ReactElement {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [accounts, setAccounts] = useState<CashAccount[]>([]);
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [payId, setPayId] = useState<string | null>(null);
  const [payForm, setPayForm] = useState({ cashAccountId: '', paymentDate: new Date().toISOString().slice(0, 10), paymentMethod: 'transfer', notes: '' });
  const [filters, setFilters] = useState({ developmentId: '', status: '', category: '', from: '', to: '' });

  async function load(): Promise<void> {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const [expData, devData, accData] = await Promise.all([
        expensesApi.list(params),
        developmentsApi.list(),
        cashAccountsApi.list({ enabled: 'true' }),
      ]);
      setExpenses(expData.expenses || []);
      setDevelopments(devData.developments || []);
      setAccounts(accData.cashAccounts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los gastos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [filters]);

  function setFilter(key: string, value: string): void {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  async function doCancel(): Promise<void> {
    if (!cancelId) return;
    try {
      await expensesApi.cancel(cancelId);
      setCancelId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cancelar el gasto.');
      setCancelId(null);
    }
  }

  async function doMarkPaid(): Promise<void> {
    if (!payId) return;
    if (!payForm.cashAccountId) { setError('Seleccioná una caja para registrar el pago.'); return; }
    try {
      await expensesApi.markPaid(payId, payForm);
      setPayId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo marcar el gasto como pagado.');
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Gastos"
        action={<Link to="/expenses/new" className="btn btn--primary">+ Nuevo gasto</Link>}
      />
      {error && <ErrorMessage message={error} />}
      <div className="filter-row">
        <select value={filters.developmentId} onChange={(e) => setFilter('developmentId', e.target.value)}>
          <option value="">Todos los barrios</option>
          {developments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <select value={filters.category} onChange={(e) => setFilter('category', e.target.value)}>
          <option value="">Todas las categorías</option>
          {(Object.entries(expenseCategoryLabels) as [string, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
          <option value="">Todos los estados</option>
          {(Object.entries(expenseStatusLabels) as [string, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input type="date" value={filters.from} onChange={(e) => setFilter('from', e.target.value)} />
        <input type="date" value={filters.to} onChange={(e) => setFilter('to', e.target.value)} />
      </div>
      <DataTable
        columns={[
          { key: 'number', header: 'Número', render: (e) => <Link to={`/expenses/${e._id}`}>{e.expenseNumber}</Link> },
          { key: 'date', header: 'Fecha', render: (e) => <DateDisplay value={e.expenseDate} /> },
          { key: 'category', header: 'Categoría', render: (e) => expenseCategoryLabels[e.category] || e.category },
          { key: 'concept', header: 'Concepto', render: (e) => e.concept },
          { key: 'supplier', header: 'Proveedor', render: (e) => (typeof e.supplierId === 'object' && e.supplierId ? (e.supplierId as Supplier).name : '-') },
          { key: 'amount', header: 'Monto', render: (e) => <CurrencyAmount amount={e.amount} currency={e.currency as Currency} /> },
          { key: 'status', header: 'Estado', render: (e) => <StatusBadge label={expenseStatusLabels[e.status] || e.status} tone={statusTone(e.status)} /> },
          {
            key: 'actions', header: '', render: (e) => (
              <div className="table-actions">
                <Link to={`/expenses/${e._id}`} className="btn btn--sm btn--secondary">Ver</Link>
                {e.status === 'pending' && <button className="btn btn--sm btn--primary" onClick={() => { setPayId(e._id); setPayForm((p) => ({ ...p, cashAccountId: accounts.find((a) => a.currency === e.currency)?._id || '' })); }}>Marcar pagado</button>}
                {e.status === 'pending' && <button className="btn btn--sm btn--danger" onClick={() => setCancelId(e._id)}>Cancelar</button>}
              </div>
            ),
          },
        ]}
        rows={expenses}
        getRowKey={(e) => e._id}
        emptyTitle="No hay gastos cargados."
      />
      {cancelId && (
        <ConfirmDialog
          open
          title="Cancelar gasto"
          message="¿Cancelar este gasto? Si estaba pagado, se revertirá el movimiento de caja."
          onConfirm={doCancel}
          onCancel={() => setCancelId(null)}
          danger
        />
      )}
      {payId && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Marcar gasto como pagado</h3>
            <div className="form-grid">
              <label>Caja *
                <select value={payForm.cashAccountId} onChange={(e) => setPayForm((p) => ({ ...p, cashAccountId: e.target.value }))}>
                  <option value="">Seleccionar caja...</option>
                  {accounts.map((a) => <option key={a._id} value={a._id}>{a.name} ({a.currency})</option>)}
                </select>
              </label>
              <label>Fecha de pago<input type="date" value={payForm.paymentDate} onChange={(e) => setPayForm((p) => ({ ...p, paymentDate: e.target.value }))} /></label>
              <label>Método
                <select value={payForm.paymentMethod} onChange={(e) => setPayForm((p) => ({ ...p, paymentMethod: e.target.value }))}>
                  <option value="transfer">Transferencia</option>
                  <option value="cash">Efectivo</option>
                  <option value="bank_deposit">Depósito bancario</option>
                  <option value="other">Otro</option>
                </select>
              </label>
              <label className="form-full">Notas<textarea rows={2} value={payForm.notes} onChange={(e) => setPayForm((p) => ({ ...p, notes: e.target.value }))} /></label>
            </div>
            <div className="form-actions">
              <button className="btn btn--secondary" onClick={() => setPayId(null)}>Cancelar</button>
              <button className="btn btn--primary" onClick={doMarkPaid}>Confirmar pago</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
