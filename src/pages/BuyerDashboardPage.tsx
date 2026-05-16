import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { buyerPortalApi } from '../api/services';
import { CurrencyAmount, CurrencyTotals } from '../components/CurrencyAmount';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { BuyerDashboard, BuyerSaleSummary } from '../types';
import { saleStatusLabels } from '../utils/labels';

export function BuyerDashboardPage(): React.ReactElement {
  const [dashboard, setDashboard] = useState<BuyerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        setDashboard(await buyerPortalApi.dashboard());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar tu dashboard.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Inicio" description="Resumen de tus compras y vencimientos." />
      <ErrorMessage message={error} />
      <section className="metric-grid">
        <article className="metric-card"><span>Compras activas</span><strong>{dashboard?.activeSalesCount || 0}</strong></article>
        <article className="metric-card"><span>Lotes comprados</span><strong>{dashboard?.purchasedLotsCount || 0}</strong></article>
        <article className="metric-card"><span>Total pagado</span><strong><CurrencyTotals totals={dashboard?.totalPaidByCurrency} /></strong></article>
        <article className="metric-card"><span>Saldo pendiente</span><strong><CurrencyTotals totals={dashboard?.pendingBalanceByCurrency} /></strong></article>
        <article className="metric-card"><span>Cuotas vencidas</span><strong>{dashboard?.overdueInstallmentsCount || 0}</strong></article>
        <article className="metric-card"><span>Proximo vencimiento</span><strong><DateDisplay value={dashboard?.nextDueDate} /></strong></article>
        <article className="metric-card"><span>Documentos disponibles</span><strong>{dashboard?.availableDocumentsCount || 0}</strong></article>
      </section>
      <section className="panel">
        <h2>Mis compras</h2>
        <BuyerSalesTable sales={dashboard?.salesSummary || []} />
      </section>
    </>
  );
}

export function BuyerSalesTable({ sales }: { sales: BuyerSaleSummary[] }): React.ReactElement {
  return (
    <DataTable
      rows={sales}
      getRowKey={(item) => item.saleId}
      emptyTitle="Todavia no tenes compras registradas."
      columns={[
        { key: 'sale', header: 'Venta', render: (item) => item.saleNumber },
        { key: 'development', header: 'Barrio', render: (item) => item.developmentName || '-' },
        { key: 'lot', header: 'Lote', render: (item) => (
          <div className="stack stack--compact">
            <span>{item.lotLabel}</span>
            <span className="badge-row">
              {item.hasReservation ? <StatusBadge label="Con reserva" tone="info" /> : null}
              {item.hasQuotation ? <StatusBadge label="Con cotizacion" tone="info" /> : null}
            </span>
          </div>
        ) },
        { key: 'status', header: 'Estado', render: (item) => <StatusBadge label={saleStatusLabels[item.status]} tone={item.status === 'active' ? 'success' : item.status === 'cancelled' ? 'danger' : 'warning'} /> },
        { key: 'pending', header: 'Saldo pendiente', render: (item) => <CurrencyAmount amount={item.pendingBalance} currency={item.currency} /> },
        { key: 'next', header: 'Proxima cuota', render: (item) => item.nextDueDate ? <><DateDisplay value={item.nextDueDate} /> - <CurrencyAmount amount={item.nextDueAmount} currency={item.currency} /></> : 'Sin vencimientos' },
        { key: 'action', header: 'Accion', render: (item) => <Link className="link-button" to={`/buyer/sales/${item.saleId}`}>Ver detalle</Link> },
      ]}
    />
  );
}
