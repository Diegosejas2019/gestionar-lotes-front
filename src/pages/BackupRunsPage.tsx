import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { backupsApi } from '../api/services';
import { DateDisplay } from '../components/DateDisplay';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { BackupRun, BackupRunStatus } from '../types';

const STATUS_LABELS: Record<BackupRunStatus, string> = {
  pending: 'Pendiente',
  running: 'En progreso',
  completed: 'Completado',
  failed: 'Fallido',
  cancelled: 'Cancelado',
};

const STATUS_STYLE: Record<BackupRunStatus, React.CSSProperties> = {
  pending: { background: '#f3f4f6', color: '#6b7280' },
  running: { background: '#fef9c3', color: '#92400e' },
  completed: { background: '#dcfce7', color: '#16a34a' },
  failed: { background: '#fee2e2', color: '#dc2626' },
  cancelled: { background: '#f3f4f6', color: '#6b7280' },
};

function formatBytes(bytes?: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function BackupRunsPage(): React.ReactElement {
  const navigate = useNavigate();
  const [runs, setRuns] = useState<BackupRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load(): Promise<void> {
    setLoading(true);
    setError('');
    try {
      const res = await backupsApi.listRuns();
      setRuns(res.runs || res || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las ejecuciones.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(runId: string): Promise<void> {
    setDownloading(runId);
    setActionError('');
    try {
      const res = await backupsApi.downloadRun(runId);
      const url = (res as any).url || (res as any).downloadUrl;
      if (url) window.open(url, '_blank');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo obtener el enlace de descarga.');
    } finally {
      setDownloading(null);
    }
  }

  async function handleCancel(runId: string): Promise<void> {
    setActionError('');
    try {
      await backupsApi.cancelRun(runId);
      setRuns((prev) => prev.map((r) => r._id === runId ? { ...r, status: 'cancelled' } : r));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo cancelar la ejecución.');
    }
  }

  if (loading) return <LoadingState message="Cargando ejecuciones..." />;

  return (
    <div>
      <PageHeader
        title="Ejecuciones de backup"
        description="Historial de todos los backups generados"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="button button--ghost" type="button" onClick={() => navigate('/backups')}>
              Trabajos
            </button>
            <button className="button button--ghost" type="button" onClick={() => navigate('/backups/manual')}>
              Backup manual
            </button>
          </div>
        }
      />

      {error && <ErrorMessage message={error} />}
      {actionError && <ErrorMessage message={actionError} />}

      {!error && runs.length === 0 && (
        <EmptyState
          title="Sin ejecuciones"
          message="Ejecutá un backup desde un trabajo o desde el backup manual para ver el historial aquí."
        />
      )}

      {runs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {runs.map((run) => {
            const status = run.status as BackupRunStatus;
            return (
              <div key={run._id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.9rem' }}>{run.runNumber}</span>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 12, fontWeight: 600, ...STATUS_STYLE[status] }}>
                      {STATUS_LABELS[status] || status}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{run.format?.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    Iniciado: <DateDisplay value={run.startedAt} />
                    {run.completedAt && <> · Completado: <DateDisplay value={run.completedAt} /></>}
                    {run.sizeBytes ? <> · {formatBytes(run.sizeBytes)}</> : null}
                  </div>
                  {(run.summary?.modulesIncluded?.length ?? 0) > 0 && (
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 2 }}>
                      Módulos: {(run.summary?.modulesIncluded ?? []).join(', ')}
                    </div>
                  )}
                  {run.errorMessage && (
                    <div style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: 4 }}>{run.errorMessage}</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {status === 'completed' && run.fileUrl && (
                    <button
                      className="button"
                      type="button"
                      disabled={downloading === run._id}
                      onClick={() => void handleDownload(run._id)}
                    >
                      {downloading === run._id ? 'Generando...' : 'Descargar'}
                    </button>
                  )}
                  {(status === 'pending' || status === 'running') && (
                    <button className="button button--ghost" type="button" style={{ color: '#dc2626' }} onClick={() => void handleCancel(run._id)}>
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
