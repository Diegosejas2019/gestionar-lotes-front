import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { DateDisplay } from '../components/DateDisplay';
import { reportsApi } from '../api/services';

interface MigrationData {
  developmentsReady: Array<{ _id: string; name: string; migrationStatus: string }>;
  developmentsReadyCount: number;
  developmentsMigrated: Array<{ _id: string; name: string; migratedToGestionarAt?: string }>;
  developmentsMigratedCount: number;
  batchesByStatus: Record<string, number>;
  migrationsCompleted: number;
  migrationsFailed: number;
  migrationItemsFailed: number;
  migrationItemsByStatus: Record<string, number>;
}

const batchStatusLabels: Record<string, string> = {
  draft: 'Borrador', simulated: 'Simulado', in_progress: 'En proceso',
  completed: 'Completado', completed_with_warnings: 'Completado c/advertencias',
  failed: 'Fallido', cancelled: 'Cancelado',
};

export function ReportMigrationPage(): React.ReactElement {
  const [data, setData] = useState<MigrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    void (async () => {
      try {
        const res = await reportsApi.migration();
        setData((res as { data: MigrationData }).data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el reporte de migración.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingState message="Cargando reporte de migración..." />;

  return (
    <div className="page-container">
      <PageHeader title="Reporte de migración" description="Estado de la migración de barrios a GestionAr App." />

      {error && <ErrorMessage message={error} />}

      {!data ? (
        <EmptyState title="Sin datos" message="No hay datos de migración." />
      ) : (
        <div className="report-grid">
          <div className="report-card">
            <h3>Resumen</h3>
            <table className="simple-table">
              <tbody>
                <tr><td>Barrios listos para migrar</td><td className="text-right"><strong>{data.developmentsReadyCount}</strong></td></tr>
                <tr><td>Barrios migrados</td><td className="text-right"><strong>{data.developmentsMigratedCount}</strong></td></tr>
                <tr><td>Migraciones completadas</td><td className="text-right"><strong>{data.migrationsCompleted}</strong></td></tr>
                <tr><td>Migraciones fallidas</td><td className="text-right"><strong>{data.migrationsFailed}</strong></td></tr>
                <tr><td>Items fallidos</td><td className="text-right"><strong>{data.migrationItemsFailed}</strong></td></tr>
              </tbody>
            </table>
          </div>

          <div className="report-card">
            <h3>Migraciones por estado</h3>
            {Object.entries(data.batchesByStatus).length === 0 ? (
              <p className="text-muted">Sin datos.</p>
            ) : (
              <table className="simple-table">
                <tbody>
                  {Object.entries(data.batchesByStatus).map(([k, v]) => (
                    <tr key={k}><td>{batchStatusLabels[k] ?? k}</td><td className="text-right"><strong>{v}</strong></td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="report-card">
            <h3>Barrios listos para migrar</h3>
            {data.developmentsReady.length === 0 ? (
              <p className="text-muted">No hay barrios listos para migrar.</p>
            ) : (
              <table className="simple-table">
                <thead><tr><th>Barrio</th><th>Estado</th></tr></thead>
                <tbody>
                  {data.developmentsReady.map((d) => (
                    <tr key={d._id}>
                      <td>{d.name}</td>
                      <td><StatusBadge label="Listo" tone="warning" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="report-card">
            <h3>Barrios migrados</h3>
            {data.developmentsMigrated.length === 0 ? (
              <p className="text-muted">No hay barrios migrados aún.</p>
            ) : (
              <table className="simple-table">
                <thead><tr><th>Barrio</th><th>Fecha de migración</th></tr></thead>
                <tbody>
                  {data.developmentsMigrated.map((d) => (
                    <tr key={d._id}>
                      <td>{d.name}</td>
                      <td>{d.migratedToGestionarAt ? <DateDisplay value={d.migratedToGestionarAt} /> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
