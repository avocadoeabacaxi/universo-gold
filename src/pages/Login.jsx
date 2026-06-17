import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, ShieldCheck, Users, Newspaper, Video } from "lucide-react";

const ALLOWED_DOMAIN = "goldpao.com";

const features = [
  { icon: Newspaper, label: "Feed de notícias", desc: "Fique por dentro de tudo que acontece na empresa" },
  { icon: Users, label: "Comunidades", desc: "Conecte-se com colegas de outros setores e unidades" },
  { icon: Video, label: "Vídeos & Lives", desc: "Assista conteúdos e transmissões ao vivo" },
  { icon: ShieldCheck, label: "Acesso seguro", desc: "Plataforma exclusiva para colaboradores Gold Pão" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [msLoading, setMsLoading] = useState(false);

  const validateDomain = (email) => email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);

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
    <div className="min-h-screen flex">
      {/* ── Lado esquerdo – Branding ── */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(145deg, #093478 0%, #0E4AA1 50%, #2B6FCC 100%)" }}
      >
        {/* Circles decorativos */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 left-1/4 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

        {/* Logo com movimento suave */}
        <div className="relative z-10" style={{ animation: "floatLogo 6s ease-in-out infinite" }}>
          <img
            src="https://media.base44.com/images/public/6a31b47db4d51fa5778edaf8/b87b7fd13_logo.png"
            alt="Universo Gold Pão"
            className="h-20 w-auto brightness-0 invert"
          />
        </div>

        {/* Tony mascote original (pão) */}
        <img
          src="https://media.base44.com/images/public/6a31b47db4d51fa5778edaf8/18b98ea2a_Pao.png"
          alt="Tony Gold Pão"
          className="absolute -bottom-4 -right-40 h-72 xl:h-80 w-auto drop-shadow-2xl z-20 pointer-events-none"
        />

        {/* Tony astronauta flutuando ao lado da logo */}
        <img
          src="https://media.base44.com/images/public/6a31b47db4d51fa5778edaf8/98b6e064c_9a6d1adc-c292-48f7-aa99-42ce3a29cdc7-removebg-preview.png"
          alt="Tony Astronauta"
          className="absolute top-8 left-40 h-20 xl:h-24 w-auto drop-shadow-xl z-20 pointer-events-none"
          style={{ animation: "floatAstro 5s ease-in-out infinite" }}
        />
        <style>{`
          @keyframes floatAstro {
            0%, 100% { transform: translateY(0px) rotate(-4deg); }
            50% { transform: translateY(-12px) rotate(4deg); }
          }
          @keyframes floatLogo {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
        `}</style>

        {/* Headline */}
        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
              Conectando<br />
              <span className="text-yellow-300">pessoas</span> que<br />
              fazem a Gold Pão
            </h1>
            <p className="mt-4 text-white/70 text-lg leading-relaxed max-w-sm">
              A plataforma oficial para colaboradores se comunicarem, aprenderem e crescerem juntos.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mb-2">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-white font-semibold text-sm leading-tight">{label}</p>
                <p className="text-white/55 text-xs mt-0.5 leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé */}
        <div className="relative z-10">
          <p className="text-white/40 text-xs">© 2026 Gold Pão · Todos os direitos reservados</p>
        </div>
      </div>

      {/* ── Lado direito – Formulário ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-6 py-12 relative">
        {/* Logo mobile */}
        <div className="lg:hidden mb-8 flex justify-center">
          <img
            src="https://media.base44.com/images/public/6a31b47db4d51fa5778edaf8/b87b7fd13_logo.png"
            alt="Universo Gold Pão"
            className="h-16 w-auto"
          />
        </div>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-black text-foreground">Bem-vindo(a) de volta!</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Entre com seu e-mail corporativo <span className="font-semibold text-foreground">@goldpao.com</span>
            </p>
          </div>

          {/* Botão Microsoft */}
          <button
            type="button"
            onClick={handleMicrosoft}
            disabled={msLoading}
            className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-border bg-card hover:bg-muted/50 text-sm font-semibold text-foreground transition-all shadow-sm hover:shadow-md disabled:opacity-60 mb-6"
          >
            {msLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
                <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
              </svg>
            )}
            Entrar com Microsoft 365
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground font-medium">ou continue com e-mail</span>
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
              <span className="mt-0.5">⚠</span>
              {error}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold">E-mail corporativo</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder={`colaborador@${ALLOWED_DOMAIN}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold">Senha</Label>
                <a href="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-white font-bold text-sm transition-all flex items-center justify-center gap-2 mt-2 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 shadow-lg hover:shadow-xl"
              style={{ background: "linear-gradient(135deg, #0E4AA1 0%, #2B6FCC 100%)" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Entrar na plataforma
                </>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border/60 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Acesso exclusivo para colaboradores Gold Pão com e-mail <strong className="text-foreground">@goldpao.com</strong>. 
              Para solicitar acesso, entre em contato com o RH ou TI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}