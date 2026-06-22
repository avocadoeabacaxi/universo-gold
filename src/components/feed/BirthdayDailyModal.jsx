import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X } from 'lucide-react';
import { parseISO, isValid, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function isBirthdayToday(dateStr) {
  if (!dateStr) return false;
  const birth = parseISO(dateStr);
  if (!isValid(birth)) return false;
  const today = new Date();
  return birth.getMonth() === today.getMonth() && birth.getDate() === today.getDate();
}

export default function BirthdayDailyModal() {
  const [people, setPeople] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const todayKey = `birthday_modal_${format(new Date(), 'yyyy-MM-dd')}`;
    if (localStorage.getItem(todayKey)) return;

    base44.entities.UserProfile.filter({ status: 'active' }).then(profiles => {
      const todays = profiles.filter(p => isBirthdayToday(p.data_nascimento));
      if (todays.length > 0) {
        setPeople(todays);
        setOpen(true);
        localStorage.setItem(todayKey, '1');
      }
    }).catch(() => {});
  }, []);

  if (!open || people.length === 0) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="relative bg-gradient-to-br from-yellow-400 to-orange-400 px-5 py-6 text-center">
          <button onClick={() => setOpen(false)} className="absolute top-3 right-3 text-white/90 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="text-4xl mb-1">🎂</div>
          <h3 className="font-bold text-lg text-white">Aniversariantes de hoje!</h3>
          <p className="text-xs text-white/90 mt-0.5">Não esqueça de dar os parabéns 🎉</p>
        </div>
        <div className="p-4 space-y-2 max-h-[50vh] overflow-y-auto">
          {people.map(p => {
            const initials = p.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            return (
              <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-yellow-50 border border-yellow-100">
                <Avatar className="w-11 h-11 border-2 border-white shadow-sm">
                  <AvatarImage src={p.avatar_url} />
                  <AvatarFallback className="bg-blue-600 text-white text-sm font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{p.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.job_title || p.department || ''}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-4 pt-0">
          <button onClick={() => setOpen(false)}
            className="w-full py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}