import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reservationsApi } from '../api/services';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { FilterBar } from '../components/FilterBar';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Reservation } from '../types';
import { asBuyer, asDevelopment, asLead, asLot, lotLabel, partyName } from '../utils/format';
import { reservationStatusLabels, reservationStatuses } from '../utils/labels';

export function ReservationsPage(): React.ReactElement {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filters, setFilters] = useState({ status: '', q: '', expired: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const data = await reservationsApi.list();
        setReservations(data.reservations || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las reservas.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const now = new Date();
  const filtered = reservations.filter((item) => {
    if (filters.status && item.status !== filters.status) return false;
    if (filters.expired && new Date(item.expirationDate) >= now) return false;
    const text = `${item.reservationNumber} ${partyName(asLead(item.leadId), asBuyer(item.buyerId))} ${asDevelopment(item.developmentId)?.name || ''} ${lotLabel(asLot(item.lotId))}`.toLowerCase();
    if (filters.q && !text.includes(filters.q.toLowerCase())) return false;
    return true;
  });

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Reservas" description="Reservas temporales y senas comerciales." action={<Link className="button" to="/reservations/new">Nueva reserva</Link>} />
      <ErrorMessage message={error} />
      <FilterBar>
        <label>Estado<select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">Todos</option>{reservationStatuses.map((status) => <option key={status} value={status}>{reservationStatusLabels[status]}</option>)}</select></label>
        <label>Buscar<input value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} /></label>
        <label><input type="checkbox" checked={filters.expired} onChange={(event) => setFilters({ ...filters, expired: event.target.checked })} /> Vencidas</label>
      </FilterBar>
      <DataTable
        rows={filtered}
        getRowKey={(item) => item._id}
        emptyTitle="No hay reservas para mostrar."
        columns={[
          { key: 'number', header: 'Numero', render: (item) => <Link to={`/reservations/${item._id}`}>{item.reservationNumber}</Link> },
          { key: 'party', header: 'Interesado/comprador', render: (item) => partyName(asLead(item.leadId), asBuyer(item.buyerId)) },
          { key: 'dev', header: 'Barrio', render: (item) => asDevelopment(item.developmentId)?.name || '-' },
          { key: 'lot', header: 'Lote', render: (item) => lotLabel(asLot(item.lotId)) },
          { key: 'date', header: 'Reserva', render: (item) => <DateDisplay value={item.reservationDate} /> },
          { key: 'exp', header: 'Vencimiento', render: (item) => <DateDisplay value={item.expirationDate} /> },
          { key: 'amount', header: 'Sena', render: (item) => <CurrencyAmount amount={item.reservationAmount} currency={item.currency} /> },
          { key: 'status', header: 'Estado', render: (item) => <StatusBadge label={reservationStatusLabels[item.status]} tone={item.status === 'paid' || item.status === 'converted_to_sale' ? 'success' : item.status === 'expired' || item.status === 'cancelled' ? 'danger' : 'warning'} /> },
        ]}
      />
    </>
  );
}
