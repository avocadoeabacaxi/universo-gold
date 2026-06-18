import React from "react";
import { base44 } from "@/api/base44Client";
import { Clock, LogOut } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function PendingApproval({ status }) {
  const rejected = status === "rejected";

  return (
    <AuthLayout
      icon={Clock}
      title={rejected ? "Cadastro não autorizado" : "Aguardando autorização"}
      subtitle={rejected ? "Seu acesso foi recusado" : "Seu cadastro está em análise"}
    >
      <div className="text-center space-y-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${rejected ? "bg-destructive/10" : "bg-amber-100"}`}>
          <Clock className={`w-8 h-8 ${rejected ? "text-destructive" : "text-amber-600"}`} />
        </div>

        {rejected ? (
          <p className="text-sm text-foreground font-medium">
            Seu cadastro não foi autorizado. Procure seu supervisor, o RH ou a TI para mais informações.
          </p>
        ) : (
          <>
            <p className="text-sm text-foreground font-medium">
              Um moderador precisa autorizar seu acesso pela sua matrícula.
            </p>
            <p className="text-xs text-muted-foreground">
              Assim que liberado, basta entrar novamente. Em caso de urgência, fale com seu supervisor ou a TI.
            </p>
          </>
        )}

        <button
          onClick={() => base44.auth.logout("/login")}
          className="w-full h-12 rounded-lg bg-muted text-foreground font-semibold text-sm hover:bg-muted/70 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </AuthLayout>
  );
}