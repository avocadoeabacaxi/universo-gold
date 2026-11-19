import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const pad = (n) => String(n).padStart(2, '0');

// Guarda apenas dia e mês (o ano é fixo e nunca é exibido)
export default function BirthdayPicker({ value, onChange, triggerClassName = 'rounded-xl h-9 text-sm' }) {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');

  useEffect(() => {
    setDay(value ? value.slice(8, 10) : '');
    setMonth(value ? value.slice(5, 7) : '');
  }, [value]);

  const update = (d, m) => {
    setDay(d); setMonth(m);
    if (d && m) onChange(`2000-${m}-${d}`);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Select value={day} onValueChange={d => update(d, month)}>
        <SelectTrigger className={triggerClassName}><SelectValue placeholder="Dia" /></SelectTrigger>
        <SelectContent>{Array.from({ length: 31 }, (_, i) => pad(i + 1)).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={month} onValueChange={m => update(day, m)}>
        <SelectTrigger className={triggerClassName}><SelectValue placeholder="Mês" /></SelectTrigger>
        <SelectContent>{MONTHS.map((m, i) => <SelectItem key={m} value={pad(i + 1)}>{m}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}