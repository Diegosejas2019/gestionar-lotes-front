import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { buyersApi, salesApi } from '../api/services';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { DataTable } from '../components/DataTable';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Buyer, Sale } from '../types';
import { asDevelopment, asLot, buyerName, getId, lotLabel } from '../utils/format';
import { saleStatusLabels } from '../utils/labels';

export function BuyerDetailPage(): React.ReactElement {
  const { id } = useParams();
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const [buyerData, saleData] = await Promise.all([buyersApi.get(id!), salesApi.list()]);
        setBuyer(buyerData.buyer);
        setSales((saleData.sales || []).filter((sale) => getId(sale.buyerId) === id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el comprador.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  const total = useMemo(() => sales.reduce((sum, sale) => sum + Number(sale.totalPrice || 0), 0), [sales]);

  if (loading) return <LoadingState />;
  if (!buyer) return <ErrorMessage message={error || 'Comprador no encontrado.'} />;

  return (
    <>
      <PageHeader title={buyerName(buyer)} description={`${buyer.documentType || 'DNI'} ${buyer.documentNumber}`} action={<Link className="button" to={`/buyers/${buyer._id}/edit`}>Editar</Link>} />
      <ErrorMessage message={error} />
      <section className="metric-grid metric-grid--small">
        <article className="metric-card"><span>Operaciones</span><strong>{sales.length}</strong></article>
        <article className="metric-card"><span>Total vendido</span><strong><CurrencyAmount amount={total} /></strong></article>
        <article className="metric-card"><span>Teléfono</span><strong>{buyer.phone || '-'}</strong></article>
        <article className="metric-card"><span>Email</span><strong>{buyer.email || '-'}</strong></article>
      </section>
      <section className="panel">
        <h2>Ventas del comprador</h2>
        <DataTable
          rows={sales}
          getRowKey={(item) => item._id}
          emptyTitle="Este comprador no tiene operaciones."
          columns={[
            { key: 'sale', header: 'Nro venta', render: (item) => <Link to={`/sales/${item._id}`}>{item.saleNumber}</Link> },
            { key: 'dev', header: 'Barrio', render: (item) => asDevelopment(item.developmentId)?.name || 'Sin barrio' },
            { key: 'lot', header: 'Lote', render: (item) => lotLabel(asLot(item.lotId)) },
            { key: 'total', header: 'Precio total', render: (item) => <CurrencyAmount amount={item.totalPrice} currency={item.currency} /> },
            { key: 'status', header: 'Estado', render: (item) => <StatusBadge label={saleStatusLabels[item.status]} tone={item.status === 'active' ? 'success' : 'neutral'} /> },
          ]}
        />
      </section>
    </>
  );
}
