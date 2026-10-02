import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { PURPOSES } from '@/lib/discProfiles';
import DiscReportSection from '@/components/disc/DiscReportSection';
import { buildPrompt, ANALYSIS_SCHEMA, ANALYSIS_SECTIONS } from '@/lib/discAnalysisPrompt';

export default function DiscAIAnalysis({ assessment }) {
  const [analysis, setAnalysis] = useState(assessment.ai_analysis);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({ prompt: buildPrompt(assessment), response_json_schema: ANALYSIS_SCHEMA });
    await base44.entities.DiscAssessment.update(assessment.id, { ai_analysis: res });
    setAnalysis(res);
    setLoading(false);
  };

  return (
    <div className="bg-card rounded-xl border border-border/60 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-extrabold flex items-center gap-2"><Sparkles className="w-5 h-5 text-yellow-500" /> Análise direcionada</h2>
          <p className="text-xs text-muted-foreground">Foco: {PURPOSES[assessment.purpose] || 'Desenvolvimento'}</p>
        </div>
        <Button size="sm" onClick={generate} disabled={loading} className="gap-1 print:hidden">
          {loading ? <Loader2 className="animate-spin" /> : analysis ? <RefreshCw /> : <Sparkles />}
          {loading ? 'Gerando...' : analysis ? 'Gerar novamente' : 'Gerar análise'}
        </Button>
      </div>
      {analysis ? (
        <>
          <p className="text-sm leading-relaxed bg-primary/5 rounded-lg p-3">{analysis.summary}</p>
          <div className="grid md:grid-cols-2 gap-4">
            {ANALYSIS_SECTIONS.map(s => <DiscReportSection key={s.key} icon={s.icon} title={s.title} items={analysis[s.key] || []} tone={s.tone} />)}
          </div>
        </>
      ) : !loading && <p className="text-sm text-muted-foreground">Clique em "Gerar análise" para receber recomendações de melhoria, cursos, vídeos, ações e plano de acompanhamento.</p>}
    </div>
  );
}