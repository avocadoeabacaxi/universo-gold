import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, Loader2, Save, Users, FileText, Radio } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import LeftSidebar from '@/components/sidebar/LeftSidebar';

export default function Profile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      const p = profiles[0] || null;
      setProfile(p);
      setForm({
        full_name: p?.full_name || user.full_name,
        job_title: p?.job_title || '',
        department: p?.department || '',
        bio: p?.bio || '',
        phone: p?.phone || '',
      });
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const data = { avatar_url: file_url };
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, data);
      setProfile(p => ({ ...p, avatar_url: file_url }));
    } else {
      const p = await base44.entities.UserProfile.create({ ...form, user_id: currentUser?.id, email: currentUser?.email, status: 'active', avatar_url: file_url });
      setProfile(p);
    }
    setUploadingAvatar(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const data = {
      ...form,
      user_id: currentUser?.id,
      email: currentUser?.email,
      status: 'active',
    };
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, data);
    } else {
      const p = await base44.entities.UserProfile.create(data);
      setProfile(p);
    }
    setSaving(false);
    setEditMode(false);
    toast.success('Perfil atualizado!');
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const initials = (form.full_name || currentUser?.full_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const roleLabels = { admin: 'Administrador', department_leader: 'Líder de Departamento', moderator: 'Moderador', user: 'Colaborador' };
  const enrichedUser = currentUser ? { ...currentUser, job_title: profile?.job_title, department: profile?.department, avatar_url: profile?.avatar_url || currentUser?.avatar_url } : null;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-4">
      <div className="flex gap-4">
        {/* Left Sidebar */}
        <div className="hidden lg:block">
          <LeftSidebar currentUser={enrichedUser} />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 py-2 max-w-2xl">
          {/* Profile Header */}
          <Card className="rounded-xl border-border/60 overflow-hidden mb-4">
            <div className="h-28 gold-gradient" />
            <CardContent className="px-6 pb-5">
              <div className="flex items-end gap-4 -mt-10 mb-4">
                <div className="relative group/avatar">
                  <Avatar className="w-20 h-20 border-4 border-white shadow-md">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-primary text-white text-2xl font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity border-4 border-white"
                  >
                    {uploadingAvatar ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                  </button>
                </div>
                <div className="flex-1 pb-1">
                  <h1 className="text-xl font-bold font-heading">{form.full_name || currentUser?.full_name}</h1>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    {profile?.role && (
                      <Badge className="bg-primary/10 text-primary border-0 text-xs">{roleLabels[profile.role] || 'Colaborador'}</Badge>
                    )}
                    {form.department && (
                      <span className="text-sm text-muted-foreground">{form.department}</span>
                    )}
                  </div>
                </div>
                <Button
                  variant={editMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editMode ? handleSave() : setEditMode(true)}
                  disabled={saving}
                  className="rounded-xl"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editMode ? <><Save className="w-3.5 h-3.5 mr-1.5" />Salvar</> : 'Editar perfil'}
                </Button>
              </div>

              {!editMode ? (
                <div className="space-y-2">
                  {form.bio && <p className="text-sm text-muted-foreground">{form.bio}</p>}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {form.job_title && <span className="text-foreground font-medium">{form.job_title}</span>}
                    {form.phone && <span className="text-muted-foreground">{form.phone}</span>}
                    <span className="text-muted-foreground">{currentUser?.email}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Nome</Label>
                      <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="rounded-xl h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Cargo</Label>
                      <Input value={form.job_title} onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))} placeholder="Seu cargo" className="rounded-xl h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Departamento</Label>
                      <Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Seu departamento" className="rounded-xl h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Telefone</Label>
                      <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(11) 99999-9999" className="rounded-xl h-9 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Bio</Label>
                    <Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Conte um pouco sobre você..." className="rounded-xl resize-none text-sm" rows={2} />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setEditMode(false)} className="text-xs">Cancelar</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: FileText, label: 'Publicações', value: '—', color: 'text-blue-500' },
              { icon: Users, label: 'Comunidades', value: profile?.communities?.length || 0, color: 'text-purple-500' },
              { icon: Radio, label: 'Lives assistidas', value: '—', color: 'text-red-500' },
            ].map(({ icon: Icon, label, value, color }) => (
              <Card key={label} className="rounded-xl border-border/60">
                <CardContent className="p-4 text-center">
                  <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                  <p className="text-lg font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}