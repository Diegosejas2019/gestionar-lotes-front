import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { developmentsApi, lotsApi, lotsMapApi } from '../api/services';
import { CurrencyAmount, CurrencyTotals } from '../components/CurrencyAmount';
import { DateDisplay } from '../components/DateDisplay';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { FilterBar } from '../components/FilterBar';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Development, LotVisualStatus, LotsMapLot, LotsMapResponse } from '../types';
import { formatDate } from '../utils/format';
import { lotVisualStatusLabels, lotVisualStatuses, serviceLabels } from '../utils/labels';

const visualTone: Record<LotVisualStatus, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  available: 'success',
  reserved: 'warning',
  reservation_expiring: 'danger',
  sold: 'info',
  sold_with_overdue: 'danger',
  blocked: 'neutral',
  cancelled: 'danger',
  deeded: 'info',
};

export function LotsMapPage(): React.ReactElement {
  const navigate = useNavigate();
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [developmentId, setDevelopmentId] = useState('');
  const [filters, setFilters] = useState({ status: '', block: '', minPrice: '', maxPrice: '', minSurface: '', maxSurface: '', search: '' });
  const [data, setData] = useState<LotsMapResponse | null>(null);
  const [selected, setSelected] = useState<LotsMapLot | null>(null);
  const [loadingDevelopments, setLoadingDevelopments] = useState(true);
  const [loadingMap, setLoadingMap] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDevelopments(): Promise<void> {
      try {
        const res = await developmentsApi.list();
        const items = res.developments || [];
        setDevelopments(items);
        if (items.length === 1) setDevelopmentId(items[0]._id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los barrios.');
      } finally {
        setLoadingDevelopments(false);
      }
    }
    void loadDevelopments();
  }, []);

  useEffect(() => {
    async function loadMap(): Promise<void> {
      if (!developmentId) {
        setData(null);
        return;
      }
      try {
        setLoadingMap(true);
        setError('');
        const params = new URLSearchParams({ developmentId });
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.set(key, value);
        });
        setData(await lotsMapApi.getLotsMap(params));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la vista de lotes.');
      } finally {
        setLoadingMap(false);
      }
    }
    void loadMap();
  }, [developmentId, filters]);

  const blockOptions = useMemo(() => {
    const all = data?.blocks.map((block) => block.block).filter(Boolean) || [];
    return [...new Set(all)];
  }, [data]);

  async function updateLotStatus(lot: LotsMapLot, status: 'available' | 'blocked'): Promise<void> {
    try {
      setSaving(true);
      await lotsApi.update(lot.id, { status });
      setSelected(null);
      const params = new URLSearchParams({ developmentId });
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      setData(await lotsMapApi.getLotsMap(params));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el lote.');
    } finally {
      setSaving(false);
    }
  }

  if (loadingDevelopments) return <LoadingState />;

  return (
    <>
      <PageHeader title="Vista de lotes" description="Mapa operativo por barrio, manzana y estado comercial." action={<button className="button button--ghost" type="button" onClick={() => navigate(developmentId ? `/lots-map/advanced?developmentId=${developmentId}` : '/lots-map/advanced')}>Ver plano avanzado</button>} />
      <ErrorMessage message={error} />
      {!developments.length ? <EmptyState title="No hay barrios cargados." message="Crea un barrio para visualizar sus lotes." /> : null}
      {developments.length ? (
        <>
          <FilterBar>
            <label>Barrio<select value={developmentId} onChange={(event) => setDevelopmentId(event.target.value)}><option value="">Seleccionar</option>{developments.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
            <label>Estado<select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">Todos</option>{lotVisualStatuses.map((status) => <option key={status} value={status}>{lotVisualStatusLabels[status]}</option>)}</select></label>
            <label>Manzana<input list="lots-map-blocks" value={filters.block} onChange={(event) => setFilters({ ...filters, block: event.target.value })} /></label>
            <datalist id="lots-map-blocks">{blockOptions.map((block) => <option key={block} value={block} />)}</datalist>
            <label>Precio desde<input type="number" value={filters.minPrice} onChange={(event) => setFilters({ ...filters, minPrice: event.target.value })} /></label>
            <label>Precio hasta<input type="number" value={filters.maxPrice} onChange={(event) => setFilters({ ...filters, maxPrice: event.target.value })} /></label>
            <label>Superficie desde<input type="number" value={filters.minSurface} onChange={(event) => setFilters({ ...filters, minSurface: event.target.value })} /></label>
            <label>Superficie hasta<input type="number" value={filters.maxSurface} onChange={(event) => setFilters({ ...filters, maxSurface: event.target.value })} /></label>
            <label>Buscar<input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Lote, comprador, venta o reserva" /></label>
          </FilterBar>
          {loadingMap ? <LoadingState /> : null}
          {data && !loadingMap ? (
            <>
              <LotsMapSummary data={data} />
              <LotsStatusLegend />
              {!data.blocks.length ? <EmptyState title="No hay lotes que coincidan con los filtros." message="Probá limpiar filtros o seleccionar otro barrio." /> : null}
              <section className="lots-map">
                {data.blocks.map((block) => (
                  <section className="lots-map-block" key={block.block}>
                    <div className="summary-strip"><h2>Manzana {block.block}</h2><span>{block.totalLots} lotes</span></div>
                    <div className="lots-visual-grid">
                      {block.lots.map((lot) => <LotVisualCard key={lot.id} lot={lot} onSelect={setSelected} />)}
                    </div>
                  </section>
                ))}
              </section>
            </>
          ) : null}
        </>
      ) : null}
      {selected ? (
        <LotQuickDetail
          lot={selected}
          saving={saving}
          onClose={() => setSelected(null)}
          onBlock={() => { void updateLotStatus(selected, 'blocked'); }}
          onUnblock={() => { void updateLotStatus(selected, 'available'); }}
          onNavigate={(path) => navigate(path)}
        />
      ) : null}
    </>
  );
}

