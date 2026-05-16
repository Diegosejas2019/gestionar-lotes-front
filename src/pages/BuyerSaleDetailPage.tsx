import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { buyerDocumentsApi, buyerPaymentRequestsApi, buyerPortalApi } from '../api/services';
import { BuyerInformPaymentModal, type PaymentConcept } from '../components/BuyerInformPaymentModal';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { BuyerPortalDocument, BuyerPortalInstallment, BuyerPortalPayment, BuyerPortalSaleDetail, PaymentRequest } from '../types';
import { documentStatusLabels, documentTypeLabels, installmentStatusLabels, paymentMethodLabels, quotationStatusLabels, reservationStatusLabels, saleStatusLabels, serviceLabels } from '../utils/labels';

export function BuyerSaleDetailPage(): React.ReactElement {
  const { id } = useParams();
  const [detail, setDetail] = useState<BuyerPortalSaleDetail | null>(null);
  const [installments, setInstallments] = useState<BuyerPortalInstallment[]>([]);
  const [payments, setPayments] = useState<BuyerPortalPayment[]>([]);
  const [documents, setDocuments] = useState<BuyerPortalDocument[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [initialConcept, setInitialConcept] = useState<PaymentConcept | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  async function load(): Promise<void> {
    try {
      setLoading(true);
      const [detailData, installmentData, paymentData, documentData, requestData] = await Promise.all([
        buyerPortalApi.saleDetail(id!),
        buyerPortalApi.installments(id!),
        buyerPortalApi.payments(id!),
        buyerPortalApi.documents(id!),
        buyerPaymentRequestsApi.list(),
      ]);
      setDetail(detailData);
      setInstallments(installmentData.installments || []);
      setPayments(paymentData.payments || []);
      setDocuments(documentData.documents || []);
      setPaymentRequests((requestData.paymentRequests || []).filter((item) => item.saleId === id || installmentData.installments?.some((installment) => installment.installmentId === item.installmentId) || detailData.reservation?.reservationId === item.reservationId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el detalle de la compra.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [id]);

  async function downloadDocument(documentId?: string | null): Promise<void> {
    if (!documentId) return;
    try {
      setActionLoading(documentId);
      const data = await buyerDocumentsApi.download(documentId);
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo descargar el documento.');
    } finally {
      setActionLoading('');
    }
  }

  async function createAccountStatement(): Promise<void> {
    try {
      setActionLoading('account');
      await buyerPortalApi.createAccountStatement(id!);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar el estado de cuenta.');
    } finally {
      setActionLoading('');
    }
  }

  if (loading) return <LoadingState />;
  if (!detail) return <ErrorMessage message={error || 'Compra no encontrada.'} />;

  const { sale, financialSummary, development, lot, reservation, quotation } = detail;
  const openRequestStatuses = ['pending', 'proof_uploaded', 'under_review', 'provider_pending'];
  const hasOpenRequest = (concept: PaymentConcept): boolean => paymentRequests.some((request) => {
    if (!openRequestStatuses.includes(request.status)) return false;
    if (concept.type === 'installment_payment') return request.installmentId === concept.installmentId;
    if (concept.type === 'down_payment') return request.saleId === concept.saleId && request.type === 'down_payment';
    return request.reservationId === concept.reservationId && request.type === 'reservation_payment';
  });
  const concepts: PaymentConcept[] = [
    ...(sale.status === 'pending_down_payment' && financialSummary.downPaymentAmount > 0 ? [{
      type: 'down_payment' as const,
      label: `Anticipo de venta ${sale.saleNumber}`,
      saleId: sale.saleId,
      amount: financialSummary.downPaymentAmount,
      currency: sale.currency,
    }] : []),
    ...(reservation && ['active', 'pending_payment'].includes(reservation.status) && reservation.reservationAmount > 0 ? [{
      type: 'reservation_payment' as const,
      label: `Sena de reserva ${reservation.reservationNumber}`,
      reservationId: reservation.reservationId,
      amount: reservation.reservationAmount,
      currency: reservation.currency || sale.currency,
    }] : []),
    ...installments
      .filter((installment) => ['pending', 'partial', 'overdue'].includes(installment.status) && Number(installment.pendingAmount || 0) > 0)
      .map((installment) => ({
        type: 'installment_payment' as const,
        label: `Cuota ${installment.installmentNumber}`,
        saleId: sale.saleId,
        installmentId: installment.installmentId,
        amount: installment.pendingAmount,
        currency: installment.currency || sale.currency,
      })),
  ].filter((concept) => !hasOpenRequest(concept));

  function openPaymentModal(concept?: PaymentConcept): void {
    setInitialConcept(concept || concepts[0] || null);
    setPaymentModalOpen(true);
  }

  return (
    <>
      <PageHeader title={`Venta ${sale.saleNumber}`} description={`${development?.name || 'Sin barrio'} - ${lot?.block ? `Mz. ${lot.block} - ` : ''}Lote ${lot?.lotNumber || '-'}`} action={<Link className="button button--ghost" to="/buyer/sales">Volver</Link>} />
      <ErrorMessage message={error} />
      <section className="summary-strip">
        <StatusBadge label={saleStatusLabels[sale.status]} tone={sale.status === 'active' ? 'success' : sale.status === 'cancelled' ? 'danger' : 'warning'} />
        {reservation ? <StatusBadge label="Con reserva" tone="info" /> : null}
        {quotation ? <StatusBadge label="Con cotizacion" tone="info" /> : null}
        {paymentRequests.some((request) => ['proof_uploaded', 'under_review'].includes(request.status)) ? <StatusBadge label="Pagos en revision" tone="info" /> : null}
        {concepts.length ? <button className="button" type="button" onClick={() => openPaymentModal()}>Informar pago</button> : null}
      </section>
      <section className="metric-grid metric-grid--small">
        <article className="metric-card"><span>Precio total</span><strong><CurrencyAmount amount={financialSummary.totalPrice} currency={sale.currency} /></strong></article>
        <article className="metric-card"><span>Anticipo</span><strong><CurrencyAmount amount={financialSummary.downPaymentAmount} currency={sale.currency} /></strong></article>
        <article className="metric-card"><span>Sena aplicada</span><strong><CurrencyAmount amount={financialSummary.reservationAmountApplied} currency={sale.currency} /></strong></article>
        <article className="metric-card"><span>Total pagado</span><strong><CurrencyAmount amount={financialSummary.totalPaid} currency={sale.currency} /></strong></article>
        <article className="metric-card"><span>Saldo pendiente</span><strong><CurrencyAmount amount={financialSummary.pendingBalance} currency={sale.currency} /></strong></article>
        <article className="metric-card"><span>Deuda vencida</span><strong><CurrencyAmount amount={financialSummary.overdueAmount} currency={sale.currency} /></strong></article>
        <article className="metric-card"><span>Proximo vencimiento</span><strong><DateDisplay value={financialSummary.nextDueDate} /></strong></article>
      </section>
      <section className="two-column">
        <article className="panel">
          <h2>Mi lote</h2>
          <p>{development?.name || 'Sin barrio'} - {development?.location || 'Sin ubicacion'}</p>
          <p>Manzana: {lot?.block || '-'} - Lote: {lot?.lotNumber || '-'}</p>
          <p>Superficie: {lot?.surface || 0} m2 - Frente: {lot?.frontMeasure || 0} - Fondo: {lot?.depthMeasure || 0}</p>
          <p>Servicios: {(lot?.services || []).map((service) => serviceLabels[service] || service).join(', ') || 'Sin servicios informados'}</p>
          <p>Estado: {lot?.status || '-'}</p>
        </article>
        <article className="panel">
          <h2>Reserva / Cotizacion</h2>
          {!reservation && !quotation ? <p>Esta venta fue registrada directamente, sin reserva o cotizacion previa.</p> : null}
          {reservation ? <div className="stack">
            <StatusBadge label={reservationStatusLabels[reservation.status]} />
            <p>Reserva {reservation.reservationNumber} - <DateDisplay value={reservation.reservationDate} /></p>
            <p>Vencimiento: <DateDisplay value={reservation.expirationDate} /></p>
            <p>Sena: <CurrencyAmount amount={reservation.reservationAmount} currency={reservation.currency} /></p>
            <p>Pago de sena: <DateDisplay value={reservation.paymentDate} /></p>
            {reservation.receiptDocumentId ? <button className="link-button" type="button" onClick={() => { void downloadDocument(reservation.receiptDocumentId); }}>Descargar recibo de sena</button> : null}
            {concepts.find((concept) => concept.type === 'reservation_payment') ? <button className="button" type="button" onClick={() => openPaymentModal(concepts.find((concept) => concept.type === 'reservation_payment'))}>Informar sena</button> : null}
          </div> : null}
          {quotation ? <div className="stack">
            <StatusBadge label={quotationStatusLabels[quotation.status]} />
            <p>Cotizacion {quotation.quotationNumber}</p>
            <p>Precio final: <CurrencyAmount amount={quotation.finalPrice} currency={sale.currency} /></p>
            <p>Cuotas: {quotation.installmentCount} x <CurrencyAmount amount={quotation.installmentAmount} currency={sale.currency} /></p>
            <p>Validez: <DateDisplay value={quotation.validUntil} /></p>
            {quotation.generatedDocumentId ? <button className="link-button" type="button" onClick={() => { void downloadDocument(quotation.generatedDocumentId); }}>Descargar cotizacion PDF</button> : null}
          </div> : null}
        </article>
      </section>
      <section className="panel">
        <h2>Cuotas</h2>
        <DataTable rows={installments} getRowKey={(item) => item.installmentId} emptyTitle="No hay cuotas registradas." columns={[
          { key: 'n', header: 'Nro', render: (item) => item.installmentNumber },
          { key: 'due', header: 'Vencimiento', render: (item) => <DateDisplay value={item.dueDate} /> },
          { key: 'amount', header: 'Monto', render: (item) => <CurrencyAmount amount={item.amount} currency={item.currency} /> },
          { key: 'paid', header: 'Pagado', render: (item) => <CurrencyAmount amount={item.paidAmount} currency={item.currency} /> },
          { key: 'pending', header: 'Saldo', render: (item) => <CurrencyAmount amount={item.pendingAmount} currency={item.currency} /> },
          { key: 'status', header: 'Estado', render: (item) => <div className="stack stack--compact"><StatusBadge label={installmentStatusLabels[item.status]} tone={item.status === 'paid' ? 'success' : item.status === 'overdue' ? 'danger' : 'warning'} />{paymentRequests.some((request) => request.installmentId === item.installmentId && openRequestStatuses.includes(request.status)) ? <StatusBadge label="Pago informado en revision" tone="info" /> : null}</div> },
          { key: 'receipt', header: 'Recibo', render: (item) => item.receiptDocumentId ? <button className="link-button" type="button" onClick={() => { void downloadDocument(item.receiptDocumentId); }}>Descargar</button> : '-' },
          { key: 'pay', header: 'Informar pago', render: (item) => {
            const concept = concepts.find((candidate) => candidate.installmentId === item.installmentId);
            return concept ? <button className="link-button" type="button" onClick={() => openPaymentModal(concept)}>Informar pago</button> : '-';
          } },
        ]} />
      </section>
      <section className="panel">
        <h2>Pagos</h2>
        <DataTable rows={payments} getRowKey={(item) => item.paymentId} emptyTitle="No hay pagos registrados." columns={[
          { key: 'date', header: 'Fecha', render: (item) => <DateDisplay value={item.paymentDate} /> },
          { key: 'type', header: 'Tipo', render: (item) => item.type === 'down_payment' ? 'Anticipo' : item.type === 'installment_payment' ? 'Pago de cuota' : 'Sena de reserva' },
          { key: 'amount', header: 'Monto', render: (item) => <CurrencyAmount amount={item.amount} currency={item.currency} /> },
          { key: 'method', header: 'Metodo', render: (item) => paymentMethodLabels[item.paymentMethod] },
          { key: 'installment', header: 'Cuota', render: (item) => item.installmentNumber || '-' },
          { key: 'receipt', header: 'Recibo', render: (item) => item.receiptDocumentId ? <button className="link-button" type="button" onClick={() => { void downloadDocument(item.receiptDocumentId); }}>Descargar</button> : item.receiptNumber || '-' },
        ]} />
      </section>
      <section className="panel">
        <div className="section-title">
          <h2>Documentos</h2>
          <button className="button" type="button" disabled={actionLoading === 'account'} onClick={() => { void createAccountStatement(); }}>{actionLoading === 'account' ? 'Generando...' : 'Generar estado de cuenta'}</button>
        </div>
        <DataTable rows={documents} getRowKey={(item) => item.documentId} emptyTitle="No hay documentos disponibles." columns={[
          { key: 'type', header: 'Tipo', render: (item) => documentTypeLabels[item.documentType] },
          { key: 'number', header: 'Numero', render: (item) => item.documentNumber },
          { key: 'date', header: 'Fecha', render: (item) => <DateDisplay value={item.generatedAt} /> },
          { key: 'status', header: 'Estado', render: (item) => <StatusBadge label={documentStatusLabels[item.status]} tone={item.status === 'active' ? 'success' : 'danger'} /> },
          { key: 'action', header: 'Accion', render: (item) => item.canDownload ? <button className="link-button" type="button" disabled={actionLoading === item.documentId} onClick={() => { void downloadDocument(item.documentId); }}>Descargar</button> : 'No disponible' },
        ]} />
      </section>
      {paymentModalOpen ? <BuyerInformPaymentModal concepts={concepts} initialConcept={initialConcept} onClose={() => setPaymentModalOpen(false)} onCreated={() => { setPaymentModalOpen(false); void load(); }} /> : null}
    </>
  );
}
