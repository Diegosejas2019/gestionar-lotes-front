type StatusBadgeProps = {
  label: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
};

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps): React.ReactElement {
  return <span className={`status-badge status-badge--${tone}`}>{label}</span>;
}
