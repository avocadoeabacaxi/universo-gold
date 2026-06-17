import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Video, Radio, Calendar, Trash2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_CONFIG = {
  live: { label: 'AO VIVO', color: 'bg-red-500 text-white animate-pulse' },
  scheduled: { label: 'Agendada', color: 'bg-amber-100 text-amber-800' },
  ended: { label: 'Encerrada', color: 'bg-gray-100 text-gray-500' },
};

export default function CommunityLiveTab({ communityId, canEdit, currentUser }) {
  const [lives, setLives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', stream_url: '', status: 'scheduled', scheduled_date: '' });

  useEffect(() => {
    base44.entities.Live.filter({ community_id: communityId }, '-created_date', 20)
      .then(setLives)
      .finally(() => setLoading(false));
  }, [communityId]);

  const handleAdd = async () => {
    if (!form.title.trim() || !form.stream_url.trim()) return;
    const created = await base44.entities.Live.create({
      ...form,
      community_id: communityId,
      host_id: currentUser?.id,
      host_name: currentUser?.full_name,
    });
    setLives(prev => [created, ...prev]);
    setForm({ title: '', description: '', stream_url: '', status: 'scheduled', scheduled_date: '' });
    setAdding(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.Live.delete(id);
    setLives(prev => prev.filter(l => l.id !== id));
  };

  const handleStatusChange = async (id, status) => {
    await base44.entities.Live.update(id, { status, ...(status === 'live' ? { started_at: new Date().toISOString() } : {}), ...(status === 'ended' ? { ended_at: new Date().toISOString() } : {}) });
    setLives(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  if (loading) return <div className="text-sm text-muted-foreground text-center py-8">Carregando...</div>;

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <button onClick={() => setAdding(!adding)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition">
            <Plus className="w-4 h-4" /> Nova live
          </button>
        </div>
      )}

      {adding && (
        <div className="bg-card rounded-xl border border-primary/30 p-4 space-y-3">
          <h3 className="font-bold text-sm">Nova transmissão</h3>
          <div className="space-y-2">
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="Título da live *" />
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="Descrição (opcional)" />
            <input value={form.stream_url} onChange={e => setForm(f => ({ ...f, stream_url: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="Link da transmissão (YouTube, Teams, Meet...) *" />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-primary/30">
                  <option value="scheduled">Agendada</option>
                  <option value="live">Ao Vivo agora</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Data/hora (opcional)</label>
                <input type="datetime-local" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-primary/30" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setAdding(false)} className="px-4 py-2 text-sm text-muted-foreground border rounded-xl hover:bg-muted transition">Cancelar</button>
            <button onClick={handleAdd} disabled={!form.title.trim() || !form.stream_url.trim()}
              className="px-4 py-2 text-sm bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 transition">
              Publicar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {lives.map(live => (
          <div key={live.id} className="bg-card rounded-xl border border-border/60 p-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${live.status === 'live' ? 'bg-red-100' : 'bg-primary/10'}`}>
                <Radio className={`w-5 h-5 ${live.status === 'live' ? 'text-red-500' : 'text-primary'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-sm">{live.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_CONFIG[live.status]?.color}`}>
                    {STATUS_CONFIG[live.status]?.label}
                  </span>
                </div>
                {live.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{live.description}</p>}
                {live.scheduled_date && live.status === 'scheduled' && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(live.scheduled_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <a href={live.stream_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs bg-primary text-white px-3 py-1.5 rounded-full font-semibold hover:bg-primary/90 transition">
                    <ExternalLink className="w-3 h-3" />
                    {live.status === 'live' ? 'Entrar na live' : 'Acessar link'}
                  </a>
                  {canEdit && live.status === 'scheduled' && (
                    <button onClick={() => handleStatusChange(live.id, 'live')}
                      className="text-xs border border-red-400 text-red-500 px-3 py-1.5 rounded-full font-semibold hover:bg-red-50 transition">
                      Iniciar ao vivo
                    </button>
                  )}
                  {canEdit && live.status === 'live' && (
                    <button onClick={() => handleStatusChange(live.id, 'ended')}
                      className="text-xs border border-gray-400 text-gray-500 px-3 py-1.5 rounded-full font-semibold hover:bg-gray-50 transition">
                      Encerrar live
                    </button>
                  )}
                  {canEdit && (
                    <button onClick={() => handleDelete(live.id)}
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {lives.length === 0 && !adding && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          <Video className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Nenhuma live ainda.</p>
          {canEdit && <p className="text-xs mt-1">Clique em "Nova live" para adicionar um link de transmissão.</p>}
        </div>
      )}
    </div>
  );
}