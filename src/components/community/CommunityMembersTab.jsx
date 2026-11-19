import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserX } from 'lucide-react';

const ROLE_LABELS = { admin: 'Admin', editor: 'Editor', member: 'Membro' };
const ROLE_COLORS = {
  admin: 'bg-blue-100 text-blue-800',
  editor: 'bg-purple-100 text-purple-800',
  member: 'bg-gray-100 text-gray-600',
};

export default function CommunityMembersTab({ communityId, memberIds = [], isLeader, currentUserId, onRemoveMember }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [records, profiles] = await Promise.all([
        base44.entities.CommunityMember.filter({ community_id: communityId }),
        memberIds.length ? base44.entities.UserProfile.filter({ user_id: { $in: memberIds } }, 'full_name', 1000) : [],
      ]);
      const byUser = new Map(records.map(r => [r.user_id, r]));
      setMembers(profiles.map(p => ({
        role: 'member', ...byUser.get(p.user_id),
        user_id: p.user_id, user_name: p.full_name, user_avatar: p.avatar_url, user_role_title: p.job_title,
      })));
      setLoading(false);
    };
    load();
  }, [communityId]);

  const handleRoleChange = async (member, role) => {
    const saved = member.id
      ? await base44.entities.CommunityMember.update(member.id, { role })
      : await base44.entities.CommunityMember.create({ community_id: communityId, user_id: member.user_id, user_name: member.user_name, user_avatar: member.user_avatar, user_role_title: member.user_role_title, role });
    setMembers(prev => prev.map(m => m.user_id === member.user_id ? { ...m, id: saved.id, role } : m));
  };

  const handleRemove = async (member) => {
    if (!confirm(`Remover ${member.user_name} da comunidade?`)) return;
    if (member.id) await base44.entities.CommunityMember.delete(member.id);
    await onRemoveMember(member.user_id);
    setMembers(prev => prev.filter(m => m.user_id !== member.user_id));
  };

  if (loading) return <div className="text-sm text-muted-foreground text-center py-8">Carregando membros...</div>;

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground mb-3">{members.length} membro{members.length !== 1 ? 's' : ''}</p>
      {members.map(member => {
        const initials = member.user_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
        return (
          <div key={member.user_id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/60">
            <Avatar className="w-10 h-10 shrink-0">
              <AvatarImage src={member.user_avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{member.user_name}</p>
              {member.user_role_title && <p className="text-xs text-muted-foreground truncate">{member.user_role_title}</p>}
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[member.role]}`}>{ROLE_LABELS[member.role]}</span>
            {isLeader && member.user_id !== currentUserId && (
              <div className="flex items-center gap-1">
                <select value={member.role} onChange={e => handleRoleChange(member, e.target.value)}
                  className="text-xs border rounded-lg px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary/30">
                  <option value="member">Membro</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
                <button onClick={() => handleRemove(member)} title="Remover"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition">
                  <UserX className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        );
      })}
      {members.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">Nenhum membro ainda.</div>}
    </div>
  );
}