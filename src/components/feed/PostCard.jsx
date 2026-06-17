import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Heart, MessageCircle, Share2, MoreHorizontal, FileText, Video, Image, Trash2, Pin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CommentsList from './CommentsList';

export default function PostCard({ post, currentUser, onDelete }) {
  const [liked, setLiked] = useState(post.liked_by?.includes(currentUser?.id) || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);

  const initials = post.author_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

    const likedBy = post.liked_by || [];
    const updatedLikedBy = newLiked
      ? [...likedBy, currentUser?.id]
      : likedBy.filter(id => id !== currentUser?.id);

    await base44.entities.Post.update(post.id, {
      likes_count: newLiked ? (post.likes_count || 0) + 1 : (post.likes_count || 0) - 1,
      liked_by: updatedLikedBy,
    });
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    await base44.entities.Comment.create({
      post_id: post.id,
      author_id: currentUser?.id,
      author_name: currentUser?.full_name,
      author_avatar: currentUser?.avatar_url,
      content: commentText,
    });
    await base44.entities.Post.update(post.id, { comments_count: commentsCount + 1 });
    setCommentsCount(prev => prev + 1);
    setCommentText('');
    setShowComments(true);
    setCommenting(false);
  };

  const timeAgo = post.created_date
    ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true, locale: ptBR })
    : '';

  const typeIcon = {
    image: <Image className="w-3 h-3" />,
    video: <Video className="w-3 h-3" />,
    document: <FileText className="w-3 h-3" />,
  };

  return (
    <Card className="rounded-xl shadow-sm border-border/60 overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-start gap-3 p-4 pb-2">
          <Avatar className="w-10 h-10 border-2 border-primary/20">
            <AvatarImage src={post.author_avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground">{post.author_name}</span>
              {post.author_role && (
                <span className="text-xs text-muted-foreground">• {post.author_role}</span>
              )}
              {post.community_name && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0">
                  {post.community_name}
                </Badge>
              )}
              {post.pinned && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-600 border-amber-300">
                  <Pin className="w-2.5 h-2.5 mr-0.5" /> Fixado
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{timeAgo}</p>
          </div>
          {(currentUser?.role === 'admin' || post.author_id === currentUser?.id) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0 text-muted-foreground">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDelete && onDelete(post.id)} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          {post.post_type !== 'text' && typeIcon[post.post_type] && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              {typeIcon[post.post_type]}
              <span className="capitalize">{post.post_type}</span>
            </div>
          )}
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{post.content}</p>
          {post.media_url && post.post_type === 'image' && (
            <img src={post.media_url} alt="Post" className="w-full rounded-lg mt-3 max-h-80 object-cover" />
          )}
          {post.media_url && post.post_type === 'video' && (
            <div className="mt-3 rounded-lg overflow-hidden aspect-video bg-black">
              <iframe src={post.media_url} className="w-full h-full" allowFullScreen title={post.content} />
            </div>
          )}
          {post.media_url && post.post_type === 'document' && (
            <a href={post.media_url} target="_blank" rel="noopener noreferrer"
              className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
              <FileText className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Ver documento</span>
            </a>
          )}
        </div>

        {/* Stats */}
        {(likesCount > 0 || commentsCount > 0) && (
          <div className="px-4 py-1 flex items-center justify-between text-xs text-muted-foreground border-t border-border/50">
            {likesCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="inline-flex items-center justify-center w-4 h-4 bg-primary rounded-full">
                  <Heart className="w-2.5 h-2.5 text-white fill-white" />
                </span>
                {likesCount}
              </span>
            )}
            {commentsCount > 0 && (
              <button onClick={() => setShowComments(!showComments)} className="hover:underline ml-auto">
                {commentsCount} comentário{commentsCount !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="px-2 py-1 flex border-t border-border/50">
          <button
            onClick={handleLike}
            className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium rounded-lg py-1.5 transition-colors hover:bg-primary/10 ${liked ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-primary' : ''}`} />
            Curtir
          </button>
          <button
            onClick={() => { setShowComments(!showComments); setCommenting(true); }}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground rounded-lg py-1.5 transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <MessageCircle className="w-4 h-4" />
            Comentar
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground rounded-lg py-1.5 transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar
          </button>
        </div>

        {/* Comment input */}
        {(showComments || commenting) && (
          <div className="px-4 pb-3 pt-2 border-t border-border/50 space-y-3">
            <div className="flex gap-2">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarImage src={currentUser?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {currentUser?.full_name?.slice(0, 2).toUpperCase() || 'EU'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Escreva um comentário..."
                  className="resize-none text-sm min-h-[60px] rounded-xl bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
                  onKeyDown={e => e.key === 'Enter' && e.ctrlKey && handleComment()}
                />
                {commentText && (
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setCommentText('')} className="text-xs">Cancelar</Button>
                    <Button size="sm" onClick={handleComment} className="text-xs bg-primary hover:bg-primary/90">Publicar</Button>
                  </div>
                )}
              </div>
            </div>
            {showComments && <CommentsList postId={post.id} currentUserId={currentUser?.id} />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}