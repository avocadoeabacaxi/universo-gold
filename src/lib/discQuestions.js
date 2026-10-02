// Cada grupo tem 4 afirmações, uma para cada fator DISC
const raw = [
  ['Decidido', 'Comunicativo', 'Paciente', 'Cuidadoso'],
  ['Competitivo', 'Entusiasmado', 'Leal', 'Preciso'],
  ['Direto', 'Persuasivo', 'Calmo', 'Analítico'],
  ['Ousado', 'Sociável', 'Colaborativo', 'Organizado'],
  ['Assume riscos', 'Otimista', 'Bom ouvinte', 'Segue regras'],
  ['Focado em resultados', 'Inspirador', 'Estável', 'Detalhista'],
  ['Exigente', 'Expressivo', 'Gentil', 'Disciplinado'],
  ['Determinado', 'Animado', 'Tolerante', 'Perfeccionista'],
  ['Gosta de desafios', 'Gosta de pessoas', 'Gosta de rotina', 'Gosta de qualidade'],
  ['Independente', 'Espontâneo', 'Prestativo', 'Criterioso'],
  ['Age rápido', 'Fala com facilidade', 'Mantém a harmonia', 'Pensa antes de agir'],
  ['Autoconfiante', 'Carismático', 'Confiável', 'Lógico'],
  ['Assertivo', 'Divertido', 'Conciliador', 'Metódico'],
  ['Impaciente com lentidão', 'Impulsivo', 'Resistente a mudanças', 'Crítico'],
  ['Lidera', 'Motiva', 'Apoia', 'Planeja'],
  ['Prático', 'Criativo', 'Constante', 'Sistemático'],
  ['Persistente', 'Popular', 'Amável', 'Reservado'],
  ['Corajoso', 'Influente', 'Sereno', 'Rigoroso'],
  ['Controla a situação', 'Contagia o grupo', 'Acolhe as pessoas', 'Garante os padrões'],
  ['Objetivo', 'Extrovertido', 'Previsível', 'Exato'],
  ['Vencedor', 'Convincente', 'Dedicado', 'Correto'],
  ['Firme', 'Alegre', 'Compreensivo', 'Prudente'],
  ['Pioneiro', 'Comunicador', 'Mediador', 'Especialista'],
  ['Desafia o status quo', 'Busca reconhecimento', 'Busca segurança', 'Busca precisão'],
];

const factors = ['D', 'I', 'S', 'C'];

// Embaralha as opções de forma determinística por grupo
export const DISC_QUESTIONS = raw.map((words, idx) => {
  const opts = words.map((text, i) => ({ text, factor: factors[i] }));
  const shift = idx % 4;
  return [...opts.slice(shift), ...opts.slice(0, shift)];
});

export function computeDisc(answers) {
  const net = { D: 0, I: 0, S: 0, C: 0 };
  answers.forEach(a => {
    if (a?.most) net[a.most] += 1;
    if (a?.least) net[a.least] -= 1;
  });
  const n = DISC_QUESTIONS.length;
  const scores = {};
  factors.forEach(f => { scores[f] = Math.round(((net[f] + n) / (2 * n)) * 100); });
  const ranked = [...factors].sort((a, b) => scores[b] - scores[a]);
  return { scores, primary: ranked[0], secondary: ranked[1] };
}