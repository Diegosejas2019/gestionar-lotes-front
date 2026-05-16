import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { developmentsApi, lotsApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DataTable } from '../components/DataTable';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Development, Lot } from '../types';
import { developmentStatusLabels } from '../utils/labels';
import { getId } from '../utils/format';

export function DevelopmentsPage(): React.ReactElement {
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(): Promise<void> {
    try {
      setLoading(true);
      const [devData, lotData] = await Promise.all([developmentsApi.list(), lotsApi.list()]);
      setDevelopments(devData.developments || []);
      setLots(lotData.lots || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los barrios.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const stats = useMemo(() => {
    const map = new Map<string, { total: number; sold: number; available: number }>();
    lots.forEach((lot) => {
      const key = getId(lot.developmentId);
      const current = map.get(key) || { total: 0, sold: 0, available: 0 };
      current.total += 1;
      if (lot.status === 'sold') current.sold += 1;
      if (lot.status === 'available') current.available += 1;
      map.set(key, current);
    });
    return map;
  }, [lots]);

  async function confirmDelete(): Promise<void> {
    if (!deleteId) return;
    try {
      await developmentsApi.remove(deleteId);
      setDeleteId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el barrio.');
      setDeleteId(null);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader
        title="Barrios y proyectos"
        description="Alta, edición y baja lógica de desarrollos."
        action={<Link className="button" to="/developments/new">Nuevo barrio</Link>}
      />
      <ErrorMessage message={error} />
      <DataTable
        rows={developments}
        getRowKey={(item) => item._id}
        emptyTitle="No hay barrios cargados."
        columns={[
          { key: 'name', header: 'Nombre', render: (item) => item.name },
          { key: 'location', header: 'Ubicación', render: (item) => item.location || 'Sin ubicación' },
          { key: 'total', header: 'Lotes totales', render: (item) => stats.get(item._id)?.total || item.totalLots || 0 },
          { key: 'sold', header: 'Vendidos', render: (item) => stats.get(item._id)?.sold || 0 },
          { key: 'available', header: 'Disponibles', render: (item) => stats.get(item._id)?.available || 0 },
          { key: 'status', header: 'Estado', render: (item) => <StatusBadge label={developmentStatusLabels[item.status]} tone={item.status === 'active' ? 'success' : 'neutral'} /> },
          { key: 'actions', header: 'Acciones', render: (item) => (
            <div className="row-actions">
              <Link className="link-button" to={`/developments/${item._id}/edit`}>Editar</Link>
              <button type="button" className="text-danger" onClick={() => setDeleteId(item._id)}>Eliminar</button>
            </div>
          ) },
        ]}
      />
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Eliminar barrio"
        message="Se dará de baja el barrio si no tiene lotes cargados."
        danger
        confirmLabel="Eliminar"
        onConfirm={() => { void confirmDelete(); }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
