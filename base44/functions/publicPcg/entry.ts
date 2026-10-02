import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const FACTORS = ['D', 'I', 'S', 'C'];
const TOTAL = 24;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const { action, id, answers } = await req.json();
    if (!id) return Response.json({ error: 'id obrigatório' }, { status: 400 });
    const db = base44.asServiceRole.entities.DiscAssessment;
    const rec = await db.get(id).catch(() => null);
    if (!rec) return Response.json({ error: 'Teste não encontrado' }, { status: 404 });

    if (action === 'get') {
      return Response.json({ candidate_name: rec.candidate_name, status: rec.status });
    }
    if (rec.status === 'completed') return Response.json({ error: 'Teste já respondido' }, { status: 409 });

    if (action === 'start') {
      await db.update(id, { status: 'in_progress', started_at: new Date().toISOString() });
      return Response.json({ ok: true });
    }

    if (action === 'submit') {
      if (!Array.isArray(answers) || answers.length !== TOTAL) return Response.json({ error: 'Respostas inválidas' }, { status: 400 });
      const net = { D: 0, I: 0, S: 0, C: 0 };
      for (const a of answers) {
        if (!FACTORS.includes(a?.most) || !FACTORS.includes(a?.least) || a.most === a.least) {
          return Response.json({ error: 'Respostas inválidas' }, { status: 400 });
        }
        net[a.most] += 1; net[a.least] -= 1;
      }
      const s = {};
      FACTORS.forEach(f => { s[f] = Math.round(((net[f] + TOTAL) / (2 * TOTAL)) * 100); });
      const ranked = [...FACTORS].sort((a, b) => s[b] - s[a]);
      const started = rec.started_at ? new Date(rec.started_at).getTime() : Date.now();
      await db.update(id, {
        answers: answers.map(a => ({ most: a.most, least: a.least })),
        score_d: s.D, score_i: s.I, score_s: s.S, score_c: s.C,
        primary_profile: ranked[0], secondary_profile: ranked[1], status: 'completed',
        completed_at: new Date().toISOString(), duration_seconds: Math.round((Date.now() - started) / 1000),
      });
      return Response.json({ ok: true });
    }
    return Response.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}