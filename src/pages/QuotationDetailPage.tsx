import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { documentsApi, quotationsApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Quotation } from '../types';
import { asBuyer, asDevelopment, asLead, asLot, getId, lotLabel, partyName, toInputDate } from '../utils/format';
import { quotationStatusLabels } from '../utils/labels';

export function QuotationDetailPage(): React.ReactElement {
  const { id } = useParams();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  async function load(): Promise<void> {
    try {
      setLoading(true);
      const data = await quotationsApi.get(id!);
      setQuotation(data.quotation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la cotizacion.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [id]);

  async function generatePdf(): Promise<void> {
    try {
      setActionLoading('pdf');
      const result = await quotationsApi.generatePdf(id!);
      setQuotation(result.quotation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar el PDF.');
    } finally {
      setActionLoading('');
    }
  }

  async function openDocument(): Promise<void> {
    const docId = getId(quotation?.generatedDocumentId);
    if (!docId) return;
    try {
      setActionLoading('download');
      const data = await documentsApi.download(docId, 'inline');
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo abrir el PDF.');
    } finally {
      setActionLoading('');
    }
  }

  async function submitReservation(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      setSaving(true);
      const result = await quotationsApi.convertToReservation(id!, {
        reservationAmount: Number(form.get('reservationAmount') || quotation?.downPaymentAmount || 0),
        expirationDate: String(form.get('expirationDate') || ''),
        notes: String(form.get('notes') || ''),
      });
      setReservationOpen(false);
      window.location.href = `/reservations/${result.reservation._id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo convertir a reserva.');
    } finally {
      setSaving(false);
    }
  }

  async function submitSale(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      setSaving(true);
      const result = await quotationsApi.convertToSale(id!, {
        reservationAmount: Number(form.get('reservationAmount') || quotation?.downPaymentAmount || 0),
        expirationDate: String(form.get('expirationDate') || ''),
        markReservationAsPaid: Boolean(form.get('markReservationAsPaid')),
        paymentMethod: String(form.get('paymentMethod') || 'other'),
        firstDueDate: String(form.get('firstDueDate') || quotation?.firstDueDate || ''),
      });
      setSaleOpen(false);
      window.location.href = `/sales/${result.sale._id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo convertir a venta.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;
  if (!quotation) return <ErrorMessage message={error || 'Cotizacion no encontrada.'} />;

  const development = asDevelopment(quotation.developmentId);
  const lot = asLot(quotation.lotId);
  const lead = asLead(quotation.leadId);
  const buyer = asBuyer(quotation.buyerId);
  const validExpired = new Date(quotation.validUntil) < new Date();

  return (
    <>
      <PageHeader title={`Cotizacion ${quotation.quotationNumber}`} description={`${partyName(lead, buyer)} - ${development?.name || 'Sin barrio'} - ${lotLabel(lot)}`} action={<Link className="button button--ghost" to="/quotations">Volver</Link>} />
      <ErrorMessage message={error} />
      <section className="summary-strip">
        <StatusBadge label={quotationStatusLabels[quotation.status]} tone={quotation.status.includes('converted') ? 'success' : quotation.status === 'rejected' || quotation.status === 'expired' ? 'danger' : 'info'} />
        <span>Valida hasta: <DateDisplay value={quotation.validUntil} /></span>
        {validExpired ? <StatusBadge label="Validez vencida" tone="danger" /> : null}
      </section>
      <section className="metric-grid metric-grid--small">
        <article className="metric-card"><span>Precio de lista</span><strong><CurrencyAmount amount={quotation.totalPrice} currency={quotation.currency} /></strong></article>
        <article className="metric-card"><span>Precio final</span><strong><CurrencyAmount amount={quotation.finalPrice} currency={quotation.currency} /></strong></article>
        <article className="metric-card"><span>Anticipo</span><strong><CurrencyAmount amount={quotation.downPaymentAmount} currency={quotation.currency} /></strong></article>
        <article className="metric-card"><span>Cuotas</span><strong>{quotation.installmentCount} x <CurrencyAmount amount={quotation.installmentAmount} currency={quotation.currency} /></strong></article>
      </section>
      <section className="panel">
        <div className="section-title">
          <h2>Acciones</h2>
          <div className="row-actions">
            <Link className="button button--ghost" to={`/quotations/${quotation._id}/edit`}>Editar</Link>
            <button className="button" type="button" disabled={actionLoading === 'pdf'} onClick={() => { void generatePdf(); }}>{actionLoading === 'pdf' ? 'Generando...' : 'Generar PDF'}</button>
            {quotation.generatedDocumentId ? <button className="button button--ghost" type="button" disabled={actionLoading === 'download'} onClick={() => { void openDocument(); }}>Ver PDF</button> : null}
            <button className="button" type="button" onClick={() => setReservationOpen(true)}>Convertir a reserva</button>
            <button className="button" type="button" onClick={() => setSaleOpen(true)}>Convertir a venta</button>
          </div>
        </div>
        <p>{quotation.notes || 'Sin observaciones.'}</p>
      </section>
      {reservationOpen ? <ReservationFromQuotationModal quotation={quotation} saving={saving} onSubmit={submitReservation} onClose={() => setReservationOpen(false)} /> : null}
      {saleOpen ? <SaleFromQuotationModal quotation={quotation} saving={saving} onSubmit={submitSale} onClose={() => setSaleOpen(false)} /> : null}
      <ConfirmDialog open={false} title="" message="" onConfirm={() => undefined} onCancel={() => undefined} />
    </>
  );
}

function ReservationFromQuotationModal({ quotation, saving, onSubmit, onClose }: { quotation: Quotation; saving: boolean; onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>; onClose: () => void }): React.ReactElement {
  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal" role="dialog" aria-modal="true" onSubmit={(event) => { void onSubmit(event); }}>
        <h2>Convertir a reserva</h2>
        <label>Monto de sena<input name="reservationAmount" type="number" min="0" step="0.01" defaultValue={quotation.downPaymentAmount} /></label>
        <label>Vencimiento<input name="expirationDate" type="date" required /></label>
        <label>Notas<textarea name="notes" rows={3} defaultValue={quotation.notes || ''} /></label>
        <div className="modal-actions"><button type="button" className="button button--ghost" onClick={onClose}>Cerrar</button><button className="button" type="submit" disabled={saving}>{saving ? 'Convirtiendo...' : 'Crear reserva'}</button></div>
      </form>
    </div>
  );
}

function SaleFromQuotationModal({ quotation, saving, onSubmit, onClose }: { quotation: Quotation; saving: boolean; onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>; onClose: () => void }): React.ReactElement {
  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal" role="dialog" aria-modal="true" onSubmit={(event) => { void onSubmit(event); }}>
        <h2>Convertir a venta</h2>
        <label>Monto de sena<input name="reservationAmount" type="number" min="0" step="0.01" defaultValue={quotation.downPaymentAmount} /></label>
        <label>Vencimiento de reserva tecnica<input name="expirationDate" type="date" required /></label>
        <label>Primer vencimiento<input name="firstDueDate" type="date" defaultValue={toInputDate(quotation.firstDueDate)} /></label>
        <label><input name="markReservationAsPaid" type="checkbox" /> Registrar la sena como pagada</label>
        <label>Metodo de pago<select name="paymentMethod" defaultValue="other"><option value="cash">Efectivo</option><option value="transfer">Transferencia</option><option value="bank_deposit">Deposito bancario</option><option value="other">Otro</option></select></label>
        <div className="modal-actions"><button type="button" className="button button--ghost" onClick={onClose}>Cerrar</button><button className="button" type="submit" disabled={saving}>{saving ? 'Convirtiendo...' : 'Crear venta'}</button></div>
      </form>
    </div>
  );
}
