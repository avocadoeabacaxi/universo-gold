import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

export default function DiscQuestionCard({ index, total, options, answer, onChange }) {
  const pick = (type, factor) => {
    const next = { ...answer, [type]: factor };
    const other = type === 'most' ? 'least' : 'most';
    if (next[other] === factor) next[other] = undefined;
    onChange(next);
  };

  return (
    <motion.div key={index} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}
      className="bg-card rounded-2xl border border-border/60 shadow-sm p-5 sm:p-6">
      <p className="text-xs font-bold text-primary uppercase tracking-widest">Grupo {index + 1} de {total}</p>
      <h2 className="text-lg font-extrabold mt-1">Qual palavra MAIS e qual MENOS descreve você?</h2>
      <p className="text-xs text-muted-foreground mt-1">Responda pensando em como você age no trabalho, de forma espontânea.</p>
      <div className="mt-5 space-y-2.5">
        {options.map(o => {
          const isMost = answer.most === o.factor, isLeast = answer.least === o.factor;
          return (
            <div key={o.text} className={`flex items-center gap-2 p-2 pl-4 rounded-xl border-2 transition-all ${isMost ? 'border-green-500 bg-green-50' : isLeast ? 'border-red-400 bg-red-50' : 'border-border'}`}>
              <span className="flex-1 font-semibold text-sm">{o.text}</span>
              <button onClick={() => pick('most', o.factor)} className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${isMost ? 'bg-green-500 text-white' : 'bg-muted hover:bg-green-100 text-green-700'}`}>
                <ThumbsUp className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Mais</span>
              </button>
              <button onClick={() => pick('least', o.factor)} className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${isLeast ? 'bg-red-500 text-white' : 'bg-muted hover:bg-red-100 text-red-600'}`}>
                <ThumbsDown className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Menos</span>
              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}