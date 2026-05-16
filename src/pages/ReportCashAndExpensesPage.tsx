import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { CurrencyTotals } from '../components/CurrencyAmount';
import { reportsApi } from '../api/services';
import type { Currency } from '../types';

interface CashData {
  cashBalancesByCurrency: Partial<Record<Currency, number>>;
  pendingExpensesByCurrency: Partial<Record<Currency, number>>;
  paidExpensesByCurrency: Partial<Record<Currency, number>>;
  expensesByCategory: Array<{ _id: { category: string; currency: string }; total: number }>;
  expensesBySupplier: Array<{ _id: { supplierId: string; currency: string }; total: number; count: number }>;
}

const categoryLabels: Record<string, string> = {
  work: 'Obras', administrative: 'Administrativo', professional_fees: 'Honorarios',
  materials: 'Materiales', machinery: 'Maquinaria', taxes: 'Impuestos',
  services: 'Servicios', marketing: 'Marketing', refund: 'Reembolso', other: 'Otro',
};

export function ReportCashAndExpensesPage(): React.ReactElement {
  const [data, setData] = useState<CashData | null>(null);
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
        const res = await reportsApi.cashAndExpenses(params);
        setData((res as { data: CashData }).data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el reporte de caja y gastos.');
      } finally {
        setLoading(false);
      }
    })();
  }

  useEffect(load, []);

  if (loading) return <LoadingState message="Cargando reporte de caja y gastos..." />;

  return (
    <div className="page-container">
      <PageHeader title="Reporte de caja y gastos" description="Saldos de caja, ingresos, egresos y gastos por categoría." />

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
            <h3>Saldos de caja</h3>
            <CurrencyTotals totals={data.cashBalancesByCurrency} />
          </div>
          <div className="report-card">
            <h3>Gastos pendientes</h3>
            <CurrencyTotals totals={data.pendingExpensesByCurrency} />
          </div>
          <div className="report-card">
            <h3>Gastos pagados</h3>
            <CurrencyTotals totals={data.paidExpensesByCurrency} />
          </div>
          <div className="report-card">
            <h3>Gastos por categoría</h3>
            {data.expensesByCategory.length === 0 ? (
              <p className="text-muted">Sin datos.</p>
            ) : (
              <table className="simple-table">
                <thead><tr><th>Categoría</th><th>Moneda</th><th>Total</th></tr></thead>
                <tbody>
                  {data.expensesByCategory.map((r, i) => (
                    <tr key={i}>
                      <td>{categoryLabels[r._id.category] ?? r._id.category}</td>
                      <td>{r._id.currency}</td>
                      <td className="text-right">{r.total.toLocaleString('es-AR')}</td>
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
