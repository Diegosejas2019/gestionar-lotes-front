import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorMessage } from '../components/ErrorMessage';
import { importsApi, developmentsApi } from '../api/services';
import type { Development, ImportBatch, ImportRow, ImportTemplate, ImportType } from '../types';

const TYPE_LABELS: Record<ImportType, string> = {
  lots: 'Lotes', buyers: 'Compradores', sales: 'Ventas', installments: 'Cuotas',
  payments: 'Pagos', reservations: 'Reservas', suppliers: 'Proveedores',
  expenses: 'Gastos', full_onboarding: 'Puesta en marcha completa',
};

const TYPES_WITH_DEVELOPMENT: ImportType[] = ['lots', 'sales', 'reservations', 'expenses'];

const ROW_STATUS_LABELS: Record<string, string> = {
  valid: 'Válida', invalid: 'Con errores', duplicated: 'Duplicado', skipped: 'Omitida',
};
const ROW_STATUS_CLASS: Record<string, string> = {
  valid: 'badge--success', invalid: 'badge--danger', duplicated: 'badge--warning', skipped: 'badge--default',
};

export function ImportNewPage(): React.ReactElement {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  // Step 1
  const [selectedType, setSelectedType] = useState<ImportType | null>(null);
  const [templates, setTemplates] = useState<ImportTemplate[]>([]);

  // Step 2
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [developmentId, setDevelopmentId] = useState('');
  const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'update' | 'fail'>('skip');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 3 (validation result)
  const [batch, setBatch] = useState<ImportBatch | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [rowFilter, setRowFilter] = useState('');
  const [validating, setValidating] = useState(false);

  // Step 4 (execute)
  const [confirmed, setConfirmed] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executed, setExecuted] = useState(false);

  useEffect(() => {
    void importsApi.listTemplates().then((r) => setTemplates(r.templates)).catch(() => {});
    void developmentsApi.list().then((r) => setDevelopments(r.developments)).catch(() => {});
  }, []);

  const selectedTemplate = templates.find((t) => t.type === selectedType);

  function handleTypeSelect(type: ImportType) {
    setSelectedType(type);
    setStep(2);
  }

  async function handleUploadAndValidate() {
    if (!file || !selectedType) return;
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', selectedType);
      if (developmentId) formData.append('developmentId', developmentId);
      formData.append('options', JSON.stringify({ duplicateStrategy }));

      const uploadRes = await importsApi.upload(formData);
      const newBatch = uploadRes.batch;
      setBatch(newBatch);

      setValidating(true);
      const validateRes = await importsApi.validate(newBatch._id);
      setBatch(validateRes.batch);

      const rowsRes = await importsApi.getRows(newBatch._id, { limit: '100' });
      setRows(rowsRes.rows);
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al subir o validar el archivo.');
    } finally {
      setUploading(false);
      setValidating(false);
    }
  }

  async function handleExecute() {
    if (!batch) return;
    setError('');
    setExecuting(true);
    try {
      await importsApi.execute(batch._id);
      setExecuted(true);
      setStep(4);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al ejecutar la importación.');
    } finally {
      setExecuting(false);
    }
  }

  const filteredRows = rowFilter ? rows.filter((r) => r.status === rowFilter) : rows;
  const hasErrors = (batch?.invalidRows ?? 0) > 0;

  return (
    <div className="page-container">
      <PageHeader title="Nueva importación" description={`Paso ${step} de ${step < 4 ? 4 : 4}`} />
      {error && <ErrorMessage message={error} />}

      {/* Paso 1: Seleccionar tipo */}
      {step === 1 && (
        <div>
          <h3>Seleccioná el tipo de datos a importar</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {templates.map((t) => (
              <button
                key={t.type}
                onClick={() => handleTypeSelect(t.type)}
                style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: 'pointer', textAlign: 'left' }}
              >
                <strong>{t.label}</strong>
                <p style={{ fontSize: '0.85em', color: '#64748b', marginTop: '0.25rem' }}>{t.description}</p>
              </button>
            ))}
          </div>
          <div className="form-actions" style={{ marginTop: '1.5rem' }}>
            <button className="button" onClick={() => navigate('/imports')}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Paso 2: Plantilla + subir archivo + opciones */}
      {step === 2 && selectedTemplate && (
        <div>
          <h3>Importar: {selectedTemplate.label}</h3>

          <div className="report-card" style={{ marginBottom: '1rem' }}>
            <h4>Plantilla de ejemplo</h4>
            <p style={{ fontSize: '0.9em', color: '#64748b' }}>Descargá la plantilla y completala con tus datos.</p>
            <div style={{ marginTop: '0.75rem' }}>
              <a
                className="button button--secondary"
                href={importsApi.templateDownloadUrl(selectedTemplate.type)}
                download
              >
                Descargar plantilla CSV
              </a>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.85em' }}>
              <strong>Columnas requeridas:</strong> {selectedTemplate.requiredColumns.join(', ')}
              {selectedTemplate.optionalColumns.length > 0 && (
                <div><strong>Columnas opcionales:</strong> {selectedTemplate.optionalColumns.join(', ')}</div>
              )}
            </div>
          </div>

          <div className="form report-card">
            {TYPES_WITH_DEVELOPMENT.includes(selectedType!) && (
              <div className="form-group">
                <label>Barrio/desarrollo (opcional)</label>
                <select className="input" value={developmentId} onChange={(e) => setDevelopmentId(e.target.value)}>
                  <option value="">— Se usará el indicado en cada fila —</option>
                  {developments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
            )}
            <div className="form-group">
              <label>Estrategia para duplicados</label>
              <select className="input" value={duplicateStrategy} onChange={(e) => setDuplicateStrategy(e.target.value as 'skip' | 'update' | 'fail')}>
                <option value="skip">Omitir duplicados</option>
                <option value="update">Actualizar duplicados</option>
                <option value="fail">Marcar como error</option>
              </select>
            </div>
            <div className="form-group">
              <label>Archivo CSV o Excel *</label>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="input"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file && <div style={{ fontSize: '0.85em', color: '#64748b', marginTop: '0.25rem' }}>Archivo: {file.name} ({Math.round(file.size / 1024)} KB)</div>}
            </div>
            <div className="form-actions">
              <button
                className="button button--primary"
                onClick={handleUploadAndValidate}
                disabled={!file || uploading || validating}
              >
                {uploading ? 'Subiendo...' : validating ? 'Validando...' : 'Subir y validar'}
              </button>
              <button className="button" onClick={() => setStep(1)}>Volver</button>
            </div>
          </div>
        </div>
      )}

      {/* Paso 3: Resultado de validación */}
      {step === 3 && batch && (
        <div>
          <h3>Resultado de validación — {batch.batchNumber}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total filas', value: batch.totalRows },
              { label: 'Válidas', value: batch.validRows, color: '#16a34a' },
              { label: 'Con errores', value: batch.invalidRows, color: batch.invalidRows > 0 ? '#dc2626' : undefined },
              { label: 'Duplicadas', value: batch.duplicatedRows },
            ].map((s) => (
              <div key={s.label} className="report-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.85em', color: '#64748b' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {hasErrors && (
            <div className="error-message" style={{ marginBottom: '1rem' }}>
              Hay {batch.invalidRows} fila(s) con errores críticos. No se puede ejecutar la importación hasta corregirlos.
            </div>
          )}

          <div style={{ marginBottom: '0.75rem' }}>
            <label>Filtrar filas: </label>
            <select className="input" value={rowFilter} onChange={(e) => setRowFilter(e.target.value)} style={{ display: 'inline-block', width: 'auto', marginLeft: '0.5rem' }}>
              <option value="">Todas ({rows.length})</option>
              <option value="valid">Válidas</option>
              <option value="invalid">Con errores</option>
              <option value="duplicated">Duplicadas</option>
            </select>
          </div>

          {filteredRows.length > 0 && (
            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table className="simple-table" style={{ fontSize: '0.82em' }}>
                <thead>
                  <tr><th>#</th><th>Estado</th><th>Acción</th><th>Errores / Advertencias</th></tr>
                </thead>
                <tbody>
                  {filteredRows.map((r) => (
                    <tr key={r._id}>
                      <td>{r.rowNumber}</td>
                      <td><span className={`badge ${ROW_STATUS_CLASS[r.status] ?? 'badge--default'}`}>{ROW_STATUS_LABELS[r.status] ?? r.status}</span></td>
                      <td>{r.action ?? '—'}</td>
                      <td>
                        {([...r.errors, ...(r.warnings || [])] as Array<{field?: string; message: string; severity?: string}>).map((e, i) => (
                          <div key={i} style={{ color: e.severity === 'error' ? '#dc2626' : '#d97706', fontSize: '0.9em' }}>
                            {e.field ? <strong>{e.field}: </strong> : null}{e.message}
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!hasErrors && (
            <div className="report-card" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
                Confirmé que revisé los datos y estoy de acuerdo con importarlos.
              </label>
            </div>
          )}

          <div className="form-actions">
            {!hasErrors && (
              <button
                className="button button--primary"
                onClick={handleExecute}
                disabled={!confirmed || executing}
              >
                {executing ? 'Ejecutando...' : 'Ejecutar importación'}
              </button>
            )}
            <button className="button" onClick={() => navigate('/imports')}>Ir a importaciones</button>
          </div>
        </div>
      )}

      {/* Paso 4: Resultado final */}
      {step === 4 && (
        <div className="report-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✓</div>
          <h3>Importación iniciada</h3>
          <p style={{ color: '#64748b' }}>La importación está en proceso. Podés consultar el estado en el historial de importaciones.</p>
          <div className="form-actions" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
            <button className="button button--primary" onClick={() => navigate(`/imports/${batch?._id}`)}>Ver detalle</button>
            <button className="button" onClick={() => navigate('/imports')}>Ir a importaciones</button>
          </div>
        </div>
      )}
    </div>
  );
}
