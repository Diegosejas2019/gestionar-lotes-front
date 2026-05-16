import React from 'react';
import { MousePointer, Square, Trash2 } from 'lucide-react';

type Tool = 'select' | 'rect';

interface MapToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  onDeleteSelected?: () => void;
  hasSelection?: boolean;
  readOnly?: boolean;
}

export function MapToolbar({ activeTool, onToolChange, onDeleteSelected, hasSelection, readOnly }: MapToolbarProps): React.ReactElement {
  const btnStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
    background: active ? '#2563eb' : '#fff',
    color: active ? '#fff' : '#374151',
    border: '1px solid ' + (active ? '#2563eb' : '#d1d5db'),
    borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
  });

  if (readOnly) return <div />;

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <button style={btnStyle(activeTool === 'select')} onClick={() => onToolChange('select')}>
        <MousePointer size={15} /> Seleccionar
      </button>
      <button style={btnStyle(activeTool === 'rect')} onClick={() => onToolChange('rect')}>
        <Square size={15} /> Dibujar rectángulo
      </button>
      {hasSelection && onDeleteSelected && (
        <button
          style={{ ...btnStyle(false), color: '#dc2626', borderColor: '#fca5a5' }}
          onClick={onDeleteSelected}
        >
          <Trash2 size={15} /> Eliminar forma
        </button>
      )}
    </div>
  );
}
