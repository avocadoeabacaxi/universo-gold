import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Radio, Plus, Calendar, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Lives() {
  const [lives, setLives] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', stream_url: '', status: 'scheduled', scheduled_date: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      setUserProfile(profiles[0] || null);
      const l = await base44.entities.Live.list('-created_date', 20);
      setLives(l);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    const live = await base44.entities.Live.create({
      ...form,
      host_id: currentUser?.id,
      host_name: currentUser?.full_name,
    });
    setLives(prev => [live, ...prev]);
    setForm({ title: '', description: '', stream_url: '', status: 'scheduled', scheduled_date: '' });
    setDialogOpen(false);
    setSaving(false);
  };

  const canAdd = userProfile?.role === 'admin' || userProfile?.role === 'department_leader';

  const statusConfig = {
    live: { label: 'AO VIVO', color: 'bg-red-500 text-white', dot: 'bg-red-500 animate-pulse' },
    scheduled: { label: 'Agendado', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
    ended: { label: 'Encerrado', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
            <Radio className="w-6 h-6 text-red-500" /> Lives e Transmissões
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Acompanhe transmissões ao vivo da empresa</p>
        </div>
        {canAdd && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gold-gradient text-white gap-2 rounded-xl shadow-md">
                <Plus className="w-4 h-4" /> Agendar Live
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>Agendar transmissão</DialogTitle></DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Título *</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Reunião Geral, Treinamento..." required className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>URL do Stream *</Label>
                  <Input value={form.stream_url} onChange={e => setForm(f => ({ ...f, stream_url: e.target.value }))} placeholder="YouTube Live embed URL..." required className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                      <SelectItem value="live">Ao Vivo Agora</SelectItem>
                      <SelectItem value="ended">Encerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Data e hora</Label>
                  <Input type="datetime-local" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Descrição</Label>
                  <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Sobre o que será?" className="rounded-xl resize-none" rows={2} />
                </div>
                <Button type="submit" disabled={saving || !form.title || !form.stream_url} className="w-full gold-gradient text-white rounded-xl">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Live now highlight */}
      {lives.filter(l => l.status === 'live').length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            <span className="font-bold text-red-600 text-sm">TRANSMISSÕES AO VIVO AGORA</span>
          </div>
          <div className="space-y-3">
            {lives.filter(l => l.status === 'live').map(live => (
              <div key={live.id} className="aspect-video rounded-xl overflow-hidden bg-black max-h-72">
                <iframe src={live.stream_url} className="w-full h-full" allowFullScreen title={live.title} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All lives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lives.map(live => {
          const cfg = statusConfig[live.status] || statusConfig.scheduled;
          return (
            <Card key={live.id} className="rounded-xl border-border/60 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-36 bg-gradient-to-br from-blue-900 to-primary flex items-center justify-center relative">
                <Radio className="w-12 h-12 text-white/40" />
                <div className="absolute top-2 right-2">
                  <Badge className={`${cfg.color} text-xs border-0 flex items-center gap-1`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-sm mb-1">{live.title}</h3>
                {live.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{live.description}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {live.host_name}</span>
                  {live.scheduled_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(live.scheduled_date), "d MMM, HH:mm", { locale: ptBR })}
                    </span>
                  )}
                </div>
                {live.status !== 'ended' && (
                  <a href={live.stream_url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="w-full rounded-lg text-xs bg-primary hover:bg-primary/90">
                      {live.status === 'live' ? '▶ Assistir ao vivo' : 'Acessar transmissão'}
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          );
        })}
        {lives.length === 0 && (
          <div className="col-span-3 text-center py-16 text-muted-foreground">
            <Radio className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhuma live agendada</p>
          </div>
        )}
      </div>
    </div>
  );
}