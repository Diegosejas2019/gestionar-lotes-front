import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { developmentsApi, lotsApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { Development, Lot, LotStatus } from '../types';
import { lotStatusLabels, lotStatuses, serviceLabels, services } from '../utils/labels';
import { getId, numberValue } from '../utils/format';

export function LotFormPage(): React.ReactElement {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lot, setLot] = useState<Partial<Lot>>({ status: 'available', currency: 'ARS', services: [] });
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const [devData, lotData] = await Promise.all([
          developmentsApi.list(),
          id ? lotsApi.get(id) : Promise.resolve(null),
        ]);
        setDevelopments(devData.developments || []);
        if (lotData) setLot(lotData.lot);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el formulario.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const selectedServices = form.getAll('services').map(String);
    const payload = {
      developmentId: String(form.get('developmentId') || ''),
      lotNumber: String(form.get('lotNumber') || ''),
      block: String(form.get('block') || ''),
      surface: numberValue(form.get('surface')),
      frontMeasure: numberValue(form.get('frontMeasure')),
      depthMeasure: numberValue(form.get('depthMeasure')),
      price: numberValue(form.get('price')),
      currency: String(form.get('currency') || 'ARS').toUpperCase(),
      services: selectedServices,
      notes: String(form.get('notes') || ''),
      status: String(form.get('status') || 'available') as LotStatus,
    };
    if (!payload.developmentId || !payload.lotNumber || payload.price < 0) {
      setError('Completá barrio, número de lote y precio válido.');
      return;
    }
    try {
      setSaving(true);
      if (id) await lotsApi.update(id, payload);
      else await lotsApi.create(payload);
      navigate('/lots');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el lote.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title={id ? 'Editar lote' : 'Nuevo lote'} action={<Link className="button button--ghost" to="/lots">Volver</Link>} />
      <ErrorMessage message={error} />
      <form className="form-grid panel" onSubmit={(event) => { void handleSubmit(event); }}>
        <label>Barrio<select name="developmentId" defaultValue={getId(lot.developmentId)} required><option value="">Seleccionar</option>{developments.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
        <label>Lote<input name="lotNumber" defaultValue={lot.lotNumber || ''} required /></label>
        <label>Manzana<input name="block" defaultValue={lot.block || ''} /></label>
        <label>Superficie<input name="surface" type="number" min="0" step="0.01" defaultValue={lot.surface || 0} /></label>
        <label>Frente<input name="frontMeasure" type="number" min="0" step="0.01" defaultValue={lot.frontMeasure || 0} /></label>
        <label>Fondo<input name="depthMeasure" type="number" min="0" step="0.01" defaultValue={lot.depthMeasure || 0} /></label>
        <label>Precio<input name="price" type="number" min="0" step="0.01" defaultValue={lot.price || 0} required /></label>
        <label>Moneda<input name="currency" defaultValue={lot.currency || 'ARS'} /></label>
        <label>Estado<select name="status" defaultValue={lot.status || 'available'}>{lotStatuses.map((status) => <option key={status} value={status}>{lotStatusLabels[status]}</option>)}</select></label>
        <fieldset className="span-2 check-grid">
          <legend>Servicios</legend>
          {services.map((service) => <label key={service}><input type="checkbox" name="services" value={service} defaultChecked={(lot.services || []).includes(service)} />{serviceLabels[service]}</label>)}
        </fieldset>
        <label className="span-2">Notas<textarea name="notes" defaultValue={lot.notes || ''} rows={4} /></label>
        <div className="form-actions span-2"><button className="button" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button></div>
      </form>
    </>
  );
}
