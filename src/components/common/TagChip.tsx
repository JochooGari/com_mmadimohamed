import { Badge } from '../ui/badge';

export default function TagChip({ tag, onClick }: { tag: string; onClick?: () => void }) {
  return (
    <Badge variant="outline" className="cursor-pointer" onClick={onClick}>#{tag}</Badge>
  );
}


