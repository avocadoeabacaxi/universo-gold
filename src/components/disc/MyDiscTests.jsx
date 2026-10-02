import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { DISC_PROFILES } from '@/lib/discProfiles';
import DiscStatusBadge from './DiscStatusBadge';

export default function MyDiscTests({ user }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    base44.entities.DiscAssessment.filter({ $or: [{ user_id: user.id }, { candidate_email: user.email }] }, '-created_date', 20).then(setItems);
  }, [user.id, user.email]);

  if (!items.length) return null;
  return (
    <div className="bg-card rounded-xl border border-border/60 p-4">
      <p className="font-bold text-sm mb-3">Meus testes</p>
      <div className="space-y-2">
        {items.map(a => (
          <div key={a.id} className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold ${a.primary_profile ? DISC_PROFILES[a.primary_profile].bg : 'bg-muted'}`}>{a.primary_profile || '?'}</div>
            <div className="flex-1 text-sm">{a.primary_profile ? DISC_PROFILES[a.primary_profile].name : 'Teste pendente'}</div>
            <DiscStatusBadge status={a.status} />
            <Link to={a.status === 'completed' ? `/disc/resultado/${a.id}` : `/disc/teste/${a.id}`}>
              <Button size="sm" variant="outline">{a.status === 'completed' ? 'Ver resultado' : 'Responder'}</Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}