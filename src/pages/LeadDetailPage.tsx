import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { leadActivitiesApi, leadsApi, quotationsApi, reservationsApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Lead, LeadActivity, LeadActivityType, Quotation, Reservation } from '../types';
import { asDevelopment, asLot, leadName, lotLabel, partyName } from '../utils/format';
import { leadActivityTypeLabels, leadActivityTypes, leadSourceLabels, leadStatusLabels, quotationStatusLabels, reservationStatusLabels } from '../utils/labels';

export function LeadDetailPage(): React.ReactElement {
  const { id } = useParams();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activityOpen, setActivityOpen] = useState(false);
  const [lostOpen, setLostOpen] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load(): Promise<void> {
    try {
      setLoading(true);
      const params = new URLSearchParams({ leadId: id! });
      const [leadData, activityData, quotationData, reservationData] = await Promise.all([
        leadsApi.get(id!),
        leadActivitiesApi.list(id!),
        quotationsApi.list(params),
        reservationsApi.list(params),
      ]);
      setLead(leadData.lead);
      setActivities(activityData.activities || []);
      setQuotations(quotationData.quotations || []);
      setReservations(reservationData.reservations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el interesado.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [id]);

  async function submitActivity(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      setSaving(true);
      await leadActivitiesApi.create(id!, {
        type: String(form.get('type') || 'note') as LeadActivityType,
        title: String(form.get('title') || 'Actividad comercial'),
        description: String(form.get('description') || ''),
        nextFollowUpDate: String(form.get('nextFollowUpDate') || ''),
      });
      setActivityOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar la actividad.');
    } finally {
      setSaving(false);
    }
  }

  async function markLost(): Promise<void> {
    try {
      setSaving(true);
      await leadsApi.markLost(id!, { lostReason });
      setLostOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo marcar el interesado como perdido.');
    } finally {
      setSaving(false);
    }
  }

  async function convertToBuyer(): Promise<void> {
    try {
      setSaving(true);
      await leadsApi.convertToBuyer(id!);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo convertir el interesado a comprador.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;
  if (!lead) return <ErrorMessage message={error || 'Interesado no encontrado.'} />;

  return (
    <>
      <PageHeader title={leadName(lead)} description={`${leadSourceLabels[lead.source]} - ${asDevelopment(lead.interestedDevelopmentId)?.name || 'Sin barrio'}`} action={<Link className="button button--ghost" to="/leads">Volver</Link>} />
      <ErrorMessage message={error} />
      <section className="summary-strip">
        <StatusBadge label={leadStatusLabels[lead.status]} tone={lead.status === 'converted' ? 'success' : lead.status === 'lost' ? 'danger' : 'info'} />
        <span>{lead.phone || 'Sin telefono'}</span>
        <span>{lead.email || 'Sin email'}</span>
        <span>{lotLabel(asLot(lead.interestedLotId))}</span>
      </section>
      <section className="panel">
        <div className="section-title">
          <h2>Acciones comerciales</h2>
          <div className="row-actions">
            <button className="button" type="button" onClick={() => setActivityOpen(true)}>Agregar actividad</button>
            <Link className="button" to={`/quotations/new?leadId=${lead._id}`}>Crear cotizacion</Link>
            <Link className="button" to={`/reservations/new?leadId=${lead._id}`}>Crear reserva</Link>
            <button className="button button--ghost" type="button" disabled={saving || lead.status === 'converted'} onClick={() => { void convertToBuyer(); }}>Convertir a comprador</button>
            <button className="button button--danger" type="button" disabled={lead.status === 'lost'} onClick={() => setLostOpen(true)}>Marcar perdido</button>
          </div>
        </div>
        <p>{lead.notes || 'Sin notas.'}</p>
      </section>
      <section className="panel">
        <h2>Actividades</h2>
        <DataTable
          rows={activities}
          getRowKey={(item) => item._id}
          emptyTitle="No hay actividades registradas."
          columns={[
            { key: 'date', header: 'Fecha', render: (item) => <DateDisplay value={item.activityDate} /> },
            { key: 'type', header: 'Tipo', render: (item) => leadActivityTypeLabels[item.type] },
            { key: 'title', header: 'Titulo', render: (item) => item.title },
            { key: 'description', header: 'Descripcion', render: (item) => item.description || '-' },
            { key: 'next', header: 'Proximo seguimiento', render: (item) => <DateDisplay value={item.nextFollowUpDate} /> },
          ]}
        />
      </section>
      <section className="two-column">
        <article className="panel">
          <h2>Cotizaciones</h2>
          <DataTable rows={quotations} getRowKey={(item) => item._id} emptyTitle="No hay cotizaciones." columns={[
            { key: 'number', header: 'Numero', render: (item) => <Link to={`/quotations/${item._id}`}>{item.quotationNumber}</Link> },
            { key: 'status', header: 'Estado', render: (item) => <StatusBadge label={quotationStatusLabels[item.status]} /> },
          ]} />
        </article>
        <article className="panel">
          <h2>Reservas</h2>
          <DataTable rows={reservations} getRowKey={(item) => item._id} emptyTitle="No hay reservas." columns={[
            { key: 'number', header: 'Numero', render: (item) => <Link to={`/reservations/${item._id}`}>{item.reservationNumber}</Link> },
            { key: 'party', header: 'Interesado/comprador', render: (item) => partyName(lead, null) },
            { key: 'status', header: 'Estado', render: (item) => <StatusBadge label={reservationStatusLabels[item.status]} /> },
          ]} />
        </article>
      </section>
      {activityOpen ? <ActivityModal saving={saving} onSubmit={submitActivity} onClose={() => setActivityOpen(false)} /> : null}
      <ConfirmDialog open={lostOpen} title="Marcar como perdido" message="El interesado quedara marcado como perdido y se registrara la actividad comercial." danger confirmLabel={saving ? 'Guardando...' : 'Marcar perdido'} onConfirm={() => { void markLost(); }} onCancel={() => setLostOpen(false)} />
      {lostOpen ? <div className="floating-reason"><label>Motivo<input value={lostReason} onChange={(event) => setLostReason(event.target.value)} /></label></div> : null}
    </>
  );
}

function ActivityModal({ saving, onSubmit, onClose }: { saving: boolean; onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>; onClose: () => void }): React.ReactElement {
  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal" role="dialog" aria-modal="true" onSubmit={(event) => { void onSubmit(event); }}>
        <h2>Agregar actividad</h2>
        <label>Tipo<select name="type" defaultValue="note">{leadActivityTypes.map((type) => <option key={type} value={type}>{leadActivityTypeLabels[type]}</option>)}</select></label>
        <label>Titulo<input name="title" required /></label>
        <label>Descripcion<textarea name="description" rows={3} /></label>
        <label>Proximo seguimiento<input name="nextFollowUpDate" type="date" /></label>
        <div className="modal-actions"><button type="button" className="button button--ghost" onClick={onClose}>Cerrar</button><button className="button" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button></div>
      </form>
    </div>
  );
}
