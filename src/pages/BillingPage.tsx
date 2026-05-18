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
    <div className="page-container">
      <PageHeader title="Mi plan" />

      {isSuspended && (
        <div className="alert alert--danger" style={{ marginBottom: '1rem' }}>
          <strong>Tu cuenta está suspendida.</strong> {subscription?.suspensionReason ? `Motivo: ${subscription.suspensionReason}` : ''} Contactá al soporte para reactivarla.
        </div>
      )}

      {isOverdue && (
        <div className="alert alert--warning" style={{ marginBottom: '1rem' }}>
          <strong>Tu suscripción está vencida.</strong> Regularizá el pago para mantener el acceso completo.
        </div>
      )}

      <div className="billing-cards">
        <div className="settings-panel">
          <h2>Plan actual</h2>
          {plan ? (
            <>
              <div className="billing-plan-name">{plan.name}</div>
              <div className="text-muted">{plan.description}</div>
              <div className="billing-plan-price">{plan.currency} {plan.monthlyPrice.toLocaleString('es-AR')} / mes</div>
            </>
          ) : (
            <p className="text-muted">Sin plan asignado. Contactá al soporte.</p>
          )}
        </div>

        <div className="settings-panel">
          <h2>Estado de suscripción</h2>
          {subscription ? (
            <dl className="billing-dl">
              <dt>Estado</dt>
              <dd><StatusBadge label={STATUS_LABELS[subscription.status] || subscription.status} /></dd>
              {subscription.renewalDate && (
                <>
                  <dt>Próxima renovación</dt>
                  <dd><DateDisplay value={subscription.renewalDate} /></dd>
                </>
              )}
              {subscription.trialEndsAt && (
                <>
                  <dt>Prueba hasta</dt>
                  <dd><DateDisplay value={subscription.trialEndsAt} /></dd>
                </>
              )}
            </dl>
          ) : (
            <p className="text-muted">Sin suscripción activa.</p>
          )}
        </div>
      </div>

      {usage && limits && (
        <div className="settings-panel">
          <h2>Uso vs límites</h2>
          <div className="billing-usage-grid">
            {LIMIT_LABELS.map(({ usageKey, limitKey, label }) => {
              const used = usage[usageKey] as number;
              const max = limits[limitKey];
              const pct = percentages[limitKey] || 0;
              const isOver = max !== null && used >= (max ?? Infinity);
              return (
                <div key={usageKey} className="billing-usage-item">
                  <div className="billing-usage-label">
                    <span>{label}</span>
                    <span className={isOver ? 'billing-usage-over' : ''}>{used} / {max ?? '∞'}</span>
                  </div>
                  {max !== null && max !== undefined && (
                    <div className="billing-progress-track">
                      <div
                        className={`billing-progress-bar${isOver ? ' billing-progress-bar--over' : pct > 80 ? ' billing-progress-bar--warn' : ''}`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
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
