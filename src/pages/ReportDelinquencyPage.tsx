import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { CurrencyTotals } from '../components/CurrencyAmount';
import { DateDisplay } from '../components/DateDisplay';
import { reportsApi } from '../api/services';
import type { Currency } from '../types';

interface DelinquencyData {
  casesBySeverity: Record<string, number>;
  casesByStatus: Record<string, number>;
  totalOpenCases: number;
  criticalCases: number;
  overdueAmountByCurrency: Partial<Record<Currency, number>>;
  topBuyersByOverdue: Array<{ buyerId: string; buyerName: string; overdueInstallmentsCount: number }>;
  casesWithoutRecentAction: number;
  nextActionsDue: Array<{ _id: string; saleId: string; severity: string; nextActionDate: string; status: string }>;
}

const severityLabels: Record<string, string> = { low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica' };
const statusLabels: Record<string, string> = {
  open: 'Abierto', monitoring: 'Monitoreando', notified: 'Notificado', in_agreement: 'En acuerdo',
  in_legal_review: 'En revisión legal', rescission_process: 'Rescisión', resolved: 'Resuelto', cancelled: 'Cancelado',
};

export function ReportDelinquencyPage(): React.ReactElement {
  const [data, setData] = useState<DelinquencyData | null>(null);
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
        const res = await reportsApi.delinquency(params);
        setData((res as { data: DelinquencyData }).data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el reporte de mora.');
      } finally {
        setLoading(false);
      }
    })();
  }

  useEffect(load, []);

  if (loading) return <LoadingState message="Cargando reporte de mora..." />;

  return (
    <div className="page-container">
      <PageHeader title="Reporte de mora" description="Casos de mora por severidad, estado y compradores con mayor deuda." />

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
            <h3>Resumen</h3>
            <table className="simple-table">
              <tbody>
                <tr><td>Casos abiertos</td><td className="text-right"><strong>{data.totalOpenCases}</strong></td></tr>
                <tr><td>Casos críticos</td><td className="text-right"><strong>{data.criticalCases}</strong></td></tr>
                <tr><td>Sin seguimiento reciente</td><td className="text-right"><strong>{data.casesWithoutRecentAction}</strong></td></tr>
              </tbody>
            </table>
          </div>

          <div className="report-card">
            <h3>Monto vencido</h3>
            <CurrencyTotals totals={data.overdueAmountByCurrency} />
          </div>

          <div className="report-card">
            <h3>Casos por severidad</h3>
            <table className="simple-table">
              <tbody>
                {Object.entries(data.casesBySeverity).map(([k, v]) => (
                  <tr key={k}><td>{severityLabels[k] ?? k}</td><td className="text-right"><strong>{v}</strong></td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="report-card">
            <h3>Casos por estado</h3>
            <table className="simple-table">
              <tbody>
                {Object.entries(data.casesByStatus).map(([k, v]) => (
                  <tr key={k}><td>{statusLabels[k] ?? k}</td><td className="text-right"><strong>{v}</strong></td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="report-card">
            <h3>Compradores con mayor mora</h3>
            {data.topBuyersByOverdue.length === 0 ? (
              <p className="text-muted">Sin datos.</p>
            ) : (
              <table className="simple-table">
                <thead><tr><th>Comprador</th><th>Cuotas vencidas</th></tr></thead>
                <tbody>
                  {data.topBuyersByOverdue.map((r) => (
                    <tr key={String(r.buyerId)}>
                      <td>{r.buyerName || '—'}</td>
                      <td className="text-right"><strong>{r.overdueInstallmentsCount}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="report-card">
            <h3>Próximas acciones</h3>
            {data.nextActionsDue.length === 0 ? (
              <p className="text-muted">Sin acciones próximas.</p>
            ) : (
              <table className="simple-table">
                <thead><tr><th>Severidad</th><th>Próxima acción</th></tr></thead>
                <tbody>
                  {data.nextActionsDue.map((r) => (
                    <tr key={r._id}>
                      <td>{severityLabels[r.severity] ?? r.severity}</td>
                      <td><DateDisplay value={r.nextActionDate} /></td>
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
