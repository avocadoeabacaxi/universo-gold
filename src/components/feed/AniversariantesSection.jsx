import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Cake, ChevronRight, Send, X } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function isBirthdayThisWeek(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  const birth = parseISO(dateStr);
  if (!isValid(birth)) return false;

  // Verifica se o mês/dia cai dentro dos próximos 7 dias
  for (let i = 0; i < 7; i++) {
    const check = new Date(today);
    check.setDate(today.getDate() + i);
    if (birth.getMonth() === check.getMonth() && birth.getDate() === check.getDate()) {
      return true;
    }
  }
  return false;
}

function isBirthdayToday(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  const birth = parseISO(dateStr);
  if (!isValid(birth)) return false;
  return birth.getMonth() === today.getMonth() && birth.getDate() === today.getDate();
}

function getBirthdayDate(dateStr) {
  if (!dateStr) return '';
  const birth = parseISO(dateStr);
  if (!isValid(birth)) return '';
  return format(birth, "dd 'de' MMMM", { locale: ptBR });
}

function MensagemModal({ person, onClose, currentUser }) {
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!msg.trim()) return;
    setSending(true);
    await base44.entities.Post.create({
      author_id: currentUser?.id,
      author_name: currentUser?.full_name,
      author_avatar: currentUser?.avatar_url,
      author_role: currentUser?.job_title,
      content: `🎂 @${person.full_name} ${msg}`,
      post_type: 'text',
    });
    setSent(true);
    setSending(false);
  };

  const initials = person.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Mensagem de Aniversário 🎂</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-xl">
          <Avatar className="w-12 h-12 border-2 border-blue-200">
            <AvatarImage src={person.avatar_url} />
            <AvatarFallback className="bg-blue-600 text-white font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{person.full_name}</p>
            <p className="text-xs text-muted-foreground">{person.job_title || person.department}</p>
            <p className="text-xs text-blue-600 font-medium">🎂 {getBirthdayDate(person.data_nascimento)}</p>
          </div>
        </div>

        {sent ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">🎉</div>
            <p className="font-semibold text-green-600">Mensagem enviada!</p>
            <p className="text-sm text-muted-foreground mt-1">Sua mensagem foi publicada no feed.</p>
            <button onClick={onClose} className="mt-4 px-6 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition">Fechar</button>
          </div>
        ) : (
          <>
            <textarea
              value={msg}
              onChange={e => setMsg(e.target.value)}
              placeholder={`Escreva uma mensagem para ${person.full_name.split(' ')[0]}...`}
              className="w-full border rounded-xl p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleSend}
              disabled={!msg.trim() || sending}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-primary text-white rounded-full py-2.5 text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> {sending ? 'Enviando...' : 'Enviar Parabéns 🎂'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function TodosAniversariantesModal({ onClose, currentUser }) {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [mesAtual, setMesAtual] = useState(new Date().getMonth());

  useEffect(() => {
    base44.entities.UserProfile.filter({ status: 'active' }).then(profiles => {
      const withBirthday = profiles.filter(p => p.data_nascimento);
      // Ordena por mês/dia
      withBirthday.sort((a, b) => {
        const da = parseISO(a.data_nascimento);
        const db = parseISO(b.data_nascimento);
        const aVal = da.getMonth() * 100 + da.getDate();
        const bVal = db.getMonth() * 100 + db.getDate();
        return aVal - bVal;
      });
      setAll(withBirthday);
      setLoading(false);
    });
  }, []);

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const filtered = all.filter(p => parseISO(p.data_nascimento).getMonth() === mesAtual);

  return (
    <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-4">
      {selected && <MensagemModal person={selected} onClose={() => setSelected(null)} currentUser={currentUser} />}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <Cake className="w-5 h-5 text-pink-500" />
            <h3 className="font-bold text-lg">Aniversariantes</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filtro por mês */}
        <div className="flex gap-1 p-3 overflow-x-auto border-b scrollbar-thin">
          {meses.map((m, i) => (
            <button
              key={i}
              onClick={() => setMesAtual(i)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${mesAtual === i ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum aniversariante neste mês.</p>
          ) : (
            filtered.map(p => {
              const initials = p.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              const isToday = isBirthdayToday(p.data_nascimento);
              return (
                <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border transition hover:shadow-sm ${isToday ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'}`}>
                  <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                    <AvatarImage src={p.avatar_url} />
                    <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{p.full_name} {isToday && '🎂'}</p>
                    <p className="text-xs text-muted-foreground">{getBirthdayDate(p.data_nascimento)}{p.department ? ` • ${p.department}` : ''}</p>
                  </div>
                  {isToday && (
                    <button
                      onClick={() => setSelected(p)}
                      className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-semibold hover:bg-primary/90 transition"
                    >
                      <Cake className="w-3 h-3" /> Parabenizar
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function AniversariantesSection({ currentUser }) {
  const [weekBirthdays, setWeekBirthdays] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  useEffect(() => {
    base44.entities.UserProfile.filter({ status: 'active' }).then(profiles => {
      const bdays = profiles.filter(p => isBirthdayThisWeek(p.data_nascimento));
      setWeekBirthdays(bdays);
    }).catch(() => {});
  }, []);

  if (weekBirthdays.length === 0) return null;

  return (
    <>
      {showAll && <TodosAniversariantesModal onClose={() => setShowAll(false)} currentUser={currentUser} />}
      {selectedPerson && <MensagemModal person={selectedPerson} onClose={() => setSelectedPerson(null)} currentUser={currentUser} />}

      <div className="bg-white rounded-xl border border-yellow-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-100">
          <span className="text-sm shrink-0">🎂</span>
          <span className="font-bold text-xs text-gray-800">Aniversariantes da Semana</span>
        </div>

        {/* Avatares */}
        <div className="px-4 py-3 flex gap-3 overflow-x-auto scrollbar-thin">
          {weekBirthdays.map(p => {
            const initials = p.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            const isToday = isBirthdayToday(p.data_nascimento);
            return (
              <button
                key={p.id}
                onClick={() => isToday && setSelectedPerson(p)}
                className={`flex flex-col items-center gap-1.5 shrink-0 group ${isToday ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className={`relative rounded-full p-0.5 ${isToday ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gradient-to-r from-blue-400 to-purple-400'}`}>
                  <Avatar className="w-12 h-12 border-2 border-white">
                    <AvatarImage src={p.avatar_url} />
                    <AvatarFallback className="bg-blue-600 text-white text-sm font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  {isToday && (
                    <span className="absolute -bottom-1 -right-1 text-sm">🎂</span>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-700 max-w-[60px] truncate group-hover:text-primary transition">
                  {p.full_name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-muted-foreground">{getBirthdayDate(p.data_nascimento)}</span>
              </button>
            );
          })}
        </div>

        {/* Ver todos - rodapé */}
        <div className="border-t border-yellow-100">
          <button
            onClick={() => setShowAll(true)}
            className="w-full flex items-center justify-center gap-1 py-2 text-xs text-primary font-semibold hover:bg-yellow-50 transition"
          >
            Ver todos <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </>
  );
}