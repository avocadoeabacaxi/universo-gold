import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function StoryViewer({ stories, startIndex = 0, currentUser, onClose, onDeleted }) {
  const [index, setIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  const story = stories[index];
  const isAdmin = currentUser?.role === 'admin';
  const canDelete = isAdmin || story?.author_id === currentUser?.id;

  useEffect(() => {
    setProgress(0);
    timerRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timerRef.current);
          next();
          return 100;
        }
        return p + 2;
      });
    }, 100);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const next = () => {
    if (index < stories.length - 1) setIndex(i => i + 1);
    else onClose();
  };
  const prev = () => {
    if (index > 0) setIndex(i => i - 1);
  };

  const handleDelete = async () => {
    clearInterval(timerRef.current);
    await base44.entities.Story.delete(story.id);
    onDeleted?.(story.id);
  };

  if (!story) return null;

  const initials = story.author_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center">
      <div className="relative w-full max-w-md h-full sm:h-[90vh] sm:rounded-2xl overflow-hidden bg-black">
        {/* Progress bars */}
        <div className="absolute top-2 left-2 right-2 z-20 flex gap-1">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-100"
                style={{ width: i < index ? '100%' : i === index ? `${progress}%` : '0%' }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-5 left-2 right-2 z-20 flex items-center gap-2 px-1">
          <Avatar className="w-8 h-8 border border-white/50">
            <AvatarImage src={story.author_avatar} />
            <AvatarFallback className="bg-blue-600 text-white text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{story.author_name}</p>
            <p className="text-white/70 text-[11px]">
              {formatDistanceToNow(new Date(story.created_date), { addSuffix: true, locale: ptBR })}
            </p>
          </div>
          {canDelete && (
            <button onClick={handleDelete} className="p-2 text-white/80 hover:text-white">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button onClick={onClose} className="p-2 text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Image */}
        <img src={story.image_url} alt="" className="w-full h-full object-contain" />

        {/* Tap zones */}
        <button onClick={prev} className="absolute left-0 top-0 bottom-0 w-1/3 z-10" aria-label="Anterior" />
        <button onClick={next} className="absolute right-0 top-0 bottom-0 w-1/3 z-10" aria-label="Próximo" />

        {/* Nav arrows (desktop) */}
        {index > 0 && (
          <button onClick={prev} className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 items-center justify-center text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {index < stories.length - 1 && (
          <button onClick={next} className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 items-center justify-center text-white">
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}