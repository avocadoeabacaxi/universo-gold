import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CommentsList({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Comment.filter({ post_id: postId, status: 'active' }, '-created_date', 20)
      .then(setComments)
      .finally(() => setLoading(false));
  }, [postId]);

  if (loading) return <div className="text-xs text-muted-foreground py-2">Carregando comentários...</div>;
  if (comments.length === 0) return null;

  return (
    <div className="space-y-2">
      {comments.map(comment => {
        const initials = comment.author_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
        const timeAgo = comment.created_date
          ? formatDistanceToNow(new Date(comment.created_date), { addSuffix: true, locale: ptBR })
          : '';
        return (
          <div key={comment.id} className="flex gap-2">
            <Avatar className="w-7 h-7 shrink-0">
              <AvatarImage src={comment.author_avatar} />
              <AvatarFallback className="bg-primary/80 text-white text-[10px] font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 bg-muted rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs">{comment.author_name}</span>
                <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
              </div>
              <p className="text-xs text-foreground mt-0.5">{comment.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}