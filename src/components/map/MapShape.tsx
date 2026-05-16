import React from 'react';
import { EnrichedMapShape } from '../../types';
import { STATUS_COLORS } from './MapLegend';

interface MapShapeProps {
  shape: EnrichedMapShape;
  selected?: boolean;
  onClick?: (shape: EnrichedMapShape) => void;
  scale?: number;
}

function shapeColor(visualStatus?: string): string {
  return STATUS_COLORS[visualStatus || 'available'] || '#e5e7eb';
}

export function MapShape({ shape, selected, onClick, scale = 1 }: MapShapeProps): React.ReactElement | null {
  const color = shapeColor(shape.visualStatus);
  const opacity = 0.7;
  const strokeWidth = selected ? 3 / scale : 1.5 / scale;
  const stroke = selected ? '#1d4ed8' : '#fff';

  const label = shape.label || shape.lotNumber || '';
  const labelX = shape.labelPosition?.x;
  const labelY = shape.labelPosition?.y;

  const tooltipLines = [
    shape.lotNumber ? `Lote: ${shape.lotNumber}` : null,
    shape.block ? `Manzana: ${shape.block}` : null,
    shape.surface ? `Superficie: ${shape.surface} m²` : null,
    shape.price != null ? `Precio: ${shape.currency} ${shape.price.toLocaleString('es-AR')}` : null,
    shape.visualStatus ? `Estado: ${shape.visualStatus}` : null,
    shape.buyerName ? `Comprador: ${shape.buyerName}` : null,
    shape.hasOverdueInstallments ? 'Tiene cuotas vencidas' : null,
  ].filter(Boolean).join('\n');

  const handleClick = () => onClick?.(shape);

  if (shape.shapeType === 'rectangle') {
    const c = shape.coordinates as { x: number; y: number; width: number; height: number };
    const cx = c.x + c.width / 2;
    const cy = c.y + c.height / 2;
    return (
      <g onClick={handleClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
        <title>{tooltipLines}</title>
        <rect
          x={c.x} y={c.y} width={c.width} height={c.height}
          fill={color} fillOpacity={opacity}
          stroke={stroke} strokeWidth={strokeWidth}
        />
        {label && (
          <text
            x={labelX ?? cx} y={labelY ?? cy}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={Math.max(10, Math.min(14, c.height * 0.3)) / scale}
            fill="#fff" style={{ pointerEvents: 'none', userSelect: 'none', fontWeight: 600 }}
          >
            {label}
          </text>
        )}
      </g>
    );
  }

  if (shape.shapeType === 'polygon') {
    const pts = (shape.coordinates as Array<{ x: number; y: number }>);
    if (!pts || pts.length < 3) return null;
    const points = pts.map((p) => `${p.x},${p.y}`).join(' ');
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    return (
      <g onClick={handleClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
        <title>{tooltipLines}</title>
        <polygon
          points={points}
          fill={color} fillOpacity={opacity}
          stroke={stroke} strokeWidth={strokeWidth}
        />
        {label && (
          <text
            x={labelX ?? cx} y={labelY ?? cy}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={12 / scale}
            fill="#fff" style={{ pointerEvents: 'none', userSelect: 'none', fontWeight: 600 }}
          >
            {label}
          </text>
        )}
      </g>
    );
  }

  return null;
}
