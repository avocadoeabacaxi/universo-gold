import { Button } from '@/components/ui/button';
import { Clock, ListChecks, Sparkles } from 'lucide-react';
import { DISC_PROFILES, DISC_ORDER } from '@/lib/discProfiles';

export default function DiscIntro({ name, total, onStart, loading }) {
  return (
    <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
      <div className="gold-gradient p-6 text-white text-center">
        <div className="flex justify-center gap-2 mb-3">
          {DISC_ORDER.map(k => <div key={k} className={`w-11 h-11 rounded-xl ${DISC_PROFILES[k].bg} flex items-center justify-center text-xl font-extrabold`}>{k}</div>)}
        </div>
        <h1 className="text-2xl font-extrabold">Olá, {name?.split(' ')[0]}!</h1>
        <p className="text-sm text-white/80 mt-1">Bem-vindo(a) à sua avaliação de perfil comportamental DISC.</p>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-muted"><ListChecks className="w-5 h-5 mx-auto text-primary" /><p className="text-xs mt-1"><b>{total}</b> grupos</p></div>
          <div className="p-3 rounded-xl bg-muted"><Clock className="w-5 h-5 mx-auto text-primary" /><p className="text-xs mt-1">~<b>10</b> min</p></div>
          <div className="p-3 rounded-xl bg-muted"><Sparkles className="w-5 h-5 mx-auto text-primary" /><p className="text-xs mt-1">Sem certo/errado</p></div>
        </div>
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
          <li>Em cada grupo, escolha a palavra que <b className="text-green-600">MAIS</b> e a que <b className="text-red-500">MENOS</b> descreve você.</li>
          <li>Responda de forma espontânea, pensando no seu dia a dia de trabalho.</li>
          <li>Você pode voltar e alterar respostas antes de finalizar.</li>
        </ul>
        <Button className="w-full h-11 text-base" onClick={onStart} disabled={loading}>Começar o teste</Button>
      </div>
    </div>
  );
}