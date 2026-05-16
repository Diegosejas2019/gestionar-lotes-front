import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { developmentsApi, lotsApi, reservationsApi, salesApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { DataTable } from '../components/DataTable';
import { ErrorMessage } from '../components/ErrorMessage';
import { FilterBar } from '../components/FilterBar';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Development, Lot, Reservation, Sale } from '../types';
import { asBuyer, asLead, buyerName, getId, partyName } from '../utils/format';
import { lotStatusLabels, lotStatuses } from '../utils/labels';

export function LotsPage(): React.ReactElement {
  const [lots, setLots] = useState<Lot[]>([]);
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filters, setFilters] = useState({ developmentId: '', status: '', block: '', priceMin: '', priceMax: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(): Promise<void> {
    try {
      setLoading(true);
      const [lotData, devData, saleData, reservationData] = await Promise.all([lotsApi.list(), developmentsApi.list(), salesApi.list(), reservationsApi.list()]);
      setLots(lotData.lots || []);
      setDevelopments(devData.developments || []);
      setSales(saleData.sales || []);
      setReservations(reservationData.reservations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los lotes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const devMap = useMemo(() => new Map(developments.map((item) => [item._id, item])), [developments]);
  const saleByLot = useMemo(() => new Map(sales.filter((sale) => sale.status !== 'cancelled').map((sale) => [getId(sale.lotId), sale])), [sales]);
  const reservationByLot = useMemo(() => new Map(reservations.filter((reservation) => ['active', 'pending_payment', 'paid'].includes(reservation.status)).map((reservation) => [getId(reservation.lotId), reservation])), [reservations]);
  const filteredLots = lots.filter((lot) => {
    if (filters.developmentId && getId(lot.developmentId) !== filters.developmentId) return false;
    if (filters.status && lot.status !== filters.status) return false;
    if (filters.block && !String(lot.block || '').toLowerCase().includes(filters.block.toLowerCase())) return false;
    if (filters.priceMin && lot.price < Number(filters.priceMin)) return false;
    if (filters.priceMax && lot.price > Number(filters.priceMax)) return false;
    return true;
  });

  async function confirmDelete(): Promise<void> {
    if (!deleteId) return;
    try {
      await lotsApi.remove(deleteId);
      setDeleteId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el lote.');
      setDeleteId(null);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Lotes" description="Inventario comercial de lotes." action={<Link className="button" to="/lots/new">Nuevo lote</Link>} />
      <ErrorMessage message={error} />
      <FilterBar>
        <label>Barrio<select value={filters.developmentId} onChange={(event) => setFilters({ ...filters, developmentId: event.target.value })}><option value="">Todos</option>{developments.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
        <label>Estado<select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">Todos</option>{lotStatuses.map((status) => <option key={status} value={status}>{lotStatusLabels[status]}</option>)}</select></label>
        <label>Manzana<input value={filters.block} onChange={(event) => setFilters({ ...filters, block: event.target.value })} /></label>
        <label>Precio desde<input type="number" value={filters.priceMin} onChange={(event) => setFilters({ ...filters, priceMin: event.target.value })} /></label>
        <label>Precio hasta<input type="number" value={filters.priceMax} onChange={(event) => setFilters({ ...filters, priceMax: event.target.value })} /></label>
      </FilterBar>
      <DataTable
        rows={filteredLots}
        getRowKey={(item) => item._id}
        emptyTitle="No hay lotes para mostrar."
        columns={[
          { key: 'dev', header: 'Barrio', render: (item) => devMap.get(getId(item.developmentId))?.name || 'Sin barrio' },
          { key: 'block', header: 'Manzana', render: (item) => item.block || '-' },
          { key: 'lot', header: 'Lote', render: (item) => item.lotNumber },
          { key: 'surface', header: 'Superficie', render: (item) => `${item.surface || 0} m2` },
          { key: 'measures', header: 'Medidas', render: (item) => `${item.frontMeasure || 0} x ${item.depthMeasure || 0}` },
          { key: 'price', header: 'Precio', render: (item) => <CurrencyAmount amount={item.price} currency={item.currency} /> },
          { key: 'status', header: 'Estado', render: (item) => <StatusBadge label={lotStatusLabels[item.status]} tone={item.status === 'available' ? 'success' : item.status === 'sold' ? 'info' : 'warning'} /> },
          { key: 'sale', header: 'Comprador/Venta', render: (item) => {
            const sale = saleByLot.get(item._id);
            const reservation = reservationByLot.get(item._id);
            if (sale) return <Link to={`/sales/${sale._id}`}>{buyerName(asBuyer(sale.buyerId))}</Link>;
            if (reservation) return <Link to={`/reservations/${reservation._id}`}>{partyName(asLead(reservation.leadId), asBuyer(reservation.buyerId))}</Link>;
            return 'Sin venta';
          } },
          { key: 'actions', header: 'Acciones', render: (item) => (
            <div className="row-actions">
              <Link className="link-button" to={`/lots/${item._id}/edit`}>Editar</Link>
              <button type="button" className="text-danger" onClick={() => setDeleteId(item._id)}>Eliminar</button>
            </div>
          ) },
        ]}
      />
      <ConfirmDialog open={Boolean(deleteId)} title="Eliminar lote" message="Se dará de baja el lote si no tiene una venta asociada." danger confirmLabel="Eliminar" onConfirm={() => { void confirmDelete(); }} onCancel={() => setDeleteId(null)} />
    </>
  );
}
