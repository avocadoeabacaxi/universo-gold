import { TrendingUp, GraduationCap, PlayCircle, ListChecks, Activity, Target } from 'lucide-react';
import { PURPOSES } from '@/lib/discProfiles';

const list = { type: 'array', items: { type: 'string' } };

export const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' }, fit: list, improvements: list, courses: list, videos: list, actions: list, monitoring: list,
  },
};

export const ANALYSIS_SECTIONS = [
  { key: 'fit', title: 'Conclusão para a finalidade', icon: Target, tone: 'text-primary' },
  { key: 'improvements', title: 'O que pode melhorar', icon: TrendingUp, tone: 'text-orange-500' },
  { key: 'courses', title: 'Cursos sugeridos', icon: GraduationCap, tone: 'text-purple-600' },
  { key: 'videos', title: 'Vídeos e aulas', icon: PlayCircle, tone: 'text-red-500' },
  { key: 'actions', title: 'Ações práticas (próximos 90 dias)', icon: ListChecks, tone: 'text-green-600' },
  { key: 'monitoring', title: 'Monitoramento do colaborador', icon: Activity, tone: 'text-teal-600' },
];

export const buildPrompt = (a) => `Você é um especialista sênior em RH e desenvolvimento humano da empresa Gold Pão (panificação/indústria alimentícia, Brasil).
Analise o resultado do teste comportamental PCG (metodologia DISC) e produza uma análise MUITO DIRECIONADA à finalidade, em português do Brasil, objetiva e prática.

Pessoa: ${a.candidate_name}
Cargo: ${a.job_title || 'não informado'} | Setor: ${a.department || 'não informado'}
Finalidade da avaliação: ${PURPOSES[a.purpose] || a.purpose}
Pontuações (0-100): D=${a.score_d}, I=${a.score_i}, S=${a.score_s}, C=${a.score_c}
Perfil primário: ${a.primary_profile} | Secundário: ${a.secondary_profile}

Regras por finalidade:
- Recrutamento: diga se recomenda para o cargo, riscos, perguntas para entrevista.
- Desenvolvimento: plano de desenvolvimento individual (PDI).
- Promoção: prontidão para liderança, lacunas a fechar antes da promoção.
- Autoconhecimento: linguagem acolhedora, foco em consciência e hábitos.

Retorne:
- summary: parágrafo de 3-4 frases com o diagnóstico central focado na finalidade.
- fit: 3-5 conclusões/recomendações diretas para a finalidade.
- improvements: 4-6 comportamentos específicos a melhorar, com o porquê.
- courses: 4-6 cursos reais e acessíveis no Brasil (ex: SENAI, SEBRAE, Fundação Bradesco, Coursera, Udemy, Escola Virtual Gov), formato "Nome do curso — Plataforma — por que".
- videos: 4-6 vídeos/aulas/palestras (TED, YouTube, podcasts) com título e autor, e o porquê.
- actions: 5-7 ações práticas no trabalho com prazo (semana/mês).
- monitoring: 5-7 itens de acompanhamento do colaborador: indicadores observáveis, frequência de 1:1, checkpoints em 30/60/90 dias e sinais de alerta.`;