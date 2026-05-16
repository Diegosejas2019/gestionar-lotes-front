import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { developmentsApi, leadsApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DataTable } from '../components/DataTable';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { FilterBar } from '../components/FilterBar';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Development, Lead } from '../types';
import { asDevelopment, getId, leadName } from '../utils/format';
import { leadSourceLabels, leadSources, leadStatusLabels, leadStatuses } from '../utils/labels';

export function LeadsPage(): React.ReactElement {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [filters, setFilters] = useState({ status: '', source: '', developmentId: '', q: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(): Promise<void> {
    try {
      setLoading(true);
      const [leadData, devData] = await Promise.all([leadsApi.list(), developmentsApi.list()]);
      setLeads(leadData.leads || []);
      setDevelopments(devData.developments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los interesados.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const devMap = useMemo(() => new Map(developments.map((item) => [item._id, item.name])), [developments]);
  const filtered = leads.filter((lead) => {
    if (filters.status && lead.status !== filters.status) return false;
    if (filters.source && lead.source !== filters.source) return false;
    if (filters.developmentId && getId(lead.interestedDevelopmentId) !== filters.developmentId) return false;
    const text = `${leadName(lead)} ${lead.phone || ''} ${lead.email || ''}`.toLowerCase();
    if (filters.q && !text.includes(filters.q.toLowerCase())) return false;
    return true;
  });

  async function confirmDelete(): Promise<void> {
    if (!deleteId) return;
    try {
      await leadsApi.remove(deleteId);
      setDeleteId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el interesado.');
      setDeleteId(null);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Interesados" description="Seguimiento comercial previo a la venta." action={<Link className="button" to="/leads/new">Nuevo interesado</Link>} />
      <ErrorMessage message={error} />
      <FilterBar>
        <label>Estado<select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">Todos</option>{leadStatuses.map((status) => <option key={status} value={status}>{leadStatusLabels[status]}</option>)}</select></label>
        <label>Origen<select value={filters.source} onChange={(event) => setFilters({ ...filters, source: event.target.value })}><option value="">Todos</option>{leadSources.map((source) => <option key={source} value={source}>{leadSourceLabels[source]}</option>)}</select></label>
        <label>Barrio<select value={filters.developmentId} onChange={(event) => setFilters({ ...filters, developmentId: event.target.value })}><option value="">Todos</option>{developments.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
        <label>Buscar<input value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} /></label>
      </FilterBar>
      <DataTable
        rows={filtered}
        getRowKey={(item) => item._id}
        emptyTitle="No hay interesados para mostrar."
        columns={[
          { key: 'name', header: 'Nombre', render: (item) => <Link to={`/leads/${item._id}`}>{leadName(item)}</Link> },
          { key: 'phone', header: 'Telefono', render: (item) => item.phone || '-' },
          { key: 'email', header: 'Email', render: (item) => item.email || '-' },
          { key: 'source', header: 'Origen', render: (item) => leadSourceLabels[item.source] },
          { key: 'dev', header: 'Barrio de interes', render: (item) => asDevelopment(item.interestedDevelopmentId)?.name || devMap.get(getId(item.interestedDevelopmentId)) || '-' },
          { key: 'status', header: 'Estado', render: (item) => <StatusBadge label={leadStatusLabels[item.status]} tone={item.status === 'converted' ? 'success' : item.status === 'lost' ? 'danger' : 'info'} /> },
          { key: 'follow', header: 'Proximo seguimiento', render: (item) => <DateDisplay value={item.nextFollowUpDate} /> },
          { key: 'actions', header: 'Acciones', render: (item) => <div className="row-actions"><Link className="link-button" to={`/leads/${item._id}/edit`}>Editar</Link><button type="button" className="text-danger" onClick={() => setDeleteId(item._id)}>Eliminar</button></div> },
        ]}
      />
      <ConfirmDialog open={Boolean(deleteId)} title="Eliminar interesado" message="Se dara de baja logica el interesado y se conservara el historial." danger confirmLabel="Eliminar" onConfirm={() => { void confirmDelete(); }} onCancel={() => setDeleteId(null)} />
    </>
  );
}
