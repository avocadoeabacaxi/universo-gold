import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Shield, Pencil, UserX } from 'lucide-react';

const ROLE_LABELS = { admin: 'Admin', editor: 'Editor', member: 'Membro' };
const ROLE_COLORS = {
  admin: 'bg-blue-100 text-blue-800',
  editor: 'bg-purple-100 text-purple-800',
  member: 'bg-gray-100 text-gray-600',
};

export default function CommunityMembersTab({ communityId, isLeader, currentUserId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.CommunityMember.filter({ community_id: communityId })
      .then(setMembers)
      .finally(() => setLoading(false));
  }, [communityId]);

  const handleRoleChange = async (member, newRole) => {
    await base44.entities.CommunityMember.update(member.id, { role: newRole });
    setMembers(prev => prev.map(m => m.id === member.id ? { ...m, role: newRole } : m));
  };

  const handleRemove = async (member) => {
    if (!confirm(`Remover ${member.user_name} da comunidade?`)) return;
    await base44.entities.CommunityMember.delete(member.id);
    setMembers(prev => prev.filter(m => m.id !== member.id));
  };

  if (loading) return <div className="text-sm text-muted-foreground text-center py-8">Carregando membros...</div>;

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground mb-3">{members.length} membro{members.length !== 1 ? 's' : ''}</p>
      {members.map(member => {
        const initials = member.user_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
        const isSelf = member.user_id === currentUserId;
        return (
          <div key={member.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/60">
            <Avatar className="w-10 h-10 shrink-0">
              <AvatarImage src={member.user_avatar} />
              <AvatarFallback className="bg-primary text-white text-sm font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{member.user_name}</p>
              {member.user_role_title && <p className="text-xs text-muted-foreground truncate">{member.user_role_title}</p>}
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[member.role]}`}>
              {ROLE_LABELS[member.role]}
            </span>
            {isLeader && !isSelf && (
              <div className="flex items-center gap-1">
                <select
                  value={member.role}
                  onChange={e => handleRoleChange(member, e.target.value)}
                  className="text-xs border rounded-lg px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                  <option value="member">Membro</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={() => handleRemove(member)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                  title="Remover"
                >
                  <UserX className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        );
      })}
      {members.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">Nenhum membro cadastrado ainda.</div>
      )}
    </div>
  );
}