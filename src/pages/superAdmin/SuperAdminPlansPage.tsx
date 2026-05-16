import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { LoadingState } from '../../components/LoadingState';
import { ErrorMessage } from '../../components/ErrorMessage';
import { StatusBadge } from '../../components/StatusBadge';
import { superAdminApi } from '../../api/services';
import type { SubscriptionPlan } from '../../types';

export function SuperAdminPlansPage(): React.ReactElement {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { void load(); }, []);

  async function load(): Promise<void> {
    try {
      const data = await superAdminApi.listPlans();
      setPlans(data.plans);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar planes.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!confirm('¿Desactivar este plan?')) return;
    try {
      await superAdminApi.deletePlan(id);
      setPlans((prev) => prev.map((p) => p._id === id ? { ...p, status: 'inactive' as const } : p));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al desactivar plan.');
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <PageHeader title="Planes comerciales" action={<Link className="link-button" to="/super-admin/plans/new">Nuevo plan</Link>} />
      <DataTable
        rows={plans}
        getRowKey={(p) => String(p._id)}
        columns={[
          { key: 'name', header: 'Nombre', render: (p) => <strong>{p.name}</strong> },
          { key: 'code', header: 'Código', render: (p) => <code>{p.code}</code> },
          { key: 'price', header: 'Precio/mes', render: (p) => `${p.currency} ${p.monthlyPrice.toLocaleString('es-AR')}` },
          { key: 'public', header: 'Público', render: (p) => p.isPublic ? 'Sí' : 'No' },
          { key: 'status', header: 'Estado', render: (p) => <StatusBadge label={p.status === 'active' ? 'Activo' : 'Inactivo'} /> },
          {
            key: 'actions',
            header: '',
            render: (p) => (
              <span style={{ display: 'flex', gap: 8 }}>
                <Link className="link-button" to={`/super-admin/plans/${p._id}/edit`}>Editar</Link>
                {p.status === 'active' && (
                  <button onClick={() => void handleDelete(String(p._id))} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.9rem' }}>
                    Desactivar
                  </button>
                )}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
