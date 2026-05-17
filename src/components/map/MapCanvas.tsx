import React, { useRef, useState, useCallback } from 'react';
import { EnrichedMapShape, LotMapShape } from '../../types';
import { MapShape } from './MapShape';

interface MapCanvasProps {
  backgroundImageUrl?: string;
  canvasWidth: number;
  canvasHeight: number;
  shapes: EnrichedMapShape[];
  selectedShapeId?: string | null;
  onShapeClick?: (shape: EnrichedMapShape) => void;
  /** Editor mode: called when user draws a new rectangle */
  onDrawRect?: (rect: { x: number; y: number; width: number; height: number }) => void;
  editorMode?: 'select' | 'rect' | null;
  /** Extra overlay shapes (editor in-progress) */
  draftShapes?: LotMapShape[];
}

export function MapCanvas({
  backgroundImageUrl,
  canvasWidth,
  canvasHeight,
  shapes,
  selectedShapeId,
  onShapeClick,
  onDrawRect,
  editorMode,
  draftShapes = [],
}: MapCanvasProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Drawing state
  const [drawing, setDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [drawCurrent, setDrawCurrent] = useState({ x: 0, y: 0 });

  const svgToCanvas = useCallback((clientX: number, clientY: number) => {
    const svg = containerRef.current?.querySelector('svg');
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: (clientX - rect.left - pan.x) / scale,
      y: (clientY - rect.top - pan.y) / scale,
    };
  }, [pan, scale]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.min(4, Math.max(0.2, s - e.deltaY * 0.001)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (editorMode === 'rect' && onDrawRect) {
      const pt = svgToCanvas(e.clientX, e.clientY);
      setDrawing(true);
      setDrawStart(pt);
      setDrawCurrent(pt);
    } else if (!editorMode || editorMode === 'select') {
      setIsDraggingPan(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (drawing) {
      setDrawCurrent(svgToCanvas(e.clientX, e.clientY));
    } else if (isDraggingPan) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (drawing) {
      setDrawing(false);
      const x = Math.min(drawStart.x, drawCurrent.x);
      const y = Math.min(drawStart.y, drawCurrent.y);
      const width = Math.abs(drawCurrent.x - drawStart.x);
      const height = Math.abs(drawCurrent.y - drawStart.y);
      if (width > 5 && height > 5) onDrawRect?.({ x, y, width, height });
    }
    setIsDraggingPan(false);
  };

  const cursorStyle = editorMode === 'rect' ? 'crosshair' : isDraggingPan ? 'grabbing' : 'grab';

  return (
    <div
      ref={containerRef}
      className="map-canvas-container"
      style={{ overflow: 'hidden', position: 'relative', width: '100%', height: 520 }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => { setIsDraggingPan(false); setDrawing(false); }}
    >
      <svg
        width={canvasWidth}
        height={canvasHeight}
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        style={{
          display: 'block',
          transformOrigin: '0 0',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          cursor: cursorStyle,
        }}
      >
        {backgroundImageUrl && (
          <image href={backgroundImageUrl} x={0} y={0} width={canvasWidth} height={canvasHeight} preserveAspectRatio="xMidYMid meet" />
        )}
        {!backgroundImageUrl && (
          <rect x={0} y={0} width={canvasWidth} height={canvasHeight} style={{ fill: 'var(--surface-muted)' }} />
        )}

        {shapes.map((shape) => (
          <MapShape
            key={shape.id}
            shape={shape}
            selected={selectedShapeId === shape.id}
            onClick={onShapeClick}
            scale={scale}
          />
        ))}

        {draftShapes.map((shape) => (
          <MapShape key={shape.id} shape={shape as EnrichedMapShape} scale={scale} />
        ))}

        {drawing && (
          <rect
            x={Math.min(drawStart.x, drawCurrent.x)}
            y={Math.min(drawStart.y, drawCurrent.y)}
            width={Math.abs(drawCurrent.x - drawStart.x)}
            height={Math.abs(drawCurrent.y - drawStart.y)}
            fill="rgba(37,99,235,0.2)" stroke="#2563eb" strokeWidth={2 / scale} strokeDasharray={`${6 / scale}`}
          />
        )}
      </svg>

      <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 4 }}>
        <button onClick={() => setScale((s) => Math.min(4, s + 0.2))} style={{ padding: '4px 8px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer', fontSize: '1rem' }}>+</button>
        <button onClick={() => setScale(1)} style={{ padding: '4px 8px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer', fontSize: '0.75rem' }}>1:1</button>
        <button onClick={() => setScale((s) => Math.max(0.2, s - 0.2))} style={{ padding: '4px 8px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer', fontSize: '1rem' }}>−</button>
      </div>
    </div>
  );
}
