import { useEffect, useState } from 'react';
import { paymentRequestsApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { FilterBar } from '../components/FilterBar';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { PaymentRequest } from '../types';
import type { Currency, PaymentRequestMethod } from '../types';
import { paymentRequestMethodLabels, paymentRequestMethods, paymentRequestStatusLabels, paymentRequestStatuses, paymentRequestTypeLabels, paymentRequestTypes } from '../utils/labels';

export function PaymentRequestsPage(): React.ReactElement {
  const [items, setItems] = useState<PaymentRequest[]>([]);
  const [filters, setFilters] = useState({ status: '', type: '', paymentMethod: '', q: '' });
  const [selected, setSelected] = useState<PaymentRequest | null>(null);
  const [approving, setApproving] = useState<PaymentRequest | null>(null);
  const [rejecting, setRejecting] = useState<PaymentRequest | null>(null);
  const [canceling, setCanceling] = useState<PaymentRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load(): Promise<void> {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.type) params.set('type', filters.type);
      if (filters.paymentMethod) params.set('paymentMethod', filters.paymentMethod);
      const data = await paymentRequestsApi.list(params);
      setItems(data.paymentRequests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las solicitudes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [filters.status, filters.type, filters.paymentMethod]);

  const filtered = items.filter((item) => {
    const text = `${item.buyerName || ''} ${item.saleNumber || ''} ${item.reservationNumber || ''} ${item.installmentNumber || ''}`.toLowerCase();
    return !filters.q || text.includes(filters.q.toLowerCase());
  });

  async function approve(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!approving) return;
    const form = new FormData(event.currentTarget);
    try {
      setSaving(true);
      await paymentRequestsApi.approve(approving._id, {
        paidAmount: Number(form.get('paidAmount') || approving.paidAmount || approving.amount),
        paidCurrency: String(form.get('paidCurrency') || approving.paidCurrency || approving.currency) as Currency,
        appliedAmount: Number(form.get('appliedAmount') || approving.appliedAmount || approving.amount),
        appliedCurrency: String(form.get('appliedCurrency') || approving.appliedCurrency || approving.currency) as Currency,
        exchangeRate: form.get('exchangeRate') ? Number(form.get('exchangeRate')) : undefined,
        exchangeRateDate: String(form.get('exchangeRateDate') || ''),
        paymentDate: String(form.get('paymentDate') || ''),
        paymentMethod: String(form.get('paymentMethod') || approving.paymentMethod) as PaymentRequestMethod,
        notes: String(form.get('notes') || ''),
        receiptNumber: String(form.get('receiptNumber') || ''),
      });
      setApproving(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo aprobar la solicitud.');
    } finally {
      setSaving(false);
    }
  }

  async function reject(): Promise<void> {
    if (!rejecting) return;
    try {
      setSaving(true);
      await paymentRequestsApi.reject(rejecting._id, { rejectionReason: rejectReason });
      setRejecting(null);
      setRejectReason('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo rechazar la solicitud.');
    } finally {
      setSaving(false);
    }
  }

  async function cancel(): Promise<void> {
    if (!canceling) return;
    try {
      setSaving(true);
      await paymentRequestsApi.cancel(canceling._id);
      setCanceling(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cancelar la solicitud.');
    } finally {
      setSaving(false);
    }
  }

  async function openProof(item: PaymentRequest): Promise<void> {
    try {
      const data = await paymentRequestsApi.proof(item._id);
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo abrir el comprobante.');
    }
  }

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Pagos informados" description="Solicitudes enviadas por compradores para validacion administrativa." />
      <ErrorMessage message={error} />
      <FilterBar>
        <label>Estado<select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">Todos</option>{paymentRequestStatuses.map((status) => <option key={status} value={status}>{paymentRequestStatusLabels[status]}</option>)}</select></label>
        <label>Tipo<select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}><option value="">Todos</option>{paymentRequestTypes.map((type) => <option key={type} value={type}>{paymentRequestTypeLabels[type]}</option>)}</select></label>
        <label>Metodo<select value={filters.paymentMethod} onChange={(event) => setFilters({ ...filters, paymentMethod: event.target.value })}><option value="">Todos</option>{paymentRequestMethods.map((method) => <option key={method} value={method}>{paymentRequestMethodLabels[method]}</option>)}</select></label>
        <label>Buscar<input value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} /></label>
      </FilterBar>
      <DataTable rows={filtered} getRowKey={(item) => item._id} emptyTitle="No hay pagos informados para mostrar." columns={[
        { key: 'date', header: 'Fecha', render: (item) => <DateDisplay value={item.createdAt} /> },
        { key: 'buyer', header: 'Comprador', render: (item) => item.buyerName || '-' },
        { key: 'type', header: 'Tipo', render: (item) => paymentRequestTypeLabels[item.type] },
        { key: 'ref', header: 'Venta/Reserva/Cuota', render: (item) => item.saleNumber || item.reservationNumber || (item.installmentNumber ? `Cuota ${item.installmentNumber}` : '-') },
        { key: 'amount', header: 'Imputado', render: (item) => <CurrencyAmount amount={item.appliedAmount ?? item.amount} currency={item.appliedCurrency || item.currency} /> },
        { key: 'paid', header: 'Pagado', render: (item) => <CurrencyAmount amount={item.paidAmount ?? item.amount} currency={item.paidCurrency || item.currency} /> },
        { key: 'method', header: 'Metodo', render: (item) => paymentRequestMethodLabels[item.paymentMethod] },
        { key: 'status', header: 'Estado', render: (item) => <RequestStatusBadge item={item} /> },
        { key: 'proof', header: 'Comprobante', render: (item) => item.hasProof ? <button className="link-button" type="button" onClick={() => { void openProof(item); }}>Ver</button> : '-' },
        { key: 'actions', header: 'Acciones', render: (item) => <div className="row-actions"><button className="link-button" type="button" onClick={() => setSelected(item)}>Detalle</button>{['pending', 'proof_uploaded', 'under_review'].includes(item.status) ? <button className="link-button" type="button" onClick={() => setApproving(item)}>Aprobar</button> : null}{item.status !== 'approved' && item.status !== 'cancelled' ? <button className="text-danger" type="button" onClick={() => setRejecting(item)}>Rechazar</button> : null}{item.status !== 'approved' && item.status !== 'cancelled' ? <button className="button button--ghost" type="button" onClick={() => setCanceling(item)}>Cancelar</button> : null}</div> },
      ]} />
      {selected ? <PaymentRequestDetail item={selected} onClose={() => setSelected(null)} /> : null}
      {approving ? <ApproveModal item={approving} saving={saving} onSubmit={approve} onClose={() => setApproving(null)} /> : null}
      {rejecting ? <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true"><h2>Rechazar solicitud</h2><label>Motivo<textarea value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} rows={3} required /></label><div className="modal-actions"><button className="button button--ghost" type="button" onClick={() => setRejecting(null)}>Cerrar</button><button className="button button--danger" type="button" disabled={saving} onClick={() => { void reject(); }}>{saving ? 'Rechazando...' : 'Rechazar'}</button></div></section></div> : null}
      <ConfirmDialog open={Boolean(canceling)} title="Cancelar solicitud" message="La solicitud quedara cancelada y no generara pagos." danger confirmLabel={saving ? 'Cancelando...' : 'Cancelar'} onConfirm={() => { void cancel(); }} onCancel={() => setCanceling(null)} />
    </>
  );
}

