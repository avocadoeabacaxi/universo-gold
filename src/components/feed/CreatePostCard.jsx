import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Image, Video, FileText, X, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { createNotification, notifyMentions } from '@/lib/notifications';

export default function CreatePostCard({ currentUser, communityId, communityName, onPostCreated }) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('text');
  const [mediaFile, setMediaFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const initials = currentUser?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'EU';

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);

    let media_url = null;
    if (mediaFile) {
      const result = await base44.integrations.Core.UploadFile({ file: mediaFile });
      media_url = result.file_url;
    }

    const newPost = await base44.entities.Post.create({
      author_id: currentUser?.id,
      author_name: currentUser?.full_name,
      author_avatar: currentUser?.avatar_url,
      author_role: currentUser?.job_title || '',
      content,
      post_type: postType,
      media_url,
      community_id: communityId || null,
      community_name: communityName || null,
      likes_count: 0,
      comments_count: 0,
      liked_by: [],
      status: 'active',
    });

    const postLink = communityId ? `/communities/${communityId}` : '/';
    // Notifica membros da comunidade sobre a novidade
    if (communityId) {
      const members = await base44.entities.CommunityMember.filter({ community_id: communityId });
      await Promise.all(members.map(m =>
        createNotification({
          recipientId: m.user_id,
          actorId: currentUser?.id,
          type: 'community',
          title: `Novidade em ${communityName}`,
          message: `${currentUser?.full_name} publicou em ${communityName}`,
          actorName: currentUser?.full_name,
          actorAvatar: currentUser?.avatar_url,
          link: postLink,
        })
      ));
    }
    // Notifica usuários mencionados (@)
    await notifyMentions({ text: content, actor: currentUser, link: postLink, contextLabel: 'uma publicação' });

    setContent('');
    setMediaFile(null);
    setPostType('text');
    setExpanded(false);
    setLoading(false);
    onPostCreated && onPostCreated(newPost);
  };

  if (!expanded) {
    return (
      <Card className="rounded-xl shadow-sm border-border/60 overflow-hidden p-0">
        <div className="h-2 gold-gradient" />
        <div className="p-4">
          <button
            onClick={() => setExpanded(true)}
            className="w-full flex items-center gap-3 text-left mb-3"
          >
            <Avatar className="w-11 h-11 ring-2 ring-primary ring-offset-2 ring-offset-card shrink-0">
              <AvatarImage src={currentUser?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground text-[15px] truncate">
              No que você está pensando, {currentUser?.full_name?.split(' ')[0] || 'colega'}?
            </span>
          </button>
          <button
            onClick={() => setExpanded(true)}
            className="w-full h-10 rounded-full bg-muted/60 hover:bg-muted transition-colors mb-3"
            aria-label="Criar publicação"
          />
          <div className="grid grid-cols-3 border-t border-border/50 pt-2 -mb-1">
            <button onClick={() => setExpanded(true)} className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 py-2 rounded-lg hover:bg-muted/60 transition-colors">
              <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Image className="w-4 h-4 text-green-600" />
              </span>
              <span className="text-[13px] sm:text-sm font-medium text-foreground">Foto</span>
            </button>
            <button onClick={() => setExpanded(true)} className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 py-2 rounded-lg hover:bg-muted/60 transition-colors border-x border-border/50">
              <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-red-500" />
              </span>
              <span className="text-[13px] sm:text-sm font-medium text-foreground">Arquivo</span>
            </button>
            <button onClick={() => setExpanded(true)} className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 py-2 rounded-lg hover:bg-muted/60 transition-colors">
              <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <Video className="w-4 h-4 text-orange-500" />
              </span>
              <span className="text-[13px] sm:text-sm font-medium text-foreground">Vídeo</span>
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl shadow-sm border-border/60 overflow-hidden p-0">
      <div className="h-2 gold-gradient" />
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="w-11 h-11 ring-2 ring-primary ring-offset-2 ring-offset-card shrink-0">
            <AvatarImage src={currentUser?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="space-y-3">
                <Textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder={`No que você está pensando${communityName ? ` em ${communityName}` : ''}?`}
                  className="resize-none min-h-[100px] border-0 bg-transparent text-sm p-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                  autoFocus
                />
                {mediaFile && (
                  <div className="flex items-center gap-2 p-2 bg-secondary rounded-lg">
                    <span className="text-xs text-secondary-foreground truncate flex-1">{mediaFile.name}</span>
                    <button onClick={() => setMediaFile(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-1">
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={e => { setMediaFile(e.target.files[0]); setPostType('image'); }} />
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-green-600 hover:bg-green-50 transition-colors cursor-pointer">
                    <Image className="w-4 h-4" /> Foto
                  </span>
                </label>
                <label className="cursor-pointer">
                  <input type="file" accept=".pdf,.docx,.xlsx,.pptx" className="hidden" onChange={e => { setMediaFile(e.target.files[0]); setPostType('document'); }} />
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                    <FileText className="w-4 h-4" /> Arquivo
                  </span>
                </label>
                <label className="cursor-pointer">
                  <input type="file" accept="video/*" className="hidden" onChange={e => { setMediaFile(e.target.files[0]); setPostType('video'); }} />
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-orange-500 hover:bg-orange-50 transition-colors cursor-pointer">
                    <Video className="w-4 h-4" /> Vídeo
                  </span>
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => { setExpanded(false); setContent(''); setMediaFile(null); }}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!content.trim() || loading}
                  className="bg-primary hover:bg-primary/90 rounded-lg px-5"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publicar'}
                </Button>
              </div>
            </div>
          </div>
      </CardContent>
    </Card>
  );
}