import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { buyersApi, salesApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DataTable } from '../components/DataTable';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Buyer, Sale } from '../types';
import { buyerName, getId } from '../utils/format';

export function BuyersPage(): React.ReactElement {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(): Promise<void> {
    try {
      setLoading(true);
      const [buyerData, saleData] = await Promise.all([buyersApi.list(), salesApi.list()]);
      setBuyers(buyerData.buyers || []);
      setSales(saleData.sales || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los compradores.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const buyerStats = useMemo(() => {
    const map = new Map<string, { operations: number; active: number; overdue: number }>();
    sales.forEach((sale) => {
      const key = getId(sale.buyerId);
      const current = map.get(key) || { operations: 0, active: 0, overdue: 0 };
      current.operations += 1;
      if (sale.status === 'active' || sale.status === 'pending_down_payment') current.active += 1;
      map.set(key, current);
    });
    return map;
  }, [sales]);

  async function confirmDelete(): Promise<void> {
    if (!deleteId) return;
    try {
      await buyersApi.remove(deleteId);
      setDeleteId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el comprador.');
      setDeleteId(null);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Compradores" description="Personas asociadas a operaciones de venta." action={<Link className="button" to="/buyers/new">Nuevo comprador</Link>} />
      <ErrorMessage message={error} />
      <DataTable
        rows={buyers}
        getRowKey={(item) => item._id}
        emptyTitle="No hay compradores cargados."
        columns={[
          { key: 'name', header: 'Nombre', render: (item) => <Link to={`/buyers/${item._id}`}>{buyerName(item)}</Link> },
          { key: 'doc', header: 'Documento', render: (item) => `${item.documentType || 'DNI'} ${item.documentNumber}` },
          { key: 'phone', header: 'Teléfono', render: (item) => item.phone || '-' },
          { key: 'email', header: 'Email', render: (item) => item.email || '-' },
          { key: 'ops', header: 'Cantidad de operaciones', render: (item) => buyerStats.get(item._id)?.operations || 0 },
          { key: 'financial', header: 'Estado financiero', render: (item) => (buyerStats.get(item._id)?.active || 0) > 0 ? <StatusBadge label="Con operaciones activas" tone="info" /> : <StatusBadge label="Sin deuda registrada" tone="success" /> },
          { key: 'actions', header: 'Acciones', render: (item) => (
            <div className="row-actions">
              <Link className="link-button" to={`/buyers/${item._id}/edit`}>Editar</Link>
              <button type="button" className="text-danger" onClick={() => setDeleteId(item._id)}>Eliminar</button>
            </div>
          ) },
        ]}
      />
      <ConfirmDialog open={Boolean(deleteId)} title="Eliminar comprador" message="Se dará de baja el comprador si no tiene ventas asociadas." danger confirmLabel="Eliminar" onConfirm={() => { void confirmDelete(); }} onCancel={() => setDeleteId(null)} />
    </>
  );
}
