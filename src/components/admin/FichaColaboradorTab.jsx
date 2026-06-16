import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, UserCircle, Loader2, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const STATUS_COLOR = { ativo: 'bg-green-100 text-green-700', inativo: 'bg-gray-100 text-gray-600', ferias: 'bg-blue-100 text-blue-700', afastado: 'bg-red-100 text-red-700' };
const REGIME_LABEL = { clt: 'CLT', pj: 'PJ', estagio: 'Estágio', temporario: 'Temporário' };
const EMPTY_FORM = { full_name: '', cpf: '', rg: '', data_nascimento: '', matricula: '', data_admissao: '', funcao_name: '', setor_name: '', unidade_name: '', regime_contratacao: 'clt', cep: '', endereco: '', bairro: '', cidade: '', estado: '', telefone: '', status: 'ativo' };

function FichaForm({ form, setForm, setores, funcoes, unidades, onSubmit, editing }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-xs font-semibold text-primary uppercase tracking-wide">Dados Pessoais</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1"><Label>Nome completo *</Label><Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required className="rounded-xl" /></div>
        <div className="space-y-1"><Label>CPF *</Label><Input value={form.cpf} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} placeholder="000.000.000-00" required className="rounded-xl" /></div>
        <div className="space-y-1"><Label>RG</Label><Input value={form.rg} onChange={e => setForm(f => ({ ...f, rg: e.target.value }))} className="rounded-xl" /></div>
        <div className="space-y-1"><Label>Data de nascimento</Label><Input type="date" value={form.data_nascimento} onChange={e => setForm(f => ({ ...f, data_nascimento: e.target.value }))} className="rounded-xl" /></div>
        <div className="space-y-1"><Label>Telefone</Label><Input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(11) 99999-9999" className="rounded-xl" /></div>
      </div>

      <p className="text-xs font-semibold text-primary uppercase tracking-wide pt-2">Registro de Trabalho</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Matrícula</Label><Input value={form.matricula} onChange={e => setForm(f => ({ ...f, matricula: e.target.value }))} className="rounded-xl" /></div>
        <div className="space-y-1"><Label>Data de admissão</Label><Input type="date" value={form.data_admissao} onChange={e => setForm(f => ({ ...f, data_admissao: e.target.value }))} className="rounded-xl" /></div>
        <div className="space-y-1"><Label>Regime</Label>
          <select value={form.regime_contratacao} onChange={e => setForm(f => ({ ...f, regime_contratacao: e.target.value }))} className="w-full h-9 rounded-xl border border-input bg-background px-3 text-sm">
            <option value="clt">CLT</option><option value="pj">PJ</option><option value="estagio">Estágio</option><option value="temporario">Temporário</option>
          </select>
        </div>
        <div className="space-y-1"><Label>Status</Label>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full h-9 rounded-xl border border-input bg-background px-3 text-sm">
            <option value="ativo">Ativo</option><option value="inativo">Inativo</option><option value="ferias">Férias</option><option value="afastado">Afastado</option>
          </select>
        </div>
        <div className="space-y-1"><Label>Função</Label>
          <select value={form.funcao_name} onChange={e => setForm(f => ({ ...f, funcao_name: e.target.value }))} className="w-full h-9 rounded-xl border border-input bg-background px-3 text-sm">
            <option value="">Selecionar</option>{funcoes.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
          </select>
        </div>
        <div className="space-y-1"><Label>Setor</Label>
          <select value={form.setor_name} onChange={e => setForm(f => ({ ...f, setor_name: e.target.value }))} className="w-full h-9 rounded-xl border border-input bg-background px-3 text-sm">
            <option value="">Selecionar</option>{setores.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>
        <div className="col-span-2 space-y-1"><Label>Unidade</Label>
          <select value={form.unidade_name} onChange={e => setForm(f => ({ ...f, unidade_name: e.target.value }))} className="w-full h-9 rounded-xl border border-input bg-background px-3 text-sm">
            <option value="">Selecionar</option>{unidades.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
          </select>
        </div>
      </div>

      <p className="text-xs font-semibold text-primary uppercase tracking-wide pt-2">Endereço Residencial</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>CEP</Label><Input value={form.cep} onChange={e => setForm(f => ({ ...f, cep: e.target.value }))} placeholder="00000-000" className="rounded-xl" /></div>
        <div className="col-span-2 space-y-1"><Label>Endereço</Label><Input value={form.endereco} onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))} placeholder="Rua, número" className="rounded-xl" /></div>
        <div className="space-y-1"><Label>Bairro</Label><Input value={form.bairro} onChange={e => setForm(f => ({ ...f, bairro: e.target.value }))} className="rounded-xl" /></div>
        <div className="space-y-1"><Label>Cidade</Label><Input value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} className="rounded-xl" /></div>
        <div className="space-y-1"><Label>Estado (UF)</Label><Input value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))} maxLength={2} className="rounded-xl" /></div>
      </div>

      <Button type="submit" className="w-full gold-gradient text-white rounded-xl">{editing ? 'Salvar alterações' : 'Criar Ficha'}</Button>
    </form>
  );
}

