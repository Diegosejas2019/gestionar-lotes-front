import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/services';
import { CurrencyAmount, CurrencyTotals } from '../components/CurrencyAmount';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { DashboardSummary, Installment } from '../types';
import { asBuyer, asDevelopment, asLot, buyerName, lotLabel } from '../utils/format';

export function DashboardPage(): React.ReactElement {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [overdue, setOverdue] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    async function load(): Promise<void> {
      try {
        setLoading(true);
        const [summaryData, overdueData] = await Promise.all([
          dashboardApi.summary(),
          dashboardApi.overdueInstallments(),
        ]);
        if (!ignore) {
          setSummary(summaryData);
          setOverdue(overdueData.installments || []);
        }
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : 'No se pudo cargar el dashboard.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    void load();
    return () => { ignore = true; };
  }, []);

  if (loading) return <LoadingState />;

  const cards = [
    ['Barrios activos', summary?.activeDevelopments],
    ['Lotes totales', summary?.totalLots],
    ['Lotes disponibles', summary?.availableLots],
    ['Lotes reservados', summary?.reservedLots],
    ['Lotes vendidos', summary?.soldLots],
    ['Ventas activas', summary?.activeSales],
    ['Monto total vendido', <CurrencyTotals key="sold" totals={summary?.totalSoldByCurrency} />],
    ['Monto total cobrado', <CurrencyTotals key="collected" totals={summary?.totalCollectedByCurrency} />],
    ['Saldo pendiente', <CurrencyTotals key="pending" totals={summary?.pendingBalanceByCurrency} />],
    ['Cuotas vencidas', summary?.overdueInstallments],
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Estado general de ventas, cobranza y vencimientos." />
      <ErrorMessage message={error} />
      <section className="metric-grid">
        {cards.map(([label, value]) => (
          <article className="metric-card" key={String(label)}>
            <span>{label}</span>
            <strong>{value ?? 0}</strong>
          </article>
        ))}
      </section>
      <section className="panel">
        <h2>Alertas de cuotas vencidas</h2>
        <DataTable
          rows={overdue}
          getRowKey={(item) => item._id}
          emptyTitle="No hay cuotas vencidas."
          columns={[
            { key: 'buyer', header: 'Comprador', render: (item) => buyerName(asBuyer(typeof item.saleId === 'string' ? null : item.saleId.buyerId)) },
            { key: 'development', header: 'Barrio', render: (item) => asDevelopment(typeof item.saleId === 'string' ? '' : item.saleId.developmentId)?.name || 'Sin barrio' },
            { key: 'lot', header: 'Lote', render: (item) => lotLabel(asLot(typeof item.saleId === 'string' ? '' : item.saleId.lotId)) },
            { key: 'count', header: 'Cuotas vencidas', render: () => 1 },
            { key: 'amount', header: 'Monto vencido', render: (item) => <CurrencyAmount amount={item.pendingAmount ?? item.amount - (item.paidAmount || 0)} currency={item.currency} /> },
            { key: 'last', header: 'Último pago', render: () => 'Sin dato' },
            { key: 'status', header: 'Estado', render: () => <StatusBadge label="Vencida" tone="danger" /> },
            { key: 'action', header: 'Acción', render: (item) => typeof item.saleId === 'string' ? null : <Link className="link-button" to={`/sales/${item.saleId._id}`}>Ver venta</Link> },
          ]}
        />
      </section>
    </>
  );
}
