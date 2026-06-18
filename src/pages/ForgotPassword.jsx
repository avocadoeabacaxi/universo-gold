import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2, Hash, KeyRound, CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

const ALLOWED_DOMAIN = "goldpao.com";

export default function ForgotPassword() {
  const [mode, setMode] = useState("email"); // email | matricula
  const [email, setEmail] = useState("");
  const [matriculaForm, setMatriculaForm] = useState({ matricula: "", full_name: "", note: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const setMf = (k) => (e) => setMatriculaForm((p) => ({ ...p, [k]: e.target.value }));

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email.trim().toLowerCase());
    } catch {
      // sempre mostra sucesso
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  const handleMatriculaSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.entities.PasswordResetRequest.create({
        matricula: matriculaForm.matricula.trim(),
        full_name: matriculaForm.full_name.trim(),
        identifier: matriculaForm.matricula.trim(),
        note: matriculaForm.note.trim(),
        status: "pending",
      });
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  if (sent) {
    return (
      <AuthLayout icon={CheckCircle2} title="Solicitação enviada"
        footer={<Link to="/login" className="text-primary font-medium hover:underline"><ArrowLeft className="w-3 h-3 inline mr-1" />Voltar para o login</Link>}>
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          {mode === "email" ? (
            <p className="text-sm text-foreground">
              Se existir uma conta com esse e-mail, você receberá um link para redefinir a senha em instantes.
            </p>
          ) : (
            <p className="text-sm text-foreground">
              Seu pedido de reset foi registrado. A TI ou seu supervisor irá redefinir sua senha em breve.
            </p>
          )}
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout icon={mode === "email" ? Mail : KeyRound} title="Recuperar senha" subtitle="Escolha como deseja recuperar"
      footer={<Link to="/login" className="text-primary font-medium hover:underline"><ArrowLeft className="w-3 h-3 inline mr-1" />Voltar para o login</Link>}>

      {/* Seletor de modo */}
      <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-muted rounded-xl">
        <button onClick={() => setMode("email")} className={`h-9 rounded-lg text-xs font-semibold transition-colors ${mode === "email" ? "bg-card shadow text-primary" : "text-muted-foreground"}`}>
          Tenho e-mail @goldpao.com / .com.br
        </button>
        <button onClick={() => setMode("matricula")} className={`h-9 rounded-lg text-xs font-semibold transition-colors ${mode === "matricula" ? "bg-card shadow text-primary" : "text-muted-foreground"}`}>
          Não tenho e-mail
        </button>
      </div>

      {mode === "email" ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <p className="text-xs text-muted-foreground">Enviaremos um link de redefinição para o seu e-mail corporativo.</p>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-semibold">E-mail corporativo</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="email" type="email" autoFocus placeholder={`voce@${ALLOWED_DOMAIN}`} value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12 rounded-xl text-sm" required />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: "linear-gradient(135deg, #0E4AA1 0%, #2B6FCC 100%)" }}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</> : "Enviar link de redefinição"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleMatriculaSubmit} className="space-y-4">
          <p className="text-xs text-muted-foreground">Quem não tem e-mail corporativo precisa acionar a TI/supervisor. Preencha abaixo para registrar o pedido.</p>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Matrícula</Label>
            <div className="relative">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input autoFocus placeholder="Sua matrícula" value={matriculaForm.matricula} onChange={setMf("matricula")} className="pl-10 h-12 rounded-xl text-sm" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Nome completo</Label>
            <Input placeholder="Seu nome" value={matriculaForm.full_name} onChange={setMf("full_name")} className="h-12 rounded-xl text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Observação (opcional)</Label>
            <Input placeholder="Ex: setor, supervisor..." value={matriculaForm.note} onChange={setMf("note")} className="h-12 rounded-xl text-sm" />
          </div>
          <button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: "linear-gradient(135deg, #0E4AA1 0%, #2B6FCC 100%)" }}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</> : "Solicitar reset à TI"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}