import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { ErrorMessage } from '../components/ErrorMessage';
import { developmentsApi, exportsApi } from '../api/services';
import type { Development } from '../types';

const EXPORT_TYPES = [
  { type: 'lots', label: 'Lotes', description: 'Todos los lotes con sus datos, precio y estado.' },
  { type: 'buyers', label: 'Compradores', description: 'Compradores con datos de contacto y documento.' },
  { type: 'sales', label: 'Ventas', description: 'Ventas activas e históricas con comprador y lote.' },
  { type: 'installments', label: 'Cuotas', description: 'Todas las cuotas con estado y montos pagados.' },
  { type: 'payments', label: 'Pagos', description: 'Pagos registrados con moneda y forma de pago.' },
  { type: 'reservations', label: 'Reservas', description: 'Reservas con estado, monto y fechas.' },
  { type: 'suppliers', label: 'Proveedores', description: 'Proveedores con datos de contacto y categoría.' },
  { type: 'expenses', label: 'Gastos', description: 'Gastos con estado, monto y proveedor.' },
];

export function ExportsPage(): React.ReactElement {
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [selectedType, setSelectedType] = useState('lots');
  const [developmentId, setDevelopmentId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    void developmentsApi.list().then((r) => setDevelopments(r.developments)).catch(() => {});
  }, []);

  async function handleExport() {
    setError('');
    setSuccess('');
    setDownloading(true);
    try {
      const params: Record<string, string> = {};
      if (developmentId) params.developmentId = developmentId;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (status) params.status = status;
      await exportsApi.download(selectedType, params);
      setSuccess('Exportación descargada correctamente.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al exportar los datos.');
    } finally {
      setDownloading(false);
    }
  }

  const selectedExport = EXPORT_TYPES.find((t) => t.type === selectedType);

  return (
    <div className="page-container">
      <PageHeader title="Exportaciones" description="Descargá datos del sistema en formato CSV." />
      {error && <ErrorMessage message={error} />}
      {success && <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', padding: '0.75rem', marginBottom: '1rem', color: '#15803d' }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Selector de tipo */}
        <div>
          <h3 style={{ marginBottom: '0.75rem' }}>Tipo de datos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {EXPORT_TYPES.map((t) => (
              <button
                key={t.type}
                onClick={() => setSelectedType(t.type)}
                style={{
                  padding: '0.75rem 1rem',
                  border: `2px solid ${selectedType === t.type ? 'var(--color-primary, #2563eb)' : '#e2e8f0'}`,
                  borderRadius: '6px',
                  background: selectedType === t.type ? '#eff6ff' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <strong style={{ color: selectedType === t.type ? 'var(--color-primary, #2563eb)' : undefined }}>{t.label}</strong>
                <div style={{ fontSize: '0.82em', color: '#64748b', marginTop: '0.1rem' }}>{t.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Filtros y export */}
        <div>
          <h3 style={{ marginBottom: '0.75rem' }}>Filtros — {selectedExport?.label}</h3>
          <div className="form report-card">
            <div className="form-group">
              <label>Barrio/desarrollo (opcional)</label>
              <select className="input" value={developmentId} onChange={(e) => setDevelopmentId(e.target.value)}>
                <option value="">Todos los barrios</option>
                {developments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Desde</label>
                <input type="date" className="input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Hasta</label>
                <input type="date" className="input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Estado (opcional)</label>
              <input className="input" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Ej: active, completed, pending..." />
            </div>
            <div className="form-actions">
              <button
                className="button button--primary"
                onClick={handleExport}
                disabled={downloading}
              >
                {downloading ? 'Descargando...' : 'Exportar CSV'}
              </button>
            </div>
          </div>

          <p style={{ fontSize: '0.82em', color: '#64748b', marginTop: '0.75rem' }}>
            El archivo CSV se descargará directamente en tu computadora. Los filtros son opcionales.
          </p>
        </div>
      </div>
    </div>
  );
}
