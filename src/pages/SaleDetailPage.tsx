import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { documentsApi, installmentsApi, paymentsApi, salesApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { GeneratedDocument, Installment, Payment, PaymentMethod, SaleDetail } from '../types';
import { asBuyer, asDevelopment, asLot, buyerName, getId, lotLabel, todayInputValue } from '../utils/format';
import { documentStatusLabels, documentTypeLabels, installmentStatusLabels, paymentMethodLabels, paymentMethods, saleStatusLabels } from '../utils/labels';

type PaymentModalState =
  | { type: 'downPayment' }
  | { type: 'installment'; installment: Installment }
  | null;

export function SaleDetailPage(): React.ReactElement {
  const { id } = useParams();
  const [detail, setDetail] = useState<SaleDetail | null>(null);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [paymentModal, setPaymentModal] = useState<PaymentModalState>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [annulId, setAnnulId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  async function load(): Promise<void> {
    try {
      setLoading(true);
      const [saleDetail, documentData] = await Promise.all([
        salesApi.get(id!),
        salesApi.documents(id!),
      ]);
      setDetail(saleDetail);
      setDocuments(documentData.documents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la venta.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [id]);

  const financial = useMemo(() => {
    const installments = detail?.installments || [];
    const payments = detail?.payments || [];
    const totalCollected = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const overdueDebt = installments.filter((item) => item.status === 'overdue').reduce((sum, item) => sum + Number(item.pendingAmount ?? item.amount - (item.paidAmount || 0)), 0);
    return {
      totalCollected,
      pendingBalance: Math.max(0, Number(detail?.sale.totalPrice || 0) - totalCollected),
      overdueDebt,
      paid: installments.filter((item) => item.status === 'paid').length,
      pending: installments.filter((item) => ['pending', 'partial'].includes(item.status)).length,
      overdue: installments.filter((item) => item.status === 'overdue').length,
    };
  }, [detail]);

  const receiptByPayment = useMemo(() => {
    const map = new Map<string, GeneratedDocument>();
    documents
      .filter((document) => document.paymentId && document.status === 'active')
      .forEach((document) => map.set(String(document.paymentId), document));
    return map;
  }, [documents]);

  async function handlePaymentSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!paymentModal || !detail) return;
    const form = new FormData(event.currentTarget);
    const amount = Number(form.get('amount') || 0);
    const paymentDate = String(form.get('paymentDate') || '');
    const paymentMethod = String(form.get('paymentMethod') || '') as PaymentMethod;
    const receiptNumber = String(form.get('receiptNumber') || '');
    const notes = String(form.get('notes') || '');

    if (amount <= 0 || !paymentDate || !paymentMethod) {
      setError('Completa monto, fecha y metodo de pago.');
      return;
    }
    if (paymentModal.type === 'installment') {
      const pending = Number(paymentModal.installment.pendingAmount ?? paymentModal.installment.amount - (paymentModal.installment.paidAmount || 0));
      if (amount > pending) {
        setError('El pago no puede superar el saldo pendiente de la cuota.');
        return;
      }
    }
    try {
      setSaving(true);
      if (paymentModal.type === 'downPayment') {
        await salesApi.registerDownPayment(detail.sale._id, { amount, paymentDate, paymentMethod, receiptNumber, notes });
      } else {
        await installmentsApi.registerPayment(paymentModal.installment._id, { amount, paymentDate, paymentMethod, receiptNumber, notes });
      }
      setPaymentModal(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el pago.');
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(): Promise<void> {
    try {
      setSaving(true);
      await salesApi.cancel(id!, { reason: cancelReason });
      setCancelOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cancelar la venta.');
    } finally {
      setSaving(false);
    }
  }

  async function generateSaleDocument(kind: 'account' | 'certificate' | 'debtFree'): Promise<void> {
    try {
      setActionLoading(kind);
      setError('');
      if (kind === 'account') await salesApi.generateAccountStatement(id!);
      if (kind === 'certificate') await salesApi.generateSaleCertificate(id!);
      if (kind === 'debtFree') await salesApi.generateDebtFreeCertificate(id!);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar el documento.');
    } finally {
      setActionLoading('');
    }
  }

  async function generateReceipt(payment: Payment): Promise<void> {
    try {
      setActionLoading(`receipt-${payment._id}`);
      setError('');
      await paymentsApi.generateReceipt(payment._id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar el recibo.');
    } finally {
      setActionLoading('');
    }
  }

  async function openDocument(document: GeneratedDocument, disposition: 'inline' | 'attachment'): Promise<void> {
    try {
      setActionLoading(`${disposition}-${document._id}`);
      const data = await documentsApi.download(document._id, disposition);
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo obtener el enlace del documento.');
    } finally {
      setActionLoading('');
    }
  }

  async function confirmAnnul(): Promise<void> {
    if (!annulId) return;
    try {
      setActionLoading(`annul-${annulId}`);
      await documentsApi.annul(annulId, 'Anulado desde el detalle de venta.');
      setAnnulId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo anular el documento.');
    } finally {
      setActionLoading('');
    }
  }

  if (loading) return <LoadingState />;
  if (!detail) return <ErrorMessage message={error || 'Venta no encontrada.'} />;

  const { sale, installments, payments, statusHistory } = detail;
  const buyer = asBuyer(sale.buyerId);
  const development = asDevelopment(sale.developmentId);
  const lot = asLot(sale.lotId);

  return (
    <>
      <PageHeader
        title={`Venta ${sale.saleNumber}`}
        description={`${buyerName(buyer)} - ${development?.name || 'Sin barrio'} - ${lotLabel(lot)}`}
        action={<Link className="button button--ghost" to="/sales">Volver</Link>}
      />
      <ErrorMessage message={error} />
      <section className="summary-strip">
        <StatusBadge label={saleStatusLabels[sale.status]} tone={sale.status === 'active' ? 'success' : sale.status === 'cancelled' ? 'danger' : 'warning'} />
        <span>{buyerName(buyer)}</span>
        <span>{development?.name || 'Sin barrio'}</span>
        <span>{lotLabel(lot)}</span>
        {sale.reservationId ? <Link to={`/reservations/${getId(sale.reservationId)}`}>Proviene de reserva</Link> : null}
        {sale.quotationId ? <Link to={`/quotations/${getId(sale.quotationId)}`}>Proviene de cotizacion</Link> : null}
      </section>
      <section className="metric-grid metric-grid--small">
        <article className="metric-card"><span>Precio total</span><strong><CurrencyAmount amount={sale.totalPrice} currency={sale.currency} /></strong></article>
        <article className="metric-card"><span>Total cobrado</span><strong><CurrencyAmount amount={financial.totalCollected} currency={sale.currency} /></strong></article>
        <article className="metric-card"><span>Saldo pendiente</span><strong><CurrencyAmount amount={financial.pendingBalance} currency={sale.currency} /></strong></article>
        <article className="metric-card"><span>Deuda vencida</span><strong><CurrencyAmount amount={financial.overdueDebt} currency={sale.currency} /></strong></article>
        <article className="metric-card"><span>Cuotas pagadas</span><strong>{financial.paid}</strong></article>
        <article className="metric-card"><span>Cuotas pendientes</span><strong>{financial.pending}</strong></article>
        <article className="metric-card"><span>Cuotas vencidas</span><strong>{financial.overdue}</strong></article>
      </section>
      <section className="two-column">
        <article className="panel">
          <h2>Datos del comprador</h2>
          <p>{buyerName(buyer)}</p>
          <p>{buyer?.documentType || 'DNI'} {buyer?.documentNumber || '-'}</p>
          <p>{buyer?.phone || 'Sin telefono'} - {buyer?.email || 'Sin email'}</p>
        </article>
        <article className="panel">
          <h2>Datos del lote</h2>
          <p>{development?.name || 'Sin barrio'}</p>
          <p>{lotLabel(lot)} - {lot?.surface || 0} m2</p>
          <p>Precio base: <CurrencyAmount amount={lot?.price} currency={lot?.currency} /></p>
        </article>
      </section>
      <section className="panel">
        <div className="section-title">
          <h2>Anticipo</h2>
          {sale.status === 'pending_down_payment' ? <button className="button" type="button" onClick={() => setPaymentModal({ type: 'downPayment' })}>Registrar anticipo</button> : null}
        </div>
        <p>Monto pactado: <CurrencyAmount amount={sale.downPaymentAmount} currency={sale.currency} /></p>
      </section>
      <section className="panel">
        <h2>Plan de cuotas</h2>
        <DataTable
          rows={installments}
          getRowKey={(item) => item._id}
          emptyTitle="Todavia no hay cuotas generadas."
          columns={[
            { key: 'number', header: 'Nro', render: (item) => item.installmentNumber },
            { key: 'due', header: 'Vencimiento', render: (item) => <DateDisplay value={item.dueDate} /> },
            { key: 'amount', header: 'Monto', render: (item) => <CurrencyAmount amount={item.amount} currency={item.currency} /> },
            { key: 'paid', header: 'Pagado', render: (item) => <CurrencyAmount amount={item.paidAmount} currency={item.currency} /> },
            { key: 'balance', header: 'Saldo', render: (item) => <CurrencyAmount amount={item.pendingAmount ?? item.amount - (item.paidAmount || 0)} currency={item.currency} /> },
            { key: 'status', header: 'Estado', render: (item) => <StatusBadge label={installmentStatusLabels[item.status]} tone={item.status === 'paid' ? 'success' : item.status === 'overdue' ? 'danger' : 'warning'} /> },
            { key: 'actions', header: 'Acciones', render: (item) => ['pending', 'partial', 'overdue'].includes(item.status) ? <button type="button" className="link-button" onClick={() => setPaymentModal({ type: 'installment', installment: item })}>Registrar pago</button> : '-' },
          ]}
        />
      </section>
      <section className="panel">
        <h2>Pagos realizados</h2>
        <DataTable
          rows={payments}
          getRowKey={(item) => item._id}
          emptyTitle="No hay pagos registrados."
          columns={[
            { key: 'date', header: 'Fecha', render: (item) => <DateDisplay value={item.paymentDate} /> },
            { key: 'type', header: 'Tipo', render: (item) => item.type === 'down_payment' ? 'Anticipo' : 'Cuota' },
            { key: 'amount', header: 'Monto', render: (item) => <CurrencyAmount amount={item.amount} currency={item.currency} /> },
            { key: 'method', header: 'Metodo', render: (item) => paymentMethodLabels[item.paymentMethod] },
            { key: 'receipt', header: 'Recibo', render: (item) => item.receiptNumber || '-' },
            { key: 'document', header: 'Documento', render: (item) => {
              const document = receiptByPayment.get(item._id);
              if (!document) {
                return <button type="button" className="link-button" disabled={actionLoading === `receipt-${item._id}`} onClick={() => { void generateReceipt(item); }}>{actionLoading === `receipt-${item._id}` ? 'Generando...' : 'Generar recibo'}</button>;
              }
              return (
                <div className="row-actions">
                  <button type="button" className="link-button" onClick={() => { void openDocument(document, 'inline'); }}>Ver recibo</button>
                  <button type="button" className="button button--ghost" onClick={() => { void openDocument(document, 'attachment'); }}>Descargar</button>
                </div>
              );
            } },
          ]}
        />
      </section>
      <section className="panel">
        <div className="section-title">
          <h2>Documentos</h2>
          <div className="row-actions">
            <button type="button" className="button" disabled={actionLoading === 'account'} onClick={() => { void generateSaleDocument('account'); }}>{actionLoading === 'account' ? 'Generando...' : 'Generar estado de cuenta'}</button>
            <button type="button" className="button" disabled={actionLoading === 'certificate'} onClick={() => { void generateSaleDocument('certificate'); }}>{actionLoading === 'certificate' ? 'Generando...' : 'Generar constancia'}</button>
            <button type="button" className="button" disabled={actionLoading === 'debtFree'} onClick={() => { void generateSaleDocument('debtFree'); }}>{actionLoading === 'debtFree' ? 'Generando...' : 'Generar libre deuda'}</button>
          </div>
        </div>
        <DataTable
          rows={documents}
          getRowKey={(item) => item._id}
          emptyTitle="No hay documentos generados."
          columns={[
            { key: 'type', header: 'Tipo', render: (item) => documentTypeLabels[item.documentType] },
            { key: 'number', header: 'Numero', render: (item) => item.documentNumber },
            { key: 'date', header: 'Fecha de generacion', render: (item) => <DateDisplay value={item.generatedAt} /> },
            { key: 'by', header: 'Generado por', render: (item) => {
              const snapshot = item.snapshot as { generatedByName?: string } | undefined;
              return snapshot?.generatedByName || 'Usuario del sistema';
            } },
            { key: 'status', header: 'Estado', render: (item) => <StatusBadge label={documentStatusLabels[item.status]} tone={item.status === 'active' ? 'success' : 'danger'} /> },
            { key: 'actions', header: 'Acciones', render: (item) => (
              <div className="row-actions">
                <button type="button" className="link-button" onClick={() => { void openDocument(item, 'inline'); }}>Ver</button>
                <button type="button" className="button button--ghost" onClick={() => { void openDocument(item, 'attachment'); }}>Descargar</button>
                {item.status === 'active' ? <button type="button" className="text-danger" onClick={() => setAnnulId(item._id)}>Anular</button> : null}
              </div>
            ) },
          ]}
        />
      </section>
      <section className="panel">
        <div className="section-title">
          <h2>Historial</h2>
          {sale.status !== 'cancelled' && sale.status !== 'completed' ? <button className="button button--danger" type="button" onClick={() => setCancelOpen(true)}>Cancelar venta</button> : null}
        </div>
        <DataTable
          rows={statusHistory}
          getRowKey={(item) => item._id}
          emptyTitle="No hay historial registrado."
          columns={[
            { key: 'date', header: 'Fecha', render: (item) => <DateDisplay value={item.createdAt} /> },
            { key: 'status', header: 'Estado', render: (item) => item.newStatus },
            { key: 'reason', header: 'Motivo', render: (item) => item.reason || '-' },
          ]}
        />
      </section>
      <PaymentModal state={paymentModal} saleCurrency={sale.currency || 'ARS'} downPaymentAmount={sale.downPaymentAmount || 0} saving={saving} onSubmit={handlePaymentSubmit} onClose={() => setPaymentModal(null)} />
      <ConfirmDialog open={cancelOpen} title="Cancelar venta" message="La venta se cancelara y el lote se liberara segun la regla actual del backend." danger confirmLabel={saving ? 'Cancelando...' : 'Cancelar venta'} onConfirm={() => { void handleCancel(); }} onCancel={() => setCancelOpen(false)} />
      <ConfirmDialog open={Boolean(annulId)} title="Anular documento" message="El documento quedara anulado y no podra editarse. Podras generar uno nuevo si corresponde." danger confirmLabel={actionLoading.startsWith('annul-') ? 'Anulando...' : 'Anular'} onConfirm={() => { void confirmAnnul(); }} onCancel={() => setAnnulId(null)} />
      {cancelOpen ? <div className="floating-reason"><label>Motivo<input value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} /></label></div> : null}
    </>
  );
}

type PaymentModalProps = {
  state: PaymentModalState;
  saleCurrency: string;
  downPaymentAmount: number;
  saving: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onClose: () => void;
};

function PaymentModal({ state, saleCurrency, downPaymentAmount, saving, onSubmit, onClose }: PaymentModalProps): React.ReactElement | null {
  if (!state) return null;
  const installment = state.type === 'installment' ? state.installment : null;
  const pending = installment ? Number(installment.pendingAmount ?? installment.amount - (installment.paidAmount || 0)) : downPaymentAmount;
  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal" role="dialog" aria-modal="true" onSubmit={(event) => { void onSubmit(event); }}>
        <h2>{state.type === 'downPayment' ? 'Registrar anticipo' : 'Registrar pago de cuota'}</h2>
        {installment ? <div className="info-box">Cuota: <CurrencyAmount amount={installment.amount} currency={installment.currency} /> - Pagado: <CurrencyAmount amount={installment.paidAmount} currency={installment.currency} /> - Saldo: <CurrencyAmount amount={pending} currency={installment.currency} /></div> : null}
        <label>Monto<input name="amount" type="number" min="0.01" max={pending} step="0.01" defaultValue={pending} required /></label>
        <label>Fecha<input name="paymentDate" type="date" defaultValue={todayInputValue()} required /></label>
        <label>Metodo<select name="paymentMethod" defaultValue="transfer" required>{paymentMethods.map((method) => <option key={method} value={method}>{paymentMethodLabels[method]}</option>)}</select></label>
        <label>Nro recibo<input name="receiptNumber" /></label>
        <label>Notas<textarea name="notes" rows={3} /></label>
        <input type="hidden" name="currency" value={installment?.currency || saleCurrency} />
        <div className="modal-actions">
          <button type="button" className="button button--ghost" onClick={onClose}>Cerrar</button>
          <button type="submit" className="button" disabled={saving}>{saving ? 'Registrando...' : 'Registrar pago'}</button>
        </div>
      </form>
    </div>
  );
}
