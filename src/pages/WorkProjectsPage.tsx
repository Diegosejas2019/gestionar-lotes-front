import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { workProjectsApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Currency, WorkProject, WorkProjectStatus } from '../types';
import { workProjectStatusLabels } from '../utils/labels';

function statusTone(status: WorkProjectStatus): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  if (status === 'completed') return 'success';
  if (status === 'cancelled') return 'danger';
  if (status === 'in_progress') return 'info';
  if (status === 'paused') return 'warning';
  return 'neutral';
}

export function WorkProjectsPage(): React.ReactElement {
  const [projects, setProjects] = useState<WorkProject[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(): Promise<void> {
    try {
      setLoading(true);
      const data = await workProjectsApi.list();
      setProjects(data.workProjects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las obras.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function confirmDelete(): Promise<void> {
    if (!deleteId) return;
    try {
      await workProjectsApi.remove(deleteId);
      setDeleteId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la obra.');
      setDeleteId(null);
    }
  }

  function devName(project: WorkProject): string {
    if (typeof project.developmentId === 'object' && project.developmentId) {
      return (project.developmentId as { name: string }).name;
    }
    return '-';
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Obras"
        action={<Link to="/work-projects/new" className="btn btn--primary">+ Nueva obra</Link>}
      />
      {error && <ErrorMessage message={error} />}
      <DataTable
        columns={[
          { key: 'name', header: 'Obra', render: (p) => <Link to={`/work-projects/${p._id}`}><strong>{p.name}</strong></Link> },
          { key: 'dev', header: 'Barrio', render: (p) => devName(p) },
          { key: 'status', header: 'Estado', render: (p) => <StatusBadge label={workProjectStatusLabels[p.status] || p.status} tone={statusTone(p.status)} /> },
          { key: 'budget', header: 'Presupuesto', render: (p) => <CurrencyAmount amount={p.estimatedBudget} currency={p.currency as Currency} /> },
          {
            key: 'progress', header: 'Avance', render: (p) => (
              <div className="progress-cell">
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.progressPercentage}%` }} /></div>
                <span>{p.progressPercentage}%</span>
              </div>
            ),
          },
          { key: 'end', header: 'Fin estimado', render: (p) => <DateDisplay value={p.estimatedEndDate} /> },
          {
            key: 'actions', header: '', render: (p) => (
              <div className="table-actions">
                <Link to={`/work-projects/${p._id}`} className="btn btn--sm btn--secondary">Ver</Link>
                <Link to={`/work-projects/${p._id}/edit`} className="btn btn--sm btn--secondary">Editar</Link>
                {p.status === 'planned' && <button className="btn btn--sm btn--danger" onClick={() => setDeleteId(p._id)}>Eliminar</button>}
              </div>
            ),
          },
        ]}
        rows={projects}
        getRowKey={(p) => p._id}
        emptyTitle="No hay obras cargadas."
      />
      {deleteId && (
        <ConfirmDialog
          open
          title="Eliminar obra"
          message="¿Eliminar esta obra? Solo se puede eliminar si no tiene gastos asociados."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
          danger
        />
      )}
    </div>
  );
}
