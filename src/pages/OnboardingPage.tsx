import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { onboardingApi } from '../api/services';
import type { OnboardingChecklist, OnboardingItem } from '../types';

export function OnboardingPage(): React.ReactElement {
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<OnboardingChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionKey, setActionKey] = useState('');

  useEffect(() => { void load(); }, []);

  async function load(): Promise<void> {
    try {
      const data = await onboardingApi.getChecklist();
      setChecklist(data.checklist);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el onboarding.');
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete(key: string): Promise<void> {
    setActionKey(key);
    try {
      const data = await onboardingApi.completeItem(key);
      setChecklist(data.checklist);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error.');
    } finally {
      setActionKey('');
    }
  }

  async function handleSkip(key: string): Promise<void> {
    setActionKey(`skip_${key}`);
    try {
      const data = await onboardingApi.skipItem(key);
      setChecklist(data.checklist);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error.');
    } finally {
      setActionKey('');
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorMessage message={error} />;
  if (!checklist) return <></>;

  const done = checklist.items.filter((i) => i.completed || i.skipped).length;
  const total = checklist.items.length;

  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader title="Configuración inicial" />

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontWeight: 600 }}>{checklist.completedPercentage}% completado</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{done} de {total} pasos</span>
        </div>
        <div style={{ background: 'var(--surface-muted)', borderRadius: 6, height: 10 }}>
          <div style={{
            background: checklist.completedPercentage === 100 ? 'var(--success)' : 'var(--primary)',
            width: `${checklist.completedPercentage}%`,
            height: '100%',
            borderRadius: 6,
            transition: 'width 0.4s',
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {checklist.items.map((item: OnboardingItem) => (
          <div key={item.key} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderLeft: `4px solid ${item.completed ? 'var(--success)' : item.skipped ? 'var(--border-light)' : 'var(--primary)'}`,
            borderRadius: 8,
            padding: '1rem',
            opacity: item.skipped ? 0.5 : 1,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4, textDecoration: item.skipped ? 'line-through' : undefined, color: item.completed ? 'var(--success)' : undefined }}>
                  {item.completed && '✓ '}{item.title}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.description}</div>
              </div>
              {!item.completed && !item.skipped && (
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button className="button button--ghost" type="button" onClick={() => navigate(item.route)}>
                    Ir
                  </button>
                  <button
                    className="button"
                    type="button"
                    disabled={actionKey === item.key}
                    onClick={() => void handleComplete(item.key)}
                  >
                    Marcar listo
                  </button>
                  <button
                    className="button button--ghost"
                    type="button"
                    disabled={actionKey === `skip_${item.key}`}
                    onClick={() => void handleSkip(item.key)}
                  >
                    Omitir
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
