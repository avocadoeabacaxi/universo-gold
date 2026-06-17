import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, Building2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

const ALLOWED_DOMAIN = "goldpao.com";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [msLoading, setMsLoading] = useState(false);

  const validateDomain = (email) => {
    return email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateDomain(email)) {
      setError(`Acesso restrito. Use seu e-mail corporativo @${ALLOWED_DOMAIN}`);
      return;
    }

    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = "/";
    } catch (err) {
      setError("E-mail ou senha incorretos. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoft = () => {
    setMsLoading(true);
    base44.auth.loginWithProvider("microsoft", "/");
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Universo Gold"
      subtitle="Acesse com seu e-mail corporativo @goldpao.com"
    >
      {/* Microsoft Login */}
      <button
        type="button"
        onClick={handleMicrosoft}
        disabled={msLoading}
        className="w-full h-12 flex items-center justify-center gap-3 rounded-lg border border-border bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors mb-6 disabled:opacity-60"
      >
        {msLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
            <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
          </svg>
        )}
        Entrar com Microsoft 365
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">ou</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail corporativo</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder={`colaborador@${ALLOWED_DOMAIN}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Entrando...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Entrar
            </>
          )}
        </button>
      </form>

      {/* Aviso de acesso restrito */}
      <div className="mt-6 p-3 rounded-lg bg-muted/60 flex items-start gap-2">
        <Building2 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Acesso exclusivo para colaboradores Gold Pão com e-mail <strong>@goldpao.com</strong>. 
          Novos acessos devem ser solicitados ao RH ou TI.
        </p>
      </div>
    </AuthLayout>
  );
}