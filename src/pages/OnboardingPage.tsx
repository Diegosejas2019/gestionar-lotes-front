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

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontWeight: 600 }}>{checklist.completedPercentage}% completado</span>
          <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>{done} de {total} pasos</span>
        </div>
        <div style={{ background: '#e5e7eb', borderRadius: 6, height: 12 }}>
          <div style={{ background: checklist.completedPercentage === 100 ? '#16a34a' : '#2563eb', width: `${checklist.completedPercentage}%`, height: '100%', borderRadius: 6, transition: 'width 0.4s' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {checklist.items.map((item: OnboardingItem) => (
          <div key={item.key} style={{
            background: '#fff',
            border: `1px solid ${item.completed ? '#bbf7d0' : item.skipped ? '#e5e7eb' : '#e5e7eb'}`,
            borderLeft: `4px solid ${item.completed ? '#16a34a' : item.skipped ? '#9ca3af' : '#2563eb'}`,
            borderRadius: 8,
            padding: '1rem',
            opacity: item.skipped ? 0.6 : 1,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4, textDecoration: item.skipped ? 'line-through' : undefined }}>
                  {item.completed && '✓ '}{item.title}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>{item.description}</div>
              </div>
              {!item.completed && !item.skipped && (
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => navigate(item.route)}
                    style={{ padding: '0.35rem 0.75rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Ir
                  </button>
                  <button
                    onClick={() => void handleComplete(item.key)}
                    disabled={actionKey === item.key}
                    style={{ padding: '0.35rem 0.75rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Marcar listo
                  </button>
                  <button
                    onClick={() => void handleSkip(item.key)}
                    disabled={actionKey === `skip_${item.key}`}
                    style={{ padding: '0.35rem 0.75rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' }}
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
