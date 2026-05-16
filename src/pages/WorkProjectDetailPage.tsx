import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { expensesApi, workProjectsApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Currency, Expense, ExpenseStatus, WorkProgressLog, WorkProject, WorkProjectStatus } from '../types';
import { expenseCategoryLabels, expenseStatusLabels, workProjectStatusLabels } from '../utils/labels';

function projectStatusTone(status: WorkProjectStatus): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  if (status === 'completed') return 'success';
  if (status === 'cancelled') return 'danger';
  if (status === 'in_progress') return 'info';
  if (status === 'paused') return 'warning';
  return 'neutral';
}

function expenseStatusTone(status: ExpenseStatus): 'success' | 'danger' | 'warning' | 'neutral' {
  if (status === 'paid') return 'success';
  if (status === 'cancelled') return 'danger';
  return 'warning';
}

export function WorkProjectDetailPage(): React.ReactElement {
  const { id } = useParams();
  const [project, setProject] = useState<WorkProject | null>(null);
  const [logs, setLogs] = useState<WorkProgressLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progressDialog, setProgressDialog] = useState(false);
  const [progressForm, setProgressForm] = useState({ newProgress: 0, description: '', progressDate: new Date().toISOString().slice(0, 10) });

  async function load(): Promise<void> {
    try {
      const [projData, logsData, expData] = await Promise.all([
        workProjectsApi.get(id!),
        workProjectsApi.progressLogs(id!),
        workProjectsApi.expenses(id!),
      ]);
      setProject(projData.workProject);
      setLogs(logsData.progressLogs || []);
      setExpenses(expData.expenses || []);
      setProgressForm((p) => ({ ...p, newProgress: projData.workProject.progressPercentage }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la obra.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [id]);

  async function doUpdateProgress(): Promise<void> {
    try {
      await workProjectsApi.updateProgress(id!, progressForm);
      setProgressDialog(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el avance.');
    }
  }

  if (loading) return <LoadingState />;
  if (!project) return <ErrorMessage message={error || 'Obra no encontrada.'} />;

  const devName = typeof project.developmentId === 'object' ? (project.developmentId as { name: string }).name : String(project.developmentId);
  const totalSpent = expenses.filter((e) => e.status === 'paid').reduce((acc, e) => acc + e.amount, 0);

  return (
    <div>
      <PageHeader title={project.name} action={<Link to="/work-projects" className="btn btn--secondary">← Volver</Link>} />
      {error && <ErrorMessage message={error} />}

      <div className="detail-card">
        <div className="detail-row"><span>Barrio</span><strong>{devName}</strong></div>
        <div className="detail-row"><span>Estado</span><StatusBadge label={workProjectStatusLabels[project.status] || project.status} tone={projectStatusTone(project.status)} /></div>
        {project.startDate && <div className="detail-row"><span>Inicio</span><strong><DateDisplay value={project.startDate} /></strong></div>}
        {project.estimatedEndDate && <div className="detail-row"><span>Fin estimado</span><strong><DateDisplay value={project.estimatedEndDate} /></strong></div>}
        {project.actualEndDate && <div className="detail-row"><span>Fin real</span><strong><DateDisplay value={project.actualEndDate} /></strong></div>}
        <div className="detail-row"><span>Presupuesto</span><strong><CurrencyAmount amount={project.estimatedBudget} currency={project.currency as Currency} /></strong></div>
        <div className="detail-row"><span>Gastado</span><strong><CurrencyAmount amount={totalSpent} currency={project.currency as Currency} /></strong></div>
        <div className="detail-row"><span>Saldo estimado</span><strong><CurrencyAmount amount={project.estimatedBudget - totalSpent} currency={project.currency as Currency} /></strong></div>
        <div className="detail-row">
          <span>Avance</span>
          <div className="progress-cell">
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${project.progressPercentage}%` }} /></div>
            <strong>{project.progressPercentage}%</strong>
          </div>
        </div>
        {project.notes && <div className="detail-row"><span>Notas</span><strong>{project.notes}</strong></div>}
      </div>

      <div className="detail-actions">
        <Link to={`/work-projects/${id}/edit`} className="btn btn--secondary">Editar</Link>
        <button className="btn btn--primary" onClick={() => setProgressDialog(true)}>Actualizar avance</button>
        <Link to={`/expenses/new?workProjectId=${id}`} className="btn btn--secondary">Agregar gasto</Link>
      </div>

      <h3>Gastos asociados</h3>
      <DataTable
        columns={[
          { key: 'number', header: 'Número', render: (e) => <Link to={`/expenses/${e._id}`}>{e.expenseNumber}</Link> },
          { key: 'date', header: 'Fecha', render: (e) => <DateDisplay value={e.expenseDate} /> },
          { key: 'category', header: 'Categoría', render: (e) => expenseCategoryLabels[e.category] || e.category },
          { key: 'concept', header: 'Concepto', render: (e) => e.concept },
          { key: 'amount', header: 'Monto', render: (e) => <CurrencyAmount amount={e.amount} currency={e.currency as Currency} /> },
          { key: 'status', header: 'Estado', render: (e) => <StatusBadge label={expenseStatusLabels[e.status] || e.status} tone={expenseStatusTone(e.status)} /> },
        ]}
        rows={expenses}
        getRowKey={(e) => e._id}
        emptyTitle="Sin gastos asociados a esta obra."
      />

      <h3>Historial de avance</h3>
      <DataTable
        columns={[
          { key: 'date', header: 'Fecha', render: (l) => <DateDisplay value={l.progressDate} /> },
          { key: 'from', header: 'Anterior', render: (l) => `${l.previousProgress}%` },
          { key: 'to', header: 'Nuevo', render: (l) => `${l.newProgress}%` },
          { key: 'description', header: 'Descripción', render: (l) => l.description || '-' },
        ]}
        rows={logs}
        getRowKey={(l) => l._id}
        emptyTitle="Sin historial de avance."
      />

      {progressDialog && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Actualizar avance de obra</h3>
            <div className="form-grid">
              <label>Nuevo avance (%)
                <input type="range" min="0" max="100" value={progressForm.newProgress} onChange={(e) => setProgressForm((p) => ({ ...p, newProgress: Number(e.target.value) }))} />
                <strong>{progressForm.newProgress}%</strong>
              </label>
              <label>Fecha<input type="date" value={progressForm.progressDate} onChange={(e) => setProgressForm((p) => ({ ...p, progressDate: e.target.value }))} /></label>
              <label className="form-full">Descripción<textarea rows={2} value={progressForm.description} onChange={(e) => setProgressForm((p) => ({ ...p, description: e.target.value }))} /></label>
            </div>
            <div className="form-actions">
              <button className="btn btn--secondary" onClick={() => setProgressDialog(false)}>Cancelar</button>
              <button className="btn btn--primary" onClick={doUpdateProgress}>Guardar avance</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
