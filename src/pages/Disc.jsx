import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import useCurrentUser from '@/hooks/useCurrentUser';
import { HR_ROLES } from '@/lib/discProfiles';
import DiscHero from '@/components/disc/DiscHero';
import DiscStats from '@/components/disc/DiscStats';
import DiscTable from '@/components/disc/DiscTable';
import DiscInviteDialog from '@/components/disc/DiscInviteDialog';
import MyDiscTests from '@/components/disc/MyDiscTests';

export default function Disc() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [starting, setStarting] = useState(false);

  if (!user) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  const isHR = HR_ROLES.includes(user.role);
  const refresh = () => setRefreshKey(k => k + 1);

  const selfTest = async () => {
    setStarting(true);
    const rec = await base44.entities.DiscAssessment.create({
      candidate_name: user.full_name, candidate_email: user.email, user_id: user.id,
      department: user.department || '', job_title: user.job_title || '', purpose: 'autoconhecimento', status: 'pending',
      invited_by_id: user.id, invited_by_name: user.full_name,
    });
    navigate(`/disc/teste/${rec.id}`);
  };

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-6 space-y-5">
      <DiscHero isHR={isHR} onInvite={() => setInviteOpen(true)} onSelfTest={selfTest} starting={starting} />
      <MyDiscTests user={user} />
      {isHR && (
        <>
          <h2 className="font-extrabold text-lg">Painel do RH</h2>
          <DiscStats refreshKey={refreshKey} />
          <DiscTable refreshKey={refreshKey} onChange={refresh} />
          <DiscInviteDialog open={inviteOpen} onOpenChange={setInviteOpen} currentUser={user} onCreated={refresh} />
        </>
      )}
    </div>
  );
}