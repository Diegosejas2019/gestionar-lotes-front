import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { migrationsApi } from '../api/services';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { MigrationBatch, MigrationBatchStatus, MigrationItem, MigrationItemStatus } from '../types';

const batchStatusLabels: Record<MigrationBatchStatus, string> = {
  draft: 'Borrador',
  simulated: 'Simulado',
  in_progress: 'En proceso',
  completed: 'Completado',
  completed_with_warnings: 'Completado con advertencias',
  failed: 'Fallido',
  cancelled: 'Cancelado',
};

const itemStatusLabels: Record<MigrationItemStatus, string> = {
  pending: 'Pendiente',
  skipped: 'Omitido',
  created: 'Creado',
  linked: 'Vinculado',
  updated: 'Actualizado',
  failed: 'Fallido',
};

function batchTone(s: MigrationBatchStatus): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  if (s === 'completed') return 'success';
  if (s === 'failed') return 'danger';
  if (s === 'completed_with_warnings') return 'warning';
  if (s === 'in_progress') return 'info';
  return 'neutral';
}

function itemTone(s: MigrationItemStatus): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  if (s === 'created' || s === 'linked') return 'success';
  if (s === 'failed') return 'danger';
  if (s === 'skipped') return 'neutral';
  return 'info';
}

const sourceTypeLabels: Record<string, string> = {
  development: 'Barrio',
  buyer: 'Comprador',
  lot: 'Lote',
  sale: 'Venta',
  owner_lot_link: 'Vinculación propietario-lote',
  user: 'Usuario',
};

export function MigrationDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const [batch, setBatch] = useState<MigrationBatch | null>(null);
  const [items, setItems] = useState<MigrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retrying, setRetrying] = useState(false);
  const [retryMsg, setRetryMsg] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        const data = await migrationsApi.get(id);
        setBatch(data.migration);
        setItems(data.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la migración.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleRetry() {
    if (!id || !batch) return;
    setRetrying(true);
    setRetryMsg('');
    try {
      const result = await migrationsApi.retryFailed(id);
      setRetryMsg(`Se reintentaron ${result.retried} ítems. Corregidos: ${result.fixed}.`);
      const refreshed = await migrationsApi.get(id);
      setBatch(refreshed.migration);
      setItems(refreshed.items || []);
    } catch (err) {
      setRetryMsg(err instanceof Error ? err.message : 'Error al reintentar.');
    } finally {
      setRetrying(false);
    }
  }

  async function handleCancel() {
    if (!id || !batch) return;
    if (!confirm('¿Cancelar esta migración?')) return;
    setCancelling(true);
    try {
      const result = await migrationsApi.cancel(id);
      setBatch(result.migration);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar.');
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <LoadingState />;
  if (error && !batch) return <div><ErrorMessage message={error} /><Link to="/migrations">← Volver</Link></div>;
  if (!batch) return <div><ErrorMessage message="Migración no encontrada." /><Link to="/migrations">← Volver</Link></div>;

  const devName = typeof batch.developmentId === 'object'
    ? (batch.developmentId as { name?: string }).name || '-'
    : String(batch.developmentId);

  const failedCount = items.filter((i) => i.status === 'failed').length;
  const canRetry = ['failed', 'completed_with_warnings'].includes(batch.status) && failedCount > 0;
  const canCancel = ['draft', 'simulated'].includes(batch.status);

  return (
    <div>
      <PageHeader
        title={`Migración ${batch.batchNumber}`}
        action={<Link to="/migrations" className="btn btn--secondary">← Volver</Link>}
      />
      {error && <ErrorMessage message={error} />}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3>Resumen</h3>
        <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem 1.5rem' }}>
          <div><dt>Barrio</dt><dd>{devName}</dd></div>
          <div><dt>Estado</dt><dd><StatusBadge label={batchStatusLabels[batch.status] || batch.status} tone={batchTone(batch.status)} /></dd></div>
          <div><dt>Modo</dt><dd>{batch.mode === 'dry_run' ? 'Simulación' : 'Ejecución real'}</dd></div>
          <div><dt>Inicio</dt><dd>{batch.startedAt ? <DateDisplay value={batch.startedAt} /> : '-'}</dd></div>
          <div><dt>Finalización</dt><dd>{batch.completedAt ? <DateDisplay value={batch.completedAt} /> : '-'}</dd></div>
          <div><dt>Organización GestionAr</dt><dd>{batch.targetGestionarOrganizationName || batch.targetGestionarOrganizationId || '-'}</dd></div>
          {batch.summary && (
            <>
              <div><dt>Creados</dt><dd>{batch.summary.created}</dd></div>
              <div><dt>Vinculados</dt><dd>{batch.summary.linked}</dd></div>
              <div><dt>Omitidos</dt><dd>{batch.summary.skipped}</dd></div>
              <div><dt>Fallidos</dt><dd>{batch.summary.failed}</dd></div>
            </>
          )}
        </dl>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {canRetry && (
            <button className="btn btn--primary" onClick={() => void handleRetry()} disabled={retrying}>
              {retrying ? 'Reintentando...' : 'Reintentar fallidos'}
            </button>
          )}
          {canCancel && (
            <button className="btn btn--danger" onClick={() => void handleCancel()} disabled={cancelling}>
              {cancelling ? 'Cancelando...' : 'Cancelar'}
            </button>
          )}
        </div>
        {retryMsg && <p style={{ marginTop: '0.75rem', color: 'var(--color-success)' }}>{retryMsg}</p>}
      </div>

      {batch.migrationErrors && batch.migrationErrors.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--color-danger)' }}>
          <h3>Errores</h3>
          <ul>
            {batch.migrationErrors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {batch.warnings && batch.warnings.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--color-warning)' }}>
          <h3>Advertencias</h3>
          <ul>
            {batch.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      <div className="card">
        <h3>Ítems migrados ({items.length})</h3>
        {items.length === 0 && <p className="empty-state">No hay ítems registrados para esta migración.</p>}
        {items.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tipo de origen</th>
                  <th>ID origen</th>
                  <th>Estado</th>
                  <th>Acción</th>
                  <th>ID destino</th>
                  <th>Motivo / Error</th>
                  <th>Advertencias</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td>{sourceTypeLabels[item.sourceType] || item.sourceType}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{item.sourceId}</td>
                    <td><StatusBadge label={itemStatusLabels[item.status] || item.status} tone={itemTone(item.status)} /></td>
                    <td>{item.action}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{item.targetId || '-'}</td>
                    <td>{item.errorMessage || item.reason || '-'}</td>
                    <td>{item.warnings?.length ? item.warnings.join('; ') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
