import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useParams, Link } from 'react-router-dom';
import { Users, Lock, Globe, FileText, Video, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PostCard from '@/components/feed/PostCard';
import CreatePostCard from '@/components/feed/CreatePostCard';

export default function CommunityDetail() {
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      setUserProfile(profiles[0] || null);
      const [c, p, d, v] = await Promise.all([
        base44.entities.Community.filter({ id }),
        base44.entities.Post.filter({ community_id: id, status: 'active' }, '-created_date', 20),
        base44.entities.Document.filter({ community_id: id, status: 'active' }),
        base44.entities.Video.filter({ community_id: id, status: 'active' }),
      ]);
      setCommunity(c[0] || null);
      setPosts(p);
      setDocuments(d);
      setVideos(v);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!community) return <div className="text-center py-12 text-muted-foreground">Comunidade não encontrada.</div>;

  const isMember = community.members?.includes(currentUser?.id);
  const enrichedUser = currentUser ? { ...currentUser, job_title: userProfile?.job_title } : null;

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-4">
      <Link to="/communities" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar às comunidades
      </Link>

      {/* Header */}
      <div className="bg-card rounded-xl border border-border/60 overflow-hidden mb-4">
        <div className="h-32 gold-gradient" />
        <div className="px-6 pb-4">
          <div className="flex items-end gap-4 -mt-8 mb-3">
            <div className="w-16 h-16 rounded-xl gold-gradient flex items-center justify-center border-4 border-white shadow-md">
              <span className="text-white font-bold text-lg">{community.name?.slice(0, 2).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold font-heading">{community.name}</h1>
                {community.visibility === 'closed'
                  ? <Badge variant="outline" className="gap-1 text-xs"><Lock className="w-3 h-3" /> Fechada</Badge>
                  : <Badge variant="outline" className="gap-1 text-xs text-green-600 border-green-300"><Globe className="w-3 h-3" /> Aberta</Badge>
                }
                {community.type === 'department' && (
                  <Badge className="bg-amber-100 text-amber-800 border-0 text-xs">Departamento</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <Users className="w-3.5 h-3.5" /> {community.members_count || 0} membros
              </p>
            </div>
          </div>
          {community.description && <p className="text-sm text-muted-foreground">{community.description}</p>}
        </div>
      </div>

      {/* Content */}
      {!isMember && community.visibility === 'closed' ? (
        <div className="text-center py-16 text-muted-foreground bg-card rounded-xl border border-border/60">
          <Lock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-lg">Comunidade fechada</p>
          <p className="text-sm mt-1">Solicite acesso para ver o conteúdo.</p>
        </div>
      ) : (
        <Tabs defaultValue="feed">
          <TabsList className="mb-4">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="w-3.5 h-3.5 mr-1.5" /> Documentos ({documents.length})
            </TabsTrigger>
            <TabsTrigger value="videos">
              <Video className="w-3.5 h-3.5 mr-1.5" /> Vídeos ({videos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-3">
            {isMember && (
              <CreatePostCard
                currentUser={enrichedUser}
                communityId={id}
                communityName={community.name}
                onPostCreated={p => setPosts(prev => [p, ...prev])}
              />
            )}
            {posts.map(post => (
              <PostCard key={post.id} post={post} currentUser={enrichedUser} onDelete={async (postId) => {
                await base44.entities.Post.update(postId, { status: 'deleted' });
                setPosts(prev => prev.filter(p => p.id !== postId));
              }} />
            ))}
            {posts.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">Nenhuma publicação nesta comunidade ainda.</div>}
          </TabsContent>

          <TabsContent value="documents">
            <div className="space-y-2">
              {documents.map(doc => (
                <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/60 hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.uploader_name} · {doc.file_type?.toUpperCase()}</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs shrink-0">Baixar</Button>
                </a>
              ))}
              {documents.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">Nenhum documento nesta comunidade.</div>}
            </div>
          </TabsContent>

          <TabsContent value="videos">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.map(video => (
                <div key={video.id} className="bg-card rounded-xl border border-border/60 overflow-hidden">
                  <div className="aspect-video bg-black">
                    <iframe src={video.embed_url} className="w-full h-full" allowFullScreen title={video.title} />
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm">{video.title}</p>
                    {video.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{video.description}</p>}
                  </div>
                </div>
              ))}
              {videos.length === 0 && <div className="col-span-2 text-center py-8 text-muted-foreground text-sm">Nenhum vídeo nesta comunidade.</div>}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}