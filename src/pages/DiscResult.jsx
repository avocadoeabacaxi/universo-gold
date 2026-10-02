import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Printer, Trophy, AlertTriangle, Flame, MessageCircle, Zap, Building, Briefcase, Compass } from 'lucide-react';
import useCurrentUser from '@/hooks/useCurrentUser';
import { DISC_PROFILES, HR_ROLES, getScores } from '@/lib/discProfiles';
import DiscResultHeader from '@/components/disc/DiscResultHeader';
import DiscCharts from '@/components/disc/DiscCharts';
import DiscReportSection from '@/components/disc/DiscReportSection';
import DiscHRNotes from '@/components/disc/DiscHRNotes';

export default function DiscResult() {
  const { id } = useParams();
  const user = useCurrentUser();
  const [a, setA] = useState(undefined);

  useEffect(() => { base44.entities.DiscAssessment.get(id).then(setA).catch(() => setA(null)); }, [id]);

  if (a === undefined || !user) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!a || a.status !== 'completed') return <p className="text-center py-20 text-muted-foreground">Resultado não disponível.</p>;

  const isHR = HR_ROLES.includes(user.role);
  if (!isHR && a.user_id !== user.id) return <p className="text-center py-20 text-muted-foreground">Você não tem acesso a este relatório.</p>;
  const p = DISC_PROFILES[a.primary_profile], s = DISC_PROFILES[a.secondary_profile];

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-6 space-y-4">
      <div className="flex justify-between print:hidden">
        <Link to="/disc"><Button variant="outline" size="sm" className="gap-1"><ArrowLeft /> Voltar</Button></Link>
        <Button size="sm" className="gap-1" onClick={() => window.print()}><Printer /> Imprimir / PDF</Button>
      </div>
      <DiscResultHeader a={a} />
      <DiscCharts scores={getScores(a)} />
      <div className="grid md:grid-cols-2 gap-4">
        <DiscReportSection icon={Trophy} title="Pontos fortes" items={[...p.strengths, ...s.strengths.slice(0, 2)]} tone="text-green-600" />
        <DiscReportSection icon={AlertTriangle} title="Pontos de atenção" items={[...p.attention, ...s.attention.slice(0, 1)]} tone="text-red-500" />
        <DiscReportSection icon={Flame} title="O que motiva" items={[...p.motivators, ...s.motivators.slice(0, 2)]} tone="text-orange-500" />
        <DiscReportSection icon={MessageCircle} title="Como se comunicar" text={p.communication} />
        <DiscReportSection icon={Zap} title="Comportamento sob pressão" text={p.pressure} tone="text-yellow-600" />
        <DiscReportSection icon={Building} title="Ambiente ideal" text={p.environment} />
        {isHR && <DiscReportSection icon={Briefcase} title="Áreas e funções com maior aderência" items={[...p.roles, ...s.roles.slice(0, 2)]} tone="text-purple-600" />}
        {isHR && <DiscReportSection icon={Compass} title="Recomendações para o gestor" text={`${p.leadership} ${s.leadership}`} tone="text-teal-600" />}
      </div>
      {isHR && <DiscHRNotes assessment={a} />}
      <p className="text-[11px] text-muted-foreground text-center">O DISC descreve tendências comportamentais e não mede inteligência, competência ou caráter. Use como apoio à decisão, junto de entrevistas e outras avaliações.</p>
    </div>
  );
}