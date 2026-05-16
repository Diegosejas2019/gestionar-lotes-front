import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { legalProcessesApi } from '../api/services';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { LegalProcess, LegalProcessStatus } from '../types';
import { legalProcessStatusLabels, legalProcessTypeLabels } from '../utils/labels';

function statusTone(status: LegalProcessStatus): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  if (status === 'resolved') return 'success';
  if (status === 'cancelled') return 'neutral';
  if (status === 'in_progress') return 'info';
  if (status === 'waiting_response') return 'warning';
  return 'neutral';
}

function buyerName(p: LegalProcess): string {
  if (typeof p.buyerId === 'object' && p.buyerId) {
    const b = p.buyerId as { firstName?: string; lastName?: string };
    return [b.firstName, b.lastName].filter(Boolean).join(' ') || '-';
  }
  return '-';
}

export function LegalProcessesPage(): React.ReactElement {
  const [processes, setProcesses] = useState<LegalProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const data = await legalProcessesApi.list();
        setProcesses(data.legalProcesses || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los procesos legales.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Procesos legales"
        action={<Link to="/legal-processes/new" className="btn btn--primary">+ Nuevo proceso</Link>}
      />
      {error && <ErrorMessage message={error} />}
      <DataTable
        columns={[
          { key: 'number', header: 'Número', render: (p) => <Link to={`/legal-processes/${p._id}`}><strong>{p.processNumber}</strong></Link> },
          { key: 'type', header: 'Tipo', render: (p) => legalProcessTypeLabels[p.type] || p.type },
          { key: 'buyer', header: 'Comprador', render: buyerName },
          { key: 'status', header: 'Estado', render: (p) => <StatusBadge label={legalProcessStatusLabels[p.status]} tone={statusTone(p.status)} /> },
          { key: 'start', header: 'Inicio', render: (p) => <DateDisplay value={p.startDate} /> },
          { key: 'reason', header: 'Motivo', render: (p) => p.reason.slice(0, 60) + (p.reason.length > 60 ? '…' : '') },
          {
            key: 'actions', header: '', render: (p) => (
              <Link to={`/legal-processes/${p._id}`} className="btn btn--sm btn--secondary">Ver</Link>
            ),
          },
        ]}
        rows={processes}
        getRowKey={(p) => p._id}
        emptyTitle="No hay procesos legales registrados."
      />
    </div>
  );
}
