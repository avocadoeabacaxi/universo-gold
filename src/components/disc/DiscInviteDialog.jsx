import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Copy, Check } from 'lucide-react';
import { PURPOSES } from '@/lib/discProfiles';

const empty = { candidate_name: '', candidate_email: '', department: '', job_title: '', purpose: 'desenvolvimento' };

export default function DiscInviteDialog({ open, onOpenChange, currentUser, onCreated }) {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const create = async () => {
    setLoading(true);
    const rec = await base44.entities.DiscAssessment.create({
      ...form, status: 'pending', invited_by_id: currentUser?.id, invited_by_name: currentUser?.full_name,
    });
    setLink(`${window.location.origin}/pcg/${rec.id}`);
    setLoading(false);
    onCreated();
  };

  const close = (v) => { onOpenChange(v); if (!v) { setForm(empty); setLink(''); setCopied(false); } };
  const copy = () => { navigator.clipboard.writeText(link); setCopied(true); };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{link ? 'Link gerado!' : 'Novo teste PCG'}</DialogTitle></DialogHeader>
        {link ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Envie este link público para <b>{form.candidate_name}</b> preencher o teste (não precisa de login). O resultado aparece aqui no painel:</p>
            <div className="flex gap-2"><Input readOnly value={link} className="text-xs" />
              <Button onClick={copy} size="icon">{copied ? <Check /> : <Copy />}</Button></div>
            <Button className="w-full" variant="outline" onClick={() => close(false)}>Concluir</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div><Label>Nome *</Label><Input value={form.candidate_name} onChange={e => set('candidate_name', e.target.value)} /></div>
            <div><Label>E-mail</Label><Input type="email" value={form.candidate_email} onChange={e => set('candidate_email', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Setor</Label><Input value={form.department} onChange={e => set('department', e.target.value)} /></div>
              <div><Label>Cargo</Label><Input value={form.job_title} onChange={e => set('job_title', e.target.value)} /></div>
            </div>
            <div><Label>Finalidade</Label>
              <Select value={form.purpose} onValueChange={v => set('purpose', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(PURPOSES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button className="w-full" disabled={!form.candidate_name.trim() || loading} onClick={create}>
              {loading ? <Loader2 className="animate-spin" /> : 'Gerar link do teste'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}