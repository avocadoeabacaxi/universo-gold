import { Megaphone, X, Pin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

export default function ComunicadoCard({ comunicado, canManage, onArchive }) {
  const audienceLabel = {
    all: 'Todos',
    department: comunicado.target_department,
    level: comunicado.target_level,
  }[comunicado.target_audience] || 'Todos';

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl overflow-hidden">
      {/* Banner image */}
      {comunicado.type === 'banner' && comunicado.image_url && (
        <div className="w-full max-h-48 overflow-hidden">
          <img src={comunicado.image_url} alt={comunicado.title} className="w-full object-cover" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-primary">
              <Megaphone className="w-4 h-4" />
              <span className="font-bold text-sm">Comunicado Oficial</span>
            </div>
            {comunicado.pinned && (
              <Badge variant="secondary" className="text-[10px] gap-1 py-0 h-5">
                <Pin className="w-2.5 h-2.5" /> Fixado
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px] py-0 h-5 border-blue-300 text-blue-700">
              {audienceLabel}
            </Badge>
          </div>
          {canManage && (
            <button
              onClick={() => onArchive(comunicado.id)}
              className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
              title="Arquivar comunicado"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <h3 className="font-bold text-foreground mt-2 text-base">{comunicado.title}</h3>
        <p className="text-sm text-foreground/80 mt-1 whitespace-pre-wrap">{comunicado.content}</p>

        <p className="text-[11px] text-muted-foreground mt-3">
          Por {comunicado.author_name}
        </p>
      </div>
    </div>
  );
}