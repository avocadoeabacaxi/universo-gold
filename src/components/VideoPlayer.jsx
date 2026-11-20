import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';

const FILE_RE = /\.(mp4|webm|mov|m4v|ogg|ogv)(\?|#|$)/i;
const PREVIEW_SECONDS = 8;

// Arquivos de vídeo mostram uma prévia sem som em repetição até clicar em "Assistir agora"
export default function VideoPlayer({ src, title }) {
  const ref = useRef(null);
  const [watching, setWatching] = useState(false);

  // A prévia só roda enquanto o vídeo está visível na tela
  useEffect(() => {
    const el = ref.current;
    if (!el || watching) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.play().catch(() => {});
      else el.pause();
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [watching]);

  if (!FILE_RE.test(src || '')) {
    return <iframe src={src} className="w-full h-full" allowFullScreen title={title} />;
  }

  const watch = () => {
    const el = ref.current;
    el.muted = false;
    el.currentTime = 0;
    el.play();
    setWatching(true);
  };

  return (
    <div className="relative w-full h-full">
      <video
        ref={ref}
        src={src}
        muted={!watching}
        loop={!watching}
        controls={watching}
        playsInline
        preload="metadata"
        className="w-full h-full"
        onTimeUpdate={e => { if (!watching && e.target.currentTime > PREVIEW_SECONDS) e.target.currentTime = 0; }}
      />
      {!watching && (
        <button onClick={watch} className="absolute inset-0 flex items-end justify-center pb-5 bg-gradient-to-t from-black/60 to-transparent">
          <span className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg hover:scale-105 transition-transform">
            <Play className="w-4 h-4 fill-current" /> Assistir agora
          </span>
        </button>
      )}
    </div>
  );
}