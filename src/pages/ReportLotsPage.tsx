import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { reportsApi } from '../api/services';

interface LotsData {
  lotsByStatus: Record<string, number>;
  totalLots: number;
  available: number;
  reserved: number;
  sold: number;
  blocked: number;
  cancelled: number;
  deeded: number;
  lotsByDevelopment: Array<{ developmentId: string; developmentName: string; status: string; count: number }>;
  lotsByBlock: Array<{ _id: { block: string; status: string }; count: number }>;
}

const statusLabels: Record<string, string> = {
  available: 'Disponible', reserved: 'Reservado', sold: 'Vendido',
  blocked: 'Bloqueado', cancelled: 'Cancelado', deeded: 'Escriturado',
};

export function ReportLotsPage(): React.ReactElement {
  const [data, setData] = useState<LotsData | null>(null);
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
        const res = await reportsApi.lots(params);
        setData((res as { data: LotsData }).data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el reporte de lotes.');
      } finally {
        setLoading(false);
      }
    })();
  }

  useEffect(load, []);

  if (loading) return <LoadingState message="Cargando reporte de lotes..." />;

  return (
    <div className="page-container">
      <PageHeader title="Reporte de lotes" description="Estado y distribución de lotes por barrio y manzana." />

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
            <h3>Lotes por estado</h3>
            <table className="simple-table">
              <tbody>
                {Object.entries(data.lotsByStatus).map(([k, v]) => (
                  <tr key={k}><td>{statusLabels[k] ?? k}</td><td className="text-right"><strong>{v}</strong></td></tr>
                ))}
                <tr><td><strong>Total</strong></td><td className="text-right"><strong>{data.totalLots}</strong></td></tr>
              </tbody>
            </table>
          </div>

          <div className="report-card">
            <h3>Por barrio</h3>
            {data.lotsByDevelopment.length === 0 ? (
              <p className="text-muted">Sin datos.</p>
            ) : (
              <table className="simple-table">
                <thead><tr><th>Barrio</th><th>Estado</th><th>Cantidad</th></tr></thead>
                <tbody>
                  {data.lotsByDevelopment.map((r, i) => (
                    <tr key={i}>
                      <td>{r.developmentName || '—'}</td>
                      <td>{statusLabels[r.status] ?? r.status}</td>
                      <td className="text-right"><strong>{r.count}</strong></td>
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
