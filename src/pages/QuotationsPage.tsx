import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { quotationsApi } from '../api/services';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { FilterBar } from '../components/FilterBar';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Quotation } from '../types';
import { asBuyer, asDevelopment, asLead, asLot, buyerName, leadName, lotLabel, partyName } from '../utils/format';
import { quotationStatusLabels, quotationStatuses } from '../utils/labels';

export function QuotationsPage(): React.ReactElement {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [filters, setFilters] = useState({ status: '', q: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const data = await quotationsApi.list();
        setQuotations(data.quotations || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las cotizaciones.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const filtered = quotations.filter((item) => {
    if (filters.status && item.status !== filters.status) return false;
    const text = `${item.quotationNumber} ${partyName(asLead(item.leadId), asBuyer(item.buyerId))} ${asDevelopment(item.developmentId)?.name || ''} ${lotLabel(asLot(item.lotId))}`.toLowerCase();
    if (filters.q && !text.includes(filters.q.toLowerCase())) return false;
    return true;
  });

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Cotizaciones" description="Simulaciones comerciales y PDFs para preventa." action={<Link className="button" to="/quotations/new">Nueva cotizacion</Link>} />
      <ErrorMessage message={error} />
      <FilterBar>
        <label>Estado<select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">Todos</option>{quotationStatuses.map((status) => <option key={status} value={status}>{quotationStatusLabels[status]}</option>)}</select></label>
        <label>Buscar<input value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} /></label>
      </FilterBar>
      <DataTable
        rows={filtered}
        getRowKey={(item) => item._id}
        emptyTitle="No hay cotizaciones para mostrar."
        columns={[
          { key: 'number', header: 'Numero', render: (item) => <Link to={`/quotations/${item._id}`}>{item.quotationNumber}</Link> },
          { key: 'party', header: 'Interesado/comprador', render: (item) => partyName(asLead(item.leadId), asBuyer(item.buyerId)) },
          { key: 'dev', header: 'Barrio', render: (item) => asDevelopment(item.developmentId)?.name || '-' },
          { key: 'lot', header: 'Lote', render: (item) => lotLabel(asLot(item.lotId)) },
          { key: 'price', header: 'Precio final', render: (item) => <CurrencyAmount amount={item.finalPrice} currency={item.currency} /> },
          { key: 'down', header: 'Anticipo', render: (item) => <CurrencyAmount amount={item.downPaymentAmount} currency={item.currency} /> },
          { key: 'installments', header: 'Cuotas', render: (item) => `${item.installmentCount} x ${item.installmentAmount}` },
          { key: 'valid', header: 'Validez', render: (item) => <DateDisplay value={item.validUntil} /> },
          { key: 'status', header: 'Estado', render: (item) => <StatusBadge label={quotationStatusLabels[item.status]} tone={item.status.includes('converted') ? 'success' : item.status === 'expired' || item.status === 'rejected' ? 'danger' : 'info'} /> },
        ]}
      />
    </>
  );
}
