import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, Pencil, Check, X } from 'lucide-react';

export default function CommentsList({ postId, currentUserId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    base44.entities.Comment.filter({ post_id: postId, status: 'active' }, '-created_date', 20)
      .then(setComments)
      .finally(() => setLoading(false));
  }, [postId]);

  const handleDelete = async (comment) => {
    await base44.entities.Comment.update(comment.id, { status: 'deleted' });
    setComments(prev => prev.filter(c => c.id !== comment.id));
  };

  const handleEdit = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.content);
  };

  const handleSaveEdit = async (comment) => {
    if (!editText.trim()) return;
    await base44.entities.Comment.update(comment.id, { content: editText.trim() });
    setComments(prev => prev.map(c => c.id === comment.id ? { ...c, content: editText.trim() } : c));
    setEditingId(null);
  };

  if (loading) return <div className="text-xs text-muted-foreground py-2">Carregando comentários...</div>;
  if (comments.length === 0) return null;

  return (
    <div className="space-y-2">
      {comments.map(comment => {
        const initials = comment.author_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
        const timeAgo = comment.created_date
          ? formatDistanceToNow(new Date(comment.created_date), { addSuffix: true, locale: ptBR })
          : '';
        const isOwner = currentUserId && comment.author_id === currentUserId;
        const isEditing = editingId === comment.id;

        return (
          <div key={comment.id} className="flex gap-2 group">
            <Avatar className="w-7 h-7 shrink-0">
              <AvatarImage src={comment.author_avatar} />
              <AvatarFallback className="bg-primary/80 text-white text-[10px] font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 bg-muted rounded-xl px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs">{comment.author_name}</span>
                  <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
                </div>
                {isOwner && !isEditing && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(comment)}
                      className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
                      title="Editar"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(comment)}
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="mt-1 flex gap-2 items-end">
                  <textarea
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    className="flex-1 text-xs border rounded-lg p-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 min-h-[40px]"
                    autoFocus
                  />
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleSaveEdit(comment)}
                      className="p-1 rounded bg-primary text-white hover:bg-primary/90 transition"
                      title="Salvar"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 rounded bg-muted-foreground/20 text-muted-foreground hover:bg-muted-foreground/30 transition"
                      title="Cancelar"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-foreground mt-0.5">{comment.content}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}