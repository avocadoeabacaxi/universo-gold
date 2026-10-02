import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function useCurrentUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      const p = profiles[0];
      setUser({ ...u, role: u.role === 'admin' ? 'admin' : (p?.role || u.role), department: p?.department, job_title: p?.job_title });
    };
    init();
  }, []);

  return user;
}