function LotsMapSummary({ data }: { data: LotsMapResponse }): React.ReactElement {
  const { summary } = data;
  const cards = [
    ['Lotes totales', summary.totalLots],
    ['Disponibles', summary.available],
    ['Reservados', summary.reserved],
    ['Reservas por vencer', summary.reservationsExpiringSoon],
    ['Vendidos', summary.sold],
    ['Vendidos con mora', summary.soldWithOverdue],
    ['Bloqueados', summary.blocked],
    ['Cancelados', summary.cancelled],
    ['Saldo pendiente', <CurrencyTotals key="pending" totals={summary.pendingBalanceByCurrency} />],
    ['Deuda vencida', <CurrencyTotals key="overdue" totals={summary.overdueAmountByCurrency} />],
  ];
  return <section className="metric-grid metric-grid--small">{cards.map(([label, value]) => <article className="metric-card" key={String(label)}><span>{label}</span><strong>{value}</strong></article>)}</section>;
}

function LotsStatusLegend(): React.ReactElement {
  return <section className="legend-row">{lotVisualStatuses.map((status) => <span key={status}><StatusBadge label={lotVisualStatusLabels[status]} tone={visualTone[status]} /></span>)}</section>;
}

function LotVisualCard({ lot, onSelect }: { lot: LotsMapLot; onSelect: (lot: LotsMapLot) => void }): React.ReactElement {
  return (
    <button className={`lot-visual-card lot-visual-card--${lot.visualStatus}`} type="button" onClick={() => onSelect(lot)}>
      <strong>Mz. {lot.block || '-'} - Lote {lot.lotNumber}</strong>
      <span>{lot.surface || 0} m2</span>
      <span><CurrencyAmount amount={lot.price} currency={lot.currency} /></span>
      <StatusBadge label={lotVisualStatusLabels[lot.visualStatus]} tone={visualTone[lot.visualStatus]} />
      {lot.buyerName ? <span>{lot.buyerName}</span> : null}
      {lot.reservationExpirationDate ? <span>Vence: {formatDate(lot.reservationExpirationDate)}</span> : null}
      {lot.hasOverdueInstallments ? <span>Cuotas vencidas: {lot.overdueInstallmentsCount}</span> : null}
      {lot.nextDueDate ? <span>Próximo vencimiento: {formatDate(lot.nextDueDate)}</span> : null}
    </button>
  );
}

