import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { developmentsApi, leadsApi, lotsApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { Development, Lead, LeadSource, LeadStatus, Lot } from '../types';
import { getId, numberValue, toInputDate } from '../utils/format';
import { leadSourceLabels, leadSources, leadStatusLabels, leadStatuses } from '../utils/labels';

export function LeadFormPage(): React.ReactElement {
  const { id } = useParams();
  const navigate = useNavigate();
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [lead, setLead] = useState<Partial<Lead>>({ source: 'other', status: 'new' });
  const [developmentId, setDevelopmentId] = useState('');
  const [lotId, setLotId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const [devData, lotData, leadData] = await Promise.all([
          developmentsApi.list(),
          lotsApi.list(),
          id ? leadsApi.get(id) : Promise.resolve(null),
        ]);
        setDevelopments(devData.developments || []);
        setLots(lotData.lots || []);
        if (leadData) {
          setLead(leadData.lead);
          setDevelopmentId(getId(leadData.lead.interestedDevelopmentId));
          setLotId(getId(leadData.lead.interestedLotId));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el formulario.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  const availableLots = lots.filter((lot) => getId(lot.developmentId) === developmentId);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!developmentId) {
      setError('Selecciona un barrio de interes.');
      return;
    }
    const payload: Partial<Lead> = {
      firstName: String(form.get('firstName') || ''),
      lastName: String(form.get('lastName') || ''),
      documentType: String(form.get('documentType') || 'DNI'),
      documentNumber: String(form.get('documentNumber') || ''),
      email: String(form.get('email') || ''),
      phone: String(form.get('phone') || ''),
      alternativePhone: String(form.get('alternativePhone') || ''),
      source: String(form.get('source') || 'other') as LeadSource,
      status: String(form.get('status') || 'new') as LeadStatus,
      interestedDevelopmentId: developmentId,
      interestedLotId: lotId || null,
      budgetAmount: numberValue(form.get('budgetAmount')),
      budgetCurrency: String(form.get('budgetCurrency') || 'ARS'),
      preferredInstallments: numberValue(form.get('preferredInstallments')),
      nextFollowUpDate: String(form.get('nextFollowUpDate') || ''),
      notes: String(form.get('notes') || ''),
    };
    try {
      setSaving(true);
      setError('');
      if (id) await leadsApi.update(id, payload);
      else {
        const created = await leadsApi.create(payload);
        navigate(`/leads/${created.lead._id}`);
        return;
      }
      navigate(`/leads/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el interesado.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title={id ? 'Editar interesado' : 'Nuevo interesado'} action={<Link className="button button--ghost" to="/leads">Volver</Link>} />
      <ErrorMessage message={error} />
      <form className="panel form-grid" onSubmit={(event) => { void handleSubmit(event); }}>
        <label>Nombre<input name="firstName" defaultValue={lead.firstName || ''} required /></label>
        <label>Apellido<input name="lastName" defaultValue={lead.lastName || ''} required /></label>
        <label>Tipo documento<input name="documentType" defaultValue={lead.documentType || 'DNI'} /></label>
        <label>Documento<input name="documentNumber" defaultValue={lead.documentNumber || ''} /></label>
        <label>Email<input name="email" type="email" defaultValue={lead.email || ''} /></label>
        <label>Telefono<input name="phone" defaultValue={lead.phone || ''} required /></label>
        <label>Telefono alternativo<input name="alternativePhone" defaultValue={lead.alternativePhone || ''} /></label>
        <label>Origen<select name="source" defaultValue={lead.source || 'other'}>{leadSources.map((source) => <option key={source} value={source}>{leadSourceLabels[source]}</option>)}</select></label>
        <label>Estado<select name="status" defaultValue={lead.status || 'new'}>{leadStatuses.map((status) => <option key={status} value={status}>{leadStatusLabels[status]}</option>)}</select></label>
        <label>Barrio de interes<select value={developmentId} onChange={(event) => { setDevelopmentId(event.target.value); setLotId(''); }} required><option value="">Seleccionar</option>{developments.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
        <label>Lote de interes<select value={lotId} onChange={(event) => setLotId(event.target.value)}><option value="">Sin lote especifico</option>{availableLots.map((lot) => <option key={lot._id} value={lot._id}>Mz. {lot.block || '-'} - Lote {lot.lotNumber}</option>)}</select></label>
        <label>Presupuesto<input name="budgetAmount" type="number" min="0" step="0.01" defaultValue={lead.budgetAmount || 0} /></label>
        <label>Moneda<input name="budgetCurrency" defaultValue={lead.budgetCurrency || 'ARS'} /></label>
        <label>Cantidad de cuotas preferidas<input name="preferredInstallments" type="number" min="0" defaultValue={lead.preferredInstallments || 0} /></label>
        <label>Proximo seguimiento<input name="nextFollowUpDate" type="date" defaultValue={toInputDate(lead.nextFollowUpDate)} /></label>
        <label className="span-2">Notas<textarea name="notes" rows={4} defaultValue={lead.notes || ''} /></label>
        <div className="form-actions span-2"><button className="button" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar interesado'}</button></div>
      </form>
    </>
  );
}
