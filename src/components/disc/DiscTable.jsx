import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Copy, Eye, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DISC_PROFILES, DISC_ORDER } from '@/lib/discProfiles';
import DiscStatusBadge from './DiscStatusBadge';

const statusFilters = [['all', 'Todos'], ['completed', 'Concluídos'], ['in_progress', 'Em andamento'], ['pending', 'Aguardando']];

export default function DiscTable({ refreshKey, onChange }) {
  const { toast } = useToast();
  const [items, setItems] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [profile, setProfile] = useState('all');

  useEffect(() => {
    const q = {};
    if (status !== 'all') q.status = status;
    if (profile !== 'all') q.primary_profile = profile;
    if (search.trim()) q.candidate_name = { $regex: search.trim(), $options: 'i' };
    const t = setTimeout(() => base44.entities.DiscAssessment.filter(q, '-created_date', 100).then(setItems), 250);
    return () => clearTimeout(t);
  }, [search, status, profile, refreshKey]);

  const copy = (id) => { navigator.clipboard.writeText(`${window.location.origin}/disc/teste/${id}`); toast({ title: 'Link copiado!' }); };
  const remove = async (id) => { if (!confirm('Excluir este teste?')) return; await base44.entities.DiscAssessment.delete(id); onChange(); };
  const chip = (active) => `shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-muted border-border'}`;

  return (
    <div className="bg-card rounded-xl border border-border/60 p-4 space-y-3">
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {statusFilters.map(([k, l]) => <button key={k} onClick={() => setStatus(k)} className={chip(status === k)}>{l}</button>)}
        <span className="w-px bg-border shrink-0" />
        <button onClick={() => setProfile('all')} className={chip(profile === 'all')}>Todos perfis</button>
        {DISC_ORDER.map(k => <button key={k} onClick={() => setProfile(k)} className={chip(profile === k)}>{k} · {DISC_PROFILES[k].name}</button>)}
      </div>
      {!items ? <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        : items.length === 0 ? <p className="text-sm text-muted-foreground text-center py-10">Nenhum teste encontrado.</p>
        : <div className="divide-y divide-border/60">
          {items.map(a => {
            const p = a.primary_profile && DISC_PROFILES[a.primary_profile];
            return (
              <div key={a.id} className="py-3 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white shrink-0 ${p ? p.bg : 'bg-muted'}`}>{a.primary_profile || '?'}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{a.candidate_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{[a.job_title, a.department].filter(Boolean).join(' · ') || a.candidate_email || '—'}</p>
                </div>
                <div className="hidden sm:block"><DiscStatusBadge status={a.status} /></div>
                {a.status === 'completed'
                  ? <Link to={`/disc/resultado/${a.id}`}><Button size="sm" className="gap-1"><Eye /> Relatório</Button></Link>
                  : <Button size="sm" variant="outline" className="gap-1" onClick={() => copy(a.id)}><Copy /> Link</Button>}
                <Button size="icon" variant="outline" className="text-red-500" onClick={() => remove(a.id)}><Trash2 /></Button>
              </div>
            );
          })}
        </div>}
    </div>
  );
}