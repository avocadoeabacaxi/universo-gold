const map = {
  pending: ['Aguardando', 'bg-muted text-muted-foreground'],
  in_progress: ['Em andamento', 'bg-yellow-100 text-yellow-700'],
  completed: ['Concluído', 'bg-green-100 text-green-700'],
};

export default function DiscStatusBadge({ status }) {
  const [label, cls] = map[status] || map.pending;
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}