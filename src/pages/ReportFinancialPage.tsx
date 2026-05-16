import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { CurrencyTotals } from '../components/CurrencyAmount';
import { reportsApi } from '../api/services';
import type { Currency } from '../types';

interface FinancialData {
  totalSoldByCurrency: Partial<Record<Currency, number>>;
  totalCollectedByCurrency: Partial<Record<Currency, number>>;
  pendingBalanceByCurrency: Partial<Record<Currency, number>>;
  overdueAmountByCurrency: Partial<Record<Currency, number>>;
  collectionRateByCurrency: Partial<Record<Currency, number>>;
  paymentRequestsPendingByCurrency: Partial<Record<Currency, number>>;
  paymentsByMethod: Array<{ _id: { method: string; currency: string }; total: number; count: number }>;
  paymentsByMonth: Array<{ _id: { year: number; month: number; currency: string }; total: number }>;
}

const methodLabels: Record<string, string> = {
  cash: 'Efectivo', transfer: 'Transferencia', bank_deposit: 'Depósito',
  mercado_pago: 'Mercado Pago', other: 'Otro',
};

export function ReportFinancialPage(): React.ReactElement {
  const [data, setData] = useState<FinancialData | null>(null);
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
        const res = await reportsApi.financial(params);
        setData((res as { data: FinancialData }).data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el reporte financiero.');
      } finally {
        setLoading(false);
      }
    })();
  }

  useEffect(load, []);

  if (loading) return <LoadingState message="Cargando reporte financiero..." />;

  return (
    <div className="page-container">
      <PageHeader title="Reporte financiero" description="Ventas, cobranza y saldos separados por moneda." />

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
            <h3>Total vendido</h3>
            <CurrencyTotals totals={data.totalSoldByCurrency} />
          </div>
          <div className="report-card">
            <h3>Total cobrado</h3>
            <CurrencyTotals totals={data.totalCollectedByCurrency} />
          </div>
          <div className="report-card">
            <h3>Saldo pendiente</h3>
            <CurrencyTotals totals={data.pendingBalanceByCurrency} />
          </div>
          <div className="report-card">
            <h3>Deuda vencida</h3>
            <CurrencyTotals totals={data.overdueAmountByCurrency} />
          </div>
          <div className="report-card">
            <h3>Tasa de cobranza</h3>
            {Object.entries(data.collectionRateByCurrency).map(([c, v]) => (
              <div key={c}><span className="currency-label">{c}</span> {v}%</div>
            ))}
          </div>
          <div className="report-card">
            <h3>Pagos pendientes de aprobación</h3>
            <CurrencyTotals totals={data.paymentRequestsPendingByCurrency} />
          </div>
          <div className="report-card">
            <h3>Pagos por método</h3>
            {data.paymentsByMethod.length === 0 ? (
              <p className="text-muted">Sin datos.</p>
            ) : (
              <table className="simple-table">
                <thead><tr><th>Método</th><th>Moneda</th><th>Total</th><th>Cantidad</th></tr></thead>
                <tbody>
                  {data.paymentsByMethod.map((r, i) => (
                    <tr key={i}>
                      <td>{methodLabels[r._id.method] ?? r._id.method}</td>
                      <td>{r._id.currency}</td>
                      <td className="text-right">{r.total.toLocaleString('es-AR')}</td>
                      <td className="text-right">{r.count}</td>
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
