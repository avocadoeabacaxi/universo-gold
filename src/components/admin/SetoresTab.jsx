import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function SetoresTab() {
  const [setores, setSetores] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', unidade: '', responsavel: '' });

  useEffect(() => {
    Promise.all([
      base44.entities.Setor.filter({ status: 'active' }, 'name', 50),
      base44.entities.Unidade.filter({ status: 'active' }, 'name', 50),
    ]).then(([s, u]) => { setSetores(s); setUnidades(u); setLoading(false); });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const s = await base44.entities.Setor.create({ ...form, status: 'active' });
    setSetores(prev => [...prev, s]);
    setForm({ name: '', description: '', unidade: '', responsavel: '' });
    setOpen(false);
    toast.success('Setor criado!');
  };

  const handleDelete = async (id) => {
    await base44.entities.Setor.update(id, { status: 'inactive' });
    setSetores(prev => prev.filter(s => s.id !== id));
    toast.success('Setor removido.');
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{setores.length} setores cadastrados</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gold-gradient text-white gap-1.5 rounded-xl"><Plus className="w-3.5 h-3.5" /> Novo Setor</Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>Criar Setor</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="space-y-1"><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Produção, RH..." required className="rounded-xl" /></div>
              <div className="space-y-1"><Label>Unidade</Label>
                <select value={form.unidade} onChange={e => setForm(f => ({ ...f, unidade: e.target.value }))} className="w-full h-9 rounded-xl border border-input bg-background px-3 text-sm">
                  <option value="">Selecionar unidade</option>
                  {unidades.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
              </div>
              <div className="space-y-1"><Label>Responsável</Label><Input value={form.responsavel} onChange={e => setForm(f => ({ ...f, responsavel: e.target.value }))} placeholder="Nome do responsável" className="rounded-xl" /></div>
              <div className="space-y-1"><Label>Descrição</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Breve descrição" className="rounded-xl" /></div>
              <Button type="submit" className="w-full gold-gradient text-white rounded-xl">Salvar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {setores.map(s => (
          <Card key={s.id} className="rounded-xl border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{s.name}</p>
                <p className="text-xs text-muted-foreground">{[s.unidade, s.responsavel].filter(Boolean).join(' · ')}</p>
              </div>
              {s.unidade && <Badge variant="secondary" className="text-xs">{s.unidade}</Badge>}
              <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} className="w-8 h-8 text-red-500 hover:bg-red-50 shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {setores.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Nenhum setor cadastrado</p>}
      </div>
    </div>
  );
}