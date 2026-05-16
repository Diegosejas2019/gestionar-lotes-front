import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { backupsApi, developmentsApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { Development } from '../types';

const ALL_MODULES = [
  { value: 'developments', label: 'Barrios' },
  { value: 'lots', label: 'Lotes' },
  { value: 'buyers', label: 'Compradores' },
  { value: 'leads', label: 'Leads' },
  { value: 'quotations', label: 'Cotizaciones' },
  { value: 'reservations', label: 'Reservas' },
  { value: 'sales', label: 'Ventas' },
  { value: 'installments', label: 'Cuotas' },
  { value: 'payments', label: 'Pagos' },
  { value: 'expenses', label: 'Gastos' },
  { value: 'suppliers', label: 'Proveedores' },
  { value: 'cashAccounts', label: 'Cajas' },
  { value: 'cashMovements', label: 'Movimientos de caja' },
];

export function ManualBackupPage(): React.ReactElement {
  const navigate = useNavigate();
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>(['developments', 'lots', 'buyers', 'sales']);
  const [selectedDevIds, setSelectedDevIds] = useState<string[]>([]);
  const [format, setFormat] = useState<'zip' | 'xlsx'>('zip');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const res = await developmentsApi.list();
        setDevelopments(res.developments || []);
      } catch {
        // non-critical
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  function toggleModule(mod: string): void {
    setSelectedModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  }

  function toggleDev(devId: string): void {
    setSelectedDevIds((prev) =>
      prev.includes(devId) ? prev.filter((d) => d !== devId) : [...prev, devId]
    );
  }

  function selectAll(): void {
    setSelectedModules(ALL_MODULES.map((m) => m.value));
  }

  function selectNone(): void {
    setSelectedModules([]);
  }

  async function handleRun(): Promise<void> {
    if (selectedModules.length === 0) { setError('Seleccioná al menos un módulo.'); return; }
    setRunning(true);
    setError('');
    setSuccess('');
    try {
      await backupsApi.runManual({ includeModules: selectedModules, developmentIds: selectedDevIds, format });
      setSuccess('Backup iniciado. Podés ver el progreso en la sección de ejecuciones.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo ejecutar el backup.');
    } finally {
      setRunning(false);
    }
  }

  if (loading) return <LoadingState message="Cargando..." />;

  return (
    <div>
      <PageHeader
        title="Backup manual"
        description="Generá un backup completo de tus datos ahora mismo"
        action={
          <button className="button button--ghost" type="button" onClick={() => navigate('/backups')}>
            ← Volver a trabajos
          </button>
        }
      />

      {error && <ErrorMessage message={error} />}

      {success && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#15803d', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {success}
          <button className="button button--ghost" type="button" onClick={() => navigate('/backups/runs')}>
            Ver ejecuciones →
          </button>
        </div>
      )}

      <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            Módulos a incluir
            <button type="button" onClick={selectAll} style={{ marginLeft: 12, fontSize: '0.8rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Seleccionar todos</button>
            <button type="button" onClick={selectNone} style={{ marginLeft: 8, fontSize: '0.8rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Ninguno</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ALL_MODULES.map((m) => (
              <label key={m.value} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem', background: selectedModules.includes(m.value) ? '#eff6ff' : '#f9fafb', border: '1px solid ' + (selectedModules.includes(m.value) ? '#93c5fd' : '#e5e7eb'), borderRadius: 6, padding: '4px 10px' }}>
                <input type="checkbox" checked={selectedModules.includes(m.value)} onChange={() => toggleModule(m.value)} />
                {m.label}
              </label>
            ))}
          </div>
        </div>

        {developments.length > 0 && (
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              Filtrar por barrio <span style={{ fontWeight: 400, color: '#6b7280' }}>(vacío = todos)</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {developments.map((d) => (
                <label key={d._id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem', background: selectedDevIds.includes(d._id) ? '#f0fdf4' : '#f9fafb', border: '1px solid ' + (selectedDevIds.includes(d._id) ? '#86efac' : '#e5e7eb'), borderRadius: 6, padding: '4px 10px' }}>
                  <input type="checkbox" checked={selectedDevIds.includes(d._id)} onChange={() => toggleDev(d._id)} />
                  {d.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Formato de exportación</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {(['zip', 'xlsx'] as const).map((f) => (
              <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="radio" name="format" value={f} checked={format === f} onChange={() => setFormat(f)} />
                {f === 'zip' ? 'ZIP (un CSV por módulo)' : 'XLSX'}
              </label>
            ))}
          </div>
        </div>

        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#92400e' }}>
          El backup se generará en segundo plano. Podrás descargarlo desde la sección de ejecuciones cuando esté listo. Máximo 50.000 registros por módulo.
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="button" type="button" disabled={running || selectedModules.length === 0} onClick={() => void handleRun()}>
            {running ? 'Iniciando backup...' : 'Generar backup ahora'}
          </button>
          <button className="button button--ghost" type="button" onClick={() => navigate('/backups/runs')}>
            Ver ejecuciones anteriores
          </button>
        </div>
      </div>
    </div>
  );
}
