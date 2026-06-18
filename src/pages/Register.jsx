import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, User, Hash, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function Register() {
  const [step, setStep] = useState("form"); // form | otp | done
  const [form, setForm] = useState({ full_name: "", email: "", matricula: "", password: "", confirm: "" });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.full_name.trim()) return setError("Informe seu nome completo.");
    if (!form.matricula.trim()) return setError("Informe sua matrícula.");
    if (form.password.length < 6) return setError("A senha deve ter no mínimo 6 caracteres.");
    if (form.password !== form.confirm) return setError("As senhas não conferem.");

    setLoading(true);
    try {
      await base44.auth.register({ email: form.email.trim().toLowerCase(), password: form.password });
      setStep("otp");
    } catch (err) {
      setError(err?.message || "Não foi possível cadastrar. Verifique o e-mail informado.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await base44.auth.verifyOtp({ email: form.email.trim().toLowerCase(), otpCode: otp.trim() });
      const token = res?.access_token;
      if (token) base44.auth.setToken(token);

      // Cria o perfil do colaborador como PENDENTE de aprovação
      const me = await base44.auth.me();
      await base44.entities.UserProfile.create({
        user_id: me.id,
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        matricula: form.matricula.trim(),
        approval_status: "pending",
        role: "user",
        status: "active",
      });

      setStep("done");
      setTimeout(() => { window.location.href = "/"; }, 2500);
    } catch (err) {
      setError("Código inválido ou expirado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(form.email.trim().toLowerCase());
    } catch {
      setError("Não foi possível reenviar o código.");
    }
  };

  if (step === "done") {
    return (
      <AuthLayout icon={CheckCircle2} title="Cadastro recebido!" subtitle="Aguardando autorização">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-sm text-foreground font-medium">
            Seu cadastro foi enviado e está aguardando autorização de um moderador.
          </p>
          <p className="text-xs text-muted-foreground">
            Você será avisado assim que o acesso for liberado. Redirecionando...
          </p>
        </div>
      </AuthLayout>
    );
  }

  if (step === "otp") {
    return (
      <AuthLayout icon={KeyRound} title="Confirme seu e-mail" subtitle={`Enviamos um código para ${form.email}`}>
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">⚠ {error}</div>
        )}
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="otp" className="text-sm font-semibold">Código de verificação</Label>
            <Input id="otp" autoFocus placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value)} className="h-12 rounded-xl text-center text-lg tracking-widest" required />
          </div>
          <button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: "linear-gradient(135deg, #0E4AA1 0%, #2B6FCC 100%)" }}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Verificando...</> : "Confirmar"}
          </button>
          <button type="button" onClick={handleResend} className="w-full text-xs text-primary hover:underline font-medium">
            Reenviar código
          </button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout icon={UserPlus} title="Criar conta" subtitle="Cadastre-se para acessar o Universo Gold"
      footer={<Link to="/login" className="text-primary font-medium hover:underline"><ArrowLeft className="w-3 h-3 inline mr-1" />Voltar para o login</Link>}>
      {error && (
        <div className="mb-5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">⚠ {error}</div>
      )}
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Nome completo</Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input autoFocus placeholder="Seu nome completo" value={form.full_name} onChange={set("full_name")} className="pl-10 h-12 rounded-xl text-sm" required />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Matrícula</Label>
          <div className="relative">
            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Sua matrícula" value={form.matricula} onChange={set("matricula")} className="pl-10 h-12 rounded-xl text-sm" required />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="email" placeholder="seu@email.com" value={form.email} onChange={set("email")} className="pl-10 h-12 rounded-xl text-sm" required />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={set("password")} className="pl-10 h-12 rounded-xl text-sm" required />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Confirmar senha</Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="password" placeholder="Repita a senha" value={form.confirm} onChange={set("confirm")} className="pl-10 h-12 rounded-xl text-sm" required />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: "linear-gradient(135deg, #0E4AA1 0%, #2B6FCC 100%)" }}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Cadastrando...</> : <><UserPlus className="w-4 h-4" />Criar conta</>}
        </button>
      </form>
    </AuthLayout>
  );
}