import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, PartyPopper, Check, Loader2 } from 'lucide-react';
import { parseISO, isValid, format } from 'date-fns';
import { createNotification } from '@/lib/notifications';

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
  const [currentUser, setCurrentUser] = useState(null);
  const [sending, setSending] = useState(null);
  const [done, setDone] = useState([]);

  useEffect(() => {
    const todayKey = `birthday_modal_${format(new Date(), 'yyyy-MM-dd')}`;
    if (localStorage.getItem(todayKey)) return;

    base44.auth.me().then(u => setCurrentUser(u)).catch(() => {});

    base44.entities.UserProfile.filter({ status: 'active' }).then(profiles => {
      const todays = profiles.filter(p => isBirthdayToday(p.data_nascimento));
      if (todays.length > 0) {
        setPeople(todays);
        setOpen(true);
        localStorage.setItem(todayKey, '1');
      }
    }).catch(() => {});
  }, []);

  const handleCongratulate = async (person) => {
    if (!currentUser) return;
    setSending(person.id);
    await base44.entities.Post.create({
      author_id: currentUser.id,
      author_name: currentUser.full_name,
      author_avatar: currentUser.avatar_url,
      content: `🎉 Parabéns, ${person.full_name?.split(' ')[0]}! Muitas felicidades! 🎂`,
      post_type: 'text',
      likes_count: 0,
      comments_count: 0,
      liked_by: [],
      status: 'active',
    });
    if (person.user_id) {
      await createNotification({
        recipientId: person.user_id,
        actorId: currentUser.id,
        type: 'system',
        title: 'Você recebeu parabéns! 🎉',
        message: `${currentUser.full_name} te parabenizou pelo aniversário!`,
        actorName: currentUser.full_name,
        actorAvatar: currentUser.avatar_url,
        link: '/',
      });
    }
    setDone(prev => [...prev, person.id]);
    setSending(null);
  };

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
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{p.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.job_title || p.department || ''}</p>
                </div>
                {done.includes(p.id) ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 shrink-0">
                    <Check className="w-4 h-4" /> Enviado
                  </span>
                ) : (
                  <button
                    onClick={() => handleCongratulate(p)}
                    disabled={sending === p.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition shrink-0 disabled:opacity-60"
                  >
                    {sending === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PartyPopper className="w-3.5 h-3.5" />}
                    Parabenizar
                  </button>
                )}
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