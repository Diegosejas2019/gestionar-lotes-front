import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { StatusBadge } from '../components/StatusBadge';
import { DateDisplay } from '../components/DateDisplay';
import { billingApi } from '../api/services';
import type { OrganizationSubscription, PlanLimits, SubscriptionPlan, UsageInfo } from '../types';

const STATUS_LABELS: Record<string, string> = {
  trial: 'Período de prueba', active: 'Activa', overdue: 'Vencida', suspended: 'Suspendida', cancelled: 'Cancelada',
};

const LIMIT_LABELS: Array<{ usageKey: keyof UsageInfo; limitKey: keyof PlanLimits; label: string }> = [
  { usageKey: 'developmentsCount', limitKey: 'maxDevelopments', label: 'Barrios' },
  { usageKey: 'lotsCount', limitKey: 'maxLots', label: 'Lotes' },
  { usageKey: 'buyersCount', limitKey: 'maxBuyers', label: 'Compradores' },
  { usageKey: 'activeSalesCount', limitKey: 'maxActiveSales', label: 'Ventas activas' },
  { usageKey: 'usersCount', limitKey: 'maxUsers', label: 'Usuarios' },
  { usageKey: 'monthlyImportsCount', limitKey: 'maxMonthlyImports', label: 'Importaciones este mes' },
];

export function BillingPage(): React.ReactElement {
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [subscription, setSubscription] = useState<OrganizationSubscription | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [limits, setLimits] = useState<PlanLimits | null>(null);
  const [percentages, setPercentages] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { void load(); }, []);

  async function load(): Promise<void> {
    try {
      const [currentPlan, usageData] = await Promise.all([
        billingApi.getCurrentPlan(),
        billingApi.getUsage(),
      ]);
      setPlan(currentPlan.plan);
      setSubscription(currentPlan.subscription);
      setUsage(usageData.usage);
      setLimits(usageData.limits);
      setPercentages(usageData.percentages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar plan.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorMessage message={error} />;

  const isSuspended = subscription?.status === 'suspended';
  const isOverdue = subscription?.status === 'overdue';

  return (
    <div>
      <PageHeader title="Mi plan" />

      {isSuspended && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem', color: '#991b1b' }}>
          <strong>Tu cuenta está suspendida.</strong> {subscription?.suspensionReason ? `Motivo: ${subscription.suspensionReason}` : ''} Contactá al soporte para reactivarla.
        </div>
      )}

      {isOverdue && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem', color: '#92400e' }}>
          <strong>Tu suscripción está vencida.</strong> Regularizá el pago para mantener el acceso completo.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Plan actual</h3>
          {plan ? (
            <>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ color: '#6b7280', marginBottom: 8 }}>{plan.description}</div>
              <div style={{ fontSize: '1.25rem', color: '#2563eb', fontWeight: 600 }}>
                {plan.currency} {plan.monthlyPrice.toLocaleString('es-AR')} / mes
              </div>
            </>
          ) : (
            <p style={{ color: '#6b7280' }}>Sin plan asignado. Contactá al soporte.</p>
          )}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Estado de suscripción</h3>
          {subscription ? (
            <dl style={{ margin: 0 }}>
              <dt style={{ color: '#6b7280', fontSize: '0.85rem' }}>Estado</dt>
              <dd style={{ margin: '0 0 0.75rem 0' }}><StatusBadge label={STATUS_LABELS[subscription.status] || subscription.status} /></dd>
              {subscription.renewalDate && (
                <>
                  <dt style={{ color: '#6b7280', fontSize: '0.85rem' }}>Próxima renovación</dt>
                  <dd style={{ margin: '0 0 0.75rem 0' }}><DateDisplay value={subscription.renewalDate} /></dd>
                </>
              )}
              {subscription.trialEndsAt && (
                <>
                  <dt style={{ color: '#6b7280', fontSize: '0.85rem' }}>Prueba hasta</dt>
                  <dd style={{ margin: 0 }}><DateDisplay value={subscription.trialEndsAt} /></dd>
                </>
              )}
            </dl>
          ) : (
            <p style={{ color: '#6b7280' }}>Sin suscripción activa.</p>
          )}
        </div>
      </div>

      {usage && limits && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Uso vs límites</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {LIMIT_LABELS.map(({ usageKey, limitKey, label }) => {
              const used = usage[usageKey] as number;
              const max = limits[limitKey];
              const pct = percentages[limitKey] || 0;
              const isOver = max !== null && used >= (max ?? Infinity);
              return (
                <div key={usageKey}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span>{label}</span>
                    <span style={{ color: isOver ? '#dc2626' : undefined }}>{used} / {max ?? '∞'}</span>
                  </div>
                  {max !== null && max !== undefined && (
                    <div style={{ background: '#e5e7eb', borderRadius: 4, height: 8 }}>
                      <div style={{ background: isOver ? '#dc2626' : pct > 80 ? '#d97706' : '#2563eb', width: `${Math.min(100, pct)}%`, height: '100%', borderRadius: 4, transition: 'width 0.3s' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
