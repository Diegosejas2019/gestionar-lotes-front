import { useEffect, useState } from 'react';
import { buyerPaymentRequestsApi, buyerDocumentsApi } from '../api/services';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { PaymentRequest } from '../types';
import { paymentRequestMethodLabels, paymentRequestStatusLabels, paymentRequestTypeLabels } from '../utils/labels';

export function BuyerPaymentRequestsPage(): React.ReactElement {
  const [items, setItems] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(): Promise<void> {
    try {
      setLoading(true);
      const data = await buyerPaymentRequestsApi.list();
      setItems(data.paymentRequests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar tus pagos informados.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function openProof(item: PaymentRequest): Promise<void> {
    try {
      const data = await buyerPaymentRequestsApi.proof(item._id);
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo abrir el comprobante.');
    }
  }

  async function openReceipt(item: PaymentRequest): Promise<void> {
    if (!item.generatedDocumentId) return;
    try {
      const data = await buyerDocumentsApi.download(item.generatedDocumentId);
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo abrir el recibo.');
    }
  }

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Mis pagos informados" description="Seguimiento de comprobantes enviados a la administracion." />
      <ErrorMessage message={error} />
      <DataTable rows={items} getRowKey={(item) => item._id} emptyTitle="Todavia no informaste pagos." columns={[
        { key: 'date', header: 'Fecha', render: (item) => <DateDisplay value={item.createdAt} /> },
        { key: 'type', header: 'Concepto', render: (item) => paymentRequestTypeLabels[item.type] },
        { key: 'amount', header: 'Monto', render: (item) => <CurrencyAmount amount={item.amount} currency={item.currency} /> },
        { key: 'method', header: 'Metodo', render: (item) => paymentRequestMethodLabels[item.paymentMethod] },
        { key: 'status', header: 'Estado', render: (item) => <StatusBadge label={paymentRequestStatusLabels[item.status]} tone={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'danger' : ['proof_uploaded', 'under_review'].includes(item.status) ? 'info' : 'warning'} /> },
        { key: 'reason', header: 'Motivo', render: (item) => item.rejectionReason || '-' },
        { key: 'proof', header: 'Comprobante', render: (item) => item.hasProof ? <button className="link-button" type="button" onClick={() => { void openProof(item); }}>Ver</button> : '-' },
        { key: 'receipt', header: 'Recibo', render: (item) => item.generatedDocumentId ? <button className="link-button" type="button" onClick={() => { void openReceipt(item); }}>Descargar</button> : '-' },
      ]} />
    </>
  );
}
