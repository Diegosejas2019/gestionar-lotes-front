import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Eye, FileText, History, Plus, Save } from 'lucide-react';
import { adminLegalDocumentsApi } from '../api/services';
import { DateDisplay } from '../components/DateDisplay';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import type { LegalAcceptance, LegalDocument, LegalDocumentType } from '../types';

const TYPE_LABELS: Record<LegalDocumentType, string> = {
  terms: 'Términos y Condiciones',
  privacy_policy: 'Política de Privacidad',
  cookies_policy: 'Política de Cookies',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
};

const emptyForm = {
  type: 'terms' as LegalDocumentType,
  version: '',
  title: '',
  content: '',
  requiresAcceptance: true,
  effectiveFrom: '',
};

export function LegalDocumentsSettingsPage(): React.ReactElement {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [selected, setSelected] = useState<LegalDocument | null>(null);
  const [acceptances, setAcceptances] = useState<LegalAcceptance[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const grouped = useMemo(() => {
    return documents.reduce<Record<string, LegalDocument[]>>((acc, doc) => {
      acc[doc.type] = acc[doc.type] || [];
      acc[doc.type].push(doc);
      return acc;
    }, {});
  }, [documents]);

  useEffect(() => {
    void load();
  }, []);

  async function load(): Promise<void> {
    setLoading(true);
    setError('');
    try {
      const res = await adminLegalDocumentsApi.list();
      setDocuments(res.documents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los documentos legales.');
    } finally {
      setLoading(false);
    }
  }

  function startNew(type: LegalDocumentType = 'terms'): void {
    setSelected(null);
    setAcceptances([]);
    setForm({ ...emptyForm, type, requiresAcceptance: type !== 'cookies_policy' });
  }

  async function selectDocument(doc: LegalDocument): Promise<void> {
    setSelected(doc);
    setForm({
      type: doc.type,
      version: doc.version,
      title: doc.title,
      content: doc.content,
      requiresAcceptance: doc.requiresAcceptance,
      effectiveFrom: doc.effectiveFrom ? doc.effectiveFrom.slice(0, 10) : '',
    });
    setAcceptances([]);
    if (doc.status === 'published') {
      try {
        const res = await adminLegalDocumentsApi.acceptances(doc._id);
        setAcceptances(res.acceptances || []);
      } catch {
        setAcceptances([]);
      }
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = { ...form, effectiveFrom: form.effectiveFrom || null };
      if (selected) {
        const res = await adminLegalDocumentsApi.update(selected._id, payload);
        setSelected(res.document);
        setMessage('Documento actualizado correctamente.');
      } else {
        const res = await adminLegalDocumentsApi.create(payload);
        setSelected(res.document);
        setMessage('Borrador creado correctamente.');
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el documento legal.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(doc: LegalDocument): Promise<void> {
    if (!confirm('¿Publicar esta versión? La versión publicada anterior del mismo tipo será archivada.')) return;
    setError('');
    try {
      await adminLegalDocumentsApi.publish(doc._id);
      setMessage('Documento publicado correctamente.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo publicar el documento legal.');
    }
  }

  async function handleArchive(doc: LegalDocument): Promise<void> {
    if (!confirm('¿Archivar esta versión legal? El historial de aceptación se conservará.')) return;
    setError('');
    try {
      await adminLegalDocumentsApi.archive(doc._id);
      setMessage('Documento archivado correctamente.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo archivar el documento legal.');
    }
  }

  async function handleDelete(doc: LegalDocument): Promise<void> {
    if (!confirm('¿Eliminar este borrador?')) return;
    setError('');
    try {
      await adminLegalDocumentsApi.remove(doc._id);
      setSelected(null);
      setMessage('Borrador eliminado correctamente.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el borrador.');
    }
  }

  if (loading) return <LoadingState message="Cargando documentos legales..." />;

  return (
    <div className="page-container">
      <PageHeader
        title="Documentos legales"
        description="Gestioná versiones de términos, privacidad y cookies de GestionAr Lotes."
        action={<button className="button" type="button" onClick={() => startNew()}><Plus size={16} /> Nuevo borrador</button>}
      />

      <div className="alert alert--warning" style={{ marginBottom: 16 }}>
        <AlertTriangle size={16} aria-hidden="true" />
        Este contenido debe ser revisado por un profesional legal antes de su publicación definitiva.
      </div>

      {error && <ErrorMessage message={error} />}
      {message && <div className="alert alert--success" style={{ marginBottom: 16 }}>{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(320px, 0.9fr)', gap: 16, alignItems: 'start' }}>
        <section className="panel">
          <h2><History size={16} /> Historial</h2>
          {documents.length === 0 ? (
            <EmptyState title="Sin documentos legales" message="Creá los borradores base para comenzar." />
          ) : (
            Object.entries(TYPE_LABELS).map(([type, label]) => (
              <div key={type} style={{ marginBottom: 18 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 14, color: '#e2e8f0' }}>{label}</h3>
                {(grouped[type] || []).length === 0 ? (
                  <button className="button button--small button--ghost" type="button" onClick={() => startNew(type as LegalDocumentType)}>Crear borrador</button>
                ) : (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {(grouped[type] || []).map((doc) => (
                      <div key={doc._id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                          <div>
                            <strong>{doc.title}</strong>
                            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                              Versión {doc.version} · {STATUS_LABELS[doc.status] || doc.status}
                              {doc.effectiveFrom ? <> · Vigente <DateDisplay value={doc.effectiveFrom} /></> : null}
                            </div>
                          </div>
                          <div className="actions">
                            <button className="button button--small button--ghost" type="button" onClick={() => void selectDocument(doc)}><Eye size={13} /> Ver</button>
                            {doc.status === 'draft' && <button className="button button--small" type="button" onClick={() => void handlePublish(doc)}>Publicar</button>}
                            {doc.status !== 'archived' && <button className="button button--small button--ghost" type="button" onClick={() => void handleArchive(doc)}>Archivar</button>}
                            {doc.status === 'draft' && <button className="button button--small button--danger" type="button" onClick={() => void handleDelete(doc)}>Eliminar</button>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </section>

        <section className="panel">
          <h2><FileText size={16} /> {selected ? 'Detalle' : 'Nuevo borrador'}</h2>
          <form onSubmit={(event) => void handleSubmit(event)} style={{ display: 'grid', gap: 12 }}>
            <label>Tipo
              <select value={form.type} disabled={Boolean(selected)} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as LegalDocumentType, requiresAcceptance: event.target.value !== 'cookies_policy' }))}>
                {Object.entries(TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>Versión
              <input value={form.version} disabled={selected?.status !== 'draft' && Boolean(selected)} onChange={(event) => setForm((prev) => ({ ...prev, version: event.target.value }))} required />
            </label>
            <label>Título
              <input value={form.title} disabled={selected?.status !== 'draft' && Boolean(selected)} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required />
            </label>
            <label>Vigente desde
              <input type="date" value={form.effectiveFrom} disabled={selected?.status !== 'draft' && Boolean(selected)} onChange={(event) => setForm((prev) => ({ ...prev, effectiveFrom: event.target.value }))} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={form.requiresAcceptance} disabled={selected?.status !== 'draft' && Boolean(selected)} onChange={(event) => setForm((prev) => ({ ...prev, requiresAcceptance: event.target.checked }))} />
              Requiere aceptación
            </label>
            <label>Contenido
              <textarea value={form.content} rows={14} disabled={selected?.status !== 'draft' && Boolean(selected)} onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))} required />
            </label>
            {(!selected || selected.status === 'draft') && (
              <button className="button" type="submit" disabled={saving}><Save size={16} /> {saving ? 'Guardando...' : 'Guardar borrador'}</button>
            )}
          </form>

          {selected?.status === 'published' && (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 14 }}>Aceptaciones registradas</h3>
              {acceptances.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>Todavía no hay aceptaciones para esta versión.</p>
              ) : (
                <table className="simple-table">
                  <thead><tr><th>Usuario</th><th>Fecha</th><th>IP</th></tr></thead>
                  <tbody>
                    {acceptances.map((acceptance) => (
                      <tr key={acceptance._id}>
                        <td>{acceptance.userId}</td>
                        <td><DateDisplay value={acceptance.acceptedAt} /></td>
                        <td>{acceptance.ip || 'No disponible'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
