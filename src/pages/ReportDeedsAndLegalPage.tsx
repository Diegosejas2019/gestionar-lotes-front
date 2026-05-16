import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { reportsApi } from '../api/services';

interface DeedsData {
  deedsByStatus: Record<string, number>;
  deedsSigningScheduled: number;
  deedsWithMissingDocuments: number;
  legalByStatus: Record<string, number>;
  legalByType: Record<string, number>;
  refinancingByStatus: Record<string, number>;
}

const deedStatusLabels: Record<string, string> = {
  not_started: 'Sin iniciar', pending_documents: 'Docs. pendientes', documents_complete: 'Docs. completos',
  sent_to_notary: 'Enviado a escribanía', signing_scheduled: 'Firma programada', signed: 'Firmado',
  delivered: 'Entregado', completed: 'Completado', cancelled: 'Cancelado',
};
const legalStatusLabels: Record<string, string> = {
  open: 'Abierto', in_progress: 'En proceso', waiting_response: 'Esperando respuesta', resolved: 'Resuelto', cancelled: 'Cancelado',
};
const legalTypeLabels: Record<string, string> = {
  legal_review: 'Revisión legal', rescission: 'Rescisión', execution: 'Ejecución', mediation: 'Mediación', other: 'Otro',
};
const refinancingLabels: Record<string, string> = {
  draft: 'Borrador', pending_signature: 'Firma pendiente', signed: 'Firmado', active: 'Activo', cancelled: 'Cancelado', completed: 'Completado',
};

function StatusTable({ data, labels }: { data: Record<string, number>; labels: Record<string, string> }) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  if (entries.length === 0) return <p className="text-muted">Sin datos.</p>;
  return (
    <table className="simple-table">
      <tbody>
        {entries.map(([k, v]) => (
          <tr key={k}><td>{labels[k] ?? k}</td><td className="text-right"><strong>{v}</strong></td></tr>
        ))}
      </tbody>
    </table>
  );
}

export function ReportDeedsAndLegalPage(): React.ReactElement {
  const [data, setData] = useState<DeedsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  function load() {
    setLoading(true);
    setError('');
    const params: Record<string, string> = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    void (async () => {
      try {
        const res = await reportsApi.deedsAndLegal(params);
        setData((res as { data: DeedsData }).data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el reporte legal.');
      } finally {
        setLoading(false);
      }
    })();
  }

  useEffect(load, []);

  if (loading) return <LoadingState message="Cargando reporte legal y escrituración..." />;

  return (
    <div className="page-container">
      <PageHeader title="Reporte legal y escrituración" description="Escrituraciones, procesos legales y refinanciaciones." />

      <div className="filter-bar">
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input" />
        <button className="button button--primary" onClick={load}>Actualizar</button>
      </div>

      {error && <ErrorMessage message={error} />}

      {!data ? (
        <EmptyState title="Sin datos" message="No hay datos para el período seleccionado." />
      ) : (
        <div className="report-grid">
          <div className="report-card">
            <h3>Escrituraciones por estado</h3>
            <StatusTable data={data.deedsByStatus} labels={deedStatusLabels} />
            <div className="report-summary">
              <span>Firmas programadas próximas: <strong>{data.deedsSigningScheduled}</strong></span>
              <span>Con documentación pendiente: <strong>{data.deedsWithMissingDocuments}</strong></span>
            </div>
          </div>
          <div className="report-card">
            <h3>Procesos legales por estado</h3>
            <StatusTable data={data.legalByStatus} labels={legalStatusLabels} />
          </div>
          <div className="report-card">
            <h3>Procesos legales por tipo</h3>
            <StatusTable data={data.legalByType} labels={legalTypeLabels} />
          </div>
          <div className="report-card">
            <h3>Refinanciaciones por estado</h3>
            <StatusTable data={data.refinancingByStatus} labels={refinancingLabels} />
          </div>
        </div>
      )}
    </div>
  );
}