export default function FichaColaboradorTab() {
  const [fichas, setFichas] = useState([]);
  const [setores, setSetores] = useState([]);
  const [funcoes, setFuncoes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    Promise.all([
      base44.entities.FichaColaborador.list('-created_date', 100),
      base44.entities.Setor.filter({ status: 'active' }, 'name', 50),
      base44.entities.Funcao.filter({ status: 'active' }, 'name', 50),
      base44.entities.Unidade.filter({ status: 'active' }, 'name', 50),
    ]).then(([fc, s, f, u]) => { setFichas(fc); setSetores(s); setFuncoes(f); setUnidades(u); setLoading(false); });
  }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY_FORM); setOpen(true); };
  const openEdit = (fc) => {
    setEditing(fc);
    setForm({
      full_name: fc.full_name || '', cpf: fc.cpf || '', rg: fc.rg || '',
      data_nascimento: fc.data_nascimento || '', matricula: fc.matricula || '',
      data_admissao: fc.data_admissao || '', funcao_name: fc.funcao_name || '',
      setor_name: fc.setor_name || '', unidade_name: fc.unidade_name || '',
      regime_contratacao: fc.regime_contratacao || 'clt', cep: fc.cep || '',
      endereco: fc.endereco || '', bairro: fc.bairro || '', cidade: fc.cidade || '',
      estado: fc.estado || '', telefone: fc.telefone || '', status: fc.status || 'ativo',
    });
    setOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editing) {
      await base44.entities.FichaColaborador.update(editing.id, form);
      setFichas(prev => prev.map(fc => fc.id === editing.id ? { ...fc, ...form } : fc));
      toast.success('Ficha atualizada!');
    } else {
      const fc = await base44.entities.FichaColaborador.create(form);
      setFichas(prev => [fc, ...prev]);
      toast.success('Ficha criada!');
    }
    setOpen(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.FichaColaborador.delete(id);
    setFichas(prev => prev.filter(f => f.id !== id));
    toast.success('Ficha removida.');
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{fichas.length} fichas cadastradas</p>
        <Button size="sm" onClick={openNew} className="gold-gradient text-white gap-1.5 rounded-xl">
          <Plus className="w-3.5 h-3.5" /> Nova Ficha
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Editar Ficha' : 'Nova Ficha do Colaborador'}</DialogTitle></DialogHeader>
          <FichaForm form={form} setForm={setForm} setores={setores} funcoes={funcoes} unidades={unidades} onSubmit={handleSave} editing={editing} />
        </DialogContent>
      </Dialog>

      <div className="space-y-2">
        {fichas.map(fc => (
          <Card key={fc.id} className="rounded-xl border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                  <UserCircle className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{fc.full_name}</p>
                  <p className="text-xs text-muted-foreground">CPF: {fc.cpf} {fc.matricula ? `· Mat: ${fc.matricula}` : ''}</p>
                  <p className="text-xs text-muted-foreground">{[fc.funcao_name, fc.setor_name, fc.unidade_name].filter(Boolean).join(' · ')}</p>
                </div>
                <Badge className={`text-[10px] border-0 shrink-0 ${STATUS_COLOR[fc.status] || STATUS_COLOR.ativo}`}>{fc.status}</Badge>
                {fc.regime_contratacao && <Badge variant="outline" className="text-[10px] shrink-0">{REGIME_LABEL[fc.regime_contratacao]}</Badge>}
                <button onClick={() => setExpanded(expanded === fc.id ? null : fc.id)} className="text-muted-foreground hover:text-foreground">
                  {expanded === fc.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(fc)} className="w-8 h-8 text-primary hover:bg-primary/10 shrink-0">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(fc.id)} className="w-8 h-8 text-red-500 hover:bg-red-50 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {expanded === fc.id && (
                <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-2 text-xs">
                  {fc.data_nascimento && <div><span className="text-muted-foreground">Nascimento:</span> {fc.data_nascimento}</div>}
                  {fc.rg && <div><span className="text-muted-foreground">RG:</span> {fc.rg}</div>}
                  {fc.data_admissao && <div><span className="text-muted-foreground">Admissão:</span> {fc.data_admissao}</div>}
                  {fc.telefone && <div><span className="text-muted-foreground">Telefone:</span> {fc.telefone}</div>}
                  {fc.endereco && <div className="col-span-2"><span className="text-muted-foreground">Endereço:</span> {[fc.endereco, fc.bairro, fc.cidade, fc.estado, fc.cep].filter(Boolean).join(', ')}</div>}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {fichas.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Nenhuma ficha cadastrada</p>}
      </div>
    </div>
  );
}