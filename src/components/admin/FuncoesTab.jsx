import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Briefcase, Loader2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const NIVEIS = { operacional: 'Operacional', tecnico: 'Técnico', supervisao: 'Supervisão', gerencia: 'Gerência', diretoria: 'Diretoria' };
const NIVEL_COLOR = { operacional: 'bg-gray-100 text-gray-700', tecnico: 'bg-blue-100 text-blue-700', supervisao: 'bg-yellow-100 text-yellow-700', gerencia: 'bg-orange-100 text-orange-700', diretoria: 'bg-red-100 text-red-700' };
const EMPTY = { name: '', setor_id: '', setor_name: '', nivel: 'operacional', descricao: '' };

export default function FuncoesTab() {
  const [funcoes, setFuncoes] = useState([]);
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    Promise.all([
      base44.entities.Funcao.filter({ status: 'active' }, 'name', 50),
      base44.entities.Setor.filter({ status: 'active' }, 'name', 50),
    ]).then(([f, s]) => { setFuncoes(f); setSetores(s); setLoading(false); });
  }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (f) => { setEditing(f); setForm({ name: f.name, setor_id: f.setor_id || '', setor_name: f.setor_name || '', nivel: f.nivel || 'operacional', descricao: f.descricao || '' }); setOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editing) {
      await base44.entities.Funcao.update(editing.id, form);
      setFuncoes(prev => prev.map(f => f.id === editing.id ? { ...f, ...form } : f));
      toast.success('Função atualizada!');
    } else {
      const f = await base44.entities.Funcao.create({ ...form, status: 'active' });
      setFuncoes(prev => [...prev, f]);
      toast.success('Função criada!');
    }
    setOpen(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.Funcao.update(id, { status: 'inactive' });
    setFuncoes(prev => prev.filter(f => f.id !== id));
    toast.success('Função removida.');
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{funcoes.length} funções cadastradas</p>
        <Button size="sm" onClick={openNew} className="gold-gradient text-white gap-1.5 rounded-xl">
          <Plus className="w-3.5 h-3.5" /> Nova Função
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>{editing ? 'Editar Função' : 'Criar Função / Cargo'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            <div className="space-y-1"><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Operador de Produção" required className="rounded-xl" /></div>
            <div className="space-y-1"><Label>Setor</Label>
              <select value={form.setor_id} onChange={e => {
                const s = setores.find(s => s.id === e.target.value);
                setForm(f => ({ ...f, setor_id: e.target.value, setor_name: s?.name || '' }));
              }} className="w-full h-9 rounded-xl border border-input bg-background px-3 text-sm">
                <option value="">Selecionar setor</option>
                {setores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label>Nível hierárquico</Label>
              <select value={form.nivel} onChange={e => setForm(f => ({ ...f, nivel: e.target.value }))} className="w-full h-9 rounded-xl border border-input bg-background px-3 text-sm">
                {Object.entries(NIVEIS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label>Descrição das atribuições</Label><Input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Breve descrição" className="rounded-xl" /></div>
            <Button type="submit" className="w-full gold-gradient text-white rounded-xl">{editing ? 'Salvar alterações' : 'Criar Função'}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-2">
        {funcoes.map(f => (
          <Card key={f.id} className="rounded-xl border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{f.name}</p>
                <p className="text-xs text-muted-foreground">{f.setor_name || 'Sem setor'}</p>
                {f.descricao && <p className="text-xs text-muted-foreground">{f.descricao}</p>}
              </div>
              <Badge className={`text-[10px] border-0 ${NIVEL_COLOR[f.nivel] || NIVEL_COLOR.operacional}`}>{NIVEIS[f.nivel] || f.nivel}</Badge>
              <Button variant="ghost" size="icon" onClick={() => openEdit(f)} className="w-8 h-8 text-primary hover:bg-primary/10 shrink-0">
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id)} className="w-8 h-8 text-red-500 hover:bg-red-50 shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {funcoes.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Nenhuma função cadastrada</p>}
      </div>
    </div>
  );
}