function LotQuickDetail({ lot, saving, onClose, onBlock, onUnblock, onNavigate }: { lot: LotsMapLot; saving: boolean; onClose: () => void; onBlock: () => void; onUnblock: () => void; onNavigate: (path: string) => void }): React.ReactElement {
  const createQuery = `developmentId=${encodeURIComponent(lot.developmentId)}&lotId=${encodeURIComponent(lot.id)}`;
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal modal--wide" role="dialog" aria-modal="true">
        <h2>Detalle rápido del lote</h2>
        <div className="detail-grid">
          <p><strong>Lote:</strong> Mz. {lot.block || '-'} - Lote {lot.lotNumber}</p>
          <p><strong>Estado:</strong> {lotVisualStatusLabels[lot.visualStatus]}</p>
          <p><strong>Superficie:</strong> {lot.surface || 0} m2</p>
          <p><strong>Frente/Fondo:</strong> {lot.frontMeasure || 0} x {lot.depthMeasure || 0}</p>
          <p><strong>Precio:</strong> <CurrencyAmount amount={lot.price} currency={lot.currency} /></p>
          <p><strong>Servicios:</strong> {(lot.services || []).map((service) => serviceLabels[service] || service).join(', ') || 'Sin servicios'}</p>
        </div>
        {lot.reservationId ? <section className="info-box"><h3>Reserva</h3><p>Número: {lot.reservationNumber || '-'}</p><p>Interesado/comprador: {lot.buyerName || '-'}</p><p>Vencimiento: <DateDisplay value={lot.reservationExpirationDate} /></p><p>Seña: <CurrencyAmount amount={lot.reservationAmount || 0} currency={lot.reservationCurrency || lot.currency} /></p></section> : null}
        {lot.saleId ? <section className="info-box"><h3>Venta</h3><p>Número: {lot.saleNumber || '-'}</p><p>Comprador: {lot.buyerName || '-'}</p><p>Estado: {lot.saleStatus || '-'}</p><p>Total vendido: <CurrencyAmount amount={lot.saleTotalPrice || 0} currency={lot.saleCurrency || lot.currency} /></p><p>Saldo pendiente: <CurrencyTotals totals={lot.pendingBalanceByCurrency} /></p><p>Cuotas vencidas: {lot.overdueInstallmentsCount}</p><p>Deuda vencida: <CurrencyTotals totals={lot.overdueAmountByCurrency} /></p></section> : null}
        <div className="modal-actions">
          {lot.actions.canEditLot ? <button className="button button--ghost" type="button" onClick={() => onNavigate(`/lots/${lot.id}/edit`)}>Editar lote</button> : null}
          {lot.actions.canViewSale && lot.saleId ? <button className="button button--ghost" type="button" onClick={() => onNavigate(`/sales/${lot.saleId}`)}>Ver venta</button> : null}
          {lot.actions.canViewReservation && lot.reservationId ? <button className="button button--ghost" type="button" onClick={() => onNavigate(`/reservations/${lot.reservationId}`)}>Ver reserva</button> : null}
          {lot.actions.canViewQuotation && lot.quotationId ? <button className="button button--ghost" type="button" onClick={() => onNavigate(`/quotations/${lot.quotationId}`)}>Ver cotización</button> : null}
          {lot.actions.canViewBuyer && lot.buyerId ? <button className="button button--ghost" type="button" onClick={() => onNavigate(`/buyers/${lot.buyerId}`)}>Ver comprador</button> : null}
          {lot.actions.canCreateReservation ? <button className="button" type="button" onClick={() => onNavigate(`/reservations/new?${createQuery}`)}>Crear reserva</button> : null}
          {lot.actions.canCreateQuotation ? <button className="button" type="button" onClick={() => onNavigate(`/quotations/new?${createQuery}`)}>Crear cotización</button> : null}
          {lot.actions.canCreateSale ? <button className="button" type="button" onClick={() => onNavigate(`/sales/new?${createQuery}`)}>Crear venta</button> : null}
          {lot.actions.canBlock ? <button className="button button--ghost" type="button" disabled={saving} onClick={onBlock}>Bloquear lote</button> : null}
          {lot.actions.canUnblock ? <button className="button button--ghost" type="button" disabled={saving} onClick={onUnblock}>Desbloquear lote</button> : null}
          <button className="button button--ghost" type="button" onClick={onClose}>Cerrar</button>
        </div>
      </section>
    </div>
  );
}
