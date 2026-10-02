export const DISC_PROFILES = {
  D: {
    name: 'Dominância', label: 'Executor', hex: '#DC2626',
    bg: 'bg-red-500', soft: 'bg-red-50', text: 'text-red-600', border: 'border-red-200',
    summary: 'Pessoa orientada a resultados, direta e determinada. Gosta de desafios, toma decisões rápidas e assume o controle das situações.',
    strengths: ['Tomada de decisão rápida', 'Foco em metas e resultados', 'Iniciativa e coragem para assumir riscos', 'Capacidade de liderar em crises'],
    attention: ['Pode ser impaciente ou autoritário', 'Tende a ignorar detalhes', 'Pode parecer insensível em feedbacks', 'Dificuldade em delegar o controle'],
    motivators: ['Autonomia', 'Desafios e metas ousadas', 'Poder de decisão', 'Resultados visíveis'],
    communication: 'Seja breve, direto e objetivo. Apresente fatos e foque no resultado. Evite rodeios e excesso de detalhes.',
    pressure: 'Torna-se mais exigente, controlador e pode agir de forma impulsiva.',
    environment: 'Ambientes dinâmicos, com autonomia, metas claras e espaço para inovar.',
    roles: ['Gestão e liderança', 'Vendas e negociação', 'Gestão de projetos', 'Abertura de novas unidades'],
    leadership: 'Dê autonomia e desafios. Defina claramente o "o quê" e deixe o "como" com ele. Trabalhe empatia e escuta ativa.',
  },
  I: {
    name: 'Influência', label: 'Comunicador', hex: '#EAB308',
    bg: 'bg-yellow-500', soft: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200',
    summary: 'Pessoa sociável, otimista e persuasiva. Gosta de interagir, inspirar e engajar pessoas, criando um clima positivo.',
    strengths: ['Comunicação e persuasão', 'Entusiasmo contagiante', 'Criatividade', 'Construção de relacionamentos'],
    attention: ['Pode ser desorganizado', 'Tende a falar mais do que ouvir', 'Dificuldade com rotinas e prazos', 'Pode ser excessivamente otimista'],
    motivators: ['Reconhecimento público', 'Interação social', 'Liberdade de expressão', 'Ambiente leve e divertido'],
    communication: 'Seja caloroso e amigável. Dê espaço para conversa e ideias. Reconheça as conquistas e evite excesso de formalidade.',
    pressure: 'Pode se tornar desorganizado, emotivo e evitar conflitos ou más notícias.',
    environment: 'Ambientes colaborativos, com contato com pessoas, variedade e reconhecimento.',
    roles: ['Comunicação e marketing', 'Atendimento e vendas', 'Treinamento', 'Relações institucionais'],
    leadership: 'Reconheça publicamente, ofereça interação e apoie com estrutura, checklists e acompanhamento de prazos.',
  },
  S: {
    name: 'Estabilidade', label: 'Planejador', hex: '#16A34A',
    bg: 'bg-green-500', soft: 'bg-green-50', text: 'text-green-600', border: 'border-green-200',
    summary: 'Pessoa paciente, leal e colaborativa. Valoriza harmonia, segurança e consistência, sendo um grande apoio para a equipe.',
    strengths: ['Lealdade e confiabilidade', 'Paciência e escuta ativa', 'Trabalho em equipe', 'Consistência e constância'],
    attention: ['Resistência a mudanças bruscas', 'Dificuldade em dizer "não"', 'Evita conflitos', 'Pode ser lento para decidir'],
    motivators: ['Segurança e estabilidade', 'Ambiente harmonioso', 'Reconhecimento sincero', 'Processos claros'],
    communication: 'Seja paciente, gentil e sincero. Explique mudanças com antecedência e mostre como elas afetam a pessoa e a equipe.',
    pressure: 'Tende a se fechar, ceder demais e resistir silenciosamente.',
    environment: 'Ambientes estáveis, previsíveis, cooperativos e com relações de confiança.',
    roles: ['Produção e operação', 'Suporte e atendimento', 'Departamento Pessoal', 'Qualidade de processos'],
    leadership: 'Comunique mudanças com antecedência, ofereça segurança e incentive-o a expressar opiniões.',
  },
  C: {
    name: 'Conformidade', label: 'Analista', hex: '#2563EB',
    bg: 'bg-blue-500', soft: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200',
    summary: 'Pessoa analítica, precisa e organizada. Valoriza qualidade, regras e dados, buscando sempre fazer o certo da melhor forma.',
    strengths: ['Precisão e atenção a detalhes', 'Pensamento analítico', 'Organização e planejamento', 'Alto padrão de qualidade'],
    attention: ['Perfeccionismo excessivo', 'Pode ser crítico demais', 'Lentidão por excesso de análise', 'Dificuldade com ambiguidade'],
    motivators: ['Qualidade e precisão', 'Regras e processos claros', 'Tempo para análise', 'Especialização'],
    communication: 'Seja preciso, apresente dados e evidências. Dê tempo para análise e evite pressão ou exageros emocionais.',
    pressure: 'Torna-se excessivamente crítico, isolado e preso a detalhes.',
    environment: 'Ambientes organizados, com padrões claros, foco técnico e qualidade.',
    roles: ['Controle de qualidade', 'Financeiro e controladoria', 'Engenharia e processos', 'TI e análise de dados'],
    leadership: 'Forneça informações completas e expectativas claras. Ajude a equilibrar perfeição com prazos.',
  },
};

export const DISC_ORDER = ['D', 'I', 'S', 'C'];

export const PURPOSES = {
  recrutamento: 'Recrutamento',
  desenvolvimento: 'Desenvolvimento',
  promocao: 'Promoção',
  autoconhecimento: 'Autoconhecimento',
};

export const HR_ROLES = ['admin', 'department_leader', 'moderator'];

export const getScores = (a) => ({ D: a.score_d || 0, I: a.score_i || 0, S: a.score_s || 0, C: a.score_c || 0 });