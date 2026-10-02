import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { DISC_QUESTIONS } from '@/lib/discQuestions';
import DiscIntro from '@/components/disc/DiscIntro';
import DiscQuestionCard from '@/components/disc/DiscQuestionCard';

const call = (payload) => base44.functions.invoke('publicPcg', payload).then(r => r.data);

export default function PcgPublic() {
  const { id } = useParams();
  const [info, setInfo] = useState(undefined);
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState(DISC_QUESTIONS.map(() => ({})));
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const total = DISC_QUESTIONS.length;

  useEffect(() => { call({ action: 'get', id }).then(setInfo).catch(() => setInfo(null)); }, [id]);

  const wrap = (c) => (
    <div className="min-h-screen bg-background">
      <div className="gold-gradient h-14 flex items-center justify-center text-white font-extrabold tracking-wide">PCG · Perfil Comportamental Gold</div>
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">{c}</div>
    </div>
  );

  if (info === undefined) return wrap(<div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>);
  if (info === null) return wrap(<p className="text-center py-20 text-muted-foreground">Link inválido ou teste não encontrado.</p>);
  if (done || info.status === 'completed') return wrap(
    <div className="text-center py-16 space-y-3">
      <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
      <h1 className="text-xl font-extrabold">Teste concluído!</h1>
      <p className="text-sm text-muted-foreground">Obrigado por responder. Suas respostas foram enviadas ao RH da Gold Pão.</p>
    </div>
  );

  const start = async () => { await call({ action: 'start', id }); setStep(0); };
  const finish = async () => { setSaving(true); await call({ action: 'submit', id, answers }); setDone(true); };
  const cur = answers[step] || {};
  const complete = cur.most && cur.least;

  return wrap(step < 0 ? <DiscIntro name={info.candidate_name} total={total} onStart={start} /> : (
    <>
      <div className="flex items-center gap-3"><Progress value={(step / total) * 100} className="h-2" />
        <span className="text-xs font-bold text-muted-foreground shrink-0">{Math.round((step / total) * 100)}%</span></div>
      <AnimatePresence mode="wait">
        <DiscQuestionCard key={step} index={step} total={total} options={DISC_QUESTIONS[step]} answer={cur}
          onChange={a => setAnswers(all => all.map((x, i) => i === step ? a : x))} />
      </AnimatePresence>
      <div className="flex justify-between gap-2">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)} className="gap-1"><ArrowLeft /> Voltar</Button>
        {step < total - 1
          ? <Button disabled={!complete} onClick={() => setStep(s => s + 1)} className="gap-1">Próximo <ArrowRight /></Button>
          : <Button disabled={!complete || saving} onClick={finish} className="gap-1 bg-green-600 hover:bg-green-700">
              {saving ? <Loader2 className="animate-spin" /> : <><CheckCircle2 /> Finalizar</>}</Button>}
      </div>
    </>
  ));
}