import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { suppliersApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DataTable } from '../components/DataTable';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { Supplier } from '../types';
import { supplierCategoryLabels } from '../utils/labels';

export function SuppliersPage(): React.ReactElement {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');

  async function load(): Promise<void> {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (category) params.category = category;
      if (q) params.q = q;
      const data = await suppliersApi.list(params);
      setSuppliers(data.suppliers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los proveedores.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [category, q]);

  async function confirmDelete(): Promise<void> {
    if (!deleteId) return;
    try {
      await suppliersApi.remove(deleteId);
      setDeleteId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el proveedor.');
      setDeleteId(null);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Proveedores"
        action={<Link to="/suppliers/new" className="btn btn--primary">+ Nuevo proveedor</Link>}
      />
      {error && <ErrorMessage message={error} />}
      <div className="filter-row">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Todas las categorías</option>
          {(Object.entries(supplierCategoryLabels) as [string, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <input placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <DataTable
        columns={[
          { key: 'name', header: 'Nombre', render: (s) => s.name },
          { key: 'businessName', header: 'Razón social', render: (s) => s.businessName || '-' },
          { key: 'taxId', header: 'CUIT/DNI', render: (s) => s.taxId || s.documentNumber || '-' },
          { key: 'category', header: 'Categoría', render: (s) => supplierCategoryLabels[s.category] || s.category },
          { key: 'phone', header: 'Teléfono', render: (s) => s.phone || '-' },
          { key: 'email', header: 'Email', render: (s) => s.email || '-' },
          {
            key: 'actions', header: '', render: (s) => (
              <div className="table-actions">
                <Link to={`/suppliers/${s._id}/edit`} className="btn btn--sm btn--secondary">Editar</Link>
                <button className="btn btn--sm btn--danger" onClick={() => setDeleteId(s._id)}>Eliminar</button>
              </div>
            ),
          },
        ]}
        rows={suppliers}
        getRowKey={(s) => s._id}
        emptyTitle="No hay proveedores cargados."
      />
      {deleteId && (
        <ConfirmDialog
          open
          title="Eliminar proveedor"
          message="¿Eliminar este proveedor? Esta acción no se puede deshacer."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
          danger
        />
      )}
    </div>
  );
}
