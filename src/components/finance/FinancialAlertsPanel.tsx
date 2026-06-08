import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { FinancialAlert } from '../../types';
import { EmptyState } from '../EmptyState';

type Props = {
  alerts: FinancialAlert[];
};

function AlertIcon({ severity }: { severity: string }): React.ReactElement {
  if (severity === 'danger') return <AlertCircle size={18} className="alert-icon alert-icon--danger" />;
  if (severity === 'warning') return <AlertTriangle size={18} className="alert-icon alert-icon--warning" />;
  return <Info size={18} className="alert-icon alert-icon--info" />;
}

function severityLabel(severity: string): string {
  if (severity === 'danger') return 'Urgente';
  if (severity === 'warning') return 'Atención';
  return 'Información';
}

export function FinancialAlertsPanel({ alerts }: Props): React.ReactElement {
  if (alerts.length === 0) {
    return <EmptyState title="No hay alertas financieras pendientes." />;
  }

  return (
    <div className="financial-alerts-list">
      {alerts.map((alert) => (
        <div key={alert.id} className={`financial-alert financial-alert--${alert.severity}`}>
          <div className="financial-alert__icon">
            <AlertIcon severity={alert.severity} />
          </div>
          <div className="financial-alert__body">
            <div className="financial-alert__header">
              <strong>{alert.title}</strong>
              <span className={`financial-alert__badge financial-alert__badge--${alert.severity}`}>
                {severityLabel(alert.severity)}
              </span>
            </div>
            <p className="financial-alert__description">{alert.description}</p>
          </div>
          <div className="financial-alert__action">
            <Link to={alert.actionUrl} className="btn-link-small">
              Ver
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
