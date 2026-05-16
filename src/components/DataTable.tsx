import { EmptyState } from './EmptyState';

export type DataTableColumn<T> = {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (item: T) => string;
  emptyTitle?: string;
};

export function DataTable<T>({ columns, rows, getRowKey, emptyTitle = 'No hay registros para mostrar.' }: DataTableProps<T>): React.ReactElement {
  if (!rows.length) return <EmptyState title={emptyTitle} />;
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => <th key={column.key} className={column.className}>{column.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((column) => <td key={column.key} className={column.className}>{column.render(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
