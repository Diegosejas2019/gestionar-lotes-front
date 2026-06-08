import { Link } from 'react-router-dom';
import type { WorkProjectSummaryItem } from '../../types';
import { CurrencyAmount } from '../CurrencyAmount';
import { DataTable } from '../DataTable';
import { EmptyState } from '../EmptyState';
import { StatusBadge } from '../StatusBadge';

type Props = {
  projects: WorkProjectSummaryItem[];
};

function statusTone(status: string): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  if (status === 'completed') return 'success';
  if (status === 'cancelled') return 'danger';
  if (status === 'in_progress') return 'info';
  if (status === 'paused') return 'warning';
  return 'neutral';
}

export function WorkProjectsSummaryTable({ projects }: Props): React.ReactElement {
  if (projects.length === 0) {
    return <EmptyState title="No hay obras registradas." />;
  }

  return (
    <DataTable<WorkProjectSummaryItem>
      rows={projects}
      getRowKey={(p) => String(p._id)}
      emptyTitle="No hay obras."
      columns={[
        {
          key: 'name',
          header: 'Obra',
          render: (p) => (
            <Link to={`/work-projects/${p._id}`} className="fw-medium">
              {p.name}
            </Link>
          ),
        },
        {
          key: 'developmentName',
          header: 'Barrio',
          render: (p) => p.developmentName || '—',
        },
        {
          key: 'status',
          header: 'Estado',
          render: (p) => <StatusBadge label={p.statusLabel} tone={statusTone(p.status)} />,
        },
        {
          key: 'estimatedBudget',
          header: 'Presupuesto',
          className: 'text-right',
          render: (p) => <CurrencyAmount amount={p.estimatedBudget} currency={p.currency as 'ARS' | 'USD'} />,
        },
        {
          key: 'spent',
          header: 'Gastado',
          className: 'text-right',
          render: (p) => <CurrencyAmount amount={p.spent} currency={p.currency as 'ARS' | 'USD'} />,
        },
        {
          key: 'remaining',
          header: 'Saldo estimado',
          className: 'text-right',
          render: (p) => <CurrencyAmount amount={p.remaining} currency={p.currency as 'ARS' | 'USD'} />,
        },
        {
          key: 'progress',
          header: 'Avance',
          render: (p) => (
            <div className="progress-cell">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${p.progressPercentage}%` }} />
              </div>
              <span>{p.progressPercentage}%</span>
            </div>
          ),
        },
        {
          key: 'actions',
          header: '',
          render: (p) => (
            <Link to={`/work-projects/${p._id}`} className="btn-link-small">
              Ver detalle
            </Link>
          ),
        },
      ]}
    />
  );
}
