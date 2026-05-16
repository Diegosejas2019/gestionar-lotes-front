import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { migrationsApi } from '../api/services';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { MigrationBatch, MigrationBatchStatus } from '../types';

const statusLabels: Record<MigrationBatchStatus, string> = {
  draft: 'Borrador',
  simulated: 'Simulado',
  in_progress: 'En proceso',
  completed: 'Completado',
  completed_with_warnings: 'Con advertencias',
  failed: 'Fallido',
  cancelled: 'Cancelado',
};

function statusTone(s: MigrationBatchStatus): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  if (s === 'completed') return 'success';
  if (s === 'failed') return 'danger';
  if (s === 'completed_with_warnings') return 'warning';
  if (s === 'in_progress') return 'info';
  return 'neutral';
}

function devName(m: MigrationBatch): string {
  if (typeof m.developmentId === 'object' && m.developmentId) {
    return (m.developmentId as { name?: string }).name || '-';
  }
  return '-';
}

export function MigrationsPage(): React.ReactElement {
  const [migrations, setMigrations] = useState<MigrationBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const data = await migrationsApi.list();
        setMigrations(data.migrations || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las migraciones.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Historial de migraciones a GestionAr App" />
      {error && <ErrorMessage message={error} />}
      {migrations.length === 0 && !error && (
        <p className="empty-state">Todavía no hay migraciones registradas.</p>
      )}
      <DataTable
        columns={[
          {
            key: 'batch',
            header: 'Lote',
            render: (m) => <Link to={`/migrations/${m._id}`}><strong>{m.batchNumber}</strong></Link>,
          },
          { key: 'barrio', header: 'Barrio', render: (m) => devName(m) },
          {
            key: 'status',
            header: 'Estado',
            render: (m) => <StatusBadge label={statusLabels[m.status] || m.status} tone={statusTone(m.status)} />,
          },
          {
            key: 'mode',
            header: 'Modo',
            render: (m) => m.mode === 'dry_run' ? 'Simulación' : 'Ejecución',
          },
          { key: 'created', header: 'Creados', render: (m) => m.summary?.created ?? '-' },
          { key: 'linked', header: 'Vinculados', render: (m) => m.summary?.linked ?? '-' },
          { key: 'failed', header: 'Fallidos', render: (m) => m.summary?.failed ?? '-' },
          { key: 'date', header: 'Fecha', render: (m) => <DateDisplay value={m.createdAt} /> },
          {
            key: 'actions',
            header: '',
            render: (m) => <Link to={`/migrations/${m._id}`} className="btn btn--sm btn--secondary">Ver detalle</Link>,
          },
        ]}
        rows={migrations}
        getRowKey={(m) => m._id}
      />
    </div>
  );
}
