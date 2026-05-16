import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { developmentsApi, workProjectsApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { Currency, Development, WorkProject, WorkProjectStatus } from '../types';
import { workProjectStatusLabels } from '../utils/labels';

export function WorkProjectFormPage(): React.ReactElement {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Partial<WorkProject>>({ status: 'planned', currency: 'ARS', progressPercentage: 0 });
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const [devData, projData] = await Promise.all([
          developmentsApi.list(),
          id ? workProjectsApi.get(id) : Promise.resolve(null),
        ]);
        setDevelopments(devData.developments || []);
        if (projData) setProject(projData.workProject);
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
      developmentId: String(form.get('developmentId') || ''),
      name: String(form.get('name') || ''),
      description: String(form.get('description') || ''),
      status: String(form.get('status') || 'planned') as WorkProjectStatus,
      startDate: String(form.get('startDate') || '') || null,
      estimatedEndDate: String(form.get('estimatedEndDate') || '') || null,
      estimatedBudget: Number(form.get('estimatedBudget') || 0),
      currency: String(form.get('currency') || 'ARS') as Currency,
      progressPercentage: Number(form.get('progressPercentage') || 0),
      notes: String(form.get('notes') || ''),
    };
    if (!payload.developmentId) { setError('El barrio/desarrollo es obligatorio.'); return; }
    if (!payload.name) { setError('El nombre de la obra es obligatorio.'); return; }
    if (payload.estimatedBudget <= 0) { setError('El presupuesto estimado debe ser mayor a cero.'); return; }
    try {
      setSaving(true);
      if (id) await workProjectsApi.update(id, payload);
      else await workProjectsApi.create(payload);
      navigate('/work-projects');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la obra.');
    } finally {
      setSaving(false);
    }
  }

  const devId = project.developmentId ? (typeof project.developmentId === 'object' ? (project.developmentId as { _id: string })._id : String(project.developmentId)) : '';

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title={id ? 'Editar obra' : 'Nueva obra'} />
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-grid">
          <label>Barrio *
            <select name="developmentId" defaultValue={devId} required>
              <option value="">Seleccionar barrio...</option>
              {developments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </label>
          <label>Nombre de la obra *<input name="name" defaultValue={project.name || ''} required /></label>
          <label className="form-full">Descripción<textarea name="description" defaultValue={project.description || ''} rows={2} /></label>
          <label>Estado
            <select name="status" defaultValue={project.status || 'planned'}>
              {(Object.entries(workProjectStatusLabels) as [string, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label>Presupuesto estimado *<input name="estimatedBudget" type="number" min="0.01" step="0.01" defaultValue={project.estimatedBudget || ''} required /></label>
          <label>Moneda *
            <select name="currency" defaultValue={project.currency || 'ARS'} disabled={Boolean(id)}>
              <option value="ARS">ARS — Pesos</option>
              <option value="USD">USD — Dólares</option>
            </select>
          </label>
          <label>Fecha de inicio<input name="startDate" type="date" defaultValue={project.startDate ? project.startDate.slice(0, 10) : ''} /></label>
          <label>Fecha estimada de fin<input name="estimatedEndDate" type="date" defaultValue={project.estimatedEndDate ? project.estimatedEndDate.slice(0, 10) : ''} /></label>
          <label>Avance actual (%)
            <input name="progressPercentage" type="range" min="0" max="100" defaultValue={project.progressPercentage ?? 0} />
            <small>{project.progressPercentage ?? 0}%</small>
          </label>
          <label className="form-full">Notas<textarea name="notes" defaultValue={project.notes || ''} rows={3} /></label>
        </div>
        <div className="form-actions">
          <Link to="/work-projects" className="btn btn--secondary">Cancelar</Link>
          <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  );
}
