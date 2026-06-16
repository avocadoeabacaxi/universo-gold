import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function UnidadesTab() {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', cidade: '', estado: '', endereco: '', cep: '', telefone: '' });

  useEffect(() => {
    base44.entities.Unidade.filter({ status: 'active' }, 'name', 50).then(u => { setUnidades(u); setLoading(false); });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const u = await base44.entities.Unidade.create({ ...form, status: 'active' });
    setUnidades(prev => [...prev, u]);
    setForm({ name: '', cidade: '', estado: '', endereco: '', cep: '', telefone: '' });
    setOpen(false);
    toast.success('Unidade criada!');
  };

  const handleDelete = async (id) => {
    await base44.entities.Unidade.update(id, { status: 'inactive' });
    setUnidades(prev => prev.filter(u => u.id !== id));
    toast.success('Unidade removida.');
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{unidades.length} unidades cadastradas</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gold-gradient text-white gap-1.5 rounded-xl"><Plus className="w-3.5 h-3.5" /> Nova Unidade</Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>Cadastrar Unidade</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="space-y-1"><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Filial São Paulo" required className="rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Cidade</Label><Input value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} placeholder="São Paulo" className="rounded-xl" /></div>
                <div className="space-y-1"><Label>Estado (UF)</Label><Input value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))} placeholder="SP" maxLength={2} className="rounded-xl" /></div>
              </div>
              <div className="space-y-1"><Label>Endereço</Label><Input value={form.endereco} onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))} placeholder="Rua, número, bairro" className="rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>CEP</Label><Input value={form.cep} onChange={e => setForm(f => ({ ...f, cep: e.target.value }))} placeholder="00000-000" className="rounded-xl" /></div>
                <div className="space-y-1"><Label>Telefone</Label><Input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(11) 9999-9999" className="rounded-xl" /></div>
              </div>
              <Button type="submit" className="w-full gold-gradient text-white rounded-xl">Salvar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {unidades.map(u => (
          <Card key={u.id} className="rounded-xl border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{u.name}</p>
                <p className="text-xs text-muted-foreground">{[u.endereco, u.cidade, u.estado].filter(Boolean).join(', ')}</p>
                {u.telefone && <p className="text-xs text-muted-foreground">{u.telefone}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)} className="w-8 h-8 text-red-500 hover:bg-red-50 shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {unidades.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Nenhuma unidade cadastrada</p>}
      </div>
    </div>
  );
}