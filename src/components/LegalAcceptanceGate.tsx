import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorMessage } from './ErrorMessage';
import { LoadingState } from './LoadingState';
import { legalAcceptancesApi, legalDocumentsApi } from '../api/services';
import type { LegalDocument } from '../types';
import { formatDate } from '../utils/format';

type LegalAcceptanceGateProps = {
  children: React.ReactNode;
};

const TYPE_LABELS: Record<LegalDocument['type'], string> = {
  terms: 'Términos y Condiciones',
  privacy_policy: 'Política de Privacidad',
  cookies_policy: 'Política de Cookies',
};

export function LegalAcceptanceGate({ children }: LegalAcceptanceGateProps): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [checked, setChecked] = useState(false);
  const [missing, setMissing] = useState<LegalDocument[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    void load();
  }, []);

  async function load(): Promise<void> {
    setLoading(true);
    setError('');
    try {
      const res = await legalDocumentsApi.current();
      setMissing(res.missingRequiredDocuments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo validar la aceptación legal.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(): Promise<void> {
    if (!checked || missing.length === 0) return;
    setAccepting(true);
    setError('');
    try {
      for (const doc of missing) {
        await legalAcceptancesApi.accept({ type: doc.type, version: doc.version, legalDocumentId: doc._id });
      }
      setAccepted(true);
      setMissing([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar la aceptación legal.');
    } finally {
      setAccepting(false);
    }
  }

  if (loading) return <LoadingState message="Validando condiciones legales..." />;
  if (error && missing.length === 0) return <ErrorMessage message={error} />;
  if (accepted || missing.length === 0) return <>{children}</>;

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal modal--wide" role="dialog" aria-modal="true" aria-labelledby="legal-acceptance-title">
        <h2 id="legal-acceptance-title">Aceptación legal requerida</h2>
        <p>Para continuar usando GestionAr Lotes, revisá y aceptá los documentos legales vigentes.</p>

        <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
          {missing.map((doc) => (
            <div key={doc._id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
              <strong>{TYPE_LABELS[doc.type]}</strong>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                Versión {doc.version}
                {doc.effectiveFrom ? ` · Vigente desde ${formatDate(doc.effectiveFrom)}` : ''}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 14 }}>
          <Link to="/legal/terms" target="_blank" rel="noreferrer">Ver Términos y Condiciones</Link>
          <Link to="/legal/privacy" target="_blank" rel="noreferrer">Ver Política de Privacidad</Link>
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: '#e2e8f0' }}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
            style={{ marginTop: 4 }}
          />
          <span>Leí y acepto los Términos y Condiciones y la Política de Privacidad.</span>
        </label>

        {error && <ErrorMessage message={error} />}

        <div className="modal-actions">
          <button className="button" type="button" disabled={!checked || accepting} onClick={() => void handleAccept()}>
            {accepting ? 'Registrando...' : 'Aceptar y continuar'}
          </button>
        </div>
      </section>
    </div>
  );
}
