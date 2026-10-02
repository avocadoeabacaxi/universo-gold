export default function DiscReportSection({ icon: Icon, title, items, text, tone = 'text-primary' }) {
  return (
    <div className="bg-card rounded-xl border border-border/60 p-4 break-inside-avoid">
      <p className="font-bold text-sm flex items-center gap-2 mb-2"><Icon className={`w-4 h-4 ${tone}`} /> {title}</p>
      {text && <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>}
      {items && <ul className="space-y-1.5">{items.map(i => <li key={i} className="text-sm flex gap-2"><span className={tone}>•</span>{i}</li>)}</ul>}
    </div>
  );
}