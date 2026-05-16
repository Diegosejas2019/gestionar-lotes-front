import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cashAccountsApi, cashMovementsApi, suppliersApi, workProjectsApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { CashAccount, MovementCategory, MovementType, Supplier, WorkProject } from '../types';
import { movementCategoryLabels, movementTypeLabels } from '../utils/labels';

const INCOME_CATEGORIES = ['sale_down_payment', 'installment_payment', 'reservation_payment', 'manual_income', 'other_income'];
const EXPENSE_CATEGORIES = ['work_expense', 'administrative_expense', 'supplier_payment', 'tax', 'fee', 'refund', 'other_expense'];

export function CashMovementFormPage(): React.ReactElement {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<CashAccount[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [projects, setProjects] = useState<WorkProject[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<CashAccount | null>(null);
  const [type, setType] = useState('income');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const [accData, supData, projData] = await Promise.all([
          cashAccountsApi.list({ enabled: 'true' }),
          suppliersApi.list(),
          workProjectsApi.list(),
        ]);
        setAccounts(accData.cashAccounts || []);
        setSuppliers(supData.suppliers || []);
        setProjects(projData.workProjects || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la información.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  function handleAccountChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    const acc = accounts.find((a) => a._id === e.target.value) || null;
    setSelectedAccount(acc);
  }

  const categories = type === 'income' || type === 'transfer_in' || type === 'adjustment' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      cashAccountId: String(form.get('cashAccountId') || ''),
      type: String(form.get('type') || 'income') as MovementType,
      category: String(form.get('category') || '') as MovementCategory,
      concept: String(form.get('concept') || ''),
      description: String(form.get('description') || ''),
      amount: Number(form.get('amount') || 0),
      movementDate: String(form.get('movementDate') || ''),
      supplierId: String(form.get('supplierId') || '') || undefined,
      workProjectId: String(form.get('workProjectId') || '') || undefined,
    };
    if (!payload.cashAccountId) { setError('Debe seleccionar una caja.'); return; }
    if (!payload.concept) { setError('El concepto es obligatorio.'); return; }
    if (payload.amount <= 0) { setError('El monto debe ser mayor a cero.'); return; }
    if (!payload.movementDate) { setError('La fecha es obligatoria.'); return; }
    try {
      setSaving(true);
      await cashMovementsApi.create(payload);
      navigate('/cash-movements');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el movimiento.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Nuevo movimiento de caja" />
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-grid">
          <label>Caja *
            <select name="cashAccountId" required onChange={handleAccountChange}>
              <option value="">Seleccionar caja...</option>
              {accounts.map((a) => <option key={a._id} value={a._id}>{a.name} ({a.currency})</option>)}
            </select>
          </label>
          {selectedAccount && <label>Moneda<input value={selectedAccount.currency} disabled /></label>}
          <label>Tipo *
            <select name="type" value={type} onChange={(e) => setType(e.target.value)}>
              {(Object.entries(movementTypeLabels) as [string, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label>Categoría *
            <select name="category" required>
              <option value="">Seleccionar...</option>
              {categories.map((k) => <option key={k} value={k}>{movementCategoryLabels[k as keyof typeof movementCategoryLabels] || k}</option>)}
            </select>
          </label>
          <label>Concepto *<input name="concept" required /></label>
          <label>Descripción<input name="description" /></label>
          <label>Monto *<input name="amount" type="number" min="0.01" step="0.01" required /></label>
          <label>Fecha *<input name="movementDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label>
          <label>Proveedor (opcional)
            <select name="supplierId">
              <option value="">Sin proveedor</option>
              {suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </label>
          <label>Obra (opcional)
            <select name="workProjectId">
              <option value="">Sin obra</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{typeof p.developmentId === 'object' ? (p.developmentId as { name: string }).name + ' · ' : ''}{p.name}</option>)}
            </select>
          </label>
        </div>
        <div className="form-actions">
          <Link to="/cash-movements" className="btn btn--secondary">Cancelar</Link>
          <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar en borrador'}</button>
        </div>
      </form>
    </div>
  );
}
