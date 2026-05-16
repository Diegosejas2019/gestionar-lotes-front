type EmptyStateProps = {
  title: string;
  message?: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, message, action }: EmptyStateProps): React.ReactElement {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      {message ? <p>{message}</p> : null}
      {action}
    </div>
  );
}
