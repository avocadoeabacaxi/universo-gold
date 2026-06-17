import React from "react";
import { Link } from "react-router-dom";
import { ShieldX, Building2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

// Cadastro desabilitado — acesso somente por convite do RH/TI
export default function Register() {
  return (
    <AuthLayout
      icon={ShieldX}
      title="Acesso Restrito"
      subtitle="O auto-cadastro não está disponível"
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <Building2 className="w-8 h-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-foreground font-medium">
            Universo Gold é uma plataforma exclusiva para colaboradores da Gold Pão.
          </p>
          <p className="text-sm text-muted-foreground">
            O acesso é liberado pelo <strong>RH ou TI</strong> com e-mail corporativo <strong>@goldpao.com</strong>.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-muted/60 text-left space-y-1">
          <p className="text-xs font-semibold text-foreground">Como obter acesso?</p>
          <p className="text-xs text-muted-foreground">1. Solicite ao seu gestor ou ao RH</p>
          <p className="text-xs text-muted-foreground">2. O TI irá cadastrar seu e-mail corporativo</p>
          <p className="text-xs text-muted-foreground">3. Você receberá as credenciais por e-mail</p>
        </div>

        <Link
          to="/login"
          className="block w-full h-12 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center"
        >
          Voltar para o login
        </Link>
      </div>
    </AuthLayout>
  );
}