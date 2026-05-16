import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { LoadingState } from '../../components/LoadingState';
import { ErrorMessage } from '../../components/ErrorMessage';
import { DateDisplay } from '../../components/DateDisplay';
import { superAdminApi } from '../../api/services';
import type { OrganizationSubscription, SubscriptionPayment } from '../../types';

type OrgRow = OrganizationSubscription;

export function SuperAdminPaymentsPage(): React.ReactElement {
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { void loadOrgs(); }, []);

  async function loadOrgs(): Promise<void> {
    try {
      const data = await superAdminApi.listOrganizations();
      setOrgs(data.organizations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar organizaciones.');
    } finally {
      setLoading(false);
    }
  }

  async function loadPayments(orgId: string): Promise<void> {
    setSelectedOrg(orgId);
    if (!orgId) { setPayments([]); return; }
    try {
      const data = await superAdminApi.listPayments(orgId);
      setPayments(data.payments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pagos.');
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <PageHeader title="Pagos de suscripción" />
      <div style={{ marginBottom: '1rem' }}>
        <label>Organización:{' '}
          <select className="input" value={selectedOrg} onChange={(e) => void loadPayments(e.target.value)} style={{ marginLeft: 8 }}>
            <option value="">— Seleccionar —</option>
            {orgs.map((o) => (
              <option key={String(o._id)} value={String(o.organizationId)}>{String(o.organizationId)}</option>
            ))}
          </select>
        </label>
      </div>

      {selectedOrg && (
        <DataTable
          rows={payments}
          getRowKey={(p) => String(p._id)}
          columns={[
            { key: 'date', header: 'Fecha', render: (p) => <DateDisplay value={p.paymentDate} /> },
            { key: 'amount', header: 'Monto', render: (p) => `${p.currency} ${p.amount.toLocaleString('es-AR')}` },
            { key: 'period', header: 'Período', render: (p) => <><DateDisplay value={p.periodFrom} /> — <DateDisplay value={p.periodTo} /></> },
            { key: 'method', header: 'Método', render: (p) => p.paymentMethod },
            { key: 'receipt', header: 'Comprobante', render: (p) => p.receiptNumber || '—' },
          ]}
        />
      )}
    </div>
  );
}
