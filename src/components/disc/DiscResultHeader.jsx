import { DISC_PROFILES, PURPOSES } from '@/lib/discProfiles';
import { format } from 'date-fns';

export default function DiscResultHeader({ a }) {
  const p = DISC_PROFILES[a.primary_profile], s = DISC_PROFILES[a.secondary_profile];
  const mins = a.duration_seconds ? Math.max(1, Math.round(a.duration_seconds / 60)) : null;
  return (
    <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
      <div className="gold-gradient p-5 text-white flex flex-col sm:flex-row sm:items-center gap-4">
        <div className={`w-20 h-20 rounded-2xl ${p.bg} flex items-center justify-center text-4xl font-extrabold shadow-lg shrink-0`}>{a.primary_profile}{a.secondary_profile}</div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-widest text-white/70 font-bold">Relatório PCG · Perfil Comportamental Gold</p>
          <h1 className="text-2xl font-extrabold">{a.candidate_name}</h1>
          <p className="text-sm text-white/80">{[a.job_title, a.department].filter(Boolean).join(' · ')}</p>
        </div>
        <div className="text-xs text-white/80 sm:text-right space-y-0.5">
          {a.completed_at && <p>Concluído em {format(new Date(a.completed_at), 'dd/MM/yyyy HH:mm')}</p>}
          {mins && <p>Tempo de resposta: {mins} min</p>}
          {a.purpose && <p>Finalidade: {PURPOSES[a.purpose]}</p>}
        </div>
      </div>
      <div className="p-5">
        <p className="text-sm"><b className={p.text}>Perfil predominante: {p.name} ({p.label})</b> com traços de <b className={s.text}>{s.name} ({s.label})</b>.</p>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{p.summary}</p>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed"><b>Influência secundária:</b> {s.summary}</p>
      </div>
    </div>
  );
}