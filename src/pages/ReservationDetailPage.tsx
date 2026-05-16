import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { documentsApi, reservationsApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { PaymentMethod, Reservation } from '../types';
import { asBuyer, asDevelopment, asLead, asLot, getId, lotLabel, partyName, toInputDate } from '../utils/format';
import { paymentMethodLabels, paymentMethods, reservationStatusLabels } from '../utils/labels';

export function ReservationDetailPage(): React.ReactElement {
  const { id } = useParams();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [expireOpen, setExpireOpen] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load(): Promise<void> {
    try {
      setLoading(true);
      const data = await reservationsApi.get(id!);
      setReservation(data.reservation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la reserva.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [id]);

  async function submitPayment(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      setSaving(true);
      await reservationsApi.registerPayment(id!, {
        amount: Number(form.get('amount') || reservation?.reservationAmount || 0),
        paymentDate: String(form.get('paymentDate') || ''),
        paymentMethod: String(form.get('paymentMethod') || 'other') as PaymentMethod,
        receiptNumber: String(form.get('receiptNumber') || ''),
      });
      setPaymentOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar la sena.');
    } finally {
      setSaving(false);
    }
  }

  async function cancelReservation(): Promise<void> {
    try {
      setSaving(true);
      await reservationsApi.cancel(id!, { reason: cancelReason });
      setCancelOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cancelar la reserva.');
    } finally {
      setSaving(false);
    }
  }

  async function expireReservation(): Promise<void> {
    try {
      setSaving(true);
      await reservationsApi.expire(id!);
      setExpireOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo marcar la reserva como vencida.');
    } finally {
      setSaving(false);
    }
  }

  async function convertToSale(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      setSaving(true);
      const result = await reservationsApi.convertToSale(id!, {
        totalPrice: Number(form.get('totalPrice') || 0),
        downPaymentAmount: Number(form.get('downPaymentAmount') || reservation?.reservationAmount || 0),
        installmentCount: Number(form.get('installmentCount') || 1),
        installmentAmount: Number(form.get('installmentAmount') || 0),
        firstDueDate: String(form.get('firstDueDate') || ''),
      });
      setSaleOpen(false);
      window.location.href = `/sales/${result.sale._id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo convertir la reserva en venta.');
    } finally {
      setSaving(false);
    }
  }

  async function openReceipt(): Promise<void> {
    const documentId = getId(reservation?.generatedDocumentId);
    if (!documentId) return;
    try {
      const data = await documentsApi.download(documentId, 'inline');
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo abrir el recibo.');
    }
  }

  if (loading) return <LoadingState />;
  if (!reservation) return <ErrorMessage message={error || 'Reserva no encontrada.'} />;

  const lead = asLead(reservation.leadId);
  const buyer = asBuyer(reservation.buyerId);
  const development = asDevelopment(reservation.developmentId);
  const lot = asLot(reservation.lotId);
  const canOperate = ['active', 'pending_payment', 'paid'].includes(reservation.status);

  return (
    <>
      <PageHeader title={`Reserva ${reservation.reservationNumber}`} description={`${partyName(lead, buyer)} - ${development?.name || 'Sin barrio'} - ${lotLabel(lot)}`} action={<Link className="button button--ghost" to="/reservations">Volver</Link>} />
      <ErrorMessage message={error} />
      <section className="summary-strip">
        <StatusBadge label={reservationStatusLabels[reservation.status]} tone={reservation.status === 'paid' || reservation.status === 'converted_to_sale' ? 'success' : reservation.status === 'cancelled' || reservation.status === 'expired' ? 'danger' : 'warning'} />
        <span>Vence: <DateDisplay value={reservation.expirationDate} /></span>
        <span>Sena: <CurrencyAmount amount={reservation.reservationAmount} currency={reservation.currency} /></span>
      </section>
      <section className="panel">
        <div className="section-title">
          <h2>Acciones</h2>
          <div className="row-actions">
            <Link className="button button--ghost" to={`/reservations/${reservation._id}/edit`}>Editar</Link>
            {canOperate && reservation.status !== 'paid' ? <button className="button" type="button" onClick={() => setPaymentOpen(true)}>Registrar sena</button> : null}
            {reservation.generatedDocumentId ? <button className="button button--ghost" type="button" onClick={() => { void openReceipt(); }}>Ver recibo</button> : null}
            {canOperate ? <button className="button" type="button" onClick={() => setSaleOpen(true)}>Convertir a venta</button> : null}
            {canOperate ? <button className="button button--ghost" type="button" onClick={() => setExpireOpen(true)}>Marcar vencida</button> : null}
            {canOperate ? <button className="button button--danger" type="button" onClick={() => setCancelOpen(true)}>Cancelar reserva</button> : null}
          </div>
        </div>
        <p>{reservation.notes || 'Sin notas.'}</p>
      </section>
      {paymentOpen ? <PaymentModal reservation={reservation} saving={saving} onSubmit={submitPayment} onClose={() => setPaymentOpen(false)} /> : null}
      {saleOpen ? <SaleModal reservation={reservation} saving={saving} onSubmit={convertToSale} onClose={() => setSaleOpen(false)} /> : null}
      <ConfirmDialog open={cancelOpen} title="Cancelar reserva" message="La reserva se cancelara y el lote volvera a estar disponible si no existe una venta asociada." danger confirmLabel={saving ? 'Cancelando...' : 'Cancelar reserva'} onConfirm={() => { void cancelReservation(); }} onCancel={() => setCancelOpen(false)} />
      <ConfirmDialog open={expireOpen} title="Marcar reserva vencida" message="La reserva quedara vencida y el lote volvera a estar disponible." danger confirmLabel={saving ? 'Marcando...' : 'Marcar vencida'} onConfirm={() => { void expireReservation(); }} onCancel={() => setExpireOpen(false)} />
      {cancelOpen ? <div className="floating-reason"><label>Motivo<input value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} /></label></div> : null}
    </>
  );
}

function PaymentModal({ reservation, saving, onSubmit, onClose }: { reservation: Reservation; saving: boolean; onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>; onClose: () => void }): React.ReactElement {
  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal" role="dialog" aria-modal="true" onSubmit={(event) => { void onSubmit(event); }}>
        <h2>Registrar sena</h2>
        <label>Monto<input name="amount" type="number" min="0.01" step="0.01" defaultValue={reservation.reservationAmount || 0} required /></label>
        <label>Fecha<input name="paymentDate" type="date" defaultValue={toInputDate(reservation.paymentDate) || new Date().toISOString().slice(0, 10)} required /></label>
        <label>Metodo<select name="paymentMethod" defaultValue="transfer">{paymentMethods.map((method) => <option key={method} value={method}>{paymentMethodLabels[method]}</option>)}</select></label>
        <label>Nro recibo<input name="receiptNumber" defaultValue={reservation.receiptNumber || ''} /></label>
        <div className="modal-actions"><button type="button" className="button button--ghost" onClick={onClose}>Cerrar</button><button className="button" type="submit" disabled={saving}>{saving ? 'Registrando...' : 'Registrar'}</button></div>
      </form>
    </div>
  );
}

function SaleModal({ reservation, saving, onSubmit, onClose }: { reservation: Reservation; saving: boolean; onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>; onClose: () => void }): React.ReactElement {
  const defaultTotal = reservation.reservationAmount || 0;
  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal" role="dialog" aria-modal="true" onSubmit={(event) => { void onSubmit(event); }}>
        <h2>Convertir a venta</h2>
        <label>Precio total<input name="totalPrice" type="number" min="0" step="0.01" defaultValue={defaultTotal} required /></label>
        <label>Anticipo<input name="downPaymentAmount" type="number" min="0" step="0.01" defaultValue={reservation.status === 'paid' ? reservation.reservationAmount : 0} /></label>
        <label>Cantidad de cuotas<input name="installmentCount" type="number" min="0" defaultValue={1} /></label>
        <label>Monto de cuota<input name="installmentAmount" type="number" min="0" step="0.01" defaultValue={0} /></label>
        <label>Primer vencimiento<input name="firstDueDate" type="date" /></label>
        <div className="modal-actions"><button type="button" className="button button--ghost" onClick={onClose}>Cerrar</button><button className="button" type="submit" disabled={saving}>{saving ? 'Convirtiendo...' : 'Crear venta'}</button></div>
      </form>
    </div>
  );
}
