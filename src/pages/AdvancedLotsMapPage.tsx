import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { developmentsApi, mapLayoutsApi } from '../api/services';
import { lotVisualStatusLabels } from '../utils/labels';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { MapCanvas } from '../components/map/MapCanvas';
import { MapLegend } from '../components/map/MapLegend';
import { UnplacedLotsPanel } from '../components/map/UnplacedLotsPanel';
import type { AdvancedMapData, Development, EnrichedMapShape } from '../types';

function ShapeDetail({ shape, onClose }: { shape: EnrichedMapShape; onClose: () => void }): React.ReactElement {
  const navigate = useNavigate();
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true">
        <h2>Lote {shape.lotNumber || '—'}</h2>
        <div className="detail-grid">
          {shape.block ? <p><strong>Manzana:</strong> {shape.block}</p> : null}
          {shape.surface ? <p><strong>Superficie:</strong> {shape.surface} m²</p> : null}
          {shape.price != null ? <p><strong>Precio:</strong> {shape.currency} {shape.price.toLocaleString('es-AR')}</p> : null}
          {shape.visualStatus ? <p><strong>Estado:</strong> {shape.visualStatus}</p> : null}
          {shape.buyerName ? <p><strong>Comprador:</strong> {shape.buyerName}</p> : null}
          {shape.hasOverdueInstallments ? <p className="text--danger">Tiene cuotas vencidas</p> : null}
        </div>
        <div className="modal-actions">
          {shape.saleId ? <button className="button button--ghost" type="button" onClick={() => navigate(`/sales/${shape.saleId}`)}>Ver venta</button> : null}
          <button className="button button--ghost" type="button" onClick={onClose}>Cerrar</button>
        </div>
      </section>
    </div>
  );
}

export function AdvancedLotsMapPage(): React.ReactElement {
  const navigate = useNavigate();
  const [developments, setDevelopments] = useState<Development[]>([]);
  const [developmentId, setDevelopmentId] = useState('');
  const [data, setData] = useState<AdvancedMapData | null>(null);
  const [selectedShape, setSelectedShape] = useState<EnrichedMapShape | null>(null);
  const [loadingDevs, setLoadingDevs] = useState(true);
  const [loadingMap, setLoadingMap] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const res = await developmentsApi.list();
        const items: Development[] = res.developments || [];
        setDevelopments(items);
        if (items.length === 1) setDevelopmentId(items[0]._id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los barrios.');
      } finally {
        setLoadingDevs(false);
      }
    }
    void load();
  }, []);

  useEffect(() => {
    if (!developmentId) { setData(null); return; }
    setLoadingMap(true);
    setError('');
    async function loadMap(): Promise<void> {
      try {
        const res = await mapLayoutsApi.getAdvancedMap(developmentId);
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el plano.');
      } finally {
        setLoadingMap(false);
      }
    }
    void loadMap();
  }, [developmentId]);

  if (loadingDevs) return <LoadingState message="Cargando barrios..." />;

  return (
    <div>
      <PageHeader
        title="Plano visual avanzado"
        description="Vista del plano del barrio con estado de lotes"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="button button--ghost" type="button" onClick={() => navigate('/lots-map')}>
              Ver grilla
            </button>
            {developmentId && (
              <button className="button button--ghost" type="button" onClick={() => navigate(`/lots-map/editor?developmentId=${developmentId}`)}>
                Editar plano
              </button>
            )}
          </div>
        }
      />

      {error && <ErrorMessage message={error} />}

      <div style={{ marginBottom: '1rem' }}>
        <select
          value={developmentId}
          onChange={(e) => setDevelopmentId(e.target.value)}
          style={{ minWidth: 240 }}
        >
          <option value="">— Seleccionar barrio —</option>
          {developments.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>
      </div>

      {loadingMap && <LoadingState message="Cargando plano..." />}

      {!loadingMap && developmentId && data && !data.layout && (
        <EmptyState
          title="Sin plano cargado"
          message="Este barrio todavía no tiene un plano cargado."
          action={
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button className="button" type="button" onClick={() => navigate(`/lots-map/editor?developmentId=${developmentId}`)}>
                Cargar plano
              </button>
              <button className="button button--ghost" type="button" onClick={() => navigate('/lots-map')}>
                Usar vista de grilla
              </button>
            </div>
          }
        />
      )}

      {!loadingMap && data?.layout && (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <MapLegend />
            <div style={{ marginTop: '0.5rem' }}>
              <MapCanvas
                backgroundImageUrl={data.layout.backgroundImageUrl ?? undefined}
                canvasWidth={data.layout.canvasWidth}
                canvasHeight={data.layout.canvasHeight}
                shapes={data.shapes}
                selectedShapeId={selectedShape?.id ?? null}
                onShapeClick={(shape) => setSelectedShape(shape)}
              />
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {data.layout.name}
              {data.layout.description ? ` — ${data.layout.description}` : ''}
            </div>
          </div>
          <div style={{ width: 260, flexShrink: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              Lotes sin ubicar
            </div>
            <UnplacedLotsPanel lots={data.unplacedLots || []} />
          </div>
        </div>
      )}

      {!loadingMap && !developmentId && (
        <EmptyState
          title="Seleccionar barrio"
          message="Elegí un barrio para ver su plano visual."
        />
      )}

      {selectedShape && (
        <ShapeDetail shape={selectedShape} onClose={() => setSelectedShape(null)} />
      )}
    </div>
  );
}
