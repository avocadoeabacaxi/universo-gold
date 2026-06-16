import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useParams, Link } from 'react-router-dom';
import { Users, Lock, Globe, FileText, Video, ArrowLeft, Loader2, Camera, Upload, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const coverInputRef = useRef(null);
  const iconInputRef = useRef(null);

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
  const isAdmin = currentUser?.role === 'admin' || userProfile?.role === 'admin';
  const isLeader = community.leader_id === currentUser?.id || isAdmin;
  const enrichedUser = currentUser ? { ...currentUser, job_title: userProfile?.job_title } : null;

  const ICON_COLORS = [
    { bg: 'from-blue-600 to-blue-800', label: 'Azul' },
    { bg: 'from-purple-600 to-purple-800', label: 'Roxo' },
    { bg: 'from-green-600 to-green-800', label: 'Verde' },
    { bg: 'from-red-600 to-red-800', label: 'Vermelho' },
    { bg: 'from-orange-500 to-orange-700', label: 'Laranja' },
    { bg: 'from-pink-500 to-pink-700', label: 'Rosa' },
    { bg: 'from-teal-500 to-teal-700', label: 'Teal' },
    { bg: 'from-yellow-500 to-yellow-700', label: 'Amarelo' },
  ];

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCover(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Community.update(community.id, { cover_url: file_url });
    setCommunity(prev => ({ ...prev, cover_url: file_url }));
    setUploadingCover(false);
  };

  const handleIconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingIcon(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Community.update(community.id, { avatar_url: file_url });
    setCommunity(prev => ({ ...prev, avatar_url: file_url }));
    setUploadingIcon(false);
  };

  const handleIconColor = async (colorBg) => {
    await base44.entities.Community.update(community.id, { icon_color: colorBg });
    setCommunity(prev => ({ ...prev, icon_color: colorBg }));
  };

  const iconGradient = community.icon_color || 'from-blue-700 to-blue-900';

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-4">
      <Link to="/communities" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar às comunidades
      </Link>

      {/* Header */}
      <div className="bg-card rounded-xl border border-border/60 overflow-hidden mb-4">
        {/* Cover */}
        <div className="relative h-40 group">
          {community.cover_url
            ? <img src={community.cover_url} alt="capa" className="w-full h-full object-cover" />
            : <div className="w-full h-full gold-gradient" />
          }
          {isLeader && (
            <>
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              <button
                onClick={() => coverInputRef.current?.click()}
                className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 bg-black/50 hover:bg-black/70 text-white text-xs rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                {uploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                Alterar capa
              </button>
            </>
          )}
        </div>

        <div className="px-6 pb-4">
          <div className="flex items-end gap-4 -mt-8 mb-3">
            {/* Community Icon */}
            <div className="relative group/icon shrink-0">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${iconGradient} flex items-center justify-center border-4 border-white shadow-md overflow-hidden`}>
                {community.avatar_url
                  ? <img src={community.avatar_url} alt="icon" className="w-full h-full object-cover" />
                  : <span className="text-white font-bold text-lg">{community.name?.slice(0, 2).toUpperCase()}</span>
                }
              </div>
              {isLeader && (
                <div className="absolute -bottom-1 -right-1 flex gap-0.5 opacity-0 group-hover/icon:opacity-100 transition-opacity">
                  <input ref={iconInputRef} type="file" accept="image/*" className="hidden" onChange={handleIconUpload} />
                  <button onClick={() => iconInputRef.current?.click()} title="Trocar imagem"
                    className="w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {uploadingIcon ? <Loader2 className="w-3 h-3 text-white animate-spin" /> : <Upload className="w-3 h-3 text-white" />}
                  </button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button title="Cor do ícone"
                        className="w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-primary shadow-sm">
                        <Palette className="w-3 h-3 text-primary" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2" side="right">
                      <p className="text-xs font-semibold mb-2 text-muted-foreground">Cor do ícone</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {ICON_COLORS.map(({ bg, label }) => (
                          <button key={bg} title={label} onClick={() => handleIconColor(bg)}
                            className={`w-9 h-9 rounded-lg bg-gradient-to-br ${bg} border-2 ${iconGradient === bg ? 'border-primary' : 'border-transparent'} hover:scale-110 transition-transform`} />
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 pb-2">
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