function RequestStatusBadge({ item }: { item: PaymentRequest }): React.ReactElement {
  const tone = item.status === 'approved' ? 'success' : item.status === 'rejected' || item.status === 'cancelled' || item.status === 'expired' || item.status === 'provider_failed' ? 'danger' : item.status === 'proof_uploaded' || item.status === 'under_review' ? 'info' : 'warning';
  return <StatusBadge label={paymentRequestStatusLabels[item.status]} tone={tone} />;
}

function PaymentRequestDetail({ item, onClose }: { item: PaymentRequest; onClose: () => void }): React.ReactElement {
  return <div className="modal-backdrop" role="presentation"><section className="modal modal--wide" role="dialog" aria-modal="true"><h2>Detalle de solicitud</h2><p>Comprador: {item.buyerName || '-'}</p><p>Tipo: {paymentRequestTypeLabels[item.type]}</p><p>Monto solicitado: <CurrencyAmount amount={item.requestedAmount ?? item.amount} currency={item.requestedCurrency || item.currency} /></p><p>Importe recibido: <CurrencyAmount amount={item.paidAmount ?? item.amount} currency={item.paidCurrency || item.currency} /></p><p>Tipo de cambio: {item.exchangeRate ? `1 USD = ARS ${item.exchangeRate}` : '-'}</p><p>Monto imputado: <CurrencyAmount amount={item.appliedAmount ?? item.amount} currency={item.appliedCurrency || item.currency} /></p><p>Estado: {paymentRequestStatusLabels[item.status]}</p><p>Comprobante: {item.proofFileName || 'Sin comprobante'}</p><p>Observaciones: {item.notes || '-'}</p>{item.rejectionReason ? <p>Motivo de rechazo: {item.rejectionReason}</p> : null}<div className="modal-actions"><button className="button button--ghost" type="button" onClick={onClose}>Cerrar</button></div></section></div>;
}

