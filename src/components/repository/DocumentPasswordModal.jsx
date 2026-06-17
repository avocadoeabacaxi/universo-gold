import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function DocumentPasswordModal({ open, onClose, doc, onUnlock }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === doc?.password) {
      onUnlock(doc);
      onClose();
      setPassword('');
      setError('');
    } else {
      setError('Senha incorreta. Tente novamente.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" /> Documento protegido
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground mb-4">
          <p className="font-medium text-foreground truncate">{doc?.title}</p>
          <p className="mt-1">Este documento exige uma senha para ser acessado.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Digite a senha..."
              className="rounded-xl pr-12"
              autoFocus
            />
            <button type="button" onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button type="submit"
            className="w-full py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition">
            Acessar documento
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}