import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { LoadingState } from '../../components/LoadingState';
import { ErrorMessage } from '../../components/ErrorMessage';
import { StatusBadge } from '../../components/StatusBadge';
import { DateDisplay } from '../../components/DateDisplay';
import { superAdminApi } from '../../api/services';
import type { OrganizationSubscription, UsageInfo, PlanLimits, SubscriptionPayment } from '../../types';

const STATUS_LABELS: Record<string, string> = {
  trial: 'Período de prueba', active: 'Activa', overdue: 'Vencida', suspended: 'Suspendida', cancelled: 'Cancelada',
};

export function SuperAdminOrganizationDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const [sub, setSub] = useState<OrganizationSubscription | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [limits, setLimits] = useState<PlanLimits | null>(null);
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [action, setAction] = useState('');

  useEffect(() => { if (id) void load(id); }, [id]);

  async function load(orgId: string): Promise<void> {
    try {
      const [detail, paymentsData] = await Promise.all([
        superAdminApi.getOrganization(orgId),
        superAdminApi.listPayments(orgId),
      ]);
      setSub(detail.subscription);
      setUsage(detail.usage);
      setLimits(detail.limits);
      setPayments(paymentsData.payments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar organización.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSuspend(): Promise<void> {
    if (!id) return;
    setAction('suspending');
    try {
      const data = await superAdminApi.suspendOrg(id, suspendReason);
      setSub(data.subscription);
      setSuspendReason('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al suspender.');
    } finally { setAction(''); }
  }

  async function handleReactivate(): Promise<void> {
    if (!id) return;
    setAction('reactivating');
    try {
      const data = await superAdminApi.reactivateOrg(id);
      setSub(data.subscription);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al reactivar.');
    } finally { setAction(''); }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorMessage message={error} />;
  if (!sub) return <ErrorMessage message="Organización no encontrada." />;

  const plan = typeof sub.planId === 'object' ? sub.planId : null;

  return (
    <div>
      <PageHeader title={`Organización: ${String(sub.organizationId)}`} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Suscripción</h3>
          <dl style={{ margin: 0 }}>
            <dt style={{ color: '#6b7280', fontSize: '0.85rem' }}>Plan</dt>
            <dd style={{ margin: '0 0 0.75rem 0', fontWeight: 500 }}>{plan?.name || '—'}</dd>
            <dt style={{ color: '#6b7280', fontSize: '0.85rem' }}>Estado</dt>
            <dd style={{ margin: '0 0 0.75rem 0' }}><StatusBadge label={STATUS_LABELS[sub.status] || sub.status} /></dd>
            <dt style={{ color: '#6b7280', fontSize: '0.85rem' }}>Renovación</dt>
            <dd style={{ margin: '0 0 0.75rem 0' }}>{sub.renewalDate ? <DateDisplay value={sub.renewalDate} /> : '—'}</dd>
          </dl>
        </div>

        {usage && limits && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Uso actual</h3>
            {[
              { label: 'Barrios', used: usage.developmentsCount, max: limits.maxDevelopments },
              { label: 'Lotes', used: usage.lotsCount, max: limits.maxLots },
              { label: 'Compradores', used: usage.buyersCount, max: limits.maxBuyers },
              { label: 'Ventas activas', used: usage.activeSalesCount, max: limits.maxActiveSales },
            ].map(({ label, used, max }) => (
              <div key={label} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                  <span>{label}</span>
                  <span>{used} / {max ?? '∞'}</span>
                </div>
                {max !== null && max !== undefined && (
                  <div style={{ background: '#e5e7eb', borderRadius: 4, height: 6 }}>
                    <div style={{ background: used >= max ? '#dc2626' : '#2563eb', width: `${Math.min(100, Math.round((used / max) * 100))}%`, height: '100%', borderRadius: 4 }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>Acciones</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {sub.status !== 'suspended' && (
            <>
              <input
                type="text"
                placeholder="Motivo de suspensión"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                style={{ padding: '0.4rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6 }}
              />
              <button onClick={void handleSuspend} disabled={action === 'suspending'} style={{ padding: '0.4rem 1rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                {action === 'suspending' ? 'Suspendiendo...' : 'Suspender'}
              </button>
            </>
          )}
          {sub.status === 'suspended' && (
            <button onClick={void handleReactivate} disabled={action === 'reactivating'} style={{ padding: '0.4rem 1rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
              {action === 'reactivating' ? 'Reactivando...' : 'Reactivar'}
            </button>
          )}
        </div>
      </div>

      {payments.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Historial de pagos</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Fecha</th>
                <th style={{ textAlign: 'right', padding: '0.5rem' }}>Monto</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Período</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Método</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={String(p._id)} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.5rem' }}><DateDisplay value={p.paymentDate} /></td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{p.currency} {p.amount.toLocaleString('es-AR')}</td>
                  <td style={{ padding: '0.5rem' }}><DateDisplay value={p.periodFrom} /> — <DateDisplay value={p.periodTo} /></td>
                  <td style={{ padding: '0.5rem' }}>{p.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
