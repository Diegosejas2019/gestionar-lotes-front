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
      <div className="super-admin-grid">
        {cards.map(({ label, value, color }) => (
          <div key={label} className="super-admin-card" style={{ borderTop: `3px solid ${color}` }}>
            <div className="super-admin-card__label">{label}</div>
            <div className="super-admin-card__value" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {dashboard.orgsByPlan.length > 0 && (
        <div className="super-admin-table-panel">
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Organizaciones por plan</h3>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th style={{ textAlign: 'right' }}>Orgs</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.orgsByPlan.map(({ planName, count }) => (
                  <tr key={planName}>
                    <td>{planName}</td>
                    <td style={{ textAlign: 'right' }}>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
