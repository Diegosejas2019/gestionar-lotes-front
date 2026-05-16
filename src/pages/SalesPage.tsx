import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, salesApi } from '../api/services';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { FilterBar } from '../components/FilterBar';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Installment, Sale } from '../types';
import { asBuyer, asDevelopment, asLot, buyerName, getId, lotLabel } from '../utils/format';
import { saleStatusLabels, saleStatuses } from '../utils/labels';

export function SalesPage(): React.ReactElement {
  const [sales, setSales] = useState<Sale[]>([]);
  const [overdueInstallments, setOverdueInstallments] = useState<Installment[]>([]);
  const [filters, setFilters] = useState({ development: '', status: '', buyer: '', lot: '', overdue: false, from: '', to: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const [saleData, overdueData] = await Promise.all([
          salesApi.list(),
          dashboardApi.overdueInstallments(),
        ]);
        setSales(saleData.sales || []);
        setOverdueInstallments(overdueData.installments || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las ventas.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const options = useMemo(() => {
    const developments = new Map<string, string>();
    sales.forEach((sale) => {
      const dev = asDevelopment(sale.developmentId);
      if (dev) developments.set(dev._id, dev.name);
    });
    return { developments: Array.from(developments.entries()) };
  }, [sales]);

  const overdueBySale = useMemo(() => {
    const map = new Map<string, number>();
    overdueInstallments.forEach((installment) => {
      const saleId = getId(installment.saleId);
      map.set(saleId, (map.get(saleId) || 0) + 1);
    });
    return map;
  }, [overdueInstallments]);

  const filteredSales = sales.filter((sale) => {
    const dev = asDevelopment(sale.developmentId);
    const buyer = asBuyer(sale.buyerId);
    const lot = asLot(sale.lotId);
    if (filters.development && dev?._id !== filters.development) return false;
    if (filters.status && sale.status !== filters.status) return false;
    if (filters.buyer && !buyerName(buyer).toLowerCase().includes(filters.buyer.toLowerCase())) return false;
    if (filters.lot && !lotLabel(lot).toLowerCase().includes(filters.lot.toLowerCase())) return false;
    if (filters.overdue && !overdueBySale.get(sale._id)) return false;
    if (filters.from && sale.createdAt && new Date(sale.createdAt) < new Date(filters.from)) return false;
    if (filters.to && sale.createdAt && new Date(sale.createdAt) > new Date(`${filters.to}T23:59:59`)) return false;
    return true;
  });

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Ventas" description="Operaciones comerciales y estado financiero." action={<Link className="button" to="/sales/new">Nueva venta</Link>} />
      <ErrorMessage message={error} />
      <FilterBar>
        <label>Barrio<select value={filters.development} onChange={(event) => setFilters({ ...filters, development: event.target.value })}><option value="">Todos</option>{options.developments.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
        <label>Estado<select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">Todos</option>{saleStatuses.map((status) => <option key={status} value={status}>{saleStatusLabels[status]}</option>)}</select></label>
        <label>Comprador<input value={filters.buyer} onChange={(event) => setFilters({ ...filters, buyer: event.target.value })} /></label>
        <label>Lote<input value={filters.lot} onChange={(event) => setFilters({ ...filters, lot: event.target.value })} /></label>
        <label>Fecha desde<input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} /></label>
        <label>Fecha hasta<input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} /></label>
        <label><input type="checkbox" checked={filters.overdue} onChange={(event) => setFilters({ ...filters, overdue: event.target.checked })} /> Con cuotas vencidas</label>
      </FilterBar>
      <DataTable
        rows={filteredSales}
        getRowKey={(item) => item._id}
        emptyTitle="No hay ventas para mostrar."
        columns={[
          { key: 'number', header: 'Nro venta', render: (item) => <Link to={`/sales/${item._id}`}>{item.saleNumber}</Link> },
          { key: 'buyer', header: 'Comprador', render: (item) => buyerName(asBuyer(item.buyerId)) },
          { key: 'dev', header: 'Barrio', render: (item) => asDevelopment(item.developmentId)?.name || 'Sin barrio' },
          { key: 'lot', header: 'Lote', render: (item) => lotLabel(asLot(item.lotId)) },
          { key: 'total', header: 'Precio total', render: (item) => <CurrencyAmount amount={item.totalPrice} currency={item.currency} /> },
          { key: 'down', header: 'Anticipo', render: (item) => <CurrencyAmount amount={item.downPaymentAmount} currency={item.currency} /> },
          { key: 'collected', header: 'Cobrado', render: (item) => item.status === 'pending_down_payment' ? <CurrencyAmount amount={0} currency={item.currency} /> : <CurrencyAmount amount={item.downPaymentAmount} currency={item.currency} /> },
          { key: 'balance', header: 'Saldo', render: (item) => <CurrencyAmount amount={item.financedAmount} currency={item.currency} /> },
          { key: 'overdue', header: 'Cuotas vencidas', render: (item) => overdueBySale.get(item._id) || 0 },
          { key: 'status', header: 'Estado', render: (item) => <StatusBadge label={saleStatusLabels[item.status]} tone={item.status === 'active' ? 'success' : item.status === 'cancelled' ? 'danger' : 'warning'} /> },
          { key: 'date', header: 'Fecha', render: (item) => <DateDisplay value={item.createdAt} /> },
        ]}
      />
    </>
  );
}
