import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { deedProcessesApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { DeedProcess, DeedStatus } from '../types';
import { deedStatusLabels } from '../utils/labels';

function statusTone(status: DeedStatus): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  if (status === 'completed') return 'success';
  if (status === 'cancelled') return 'danger';
  if (status === 'signed' || status === 'delivered') return 'success';
  if (status === 'signing_scheduled') return 'info';
  if (status === 'sent_to_notary') return 'info';
  if (status === 'documents_complete') return 'warning';
  return 'neutral';
}

const STATUS_TRANSITIONS: Record<DeedStatus, DeedStatus | null> = {
  not_started: 'pending_documents',
  pending_documents: 'documents_complete',
  documents_complete: 'sent_to_notary',
  sent_to_notary: 'signing_scheduled',
  signing_scheduled: 'signed',
  signed: 'delivered',
  delivered: 'completed',
  completed: null,
  cancelled: null,
};

export function DeedProcessDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const [deed, setDeed] = useState<DeedProcess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const [uploadForm, setUploadForm] = useState({ name: '', fileUrl: '', publicId: '' });
  const [advanceDialog, setAdvanceDialog] = useState(false);
  const [advanceData, setAdvanceData] = useState({ estimatedSigningDate: '', signingDate: '', deedNumber: '', overrideDebtCheck: false, overrideReason: '' });
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [working, setWorking] = useState('');

  async function load(): Promise<void> {
    try {
      const data = await deedProcessesApi.get(id!);
      setDeed(data.deedProcess);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el proceso de escrituración.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [id]);

  async function uploadDocument(): Promise<void> {
    if (!uploadForm.name.trim() || !uploadForm.fileUrl.trim()) { setError('Nombre y URL son requeridos.'); return; }
    setWorking('upload');
    try {
      await deedProcessesApi.uploadDocument(id!, { ...uploadForm, publicId: uploadForm.publicId || uploadForm.fileUrl });
      setUploadForm({ name: '', fileUrl: '', publicId: '' });
      setMsg('Documento cargado correctamente.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el documento.');
    } finally {
      setWorking('');
    }
  }

  async function advance(): Promise<void> {
    if (!deed) return;
    const nextStatus = STATUS_TRANSITIONS[deed.status];
    if (!nextStatus) return;
    setAdvanceDialog(false);
    setWorking('advance');
    try {
      await deedProcessesApi.advanceStatus(id!, { status: nextStatus, data: advanceData });
      setMsg(`Estado actualizado a: ${deedStatusLabels[nextStatus]}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo avanzar el estado.');
    } finally {
      setWorking('');
    }
  }

  async function cancel(): Promise<void> {
    setCancelDialog(false);
    setWorking('cancel');
    try {
      await deedProcessesApi.cancel(id!, { reason: cancelReason });
      setMsg('Proceso cancelado.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cancelar.');
    } finally {
      setWorking('');
    }
  }

  if (loading) return <LoadingState />;
  if (!deed) return <ErrorMessage message="Proceso no encontrado." />;

  const d = deed;
  const nextStatus = STATUS_TRANSITIONS[d.status];
  const canAdvance = nextStatus !== null && d.status !== 'cancelled';
  const canCancel = !['completed', 'cancelled'].includes(d.status);

  return (
    <div>
      <PageHeader title={`Escrituración ${d.processNumber}`} />
      {error && <ErrorMessage message={error} />}
      {msg && <div className="alert alert--success">{msg}</div>}

      <div className="detail-grid">
        <div className="detail-card">
          <h3>Estado</h3>
          <dl className="detail-list">
            <dt>Estado actual</dt><dd><StatusBadge label={deedStatusLabels[d.status]} tone={statusTone(d.status)} /></dd>
            {d.notaryName && <><dt>Escribanía</dt><dd>{d.notaryName}</dd></>}
            {d.notaryContact && <><dt>Contacto</dt><dd>{d.notaryContact}</dd></>}
            {d.estimatedSigningDate && <><dt>Firma estimada</dt><dd><DateDisplay value={d.estimatedSigningDate} /></dd></>}
            {d.signingDate && <><dt>Fecha de firma</dt><dd><DateDisplay value={d.signingDate} /></dd></>}
            {d.deedNumber && <><dt>Número de escritura</dt><dd>{d.deedNumber}</dd></>}
            {d.completedAt && <><dt>Completado</dt><dd><DateDisplay value={d.completedAt} /></dd></>}
          </dl>
        </div>

        <div className="detail-card">
          <h3>Documentación</h3>
          <p><strong>Requeridos ({d.requiredDocuments.length}):</strong></p>
          <ul>
            {d.requiredDocuments.map((doc, i) => {
              const submitted = d.submittedDocuments.find((s) => s.name === doc);
              return (
                <li key={i} className={submitted ? 'text--success' : 'text--warning'}>
                  {submitted ? '✓' : '○'} {doc}
                  {submitted && <a href={submitted.fileUrl} target="_blank" rel="noreferrer" className="link-sm"> ver</a>}
                </li>
              );
            })}
          </ul>
          {d.submittedDocuments.filter((s) => !d.requiredDocuments.includes(s.name)).map((s, i) => (
            <div key={i}><a href={s.fileUrl} target="_blank" rel="noreferrer">{s.name}</a></div>
          ))}
        </div>
      </div>

      <section className="section">
        <h3>Cargar documento</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Nombre del documento</label>
            <input value={uploadForm.name} onChange={(e) => setUploadForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>URL del archivo</label>
            <input value={uploadForm.fileUrl} onChange={(e) => setUploadForm((f) => ({ ...f, fileUrl: e.target.value }))} />
          </div>
          <div style={{ alignSelf: 'flex-end' }}>
            <button className="btn btn--secondary" onClick={uploadDocument} disabled={working === 'upload'}>Cargar</button>
          </div>
        </div>
      </section>

      {d.notes && <section className="section"><h3>Notas</h3><p>{d.notes}</p></section>}

      <div className="action-bar">
        {canAdvance && (
          <button className="btn btn--primary" onClick={() => setAdvanceDialog(true)} disabled={!!working}>
            Avanzar a: {deedStatusLabels[nextStatus!]}
          </button>
        )}
        {canCancel && <button className="btn btn--danger" onClick={() => setCancelDialog(true)} disabled={!!working}>Cancelar proceso</button>}
      </div>

      {advanceDialog && nextStatus && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Avanzar estado → {deedStatusLabels[nextStatus]}</h3>
            {nextStatus === 'signing_scheduled' && (
              <div className="form-group">
                <label>Fecha estimada de firma</label>
                <input type="date" value={advanceData.estimatedSigningDate} onChange={(e) => setAdvanceData((f) => ({ ...f, estimatedSigningDate: e.target.value }))} />
              </div>
            )}
            {nextStatus === 'signed' && (
              <>
                <div className="form-group">
                  <label>Fecha de firma *</label>
                  <input type="date" value={advanceData.signingDate} onChange={(e) => setAdvanceData((f) => ({ ...f, signingDate: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Número de escritura</label>
                  <input value={advanceData.deedNumber} onChange={(e) => setAdvanceData((f) => ({ ...f, deedNumber: e.target.value }))} />
                </div>
              </>
            )}
            {nextStatus === 'completed' && (
              <div className="alert alert--warning">
                Al completar, el lote quedará marcado como <strong>escriturado</strong> y la venta como <strong>completada</strong>.
                {!d.overrideDebtCheck && (
                  <div className="form-group">
                    <label>
                      <input type="checkbox" checked={advanceData.overrideDebtCheck} onChange={(e) => setAdvanceData((f) => ({ ...f, overrideDebtCheck: e.target.checked }))} />
                      {' '}Completar aunque haya deuda pendiente
                    </label>
                    {advanceData.overrideDebtCheck && (
                      <textarea placeholder="Motivo obligatorio..." value={advanceData.overrideReason} onChange={(e) => setAdvanceData((f) => ({ ...f, overrideReason: e.target.value }))} />
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn--primary" onClick={advance} disabled={working === 'advance'}>Confirmar</button>
              <button className="btn btn--secondary" onClick={() => setAdvanceDialog(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {cancelDialog && (
        <ConfirmDialog
          open
          title="Cancelar proceso de escrituración"
          message="¿Cancelar este proceso? No se modificará el estado del lote ni la venta."
          onConfirm={cancel}
          onCancel={() => setCancelDialog(false)}
          danger
        />
      )}
    </div>
  );
}
