import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { LoadingState } from '../../components/LoadingState';
import { ErrorMessage } from '../../components/ErrorMessage';
import { superAdminApi } from '../../api/services';
import type { SaasDashboard } from '../../types';

export function SuperAdminDashboardPage(): React.ReactElement {
  const [dashboard, setDashboard] = useState<SaasDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { void load(); }, []);

  async function load(): Promise<void> {
    try {
      const data = await superAdminApi.getDashboard();
      setDashboard(data.dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el panel.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorMessage message={error} />;
  if (!dashboard) return <></>;

  const cards = [
    { label: 'Orgs activas', value: dashboard.activeOrgs, color: '#16a34a' },
    { label: 'En período de prueba', value: dashboard.trialOrgs, color: '#2563eb' },
    { label: 'Vencidas', value: dashboard.overdueOrgs, color: '#d97706' },
    { label: 'Suspendidas', value: dashboard.suspendedOrgs, color: '#dc2626' },
    { label: 'MRR (ARS)', value: `$${dashboard.mrrARS.toLocaleString('es-AR')}`, color: '#7c3aed' },
    { label: 'MRR (USD)', value: `USD ${dashboard.mrrUSD.toLocaleString('en-US')}`, color: '#0891b2' },
    { label: 'Pagos este mes', value: dashboard.paymentsThisMonth, color: '#16a34a' },
    { label: 'Total organizaciones', value: dashboard.totalOrgs, color: '#6b7280' },
  ];

  return (
    <div>
      <PageHeader title="Panel Super Admin" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {cards.map(({ label, value, color }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', borderTop: `3px solid ${color}` }}>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {dashboard.orgsByPlan.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Organizaciones por plan</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem', fontWeight: 600 }}>Plan</th>
                <th style={{ textAlign: 'right', padding: '0.5rem', fontWeight: 600 }}>Orgs</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.orgsByPlan.map(({ planName, count }) => (
                <tr key={planName} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.5rem' }}>{planName}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
