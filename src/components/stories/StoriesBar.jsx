import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StoryViewer from './StoryViewer';

export default function StoriesBar({ currentUser }) {
  const [stories, setStories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [viewer, setViewer] = useState(null); // { stories, startIndex }
  const fileRef = useRef(null);

  const loadStories = async () => {
    const now = new Date().toISOString();
    const all = await base44.entities.Story.filter({ expires_at: { $gt: now } }, '-created_date', 100);
    setStories(all);
  };

  useEffect(() => {
    loadStories().catch(() => {});
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await base44.entities.Story.create({
      author_id: currentUser?.id,
      author_name: currentUser?.full_name,
      author_avatar: currentUser?.avatar_url,
      image_url: file_url,
      expires_at: expires,
    });
    await loadStories();
    setUploading(false);
    e.target.value = '';
  };

  // Agrupa stories por autor
  const grouped = [];
  const byAuthor = {};
  stories.forEach(s => {
    if (!byAuthor[s.author_id]) {
      byAuthor[s.author_id] = { author_id: s.author_id, author_name: s.author_name, author_avatar: s.author_avatar, items: [] };
      grouped.push(byAuthor[s.author_id]);
    }
    byAuthor[s.author_id].items.push(s);
  });

  const openAuthor = (authorStories) => {
    setViewer({ stories: authorStories, startIndex: 0 });
  };

  const handleDeleted = (storyId) => {
    setStories(prev => prev.filter(s => s.id !== storyId));
    setViewer(v => {
      if (!v) return null;
      const remaining = v.stories.filter(s => s.id !== storyId);
      if (remaining.length === 0) return null;
      return { stories: remaining, startIndex: Math.min(v.startIndex, remaining.length - 1) };
    });
  };

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <>
      <div className="bg-card rounded-xl border border-border/60 p-2.5 mb-3 shadow-sm">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {/* Criar story */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="shrink-0 w-[72px] h-[112px] rounded-xl overflow-hidden relative border border-border/60 bg-muted/40 flex flex-col group"
          >
            <div className="flex-1 w-full overflow-hidden">
              {currentUser?.avatar_url ? (
                <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full gold-gradient" />
              )}
            </div>
            <div className="h-8 bg-card flex items-end justify-center pb-1 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary border-[3px] border-card flex items-center justify-center">
                {uploading ? <Loader2 className="w-3 h-3 text-white animate-spin" /> : <Plus className="w-3 h-3 text-white" />}
              </div>
              <span className="text-[9px] font-semibold text-foreground">Criar story</span>
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

          {/* Stories dos colegas */}
          {grouped.map(g => (
            <button
              key={g.author_id}
              onClick={() => openAuthor(g.items)}
              className="shrink-0 w-[72px] h-[112px] rounded-xl overflow-hidden relative group"
            >
              <img src={g.items[0].image_url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-1.5 left-1.5 w-7 h-7 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-black/0">
                <Avatar className="w-full h-full border-2 border-card">
                  <AvatarImage src={g.author_avatar} />
                  <AvatarFallback className="bg-blue-600 text-white text-[9px]">{initials(g.author_name)}</AvatarFallback>
                </Avatar>
              </div>
              <span className="absolute bottom-1 left-1 right-1 text-[9px] font-semibold text-white truncate text-left">
                {g.author_name?.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {viewer && (
        <StoryViewer
          stories={viewer.stories}
          startIndex={viewer.startIndex}
          currentUser={currentUser}
          onClose={() => setViewer(null)}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}