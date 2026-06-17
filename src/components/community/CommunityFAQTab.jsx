import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ChevronDown, Plus, Trash2, Pencil, Check, X } from 'lucide-react';

function FAQItem({ faq, canEdit, onDelete, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer);

  const handleSave = async () => {
    await onUpdate(faq.id, { question, answer });
    setEditing(false);
  };

  return (
    <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
      {editing ? (
        <div className="p-4 space-y-2">
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary/30"
            placeholder="Pergunta..."
          />
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
            placeholder="Resposta..."
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-xs text-muted-foreground border rounded-lg hover:bg-muted transition">Cancelar</button>
            <button onClick={handleSave} className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 transition">Salvar</button>
          </div>
        </div>
      ) : (
        <>
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition"
          >
            <ChevronDown className={`w-4 h-4 text-primary shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            <span className="flex-1 font-semibold text-sm">{faq.question}</span>
            {canEdit && (
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <button onClick={() => setEditing(true)} className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onDelete(faq.id)} className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </button>
          {open && (
            <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border/40 bg-muted/20 whitespace-pre-wrap">
              <p className="pt-3">{faq.answer}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function CommunityFAQTab({ communityId, canEdit, currentUser }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');

  useEffect(() => {
    base44.entities.CommunityFAQ.filter({ community_id: communityId, status: 'active' })
      .then(data => setFaqs(data.sort((a, b) => (a.order || 0) - (b.order || 0))))
      .finally(() => setLoading(false));
  }, [communityId]);

  const handleAdd = async () => {
    if (!newQ.trim() || !newA.trim()) return;
    const created = await base44.entities.CommunityFAQ.create({
      community_id: communityId,
      question: newQ.trim(),
      answer: newA.trim(),
      author_id: currentUser?.id,
      author_name: currentUser?.full_name,
      order: faqs.length,
    });
    setFaqs(prev => [...prev, created]);
    setNewQ('');
    setNewA('');
    setAdding(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.CommunityFAQ.update(id, { status: 'archived' });
    setFaqs(prev => prev.filter(f => f.id !== id));
  };

  const handleUpdate = async (id, data) => {
    await base44.entities.CommunityFAQ.update(id, data);
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, ...data } : f));
  };

  if (loading) return <div className="text-sm text-muted-foreground text-center py-8">Carregando...</div>;

  return (
    <div className="space-y-3">
      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={() => setAdding(!adding)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition"
          >
            <Plus className="w-4 h-4" /> Nova pergunta
          </button>
        </div>
      )}

      {adding && (
        <div className="bg-card rounded-xl border border-primary/30 p-4 space-y-2">
          <input
            value={newQ}
            onChange={e => setNewQ(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary/30"
            placeholder="Digite a pergunta..."
            autoFocus
          />
          <textarea
            value={newA}
            onChange={e => setNewA(e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
            placeholder="Digite a resposta..."
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setAdding(false)} className="px-3 py-1.5 text-xs text-muted-foreground border rounded-lg hover:bg-muted transition">Cancelar</button>
            <button onClick={handleAdd} className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 transition">Adicionar</button>
          </div>
        </div>
      )}

      {faqs.map(faq => (
        <FAQItem key={faq.id} faq={faq} canEdit={canEdit} onDelete={handleDelete} onUpdate={handleUpdate} />
      ))}

      {faqs.length === 0 && !adding && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          <p>Nenhuma pergunta frequente ainda.</p>
          {canEdit && <p className="mt-1 text-xs">Clique em "Nova pergunta" para começar.</p>}
        </div>
      )}
    </div>
  );
}