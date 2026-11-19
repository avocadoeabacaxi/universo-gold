import { Bold, Italic, Type } from 'lucide-react';

const btn = 'w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors';

export default function FormatToolbar({ textareaRef, value, onChange }) {
  const wrap = (mark) => {
    const el = textareaRef.current;
    const start = el.selectionStart, end = el.selectionEnd;
    const sel = value.slice(start, end).trim() || 'texto';
    onChange(value.slice(0, start) + mark + sel + mark + value.slice(end));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start + mark.length, start + mark.length + sel.length); });
  };

  const bigger = () => {
    const el = textareaRef.current;
    const lineStart = value.lastIndexOf('\n', el.selectionStart - 1) + 1;
    if (value.startsWith('# ', lineStart)) return;
    onChange(value.slice(0, lineStart) + '# ' + value.slice(lineStart));
    requestAnimationFrame(() => el.focus());
  };

  return (
    <div className="flex items-center gap-1">
      <button type="button" className={btn} title="Negrito" onClick={() => wrap('**')}><Bold className="w-4 h-4" /></button>
      <button type="button" className={btn} title="Itálico" onClick={() => wrap('*')}><Italic className="w-4 h-4" /></button>
      <button type="button" className={btn} title="Fonte maior (linha atual)" onClick={bigger}><Type className="w-4 h-4" /></button>
    </div>
  );
}