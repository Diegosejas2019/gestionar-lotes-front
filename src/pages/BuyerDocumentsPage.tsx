import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { buyerDocumentsApi } from '../api/services';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { BuyerPortalDocument } from '../types';
import { documentStatusLabels, documentTypeLabels } from '../utils/labels';

type BuyerDocumentRow = BuyerPortalDocument & {
  saleId?: string;
  saleNumber?: string;
  developmentName?: string;
  lotLabel?: string;
};

export function BuyerDocumentsPage(): React.ReactElement {
  const [documents, setDocuments] = useState<BuyerDocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const data = await buyerDocumentsApi.list();
        setDocuments(data.documents || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar tus documentos.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function downloadDocument(documentId: string): Promise<void> {
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

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Documentos" description="Recibos, cotizaciones y constancias disponibles para descargar." />
      <ErrorMessage message={error} />
      <DataTable
        rows={documents}
        getRowKey={(item) => item.documentId}
        emptyTitle="No hay documentos disponibles."
        columns={[
          { key: 'sale', header: 'Venta', render: (item) => item.saleId ? <Link to={`/buyer/sales/${item.saleId}`}>{item.saleNumber || 'Ver venta'}</Link> : (item.saleNumber || '-') },
          { key: 'development', header: 'Barrio', render: (item) => item.developmentName || '-' },
          { key: 'lot', header: 'Lote', render: (item) => item.lotLabel || '-' },
          { key: 'type', header: 'Tipo', render: (item) => documentTypeLabels[item.documentType] },
          { key: 'number', header: 'Numero', render: (item) => item.documentNumber },
          { key: 'date', header: 'Fecha', render: (item) => <DateDisplay value={item.generatedAt} /> },
          { key: 'status', header: 'Estado', render: (item) => <StatusBadge label={documentStatusLabels[item.status]} tone={item.status === 'active' ? 'success' : 'danger'} /> },
          {
            key: 'action',
            header: 'Accion',
            render: (item) => item.canDownload
              ? <button className="link-button" type="button" disabled={actionLoading === item.documentId} onClick={() => { void downloadDocument(item.documentId); }}>{actionLoading === item.documentId ? 'Abriendo...' : 'Descargar'}</button>
              : 'No disponible',
          },
        ]}
      />
    </>
  );
}
