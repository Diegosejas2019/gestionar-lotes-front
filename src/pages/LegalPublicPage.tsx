import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { legalDocumentsApi } from '../api/services';
import type { LegalDocument } from '../types';
import { formatDate } from '../utils/format';

const LEGAL_LABELS: Record<string, string> = {
  '/legal/terms': 'Términos y Condiciones',
  '/legal/privacy': 'Política de Privacidad',
  '/legal/cookies': 'Política de Cookies',
};

export function LegalPublicPage(): React.ReactElement {
  const location = useLocation();
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loader = useMemo(() => {
    if (location.pathname === '/legal/privacy') return legalDocumentsApi.publicPrivacy;
    if (location.pathname === '/legal/cookies') return legalDocumentsApi.publicCookies;
    return legalDocumentsApi.publicTerms;
  }, [location.pathname]);

  useEffect(() => {
    async function load(): Promise<void> {
      setLoading(true);
      setError('');
      try {
        const res = await loader();
        setDocument(res.document);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el documento legal.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [loader]);

  if (loading) return <LoadingState message="Cargando documento legal..." />;

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', color: '#1f2937', padding: '32px 16px' }}>
      <article style={{ maxWidth: 880, margin: '0 auto', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 28 }}>
        <Link to="/landing" style={{ color: '#2563eb', textDecoration: 'none', fontSize: 14 }}>Volver a GestionAr Lotes</Link>
        {error ? (
          <div style={{ marginTop: 20 }}>
            <ErrorMessage message={error} />
          </div>
        ) : document ? (
          <>
            <h1 style={{ margin: '20px 0 8px', fontSize: 30 }}>{document.title || LEGAL_LABELS[location.pathname]}</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Versión {document.version}
              {document.effectiveFrom ? ` · Vigente desde ${formatDate(document.effectiveFrom)}` : ''}
            </p>
            <div style={{ marginTop: 28, whiteSpace: 'pre-wrap', lineHeight: 1.75, fontSize: 16 }}>
              {document.content}
            </div>
          </>
        ) : null}
      </article>
    </main>
  );
}
