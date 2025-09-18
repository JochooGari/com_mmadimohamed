import { Input } from '../ui/input';

export default function SearchInput({ value, onChange, placeholder = 'Rechercher...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />;
}


