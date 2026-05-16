import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { refinancingAgreementsApi } from '../api/services';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CurrencyAmount } from '../components/CurrencyAmount';
import { DateDisplay } from '../components/DateDisplay';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { Currency, RefinancingAgreement, RefinancingStatus } from '../types';
import { refinancingStatusLabels } from '../utils/labels';

function statusTone(status: RefinancingStatus): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  if (status === 'active' || status === 'completed') return 'success';
  if (status === 'cancelled') return 'danger';
  if (status === 'pending_signature') return 'warning';
  if (status === 'signed') return 'info';
  return 'neutral';
}

export function RefinancingAgreementDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const [agreement, setAgreement] = useState<RefinancingAgreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const [signedDialog, setSignedDialog] = useState(false);
  const [signedForm, setSignedForm] = useState({ signedAt: new Date().toISOString().slice(0, 10), signedDocumentUrl: '', signedDocumentPublicId: '' });
  const [activateDialog, setActivateDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [working, setWorking] = useState('');

  async function load(): Promise<void> {
    try {
      const data = await refinancingAgreementsApi.get(id!);
      setAgreement(data.refinancingAgreement);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el acuerdo.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [id]);

  async function generateDocument(): Promise<void> {
    setWorking('gen');
    try {
      await refinancingAgreementsApi.generateDocument(id!);
      setMsg('PDF generado. El acuerdo pasó a estado "Pendiente de firma".');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar el documento.');
    } finally {
      setWorking('');
    }
  }

  async function markSigned(): Promise<void> {
    setWorking('sign');
    try {
      await refinancingAgreementsApi.markSigned(id!, signedForm);
      setSignedDialog(false);
      setMsg('Acuerdo marcado como firmado.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo marcar como firmado.');
    } finally {
      setWorking('');
    }
  }

  async function activate(): Promise<void> {
    setActivateDialog(false);
    setWorking('activate');
    try {
      await refinancingAgreementsApi.activate(id!);
      setMsg('Acuerdo activado. Las cuotas anteriores fueron refinanciadas y se crearon las nuevas.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo activar el acuerdo.');
    } finally {
      setWorking('');
    }
  }

  async function cancel(): Promise<void> {
    setCancelDialog(false);
    setWorking('cancel');
    try {
      await refinancingAgreementsApi.cancel(id!, { reason: cancelReason });
      setMsg('Acuerdo cancelado.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cancelar el acuerdo.');
    } finally {
      setWorking('');
    }
  }

  if (loading) return <LoadingState />;
  if (!agreement) return <ErrorMessage message="Acuerdo no encontrado." />;

  const a = agreement;
  const canGenerate = a.status === 'draft';
  const canSign = a.status === 'draft' || a.status === 'pending_signature';
  const canActivate = a.status === 'signed';
  const canCancel = !['active', 'completed', 'cancelled'].includes(a.status);

  return (
    <div>
      <PageHeader title={`Refinanciación ${a.agreementNumber}`} />
      {error && <ErrorMessage message={error} />}
      {msg && <div className="alert alert--success">{msg}</div>}

      <div className="detail-grid">
        <div className="detail-card">
          <h3>Datos del acuerdo</h3>
          <dl className="detail-list">
            <dt>Estado</dt><dd><StatusBadge label={refinancingStatusLabels[a.status]} tone={statusTone(a.status)} /></dd>
            <dt>Fecha</dt><dd><DateDisplay value={a.agreementDate} /></dd>
            <dt>Moneda</dt><dd>{a.currency}</dd>
            <dt>Monto total</dt><dd><CurrencyAmount amount={a.totalDebtAmount} currency={a.currency as Currency} /></dd>
            <dt>Anticipo</dt><dd><CurrencyAmount amount={a.downPaymentAmount} currency={a.currency as Currency} /></dd>
            <dt>Cuotas</dt><dd>{a.installmentCount}</dd>
            <dt>Valor cuota</dt><dd><CurrencyAmount amount={a.installmentAmount} currency={a.currency as Currency} /></dd>
            <dt>Primer vencimiento</dt><dd><DateDisplay value={a.firstDueDate} /></dd>
            <dt>Día mensual</dt><dd>Día {a.monthlyDueDay}</dd>
            {a.signedAt && <><dt>Firmado</dt><dd><DateDisplay value={a.signedAt} /></dd></>}
          </dl>
        </div>

        <div className="detail-card">
          <h3>Estado del proceso</h3>
          {a.status === 'active' && (
            <div>
              <p>Cuotas refinanciadas (anteriores): {a.previousInstallmentIds.length}</p>
              <p>Cuotas nuevas: {a.newInstallmentIds.length}</p>
            </div>
          )}
          {a.notes && <><h4>Notas</h4><p>{a.notes}</p></>}
        </div>
      </div>

      {canActivate && (
        <div className="alert alert--warning">
          <strong>Atención:</strong> Al activar, las cuotas anteriores quedarán refinanciadas y se crearán las nuevas. Esta acción no se puede deshacer.
        </div>
      )}

      <div className="action-bar">
        {canGenerate && <button className="btn btn--secondary" onClick={generateDocument} disabled={working === 'gen'}>Generar PDF</button>}
        {canSign && <button className="btn btn--secondary" onClick={() => setSignedDialog(true)}>Marcar como firmado</button>}
        {canActivate && <button className="btn btn--primary" onClick={() => setActivateDialog(true)} disabled={working === 'activate'}>Activar acuerdo</button>}
        {canCancel && <button className="btn btn--danger" onClick={() => setCancelDialog(true)}>Cancelar</button>}
      </div>

      {signedDialog && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Marcar como firmado</h3>
            <div className="form-group">
              <label>Fecha de firma</label>
              <input type="date" value={signedForm.signedAt} onChange={(e) => setSignedForm((f) => ({ ...f, signedAt: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>URL del documento firmado</label>
              <input value={signedForm.signedDocumentUrl} onChange={(e) => setSignedForm((f) => ({ ...f, signedDocumentUrl: e.target.value }))} />
            </div>
            <div className="modal-actions">
              <button className="btn btn--primary" onClick={markSigned} disabled={working === 'sign'}>Confirmar</button>
              <button className="btn btn--secondary" onClick={() => setSignedDialog(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {activateDialog && (
        <ConfirmDialog
          open
          title="Activar acuerdo de refinanciación"
          message="Al activar: las cuotas pendientes anteriores quedarán como 'refinanciadas' y se crearán las nuevas cuotas según este acuerdo. Esta acción es irreversible. ¿Confirmar?"
          onConfirm={activate}
          onCancel={() => setActivateDialog(false)}
          danger
        />
      )}

      {cancelDialog && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Cancelar acuerdo</h3>
            <div className="form-group">
              <label>Motivo</label>
              <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn btn--danger" onClick={cancel}>Cancelar acuerdo</button>
              <button className="btn btn--secondary" onClick={() => setCancelDialog(false)}>Volver</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
