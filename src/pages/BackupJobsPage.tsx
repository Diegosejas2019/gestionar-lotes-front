import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { backupsApi } from '../api/services';
import { DateDisplay } from '../components/DateDisplay';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { BackupJob } from '../types';

const FREQ_LABELS: Record<string, string> = {
  manual: 'Manual',
  weekly: 'Semanal',
  monthly: 'Mensual',
};

export function BackupJobsPage(): React.ReactElement {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<BackupJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [running, setRunning] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load(): Promise<void> {
    setLoading(true);
    setError('');
    try {
      const res = await backupsApi.listJobs();
      setJobs(res.jobs || res || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los trabajos de backup.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRun(jobId: string): Promise<void> {
    setRunning(jobId);
    setActionError('');
    try {
      await backupsApi.runJob(jobId);
      navigate('/backups/runs');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo ejecutar el backup.');
      setRunning(null);
    }
  }

  async function handleDelete(jobId: string): Promise<void> {
    if (!confirm('¿Eliminar este trabajo de backup?')) return;
    setActionError('');
    try {
      await backupsApi.removeJob(jobId);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo eliminar el trabajo.');
    }
  }

  if (loading) return <LoadingState message="Cargando trabajos de backup..." />;

  return (
    <div>
      <PageHeader
        title="Trabajos de backup"
        description="Configurá y ejecutá backups de los datos de tu organización"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="button button--ghost" type="button" onClick={() => navigate('/backups/runs')}>
              Ver ejecuciones
            </button>
            <button className="button button--ghost" type="button" onClick={() => navigate('/backups/manual')}>
              Backup manual
            </button>
            <button className="button" type="button" onClick={() => navigate('/backups/new')}>
              + Nuevo trabajo
            </button>
          </div>
        }
      />

      {error && <ErrorMessage message={error} />}
      {actionError && <ErrorMessage message={actionError} />}

      {!error && jobs.length === 0 && (
        <EmptyState
          title="Sin trabajos de backup"
          message="Creá un trabajo de backup para programar exportaciones automáticas de tus datos."
          action={
            <button className="button" type="button" onClick={() => navigate('/backups/new')}>
              + Nuevo trabajo de backup
            </button>
          }
        />
      )}

      {jobs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {jobs.map((job) => (
            <div key={job._id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 4 }}>
                    {job.name}
                    <span style={{ marginLeft: 8, fontSize: '0.75rem', padding: '2px 8px', borderRadius: 12, background: job.enabled ? '#dcfce7' : '#f3f4f6', color: job.enabled ? '#16a34a' : '#6b7280' }}>
                      {job.enabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    {FREQ_LABELS[job.frequency] || job.frequency} · Formato: {job.format?.toUpperCase()} · Retención: {job.retentionCount} copias
                  </div>
                  {(job.includeModules || []).length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: 4 }}>
                      Módulos: {job.includeModules.join(', ')}
                    </div>
                  )}
                  {job.lastRunAt && (
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: 2 }}>
                      Última ejecución: <DateDisplay value={job.lastRunAt} />
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    className="button"
                    type="button"
                    disabled={running === job._id}
                    onClick={() => void handleRun(job._id)}
                  >
                    {running === job._id ? 'Ejecutando...' : 'Ejecutar ahora'}
                  </button>
                  <button className="button button--ghost" type="button" onClick={() => navigate(`/backups/${job._id}/edit`)}>
                    Editar
                  </button>
                  <button className="button button--ghost" type="button" style={{ color: '#dc2626' }} onClick={() => void handleDelete(job._id)}>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
