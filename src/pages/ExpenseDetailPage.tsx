import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cashAccountsApi, expensesApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { CashAccount, Expense, ExpenseStatus, Currency, Supplier, WorkProject } from '../types';
import { expenseCategoryLabels, expenseStatusLabels } from '../utils/labels';

function statusTone(status: ExpenseStatus): 'success' | 'danger' | 'warning' | 'neutral' {
  if (status === 'paid') return 'success';
  if (status === 'cancelled') return 'danger';
  return 'warning';
}

export function ExpenseDetailPage(): React.ReactElement {
  const { id } = useParams();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [accounts, setAccounts] = useState<CashAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialog, setCancelDialog] = useState(false);
  const [payDialog, setPayDialog] = useState(false);
  const [payForm, setPayForm] = useState({ cashAccountId: '', paymentDate: new Date().toISOString().slice(0, 10), paymentMethod: 'transfer', notes: '' });

  async function load(): Promise<void> {
    try {
      const [expData, accData] = await Promise.all([expensesApi.get(id!), cashAccountsApi.list({ enabled: 'true' })]);
      setExpense(expData.expense);
      setAccounts(accData.cashAccounts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el gasto.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [id]);

  async function doCancel(): Promise<void> {
    try {
      await expensesApi.cancel(id!);
      setCancelDialog(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cancelar el gasto.');
      setCancelDialog(false);
    }
  }

  async function doMarkPaid(): Promise<void> {
    if (!payForm.cashAccountId) { setError('Seleccioná una caja para registrar el pago.'); return; }
    try {
      await expensesApi.markPaid(id!, payForm);
      setPayDialog(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo marcar el gasto como pagado.');
    }
  }

  if (loading) return <LoadingState />;
  if (!expense) return <ErrorMessage message={error || 'Gasto no encontrado.'} />;

  return (
    <div>
      <PageHeader title={`Gasto ${expense.expenseNumber}`} action={<Link to="/expenses" className="btn btn--secondary">← Volver</Link>} />
      {error && <ErrorMessage message={error} />}
      <div className="detail-card">
        <div className="detail-row"><span>Estado</span><StatusBadge label={expenseStatusLabels[expense.status] || expense.status} tone={statusTone(expense.status)} /></div>
        <div className="detail-row"><span>Categoría</span><strong>{expenseCategoryLabels[expense.category] || expense.category}</strong></div>
        <div className="detail-row"><span>Concepto</span><strong>{expense.concept}</strong></div>
        {expense.description && <div className="detail-row"><span>Descripción</span><strong>{expense.description}</strong></div>}
        <div className="detail-row"><span>Monto</span><strong><CurrencyAmount amount={expense.amount} currency={expense.currency as Currency} /></strong></div>
        <div className="detail-row"><span>Fecha del gasto</span><strong><DateDisplay value={expense.expenseDate} /></strong></div>
        {expense.dueDate && <div className="detail-row"><span>Vencimiento</span><strong><DateDisplay value={expense.dueDate} /></strong></div>}
        {expense.paymentDate && <div className="detail-row"><span>Fecha de pago</span><strong><DateDisplay value={expense.paymentDate} /></strong></div>}
        {expense.invoiceNumber && <div className="detail-row"><span>Nro. factura</span><strong>{expense.invoiceNumber}</strong></div>}
        {expense.supplierId && typeof expense.supplierId === 'object' && <div className="detail-row"><span>Proveedor</span><strong>{(expense.supplierId as Supplier).name}</strong></div>}
        {expense.workProjectId && typeof expense.workProjectId === 'object' && <div className="detail-row"><span>Obra</span><strong>{(expense.workProjectId as WorkProject).name}</strong></div>}
        {expense.cashMovementId && <div className="detail-row"><span>Movimiento de caja</span><Link to={`/cash-movements/${typeof expense.cashMovementId === 'object' ? (expense.cashMovementId as { _id: string })._id : expense.cashMovementId}`}>Ver movimiento</Link></div>}
        {expense.proofFileUrl && <div className="detail-row"><span>Comprobante</span><a href={expense.proofFileUrl} target="_blank" rel="noreferrer">Ver comprobante</a></div>}
        {expense.notes && <div className="detail-row"><span>Notas</span><strong>{expense.notes}</strong></div>}
      </div>
      <div className="detail-actions">
        {expense.status === 'pending' && (
          <>
            <Link to={`/expenses/${id}/edit`} className="btn btn--secondary">Editar</Link>
            <button className="btn btn--primary" onClick={() => { setPayDialog(true); setPayForm((p) => ({ ...p, cashAccountId: accounts.find((a) => a.currency === expense.currency)?._id || '' })); }}>Marcar como pagado</button>
            <button className="btn btn--danger" onClick={() => setCancelDialog(true)}>Cancelar gasto</button>
          </>
        )}
      </div>
      {cancelDialog && (
        <ConfirmDialog
          open
          title="Cancelar gasto"
          message="¿Cancelar este gasto? Si estaba pagado, se revertirá el movimiento de caja."
          onConfirm={doCancel}
          onCancel={() => setCancelDialog(false)}
          danger
        />
      )}
      {payDialog && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Marcar gasto como pagado</h3>
            <div className="form-grid">
              <label>Caja *
                <select value={payForm.cashAccountId} onChange={(e) => setPayForm((p) => ({ ...p, cashAccountId: e.target.value }))}>
                  <option value="">Seleccionar caja...</option>
                  {accounts.filter((a) => a.currency === expense.currency).map((a) => <option key={a._id} value={a._id}>{a.name} ({a.currency})</option>)}
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
              <button className="btn btn--secondary" onClick={() => setPayDialog(false)}>Cancelar</button>
              <button className="btn btn--primary" onClick={doMarkPaid}>Confirmar pago</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
