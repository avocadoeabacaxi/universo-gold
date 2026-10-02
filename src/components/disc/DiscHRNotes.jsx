import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, NotebookPen } from 'lucide-react';

export default function DiscHRNotes({ assessment }) {
  const [notes, setNotes] = useState(assessment.hr_notes || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    await base44.entities.DiscAssessment.update(assessment.id, { hr_notes: notes });
    setSaving(false); setSaved(true);
  };

  return (
    <div className="bg-card rounded-xl border border-border/60 p-4 print:hidden">
      <p className="font-bold text-sm flex items-center gap-2 mb-2"><NotebookPen className="w-4 h-4 text-primary" /> Observações do RH (confidencial)</p>
      <Textarea value={notes} onChange={e => { setNotes(e.target.value); setSaved(false); }} placeholder="Anotações sobre entrevista, encaixe na vaga, plano de desenvolvimento..." className="min-h-[90px]" />
      <div className="flex justify-end mt-2">
        <Button size="sm" onClick={save} disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : saved ? 'Salvo!' : 'Salvar observações'}</Button>
      </div>
    </div>
  );
}