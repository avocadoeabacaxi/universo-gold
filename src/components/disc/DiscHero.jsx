import { Button } from '@/components/ui/button';
import { Plus, PlayCircle } from 'lucide-react';

export default function DiscHero({ isHR, onInvite, onSelfTest, starting }) {
  return (
    <div className="gold-gradient rounded-2xl p-6 text-white relative overflow-hidden">
      <img
        src="https://media.base44.com/images/public/6a31b47db4d51fa5778edaf8/36879ccf5_generated_image.png"
        alt="Logo PCG"
        className="hidden sm:block absolute right-6 top-1/2 -translate-y-1/2 w-36 h-36 rounded-3xl shadow-2xl ring-4 ring-white/20 object-cover"
      />
      <div className="relative max-w-xl">
        <p className="text-xs uppercase tracking-widest font-bold text-white/70">Perfil Comportamental Gold</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">PCG</h1>
        <p className="text-sm text-white/80 mt-2">Descubra como cada pessoa age, se comunica e toma decisões. Dominância, Influência, Estabilidade e Conformidade.</p>
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button onClick={onSelfTest} disabled={starting} className="bg-white text-primary hover:bg-white/90 gap-2"><PlayCircle /> Fazer meu teste</Button>
          {isHR && <Button onClick={onInvite} className="bg-yellow-400 text-foreground hover:bg-yellow-300 gap-2"><Plus /> Novo teste / link</Button>}
        </div>
      </div>
    </div>
  );
}