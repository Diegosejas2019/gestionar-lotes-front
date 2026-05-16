type FilterBarProps = {
  children: React.ReactNode;
};

export function FilterBar({ children }: FilterBarProps): React.ReactElement {
  return <section className="filter-bar" aria-label="Filtros">{children}</section>;
}