function ApproveModal({ item, saving, onSubmit, onClose }: { item: PaymentRequest; saving: boolean; onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>; onClose: () => void }): React.ReactElement {
  return <div className="modal-backdrop" role="presentation"><form className="modal" role="dialog" aria-modal="true" onSubmit={(event) => { void onSubmit(event); }}><h2>Aprobar pago informado</h2><p>Monto solicitado: <CurrencyAmount amount={item.requestedAmount ?? item.amount} currency={item.requestedCurrency || item.currency} /></p><label>Importe recibido<input name="paidAmount" type="number" min="0.01" step="0.01" defaultValue={item.paidAmount ?? item.amount} required /></label><label>Moneda recibida<select name="paidCurrency" defaultValue={item.paidCurrency || item.currency || 'ARS'}><option value="ARS">ARS</option><option value="USD">USD</option></select></label><label>Monto imputado<input name="appliedAmount" type="number" min="0.01" step="0.01" defaultValue={item.appliedAmount ?? item.amount} required /></label><label>Moneda imputada<select name="appliedCurrency" defaultValue={item.appliedCurrency || item.currency || 'ARS'}><option value="ARS">ARS</option><option value="USD">USD</option></select></label><label>Tipo de cambio<input name="exchangeRate" type="number" min="0.01" step="0.01" defaultValue={item.exchangeRate || ''} /></label><label>Fecha tipo de cambio<input name="exchangeRateDate" type="date" defaultValue={item.exchangeRateDate ? item.exchangeRateDate.slice(0, 10) : new Date().toISOString().slice(0, 10)} /></label><label>Fecha de pago<input name="paymentDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label><label>Metodo<select name="paymentMethod" defaultValue={item.paymentMethod}>{paymentRequestMethods.map((method) => <option key={method} value={method}>{paymentRequestMethodLabels[method]}</option>)}</select></label><label>Nro recibo<input name="receiptNumber" /></label><label>Notas<textarea name="notes" rows={3} /></label><div className="modal-actions"><button className="button button--ghost" type="button" onClick={onClose}>Cerrar</button><button className="button" type="submit" disabled={saving}>{saving ? 'Aprobando...' : 'Aprobar'}</button></div></form></div>;
}
