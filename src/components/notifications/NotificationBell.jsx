import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Bell, MessageCircle, AtSign, Users, Heart, CheckCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TYPE_ICON = {
  comment: { icon: MessageCircle, color: 'text-blue-500 bg-blue-50' },
  mention: { icon: AtSign, color: 'text-purple-500 bg-purple-50' },
  community: { icon: Users, color: 'text-teal-500 bg-teal-50' },
  like: { icon: Heart, color: 'text-red-500 bg-red-50' },
  system: { icon: Bell, color: 'text-amber-500 bg-amber-50' },
};

export default function NotificationBell({ userId }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    const list = await base44.entities.Notification.filter({ recipient_id: userId }, '-created_date', 30);
    setItems(list);
  }, [userId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  // Real-time: novas notificações aparecem na hora
  useEffect(() => {
    if (!userId) return;
    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event.data?.recipient_id === userId) load();
    });
    return () => unsub && unsub();
  }, [userId, load]);

  const unreadCount = items.filter(n => !n.read).length;

  // Ao abrir, marca tudo como lido (clicou, viu, some o contador)
  const handleOpenChange = async (isOpen) => {
    setOpen(isOpen);
    if (isOpen && unreadCount > 0) {
      const unread = items.filter(n => !n.read);
      setItems(prev => prev.map(n => ({ ...n, read: true })));
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { read: true })));
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button className="relative text-white/80 hover:text-white hover:bg-white/20 rounded-full w-9 h-9 flex items-center justify-center transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#1a3a7a]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 z-[200] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
          <h4 className="font-bold text-sm">Notificações</h4>
          {items.length > 0 && <CheckCheck className="w-4 h-4 text-muted-foreground" />}
        </div>
        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {items.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            items.map(n => {
              const cfg = TYPE_ICON[n.type] || TYPE_ICON.system;
              const Icon = cfg.icon;
              const time = n.created_date ? formatDistanceToNow(new Date(n.created_date), { addSuffix: true, locale: ptBR }) : '';
              const content = (
                <div className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                  {n.actor_avatar ? (
                    <Avatar className="w-9 h-9 shrink-0">
                      <AvatarImage src={n.actor_avatar} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                        {n.actor_name?.slice(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${cfg.color.split(' ')[1]}`}>
                      <Icon className={`w-4 h-4 ${cfg.color.split(' ')[0]}`} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-tight">{n.title}</p>
                    {n.message && <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>}
                    <p className="text-[10px] text-muted-foreground mt-1">{time}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                </div>
              );
              return n.link
                ? <Link key={n.id} to={n.link} onClick={() => setOpen(false)} className="block border-b border-border/40 last:border-0">{content}</Link>
                : <div key={n.id} className="border-b border-border/40 last:border-0">{content}</div>;
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}