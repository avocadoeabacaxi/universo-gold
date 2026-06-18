import { base44 } from '@/api/base44Client';

// Extrai @nomes mencionados em um texto
export function extractMentions(text) {
  if (!text) return [];
  const matches = text.match(/@([\wÀ-ÿ.]+)/g) || [];
  return matches.map(m => m.slice(1).toLowerCase());
}

// Cria uma notificação (ignora se for para o próprio autor)
export async function createNotification({ recipientId, actorId, type, title, message, actorName, actorAvatar, link }) {
  if (!recipientId || recipientId === actorId) return;
  await base44.entities.Notification.create({
    recipient_id: recipientId,
    type,
    title,
    message,
    actor_name: actorName,
    actor_avatar: actorAvatar,
    link,
    read: false,
  });
}

// Notifica menções (@) encontradas no texto, buscando os perfis pelo nome
export async function notifyMentions({ text, actor, link, contextLabel }) {
  const mentions = extractMentions(text);
  if (mentions.length === 0) return;
  const profiles = await base44.entities.UserProfile.list('-created_date', 200);
  const matched = profiles.filter(p => {
    const slug = (p.full_name || '').toLowerCase().replace(/\s+/g, '');
    const firstName = (p.full_name || '').toLowerCase().split(' ')[0];
    return mentions.some(m => slug.includes(m.replace(/\./g, '')) || firstName === m);
  });
  await Promise.all(matched.map(p =>
    createNotification({
      recipientId: p.user_id,
      actorId: actor?.id,
      type: 'mention',
      title: 'Você foi mencionado',
      message: `${actor?.full_name} mencionou você${contextLabel ? ` em ${contextLabel}` : ''}`,
      actorName: actor?.full_name,
      actorAvatar: actor?.avatar_url,
      link,
    })
  ));
}