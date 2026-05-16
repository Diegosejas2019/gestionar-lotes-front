import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { developmentsApi, lotsApi, mapLayoutsApi } from '../api/services';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { MapCanvas } from '../components/map/MapCanvas';
import { MapToolbar } from '../components/map/MapToolbar';
import { UnplacedLotsPanel } from '../components/map/UnplacedLotsPanel';
import type { Development, LotMapLayout, LotMapShape } from '../types';

interface DrawnRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  lotId: string;
}

export function LotMapEditorPage(): React.ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialDevId = searchParams.get('developmentId') || '';

  const [developments, setDevelopments] = useState<Development[]>([]);
  const [developmentId, setDevelopmentId] = useState(initialDevId);
  const [layout, setLayout] = useState<LotMapLayout | null>(null);
  const [lots, setLots] = useState<Array<{ _id: string; id: string; lotNumber: string; block: string; surface?: number }>>([]);
  const [shapes, setShapes] = useState<LotMapShape[]>([]);
  const [activeTool, setActiveTool] = useState<'select' | 'rect'>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingRect, setPendingRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [pendingLotId, setPendingLotId] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingDevs, setLoadingDevs] = useState(true);
  const [loadingLayout, setLoadingLayout] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [layoutName, setLayoutName] = useState('');
  const [creatingLayout, setCreatingLayout] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const res = await developmentsApi.list();
        setDevelopments(res.developments || []);
      } catch {
        setError('No se pudieron cargar los barrios.');
      } finally {
        setLoadingDevs(false);
      }
    }
    void load();
  }, []);

  useEffect(() => {
    if (!developmentId) { setLayout(null); setLots([]); setShapes([]); return; }
    setLoadingLayout(true);
    setError('');
    async function loadEditor(): Promise<void> {
      try {
        const [mapRes, lotsRes] = await Promise.all([
          mapLayoutsApi.getAdvancedMap(developmentId),
          lotsApi.list(new URLSearchParams({ developmentId, limit: '500' })),
        ]);
        if (mapRes.layout) {
          setLayout(mapRes.layout);
          setShapes(mapRes.layout.layoutData?.shapes || []);
        } else {
          setLayout(null);
          setShapes([]);
        }
        setLots((lotsRes.lots || []).map((l: any) => ({ _id: l._id, id: l._id, lotNumber: l.lotNumber, block: l.block, surface: l.surface })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el plano.');
      } finally {
        setLoadingLayout(false);
      }
    }
    void loadEditor();
  }, [developmentId]);

  const placedLotIds = new Set(shapes.filter((s) => s.lotId).map((s) => s.lotId as string));
  const unplacedLots = lots.filter((l) => !placedLotIds.has(l._id));

  async function handleCreateLayout(): Promise<void> {
    if (!layoutName.trim()) { setError('Ingresá un nombre para el plano.'); return; }
    setCreatingLayout(true);
    setError('');
    try {
      const res = await mapLayoutsApi.create(developmentId, { name: layoutName, canvasWidth: 1200, canvasHeight: 800 });
      setLayout(res.layout || res);
      setShapes([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el plano.');
    } finally {
      setCreatingLayout(false);
    }
  }

  async function handleUploadBackground(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    if (!file || !layout) return;
    setUploadingBg(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await mapLayoutsApi.uploadBackground(developmentId, layout._id, formData);
      const updatedLayout = (res as any).layout;
      if (updatedLayout?.backgroundImageUrl) {
        setLayout((prev) => prev ? { ...prev, backgroundImageUrl: updatedLayout.backgroundImageUrl } : prev);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir la imagen.');
    } finally {
      setUploadingBg(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleDrawRect(rect: { x: number; y: number; width: number; height: number }): void {
    setPendingRect(rect);
    setPendingLotId('');
    setActiveTool('select');
  }

  function confirmPendingRect(): void {
    if (!pendingRect) return;
    const newShape: LotMapShape = {
      id: `shape-${Date.now()}`,
      lotId: pendingLotId || undefined,
      shapeType: 'rectangle',
      coordinates: pendingRect,
      label: pendingLotId ? (lots.find((l) => l._id === pendingLotId)?.lotNumber ?? '') : '',
    };
    setShapes((prev) => [...prev, newShape]);
    setPendingRect(null);
    setPendingLotId('');
  }

  function deleteSelected(): void {
    setShapes((prev) => prev.filter((s) => s.id !== selectedId));
    setSelectedId(null);
  }

  async function handleSave(): Promise<void> {
    if (!layout) return;
    setSaving(true);
    setError('');
    try {
      await mapLayoutsApi.updateShapes(developmentId, layout._id, shapes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el plano.');
    } finally {
      setSaving(false);
    }
  }

  async function handleActivate(): Promise<void> {
    if (!layout) return;
    setSaving(true);
    setError('');
    try {
      await mapLayoutsApi.updateShapes(developmentId, layout._id, shapes);
      await mapLayoutsApi.activate(developmentId, layout._id);
      setLayout((prev) => prev ? { ...prev, status: 'active', active: true } : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo activar el plano.');
    } finally {
      setSaving(false);
    }
  }

  if (loadingDevs) return <LoadingState message="Cargando..." />;

  return (
    <div>
      <PageHeader
        title="Editor de plano"
        description="Dibujá y asociá lotes en el plano del barrio"
        action={
          <button className="button button--ghost" type="button" onClick={() => navigate(developmentId ? `/lots-map/advanced?developmentId=${developmentId}` : '/lots-map/advanced')}>
            ← Volver al plano
          </button>
        }
      />

      {error && <ErrorMessage message={error} />}

      <div style={{ marginBottom: '1rem' }}>
        <select
          value={developmentId}
          onChange={(e) => setDevelopmentId(e.target.value)}
          style={{ padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem', minWidth: 240 }}
        >
          <option value="">— Seleccionar barrio —</option>
          {developments.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>
      </div>

      {loadingLayout && <LoadingState message="Cargando plano..." />}

      {!loadingLayout && developmentId && !layout && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1.5rem', maxWidth: 480 }}>
          <p style={{ marginBottom: '1rem', fontWeight: 600 }}>No hay un plano para este barrio. Creá uno para empezar.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Nombre del plano (ej: Plano 2024)"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem' }}
            />
            <button className="button" type="button" disabled={creatingLayout} onClick={() => void handleCreateLayout()}>
              {creatingLayout ? 'Creando...' : 'Crear plano'}
            </button>
          </div>
        </div>
      )}

      {!loadingLayout && layout && (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: 8 }}>
              <MapToolbar
                activeTool={activeTool}
                onToolChange={setActiveTool}
                onDeleteSelected={deleteSelected}
                hasSelection={!!selectedId}
              />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: layout.active ? '#16a34a' : '#6b7280' }}>
                  {layout.active ? 'Activo' : layout.status === 'draft' ? 'Borrador' : 'Archivado'}
                </span>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={(e) => void handleUploadBackground(e)} />
                <button className="button button--ghost" type="button" disabled={uploadingBg} onClick={() => fileInputRef.current?.click()}>
                  {uploadingBg ? 'Subiendo...' : 'Cambiar imagen de fondo'}
                </button>
                <button className="button button--ghost" type="button" disabled={saving} onClick={() => void handleSave()}>
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
                {!layout.active && (
                  <button className="button" type="button" disabled={saving} onClick={() => void handleActivate()}>
                    Activar plano
                  </button>
                )}
              </div>
            </div>

            <MapCanvas
              backgroundImageUrl={layout.backgroundImageUrl ?? undefined}
              canvasWidth={layout.canvasWidth}
              canvasHeight={layout.canvasHeight}
              shapes={[]}
              draftShapes={shapes as any}
              selectedShapeId={selectedId}
              onShapeClick={(shape) => setSelectedId(selectedId === shape.id ? null : shape.id)}
              onDrawRect={handleDrawRect}
              editorMode={activeTool}
            />

            {pendingRect && (
              <div style={{ marginTop: '0.75rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '0.75rem', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Asociar lote a la forma dibujada:</span>
                <select
                  value={pendingLotId}
                  onChange={(e) => setPendingLotId(e.target.value)}
                  style={{ padding: '0.4rem 0.6rem', border: '1px solid #d1d5db', borderRadius: 4, fontSize: '0.85rem' }}
                >
                  <option value="">— Sin asignar —</option>
                  {unplacedLots.map((l) => (
                    <option key={l._id} value={l._id}>Lote {l.lotNumber}{l.block ? ` — Mza. ${l.block}` : ''}</option>
                  ))}
                </select>
                <button className="button" type="button" onClick={confirmPendingRect}>Confirmar</button>
                <button className="button button--ghost" type="button" onClick={() => setPendingRect(null)}>Cancelar</button>
              </div>
            )}
          </div>

          <div style={{ width: 260, flexShrink: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', color: '#374151' }}>
              Lotes sin ubicar
            </div>
            <UnplacedLotsPanel lots={unplacedLots} />
          </div>
        </div>
      )}
    </div>
  );
}
