import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, MapPin, Loader2, Pencil, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const EMPTY = { name: '', cidade: '', estado: '', endereco: '', cep: '', telefone: '' };

export default function UnidadesTab() {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('all');

  useEffect(() => {
    base44.entities.Unidade.filter({ status: 'active' }, 'name', 50).then(u => { setUnidades(u); setLoading(false); });
  }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (u) => { setEditing(u); setForm({ name: u.name, cidade: u.cidade || '', estado: u.estado || '', endereco: u.endereco || '', cep: u.cep || '', telefone: u.telefone || '' }); setOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editing) {
      await base44.entities.Unidade.update(editing.id, form);
      setUnidades(prev => prev.map(u => u.id === editing.id ? { ...u, ...form } : u));
      toast.success('Unidade atualizada!');
    } else {
      const u = await base44.entities.Unidade.create({ ...form, status: 'active' });
      setUnidades(prev => [...prev, u]);
      toast.success('Unidade criada!');
    }
    setOpen(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.Unidade.update(id, { status: 'inactive' });
    setUnidades(prev => prev.filter(u => u.id !== id));
    toast.success('Unidade removida.');
  };

  const term = search.trim().toLowerCase();
  const estados = [...new Set(unidades.map(u => u.estado).filter(Boolean))].sort();
  const filteredUnidades = unidades.filter(u =>
    (!term || u.name?.toLowerCase().includes(term) || u.cidade?.toLowerCase().includes(term)) &&
    (estadoFilter === 'all' || u.estado === estadoFilter)
  );

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{unidades.length} unidades cadastradas</p>
        <Button size="sm" onClick={openNew} className="gold-gradient text-white gap-1.5 rounded-xl">
          <Plus className="w-3.5 h-3.5" /> Nova Unidade
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>{editing ? 'Editar Unidade' : 'Cadastrar Unidade'}</DialogTitle></DialogHeader>
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
            <Button type="submit" className="w-full gold-gradient text-white rounded-xl">{editing ? 'Salvar alterações' : 'Criar Unidade'}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar unidade ou cidade..." className="pl-9 rounded-xl" />
        </div>
        <select value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)} className="w-full sm:w-44 h-9 rounded-xl border border-input bg-background px-3 text-sm">
          <option value="all">Todos os estados</option>
          {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {filteredUnidades.map(u => (
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
              <Button variant="ghost" size="icon" onClick={() => openEdit(u)} className="w-8 h-8 text-primary hover:bg-primary/10 shrink-0">
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)} className="w-8 h-8 text-red-500 hover:bg-red-50 shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {filteredUnidades.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Nenhuma unidade encontrada</p>}
      </div>
    </div>
  );
}