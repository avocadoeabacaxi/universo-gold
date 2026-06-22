import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, ShieldCheck, Users, Newspaper, Video } from "lucide-react";

const ALLOWED_DOMAIN = "goldpao.com";

const features = [
{ icon: Newspaper, label: "Feed de notícias", desc: "Fique por dentro de tudo que acontece na empresa" },
{ icon: Users, label: "Comunidades", desc: "Conecte-se com colegas de outros setores e unidades" },
{ icon: Video, label: "Vídeos & Lives", desc: "Assista conteúdos e transmissões ao vivo" },
{ icon: ShieldCheck, label: "Acesso seguro", desc: "Plataforma exclusiva para colaboradores Gold Pão" }];


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [msLoading, setMsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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

  const handleGoogle = () => {
    setGoogleLoading(true);
    base44.auth.loginWithProvider("google", "/");
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Tony mascote original (pão) - acima de tudo, na divisa azul/branco */}
      <img
        src="https://media.base44.com/images/public/6a31b47db4d51fa5778edaf8/18b98ea2a_Pao.png"
        alt="Tony Gold Pão"
        className="hidden lg:block absolute -bottom-6 h-72 xl:h-80 w-auto drop-shadow-2xl z-50 pointer-events-none left-1/2 xl:left-[60%] -translate-x-1/2" />

      {/* ── Lado esquerdo – Branding ── */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(145deg, #093478 0%, #0E4AA1 50%, #2B6FCC 100%)" }}>
        
        {/* Circles decorativos */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 left-1/4 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

        {/* Logo com movimento suave */}
        <div className="relative z-10" style={{ animation: "floatLogo 6s ease-in-out infinite" }}>
          <img
            src="https://media.base44.com/images/public/6a31b47db4d51fa5778edaf8/b87b7fd13_logo.png"
            alt="Universo Gold Pão"
            className="h-20 w-auto brightness-0 invert" />
          
        </div>

        {/* Tony astronauta flutuando perto da seta da logo */}
        <img
          src="https://media.base44.com/images/public/6a31b47db4d51fa5778edaf8/98b6e064c_9a6d1adc-c292-48f7-aa99-42ce3a29cdc7-removebg-preview.png"
          alt="Tony Astronauta"
          className="absolute top-12 left-52 xl:left-64 h-20 xl:h-24 w-auto drop-shadow-xl z-20 pointer-events-none"
          style={{ animation: "floatAstro 5s ease-in-out infinite" }} />
        
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
            {features.map(({ icon: Icon, label, desc }) =>
            <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mb-2">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-white font-semibold text-sm leading-tight">{label}</p>
                <p className="text-white/55 text-xs mt-0.5 leading-snug">{desc}</p>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="relative z-10">
          <p className="text-white/40 text-xs">© 2026 Gold Pão · Desenvolvido por LAB485/Avocado</p>
        </div>
      </div>

      {/* ── Lado direito – Formulário ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-6 py-12 relative">
        {/* Logo mobile */}
        <div className="lg:hidden mb-8 flex justify-center">
          <img
            src="https://media.base44.com/images/public/6a31b47db4d51fa5778edaf8/b87b7fd13_logo.png"
            alt="Universo Gold Pão"
            className="h-16 w-auto" />
          
        </div>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-black text-foreground">Bem-vindo(a) de volta!</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Entre com seu e-mail e senha para acessar a plataforma
            </p>
          </div>

          {/* Botão Microsoft */}
          <button
            type="button"
            onClick={handleMicrosoft}
            disabled={msLoading}
            className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-border bg-card hover:bg-muted/50 text-sm font-semibold text-foreground transition-all shadow-sm hover:shadow-md disabled:opacity-60 mb-6">
            
            {msLoading ?
            <Loader2 className="w-4 h-4 animate-spin" /> :

            <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
                <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
              </svg>
            }
            Entrar com Microsoft 365
          </button>

          {/* Botão Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-border bg-card hover:bg-muted/50 text-sm font-semibold text-foreground transition-all shadow-sm hover:shadow-md disabled:opacity-60 mb-6">

            {googleLoading ?
            <Loader2 className="w-4 h-4 animate-spin" /> :

            <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
              </svg>
            }
            Entrar com Google
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
          {error &&
          <div className="mb-5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
              <span className="mt-0.5">⚠</span>
              {error}
            </div>
          }

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
                  required />
                
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
                  required />
                
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-white font-bold text-sm transition-all flex items-center justify-center gap-2 mt-2 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 shadow-lg hover:shadow-xl"
              style={{ background: "linear-gradient(135deg, #0E4AA1 0%, #2B6FCC 100%)" }}>
              
              {loading ?
              <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entrando...
                </> :

              <>
                  <LogIn className="w-4 h-4" />
                  Entrar na plataforma
                </>
              }
            </button>
          </form>

          {/* Cadastro */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">Criar conta</Link>
          </p>

          {/* Info */}
          <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border/60 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Plataforma exclusiva para colaboradores Gold Pão. Cadastros são autorizados por um moderador através da matrícula.
            </p>
          </div>
        </div>
      </div>
    </div>);

}