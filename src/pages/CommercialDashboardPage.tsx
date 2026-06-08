import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { commercialDashboardApi } from '../api/services';
import { CommercialFunnelEvolutionChart } from '../components/commercial/CommercialFunnelEvolutionChart';
import { CommercialLeadsBySourceChart } from '../components/commercial/CommercialLeadsBySourceChart';
import { CommercialLeadsByStatusChart } from '../components/commercial/CommercialLeadsByStatusChart';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { CommercialFunnelEvolutionPoint, Quotation, Reservation } from '../types';
import { asBuyer, asDevelopment, asLead, asLot, lotLabel, partyName } from '../utils/format';
import { quotationStatusLabels, reservationStatusLabels } from '../utils/labels';

type Summary = Awaited<ReturnType<typeof commercialDashboardApi.summary>>;
type GroupItem = { _id: string; count: number };

export function CommercialDashboardPage(): React.ReactElement {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [byStatus, setByStatus] = useState<GroupItem[]>([]);
  const [bySource, setBySource] = useState<GroupItem[]>([]);
  const [funnelEvolution, setFunnelEvolution] = useState<CommercialFunnelEvolutionPoint[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const [summaryData, statusData, sourceData, funnelData, reservationData, quotationData] = await Promise.all([
          commercialDashboardApi.summary(),
          commercialDashboardApi.leadsByStatus(),
          commercialDashboardApi.leadsBySource(),
          commercialDashboardApi.funnelEvolution({ months: '6' }),
          commercialDashboardApi.activeReservations(),
          commercialDashboardApi.quotations(),
        ]);
        setSummary(summaryData);
        setByStatus(statusData.items || []);
        setBySource(sourceData.items || []);
        setFunnelEvolution(funnelData.monthlyData || []);
        setReservations(reservationData.reservations || []);
        setQuotations(quotationData.quotations || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el dashboard comercial.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) return <LoadingState />;

  const cards = [
    ['Interesados nuevos', summary?.newLeads],
    ['Interesados contactados', summary?.contactedLeads],
    ['Cotizaciones enviadas', summary?.sentQuotations],
    ['Reservas activas', summary?.activeReservations],
    ['Reservas vencidas', summary?.expiredReservations],
    ['Conversiones a venta', summary?.convertedSales],
    ['Leads perdidos', summary?.lostLeads],
  ];

  return (
    <>
      <PageHeader title="Dashboard comercial" description="Indicadores basicos de preventa y seguimiento." />
      <ErrorMessage message={error} />
      <section className="metric-grid">
        {cards.map(([label, value]) => <article className="metric-card" key={String(label)}><span>{label}</span><strong>{value ?? 0}</strong></article>)}
      </section>
      <section className="panel">
        <h2>Embudo comercial - últimos 6 meses</h2>
        <CommercialFunnelEvolutionChart data={funnelEvolution} />
      </section>
      <section className="two-column commercial-charts-row">
        <article className="panel">
          <h2>Leads por estado</h2>
          <CommercialLeadsByStatusChart data={byStatus} />
        </article>
        <article className="panel">
          <h2>Leads por origen</h2>
          <CommercialLeadsBySourceChart data={bySource} />
        </article>
      </section>
      <section className="panel">
        <h2>Reservas proximas a vencer</h2>
        <DataTable rows={reservations.slice(0, 8)} getRowKey={(item) => item._id} emptyTitle="No hay reservas activas." columns={[
          { key: 'number', header: 'Numero', render: (item) => <Link to={`/reservations/${item._id}`}>{item.reservationNumber}</Link> },
          { key: 'party', header: 'Interesado/comprador', render: (item) => partyName(asLead(item.leadId), asBuyer(item.buyerId)) },
          { key: 'lot', header: 'Lote', render: (item) => `${asDevelopment(item.developmentId)?.name || '-'} - ${lotLabel(asLot(item.lotId))}` },
          { key: 'exp', header: 'Vencimiento', render: (item) => <DateDisplay value={item.expirationDate} /> },
          { key: 'status', header: 'Estado', render: (item) => <StatusBadge label={reservationStatusLabels[item.status]} /> },
        ]} />
      </section>
      <section className="panel">
        <h2>Cotizaciones proximas a vencer</h2>
        <DataTable rows={quotations.slice(0, 8)} getRowKey={(item) => item._id} emptyTitle="No hay cotizaciones." columns={[
          { key: 'number', header: 'Numero', render: (item) => <Link to={`/quotations/${item._id}`}>{item.quotationNumber}</Link> },
          { key: 'party', header: 'Interesado/comprador', render: (item) => partyName(asLead(item.leadId), asBuyer(item.buyerId)) },
          { key: 'lot', header: 'Lote', render: (item) => `${asDevelopment(item.developmentId)?.name || '-'} - ${lotLabel(asLot(item.lotId))}` },
          { key: 'valid', header: 'Validez', render: (item) => <DateDisplay value={item.validUntil} /> },
          { key: 'status', header: 'Estado', render: (item) => <StatusBadge label={quotationStatusLabels[item.status]} /> },
        ]} />
      </section>
    </>
  );
}
