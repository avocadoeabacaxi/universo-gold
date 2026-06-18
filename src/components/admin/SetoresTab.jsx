import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Building2, Loader2, Pencil, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const EMPTY = { name: '', description: '', unidade: '', responsavel: '' };

export default function SetoresTab() {
  const [setores, setSetores] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = novo, object = editar
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState('');
  const [unidadeFilter, setUnidadeFilter] = useState('all');

  useEffect(() => {
    Promise.all([
      base44.entities.Setor.filter({ status: 'active' }, 'name', 50),
      base44.entities.Unidade.filter({ status: 'active' }, 'name', 50),
    ]).then(([s, u]) => { setSetores(s); setUnidades(u); setLoading(false); });
  }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, description: s.description || '', unidade: s.unidade || '', responsavel: s.responsavel || '' }); setOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editing) {
      const updated = await base44.entities.Setor.update(editing.id, form);
      setSetores(prev => prev.map(s => s.id === editing.id ? { ...s, ...form } : s));
      toast.success('Setor atualizado!');
    } else {
      const s = await base44.entities.Setor.create({ ...form, status: 'active' });
      setSetores(prev => [...prev, s]);
      toast.success('Setor criado!');
    }
    setOpen(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.Setor.update(id, { status: 'inactive' });
    setSetores(prev => prev.filter(s => s.id !== id));
    toast.success('Setor removido.');
  };

  const term = search.trim().toLowerCase();
  const filteredSetores = setores.filter(s =>
    (!term || s.name?.toLowerCase().includes(term) || s.responsavel?.toLowerCase().includes(term)) &&
    (unidadeFilter === 'all' || s.unidade === unidadeFilter)
  );

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{setores.length} setores cadastrados</p>
        <Button size="sm" onClick={openNew} className="gold-gradient text-white gap-1.5 rounded-xl">
          <Plus className="w-3.5 h-3.5" /> Novo Setor
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>{editing ? 'Editar Setor' : 'Criar Setor'}</DialogTitle></DialogHeader>
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
            <Button type="submit" className="w-full gold-gradient text-white rounded-xl">{editing ? 'Salvar alterações' : 'Criar Setor'}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar setor ou responsável..." className="pl-9 rounded-xl" />
        </div>
        <select value={unidadeFilter} onChange={e => setUnidadeFilter(e.target.value)} className="w-full sm:w-56 h-9 rounded-xl border border-input bg-background px-3 text-sm">
          <option value="all">Todas as unidades</option>
          {unidades.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {filteredSetores.map(s => (
          <Card key={s.id} className="rounded-xl border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{s.name}</p>
                <p className="text-xs text-muted-foreground">{[s.unidade, s.responsavel].filter(Boolean).join(' · ')}</p>
                {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
              </div>
              {s.unidade && <Badge variant="secondary" className="text-xs">{s.unidade}</Badge>}
              <Button variant="ghost" size="icon" onClick={() => openEdit(s)} className="w-8 h-8 text-primary hover:bg-primary/10 shrink-0">
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} className="w-8 h-8 text-red-500 hover:bg-red-50 shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {filteredSetores.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Nenhum setor encontrado</p>}
      </div>
    </div>
  );
}