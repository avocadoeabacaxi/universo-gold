import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ClipboardList, CheckCircle2, Clock, Hourglass } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DISC_PROFILES, DISC_ORDER } from '@/lib/discProfiles';

export default function DiscStats({ refreshKey }) {
  const [status, setStatus] = useState({});
  const [profiles, setProfiles] = useState({});

  useEffect(() => {
    base44.entities.DiscAssessment.aggregate({ groupBy: 'status' }).then(r => {
      const m = {}; r.rows.forEach(x => { m[x.status] = x.count; }); setStatus(m);
    });
    base44.entities.DiscAssessment.aggregate({ query: { status: 'completed' }, groupBy: 'primary_profile' }).then(r => {
      const m = {}; r.rows.forEach(x => { m[x.primary_profile] = x.count; }); setProfiles(m);
    });
  }, [refreshKey]);

  const total = (status.pending || 0) + (status.in_progress || 0) + (status.completed || 0);
  const cards = [
    { label: 'Total de testes', value: total, icon: ClipboardList, cls: 'bg-primary/10 text-primary' },
    { label: 'Concluídos', value: status.completed || 0, icon: CheckCircle2, cls: 'bg-green-100 text-green-600' },
    { label: 'Em andamento', value: status.in_progress || 0, icon: Hourglass, cls: 'bg-yellow-100 text-yellow-600' },
    { label: 'Aguardando', value: status.pending || 0, icon: Clock, cls: 'bg-muted text-muted-foreground' },
  ];
  const pie = DISC_ORDER.map(k => ({ name: DISC_PROFILES[k].name, key: k, value: profiles[k] || 0 }));
  const hasPie = pie.some(p => p.value > 0);

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 grid grid-cols-2 gap-3">
        {cards.map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className="bg-card rounded-xl border border-border/60 p-4 flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${cls}`}><Icon className="w-5 h-5" /></div>
            <div><p className="text-2xl font-extrabold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
          </div>
        ))}
      </div>
      <div className="bg-card rounded-xl border border-border/60 p-4">
        <p className="font-bold text-sm mb-2">Distribuição de perfis</p>
        {hasPie ? (
          <div className="flex items-center gap-2">
            <div className="w-28 h-28">
              <ResponsiveContainer>
                <PieChart><Pie data={pie} dataKey="value" innerRadius={28} outerRadius={50} paddingAngle={2}>
                  {pie.map(p => <Cell key={p.key} fill={DISC_PROFILES[p.key].hex} />)}
                </Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 text-xs">
              {pie.map(p => (
                <div key={p.key} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${DISC_PROFILES[p.key].bg}`} />{p.name}: <b>{p.value}</b>
                </div>
              ))}
            </div>
          </div>
        ) : <p className="text-xs text-muted-foreground py-8 text-center">Nenhum teste concluído ainda.</p>}
      </div>
    </div>
  );
}