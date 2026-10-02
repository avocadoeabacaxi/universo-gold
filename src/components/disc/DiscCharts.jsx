import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { DISC_PROFILES, DISC_ORDER } from '@/lib/discProfiles';

export default function DiscCharts({ scores }) {
  const data = DISC_ORDER.map(k => ({ factor: `${k} · ${DISC_PROFILES[k].name}`, value: scores[k] }));
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-card rounded-xl border border-border/60 p-4">
        <p className="font-bold text-sm mb-4">Intensidade dos fatores</p>
        <div className="space-y-4">
          {DISC_ORDER.map(k => (
            <div key={k}>
              <div className="flex justify-between text-sm mb-1"><span className="font-semibold">{k} · {DISC_PROFILES[k].name}</span><b className={DISC_PROFILES[k].text}>{scores[k]}%</b></div>
              <div className="h-3 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${DISC_PROFILES[k].bg} transition-all duration-700`} style={{ width: `${scores[k]}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-card rounded-xl border border-border/60 p-4">
        <p className="font-bold text-sm">Mapa comportamental</p>
        <div className="h-60">
          <ResponsiveContainer>
            <RadarChart data={data} outerRadius="70%">
              <PolarGrid /><PolarAngleAxis dataKey="factor" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="value" stroke="#0E4AA1" fill="#0E4AA1" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}