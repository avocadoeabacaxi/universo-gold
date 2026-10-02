import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import useCurrentUser from '@/hooks/useCurrentUser';
import { DISC_QUESTIONS, computeDisc } from '@/lib/discQuestions';
import DiscIntro from '@/components/disc/DiscIntro';
import DiscQuestionCard from '@/components/disc/DiscQuestionCard';

export default function DiscTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const [rec, setRec] = useState(undefined);
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState(DISC_QUESTIONS.map(() => ({})));
  const [saving, setSaving] = useState(false);
  const total = DISC_QUESTIONS.length;

  useEffect(() => { base44.entities.DiscAssessment.get(id).then(setRec).catch(() => setRec(null)); }, [id]);

  if (rec === undefined || !user) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (rec === null) return <p className="text-center py-20 text-muted-foreground">Teste não encontrado.</p>;
  if (rec.status === 'completed') return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
      <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto" />
      <h1 className="text-xl font-extrabold">Este teste já foi respondido</h1>
      <Button onClick={() => navigate(`/disc/resultado/${id}`)}>Ver resultado</Button>
    </div>
  );

  const start = async () => {
    await base44.entities.DiscAssessment.update(id, { status: 'in_progress', started_at: new Date().toISOString(), user_id: user.id });
    setRec(r => ({ ...r, started_at: new Date().toISOString() }));
    setStep(0);
  };

  const finish = async () => {
    setSaving(true);
    const { scores, primary, secondary } = computeDisc(answers);
    const started = rec.started_at ? new Date(rec.started_at) : new Date();
    await base44.entities.DiscAssessment.update(id, {
      answers, score_d: scores.D, score_i: scores.I, score_s: scores.S, score_c: scores.C,
      primary_profile: primary, secondary_profile: secondary, status: 'completed', user_id: user.id,
      completed_at: new Date().toISOString(), duration_seconds: Math.round((Date.now() - started.getTime()) / 1000),
    });
    navigate(`/disc/resultado/${id}`);
  };

  const cur = answers[step] || {};
  const complete = cur.most && cur.least;

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
      {step < 0 ? <DiscIntro name={rec.candidate_name} total={total} onStart={start} /> : (
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
      )}
    </div>
  );
}