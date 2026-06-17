import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Tag, RefreshCw, Gift, Search as SearchIcon, X, ImageIcon, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TYPE_CONFIG = {
  venda: { label: 'Venda', color: 'bg-green-100 text-green-800', icon: Tag },
  troca: { label: 'Troca', color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
  doacao: { label: 'Doação', color: 'bg-purple-100 text-purple-800', icon: Gift },
  procuro: { label: 'Procuro', color: 'bg-orange-100 text-orange-800', icon: SearchIcon },
};

function ClassifiedCard({ item, currentUserId, onStatusChange, onDelete }) {
  const initials = item.author_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const isOwner = item.author_id === currentUserId;
  const TypeIcon = TYPE_CONFIG[item.type]?.icon || Tag;
  const timeAgo = item.created_date
    ? formatDistanceToNow(new Date(item.created_date), { addSuffix: true, locale: ptBR })
    : '';

  return (
    <div className="bg-card rounded-xl border border-border/60 overflow-hidden hover:shadow-md transition-shadow">
      {item.image_url && (
        <div className="aspect-video bg-muted overflow-hidden">
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_CONFIG[item.type]?.color}`}>
              <TypeIcon className="w-3 h-3" /> {TYPE_CONFIG[item.type]?.label}
            </span>
            {item.status === 'sold' && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">Vendido/Encerrado</span>
            )}
          </div>
          {item.type === 'venda' && item.price > 0 && (
            <span className="text-base font-bold text-green-700 shrink-0">
              R$ {Number(item.price).toFixed(2).replace('.', ',')}
            </span>
          )}
        </div>
        <h3 className="font-bold text-sm mb-1">{item.title}</h3>
        {item.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{item.description}</p>}
        <div className="flex items-center gap-2 pt-2 border-t border-border/40">
          <Avatar className="w-6 h-6 shrink-0">
            <AvatarImage src={item.author_avatar} />
            <AvatarFallback className="bg-primary text-white text-[9px] font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{item.author_name}</p>
            <p className="text-[10px] text-muted-foreground">{timeAgo}</p>
          </div>
          {item.contact && (
            <a href={`https://wa.me/${item.contact.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
              className="shrink-0 text-xs bg-green-500 text-white px-2.5 py-1 rounded-full font-semibold hover:bg-green-600 transition">
              Contato
            </a>
          )}
        </div>
        {isOwner && item.status === 'active' && (
          <div className="flex gap-2 mt-2 pt-2 border-t border-border/40">
            <button onClick={() => onStatusChange(item.id, 'sold')}
              className="flex-1 text-xs text-muted-foreground border rounded-lg py-1 hover:bg-muted transition">
              Marcar como encerrado
            </button>
            <button onClick={() => onDelete(item.id)}
              className="text-xs text-destructive border border-destructive/30 rounded-lg px-3 py-1 hover:bg-destructive/10 transition">
              Excluir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NewClassifiedForm({ communityId, currentUser, onCreated, onCancel }) {
  const [form, setForm] = useState({ title: '', description: '', type: 'venda', price: '', contact: '' });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setUploading(true);
    let image_url = '';
    if (image) {
      const res = await base44.integrations.Core.UploadFile({ file: image });
      image_url = res.file_url;
    }
    const created = await base44.entities.CommunityClassified.create({
      community_id: communityId,
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      price: form.price ? parseFloat(form.price) : 0,
      contact: form.contact.trim(),
      image_url,
      author_id: currentUser?.id,
      author_name: currentUser?.full_name,
      author_avatar: currentUser?.avatar_url,
    });
    onCreated(created);
    setUploading(false);
  };

  return (
    <div className="bg-card rounded-xl border border-primary/30 p-4 space-y-3">
      <h3 className="font-bold text-sm">Novo anúncio</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-semibold text-muted-foreground">Tipo *</label>
          <div className="flex gap-2 mt-1 flex-wrap">
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
              <button key={key} onClick={() => setForm(f => ({ ...f, type: key }))}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition ${form.type === key ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary'}`}>
                {cfg.label}
              </button>
            ))}
          </div>
        </div>
        <div className="col-span-2">
          <label className="text-xs font-semibold text-muted-foreground">Título *</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="Ex: iPhone 12 Pro" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-semibold text-muted-foreground">Descrição</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={2} className="w-full border rounded-lg px-3 py-2 text-sm mt-1 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="Descreva o item..." />
        </div>
        {form.type === 'venda' && (
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Preço (R$)</label>
            <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="0,00" />
          </div>
        )}
        <div className={form.type === 'venda' ? '' : 'col-span-2'}>
          <label className="text-xs font-semibold text-muted-foreground">WhatsApp / Contato</label>
          <input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="(11) 99999-9999" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-semibold text-muted-foreground">Foto (opcional)</label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          {imagePreview ? (
            <div className="relative mt-1 rounded-lg overflow-hidden aspect-video bg-muted">
              <img src={imagePreview} className="w-full h-full object-cover" alt="preview" />
              <button onClick={() => { setImage(null); setImagePreview(null); }}
                className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()}
              className="mt-1 w-full border-2 border-dashed border-border rounded-lg py-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition">
              <ImageIcon className="w-4 h-4" /> Adicionar foto
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-muted-foreground border rounded-xl hover:bg-muted transition">Cancelar</button>
        <button onClick={handleSubmit} disabled={!form.title.trim() || uploading}
          className="px-4 py-2 text-sm bg-primary text-white rounded-xl hover:bg-primary/90 transition disabled:opacity-50 flex items-center gap-2">
          {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Publicar anúncio
        </button>
      </div>
    </div>
  );
}

export default function CommunityClassifiedsTab({ communityId, currentUser, isMember }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    base44.entities.CommunityClassified.filter({ community_id: communityId, status: 'active' }, '-created_date', 50)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [communityId]);

  const handleStatusChange = async (id, status) => {
    await base44.entities.CommunityClassified.update(id, { status });
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  };

  const handleDelete = async (id) => {
    await base44.entities.CommunityClassified.delete(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);

  if (loading) return <div className="text-sm text-muted-foreground text-center py-8">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('all')} className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition ${filter === 'all' ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary'}`}>Todos</button>
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
            <button key={key} onClick={() => setFilter(key)} className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition ${filter === key ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary'}`}>{cfg.label}</button>
          ))}
        </div>
        {isMember && (
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition">
            <Plus className="w-4 h-4" /> Novo anúncio
          </button>
        )}
      </div>

      {adding && (
        <NewClassifiedForm
          communityId={communityId}
          currentUser={currentUser}
          onCreated={item => { setItems(prev => [item, ...prev]); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map(item => (
          <ClassifiedCard key={item.id} item={item} currentUserId={currentUser?.id}
            onStatusChange={handleStatusChange} onDelete={handleDelete} />
        ))}
      </div>

      {filtered.length === 0 && !adding && (
        <div className="col-span-2 text-center py-12 text-muted-foreground text-sm">
          <p>Nenhum anúncio ainda.</p>
          {isMember && <p className="text-xs mt-1">Clique em "Novo anúncio" para começar.</p>}
        </div>
      )}
    </div>
  );
}