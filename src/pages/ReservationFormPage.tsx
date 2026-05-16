import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { buyersApi, developmentsApi, leadsApi, lotsApi, quotationsApi, reservationsApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { Buyer, Development, Lead, Lot, Quotation, Reservation } from '../types';
import { getId, numberValue, todayInputValue, toInputDate } from '../utils/format';

export function ReservationFormPage(): React.ReactElement {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [reservation, setReservation] = useState<Partial<Reservation>>({});
  const [developmentId, setDevelopmentId] = useState(searchParams.get('developmentId') || '');
  const [lotId, setLotId] = useState(searchParams.get('lotId') || '');
  const [leadId, setLeadId] = useState(searchParams.get('leadId') || '');
  const [buyerId, setBuyerId] = useState('');
  const [quotationId, setQuotationId] = useState(searchParams.get('quotationId') || '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const [devData, lotData, leadData, buyerData, quotationData, reservationData] = await Promise.all([
          developmentsApi.list(),
          lotsApi.list(),
          leadsApi.list(),
          buyersApi.list(),
          quotationsApi.list(),
          id ? reservationsApi.get(id) : Promise.resolve(null),
        ]);
        setDevelopments(devData.developments || []);
        setLots(lotData.lots || []);
        setLeads(leadData.leads || []);
        setBuyers(buyerData.buyers || []);
        setQuotations(quotationData.quotations || []);
        if (reservationData) {
          const item = reservationData.reservation;
          setReservation(item);
          setDevelopmentId(getId(item.developmentId));
          setLotId(getId(item.lotId));
          setLeadId(getId(item.leadId));
          setBuyerId(getId(item.buyerId));
          setQuotationId(getId(item.quotationId));
        } else if (leadId) {
          const lead = (leadData.leads || []).find((item) => item._id === leadId);
          if (lead) {
            setDevelopmentId(getId(lead.interestedDevelopmentId));
            setLotId(getId(lead.interestedLotId));
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el formulario.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id, leadId]);

  const selectedQuotation = useMemo(() => quotations.find((item) => item._id === quotationId), [quotations, quotationId]);
  const availableLots = lots.filter((lot) => getId(lot.developmentId) === developmentId && (lot.status === 'available' || lot._id === lotId));

  useEffect(() => {
    if (selectedQuotation && !id) {
      setLeadId(getId(selectedQuotation.leadId));
      setBuyerId(getId(selectedQuotation.buyerId));
      setDevelopmentId(getId(selectedQuotation.developmentId));
      setLotId(getId(selectedQuotation.lotId));
    }
  }, [selectedQuotation, id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!developmentId || !lotId || (!leadId && !buyerId)) {
      setError('Selecciona barrio, lote e interesado o comprador.');
      return;
    }
    const payload: Partial<Reservation> = {
      leadId: leadId || null,
      buyerId: buyerId || null,
      quotationId: quotationId || null,
      developmentId,
      lotId,
      reservationDate: String(form.get('reservationDate') || ''),
      expirationDate: String(form.get('expirationDate') || ''),
      reservationAmount: numberValue(form.get('reservationAmount')),
      currency: String(form.get('currency') || selectedQuotation?.currency || 'ARS'),
      notes: String(form.get('notes') || ''),
    };
    try {
      setSaving(true);
      if (id) await reservationsApi.update(id, payload);
      else {
        const created = await reservationsApi.create(payload);
        navigate(`/reservations/${created.reservation._id}`);
        return;
      }
      navigate(`/reservations/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la reserva.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title={id ? 'Editar reserva' : 'Nueva reserva'} action={<Link className="button button--ghost" to="/reservations">Volver</Link>} />
      <ErrorMessage message={error} />
      <form className="panel form-grid" onSubmit={(event) => { void handleSubmit(event); }}>
        <label>Interesado<select value={leadId} onChange={(event) => setLeadId(event.target.value)}><option value="">Sin interesado</option>{leads.map((lead) => <option key={lead._id} value={lead._id}>{lead.fullName || `${lead.firstName} ${lead.lastName}`}</option>)}</select></label>
        <label>Comprador<select value={buyerId} onChange={(event) => setBuyerId(event.target.value)}><option value="">Sin comprador</option>{buyers.map((buyer) => <option key={buyer._id} value={buyer._id}>{buyer.firstName} {buyer.lastName}</option>)}</select></label>
        <label>Cotizacion<select value={quotationId} onChange={(event) => setQuotationId(event.target.value)}><option value="">Sin cotizacion</option>{quotations.map((quotation) => <option key={quotation._id} value={quotation._id}>{quotation.quotationNumber}</option>)}</select></label>
        <label>Barrio<select value={developmentId} onChange={(event) => { setDevelopmentId(event.target.value); setLotId(''); }} required><option value="">Seleccionar</option>{developments.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
        <label>Lote<select value={lotId} onChange={(event) => setLotId(event.target.value)} required><option value="">Seleccionar</option>{availableLots.map((lot) => <option key={lot._id} value={lot._id}>Mz. {lot.block || '-'} - Lote {lot.lotNumber}</option>)}</select></label>
        <label>Fecha de reserva<input name="reservationDate" type="date" defaultValue={toInputDate(reservation.reservationDate) || todayInputValue()} /></label>
        <label>Vencimiento<input name="expirationDate" type="date" defaultValue={toInputDate(reservation.expirationDate)} required /></label>
        <label>Monto de sena<input name="reservationAmount" type="number" min="0" step="0.01" defaultValue={reservation.reservationAmount ?? selectedQuotation?.downPaymentAmount ?? 0} /></label>
        <label>Moneda<input name="currency" defaultValue={reservation.currency || selectedQuotation?.currency || 'ARS'} /></label>
        <label className="span-2">Notas<textarea name="notes" rows={4} defaultValue={reservation.notes || ''} /></label>
        <div className="form-actions span-2"><button className="button" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar reserva'}</button></div>
      </form>
    </>
  );
}
