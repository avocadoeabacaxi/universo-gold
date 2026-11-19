import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Loader2 } from 'lucide-react';

export default function LikesDialog({ open, onOpenChange, userIds }) {
  const [people, setPeople] = useState(null);

  useEffect(() => {
    if (!open) return;
    setPeople(null);
    base44.entities.UserProfile.filter({ user_id: { $in: userIds } }, 'full_name', 500).then(setPeople);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Heart className="w-4 h-4 text-primary fill-primary" /> Quem curtiu</DialogTitle>
        </DialogHeader>
        {!people ? (
          <div className="py-6 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {people.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={p.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">{p.full_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{p.full_name}</p>
                  {(p.job_title || p.department) && <p className="text-xs text-muted-foreground truncate">{p.job_title || p.department}</p>}
                </div>
              </div>
            ))}
            {people.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Ninguém curtiu ainda.</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}