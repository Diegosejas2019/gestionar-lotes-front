import { formatDate } from '../utils/format';

type DateDisplayProps = {
  value?: string | null;
};

export function DateDisplay({ value }: DateDisplayProps): React.ReactElement {
  return <span>{formatDate(value)}</span>;
}
