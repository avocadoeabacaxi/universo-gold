import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Check, X, Hash, KeyRound, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAprovacoesTab() {
  const [pending, setPending] = useState([]);
  const [resets, setResets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);

  const load = async () => {
    const user = await base44.auth.me();
    setMe(user);
    const [p, r] = await Promise.all([
      base44.entities.UserProfile.filter({ approval_status: 'pending' }, '-created_date', 100),
      base44.entities.PasswordResetRequest.filter({ status: 'pending' }, '-created_date', 100),
    ]);
    setPending(p);
    setResets(r);
    setLoading(false);
  };

  useEffect(() => { load().catch(() => setLoading(false)); }, []);

  const decide = async (profile, status) => {
    await base44.entities.UserProfile.update(profile.id, { approval_status: status });
    setPending(prev => prev.filter(p => p.id !== profile.id));
    toast.success(status === 'approved' ? `${profile.full_name} autorizado!` : `${profile.full_name} recusado.`);
  };

  const markResetDone = async (req) => {
    await base44.entities.PasswordResetRequest.update(req.id, { status: 'done', handled_by: me?.full_name || '' });
    setResets(prev => prev.filter(r => r.id !== req.id));
    toast.success('Pedido marcado como resolvido.');
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>;

  return (
    <Tabs defaultValue="cadastros">
      <TabsList className="mb-4">
        <TabsTrigger value="cadastros">
          <UserCheck className="w-3.5 h-3.5 mr-1.5" /> Cadastros {pending.length > 0 && <Badge className="ml-1.5 h-5 px-1.5 bg-red-500 text-white border-0">{pending.length}</Badge>}
        </TabsTrigger>
        <TabsTrigger value="resets">
          <KeyRound className="w-3.5 h-3.5 mr-1.5" /> Reset de senha {resets.length > 0 && <Badge className="ml-1.5 h-5 px-1.5 bg-red-500 text-white border-0">{resets.length}</Badge>}
        </TabsTrigger>
      </TabsList>

      {/* Cadastros pendentes */}
      <TabsContent value="cadastros" className="space-y-2">
        {pending.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">Nenhum cadastro aguardando autorização.</p>}
        {pending.map(p => (
          <Card key={p.id} className="rounded-xl border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{p.full_name?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{p.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Hash className="w-3 h-3" /> Matrícula: <strong className="text-foreground">{p.matricula || '—'}</strong></p>
              </div>
              <Button onClick={() => decide(p, 'approved')} className="gap-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg h-9">
                <Check className="w-4 h-4" /> Autorizar
              </Button>
              <Button onClick={() => decide(p, 'rejected')} variant="outline" className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 rounded-lg h-9">
                <X className="w-4 h-4" /> Recusar
              </Button>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      {/* Pedidos de reset */}
      <TabsContent value="resets" className="space-y-2">
        {resets.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">Nenhum pedido de reset pendente.</p>}
        {resets.map(r => (
          <Card key={r.id} className="rounded-xl border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{r.full_name || 'Colaborador'}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="w-3 h-3" /> Matrícula: <strong className="text-foreground">{r.matricula}</strong></p>
                {r.note && <p className="text-xs text-muted-foreground mt-0.5">Obs: {r.note}</p>}
              </div>
              <Button onClick={() => markResetDone(r)} className="gap-1.5 gold-gradient text-white rounded-lg h-9">
                <Check className="w-4 h-4" /> Marcar resolvido
              </Button>
            </CardContent>
          </Card>
        ))}
        <p className="text-xs text-muted-foreground px-1 pt-2">Para redefinir a senha, use o painel de usuários da plataforma (a senha real é gerenciada pela Base44). Após resetar, marque o pedido como resolvido.</p>
      </TabsContent>
    </Tabs>
  );
}