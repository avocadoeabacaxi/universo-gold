const FILE_RE = /\.(mp4|webm|mov|m4v|ogg|ogv)(\?|#|$)/i;

// Arquivos de vídeo usam o player nativo (só toca ao clicar); links de incorporação usam iframe
export default function VideoPlayer({ src, title }) {
  if (FILE_RE.test(src || '')) {
    return <video src={src} controls preload="metadata" playsInline className="w-full h-full" />;
  }
  return <iframe src={src} className="w-full h-full" allowFullScreen title={title} />;
}