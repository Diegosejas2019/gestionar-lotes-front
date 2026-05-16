import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { developmentsApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { Development, DevelopmentStatus } from '../types';
import { developmentStatusLabels, developmentStatuses } from '../utils/labels';
import { numberValue } from '../utils/format';

export function DevelopmentFormPage(): React.ReactElement {
  const { id } = useParams();
  const navigate = useNavigate();
  const [development, setDevelopment] = useState<Partial<Development>>({ status: 'draft', defaultCurrency: 'ARS' });
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    async function load(): Promise<void> {
      try {
        const data = await developmentsApi.get(id!);
        setDevelopment(data.development);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el barrio.');
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
      name: String(form.get('name') || ''),
      description: String(form.get('description') || ''),
      location: String(form.get('location') || ''),
      totalLots: numberValue(form.get('totalLots')),
      defaultCurrency: String(form.get('defaultCurrency') || 'ARS').toUpperCase(),
      status: String(form.get('status') || 'draft') as DevelopmentStatus,
    };
    if (!payload.name.trim()) {
      setError('El nombre del barrio es obligatorio.');
      return;
    }
    try {
      setSaving(true);
      if (id) await developmentsApi.update(id, payload);
      else await developmentsApi.create(payload);
      navigate('/developments');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el barrio.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title={id ? 'Editar barrio' : 'Nuevo barrio'} action={<Link className="button button--ghost" to="/developments">Volver</Link>} />
      <ErrorMessage message={error} />
      <form className="form-grid panel" onSubmit={(event) => { void handleSubmit(event); }}>
        <label>Nombre<input name="name" defaultValue={development.name || ''} required /></label>
        <label>Ubicación<input name="location" defaultValue={development.location || ''} /></label>
        <label>Lotes totales<input name="totalLots" type="number" min="0" defaultValue={development.totalLots || 0} /></label>
        <label>Moneda por defecto<input name="defaultCurrency" defaultValue={development.defaultCurrency || 'ARS'} /></label>
        <label>Estado<select name="status" defaultValue={development.status || 'draft'}>{developmentStatuses.map((status) => <option key={status} value={status}>{developmentStatusLabels[status]}</option>)}</select></label>
        <label className="span-2">Descripción<textarea name="description" defaultValue={development.description || ''} rows={4} /></label>
        <div className="form-actions span-2">
          <button className="button" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </>
  );
}
