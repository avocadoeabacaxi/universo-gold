import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CreateCommunity() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'free_group',
    visibility: 'open',
    department: '',
  });

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const community = await base44.entities.Community.create({
      ...form,
      leader_id: currentUser?.id,
      leader_name: currentUser?.full_name,
      members: [currentUser?.id],
      members_count: 1,
      status: 'active',
    });
    navigate(`/communities/${community.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link to="/communities" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold font-heading">Criar novo grupo</CardTitle>
          <p className="text-sm text-muted-foreground">Crie um grupo temático ou de departamento para conectar colegas.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome do grupo *</Label>
              <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Marketing Digital, Treinamentos..." required className="rounded-xl" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descreva o propósito do grupo..." className="rounded-xl resize-none" rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free_group">Grupo Livre</SelectItem>
                    <SelectItem value="department">Departamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Privacidade</Label>
                <Select value={form.visibility} onValueChange={v => setForm(f => ({ ...f, visibility: v }))}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Aberto — qualquer um pode entrar</SelectItem>
                    <SelectItem value="closed">Fechado — precisa de aprovação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.type === 'department' && (
              <div className="space-y-1.5">
                <Label htmlFor="department">Departamento</Label>
                <Input id="department" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Ex: Recursos Humanos, Produção..." className="rounded-xl" />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Link to="/communities" className="flex-1">
                <Button type="button" variant="outline" className="w-full rounded-xl">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={loading || !form.name} className="flex-1 gold-gradient text-white rounded-xl">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Grupo'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}