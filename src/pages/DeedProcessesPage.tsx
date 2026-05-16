import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deedProcessesApi } from '../api/services';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { DeedProcess, DeedStatus } from '../types';
import { deedStatusLabels } from '../utils/labels';

function statusTone(status: DeedStatus): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  if (status === 'completed') return 'success';
  if (status === 'cancelled') return 'danger';
  if (status === 'signed' || status === 'delivered') return 'success';
  if (status === 'signing_scheduled') return 'info';
  if (status === 'sent_to_notary') return 'info';
  if (status === 'documents_complete') return 'warning';
  return 'neutral';
}

function buyerName(d: DeedProcess): string {
  if (typeof d.buyerId === 'object' && d.buyerId) {
    const b = d.buyerId as { firstName?: string; lastName?: string };
    return [b.firstName, b.lastName].filter(Boolean).join(' ') || '-';
  }
  return '-';
}

export function DeedProcessesPage(): React.ReactElement {
  const [processes, setProcesses] = useState<DeedProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const data = await deedProcessesApi.list();
        setProcesses(data.deedProcesses || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las escrituraciones.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Escrituración"
        action={<Link to="/deed-processes/new" className="btn btn--primary">+ Nuevo proceso</Link>}
      />
      {error && <ErrorMessage message={error} />}
      <DataTable
        columns={[
          { key: 'number', header: 'Número', render: (d) => <Link to={`/deed-processes/${d._id}`}><strong>{d.processNumber}</strong></Link> },
          { key: 'buyer', header: 'Comprador', render: buyerName },
          { key: 'status', header: 'Estado', render: (d) => <StatusBadge label={deedStatusLabels[d.status]} tone={statusTone(d.status)} /> },
          { key: 'notary', header: 'Escribanía', render: (d) => d.notaryName || '-' },
          { key: 'docs', header: 'Docs', render: (d) => `${d.submittedDocuments.length}/${d.requiredDocuments.length}` },
          { key: 'signing', header: 'Firma estimada', render: (d) => <DateDisplay value={d.estimatedSigningDate} /> },
          {
            key: 'actions', header: '', render: (d) => (
              <Link to={`/deed-processes/${d._id}`} className="btn btn--sm btn--secondary">Ver</Link>
            ),
          },
        ]}
        rows={processes}
        getRowKey={(d) => d._id}
        emptyTitle="No hay procesos de escrituración registrados."
      />
    </div>
  );
}
