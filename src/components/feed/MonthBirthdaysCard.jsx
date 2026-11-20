import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Cake } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const HIGHLIGHT_DAYS = 7;

// Destaque exibido no Feed nos primeiros dias de cada mês
export default function MonthBirthdaysCard() {
  const [people, setPeople] = useState([]);
  const today = new Date();
  const show = today.getDate() <= HIGHLIGHT_DAYS;

  useEffect(() => {
    if (!show) return;
    const month = format(today, 'MM');
    base44.entities.UserProfile
      .filter({ status: 'active', data_nascimento: { $regex: `^\\d{4}-${month}-` } }, 'full_name', 500)
      .then(list => setPeople([...list].sort((a, b) => a.data_nascimento.slice(8, 10).localeCompare(b.data_nascimento.slice(8, 10)))));
  }, []);

  if (!show || people.length === 0) return null;

  return (
    <div className="bg-card border-2 border-primary rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 text-primary mb-3">
        <Cake className="w-5 h-5" />
        <h3 className="font-extrabold text-base">Aniversariantes de {format(today, 'MMMM', { locale: ptBR })}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {people.map(p => (
          <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary">
            <Avatar className="w-9 h-9 shrink-0">
              <AvatarImage src={p.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">{p.full_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{p.full_name}</p>
              {p.department && <p className="text-xs text-muted-foreground truncate">{p.department}</p>}
            </div>
            <span className="text-xs font-bold text-primary shrink-0">Dia {p.data_nascimento.slice(8, 10)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}