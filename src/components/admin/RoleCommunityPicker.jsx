import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

export default function RoleCommunityPicker({ communities, value = [], onChange }) {
  const toggle = (id) => onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id]);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={`h-8 text-xs gap-1 ${value.length ? '' : 'border-red-300 text-red-600'}`}>
          <Users className="w-3 h-3" /> {value.length ? `${value.length} comunidade(s)` : 'Vincular comunidade'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2 max-h-72 overflow-y-auto">
        <p className="text-xs font-semibold px-1 pb-2 text-muted-foreground">Comunidades / grupos vinculados</p>
        {communities.map(c => (
          <label key={c.id} className="flex items-center gap-2 px-1 py-1.5 rounded hover:bg-muted cursor-pointer text-sm">
            <Checkbox checked={value.includes(c.id)} onCheckedChange={() => toggle(c.id)} />
            <span className="truncate">{c.name}</span>
          </label>
        ))}
        {communities.length === 0 && <p className="text-xs text-muted-foreground p-1">Nenhuma comunidade cadastrada.</p>}
      </PopoverContent>
    </Popover>
  );
}