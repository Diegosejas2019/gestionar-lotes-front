import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { developmentsApi, expensesApi, suppliersApi, workProjectsApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { Currency, Development, Expense, ExpenseCategory, Supplier, WorkProject } from '../types';
import { expenseCategoryLabels } from '../utils/labels';

export function ExpenseFormPage(): React.ReactElement {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState<Partial<Expense>>({ currency: 'ARS', category: 'administrative' });
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [projects, setProjects] = useState<WorkProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const [devData, supData, projData, expenseData] = await Promise.all([
          developmentsApi.list(),
          suppliersApi.list(),
          workProjectsApi.list(),
          id ? expensesApi.get(id) : Promise.resolve(null),
        ]);
        setDevelopments(devData.developments || []);
        setSuppliers(supData.suppliers || []);
        setProjects(projData.workProjects || []);
        if (expenseData) setExpense(expenseData.expense);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la información.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      category: String(form.get('category') || '') as ExpenseCategory,
      concept: String(form.get('concept') || ''),
      description: String(form.get('description') || ''),
      amount: Number(form.get('amount') || 0),
      currency: String(form.get('currency') || 'ARS') as Currency,
      expenseDate: String(form.get('expenseDate') || ''),
      dueDate: String(form.get('dueDate') || '') || null,
      invoiceNumber: String(form.get('invoiceNumber') || ''),
      notes: String(form.get('notes') || ''),
      developmentId: String(form.get('developmentId') || '') || null,
      supplierId: String(form.get('supplierId') || '') || null,
      workProjectId: String(form.get('workProjectId') || '') || null,
    };
    if (!payload.concept) { setError('El concepto es obligatorio.'); return; }
    if (payload.amount <= 0) { setError('El monto debe ser mayor a cero.'); return; }
    if (!payload.expenseDate) { setError('La fecha del gasto es obligatoria.'); return; }
    try {
      setSaving(true);
      if (id) await expensesApi.update(id, payload);
      else await expensesApi.create(payload);
      navigate('/expenses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el gasto.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title={id ? 'Editar gasto' : 'Nuevo gasto'} />
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-grid">
          <label>Categoría *
            <select name="category" defaultValue={expense.category || 'administrative'} required>
              {(Object.entries(expenseCategoryLabels) as [string, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label>Concepto *<input name="concept" defaultValue={expense.concept || ''} required /></label>
          <label className="form-full">Descripción<textarea name="description" defaultValue={expense.description || ''} rows={2} /></label>
          <label>Monto *<input name="amount" type="number" min="0.01" step="0.01" defaultValue={expense.amount || ''} required /></label>
          <label>Moneda *
            <select name="currency" defaultValue={expense.currency || 'ARS'} disabled={Boolean(id)}>
              <option value="ARS">ARS — Pesos</option>
              <option value="USD">USD — Dólares</option>
            </select>
          </label>
          <label>Fecha del gasto *<input name="expenseDate" type="date" defaultValue={expense.expenseDate ? expense.expenseDate.slice(0, 10) : new Date().toISOString().slice(0, 10)} required /></label>
          <label>Vencimiento<input name="dueDate" type="date" defaultValue={expense.dueDate ? expense.dueDate.slice(0, 10) : ''} /></label>
          <label>Nro. factura/comprobante<input name="invoiceNumber" defaultValue={expense.invoiceNumber || ''} /></label>
          <label>Barrio (opcional)
            <select name="developmentId" defaultValue={String(expense.developmentId || '')}>
              <option value="">Sin barrio</option>
              {developments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </label>
          <label>Proveedor (opcional)
            <select name="supplierId" defaultValue={String(expense.supplierId || '')}>
              <option value="">Sin proveedor</option>
              {suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </label>
          <label>Obra (opcional)
            <select name="workProjectId" defaultValue={String(expense.workProjectId || '')}>
              <option value="">Sin obra</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </label>
          <label className="form-full">Notas<textarea name="notes" defaultValue={expense.notes || ''} rows={3} /></label>
        </div>
        <div className="form-actions">
          <Link to="/expenses" className="btn btn--secondary">Cancelar</Link>
          <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  );
}
