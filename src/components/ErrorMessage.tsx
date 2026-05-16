type ErrorMessageProps = {
  message?: string;
};

export function ErrorMessage({ message }: ErrorMessageProps): React.ReactElement | null {
  if (!message) return null;
  return <div className="error-message" role="alert">{message}</div>;
}
