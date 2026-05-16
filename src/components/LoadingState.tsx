type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = 'Cargando datos...' }: LoadingStateProps): React.ReactElement {
  return <div className="loading-state">{message}</div>;
}
