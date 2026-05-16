import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { LoadingState } from '../../components/LoadingState';
import { ErrorMessage } from '../../components/ErrorMessage';
import { StatusBadge } from '../../components/StatusBadge';
import { DateDisplay } from '../../components/DateDisplay';
import { superAdminApi } from '../../api/services';
import type { OrganizationSubscription, SubscriptionPlan } from '../../types';

type OrgRow = OrganizationSubscription & { planId: SubscriptionPlan };

const STATUS_LABELS: Record<string, string> = {
  trial: 'Período de prueba', active: 'Activa', overdue: 'Vencida', suspended: 'Suspendida', cancelled: 'Cancelada',
};

export function SuperAdminOrganizationsPage(): React.ReactElement {
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { void load(); }, []);

  async function load(): Promise<void> {
    try {
      const data = await superAdminApi.listOrganizations();
      setOrgs(data.organizations as OrgRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar organizaciones.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <PageHeader title="Organizaciones" />
      <DataTable
        rows={orgs}
        getRowKey={(r) => String(r._id)}
        columns={[
          {
            key: 'org',
            header: 'Organización',
            render: (r) => (
              <Link to={`/super-admin/organizations/${r.organizationId}`} style={{ color: '#2563eb', fontWeight: 500 }}>
                {String(r.organizationId)}
              </Link>
            ),
          },
          {
            key: 'plan',
            header: 'Plan',
            render: (r) => r.planId?.name || '—',
          },
          {
            key: 'status',
            header: 'Estado',
            render: (r) => <StatusBadge label={STATUS_LABELS[r.status] || r.status} />,
          },
          {
            key: 'renewal',
            header: 'Renovación',
            render: (r) => r.renewalDate ? <DateDisplay value={r.renewalDate} /> : '—',
          },
          {
            key: 'actions',
            header: '',
            render: (r) => (
              <Link className="link-button" to={`/super-admin/organizations/${r.organizationId}`}>Ver detalle</Link>
            ),
          },
        ]}
      />
    </div>
  );
}
