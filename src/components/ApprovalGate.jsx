import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import PendingApproval from "@/components/PendingApproval";

// Verifica se o colaborador foi autorizado por um moderador (approval_status).
// Admins e Líderes sempre passam. Perfis sem registro são tratados como aprovados (legados).
export default function ApprovalGate({ children }) {
  const [state, setState] = useState({ loading: true, status: "approved" });

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        // Admin da plataforma sempre tem acesso
        if (me?.role === "admin") {
          setState({ loading: false, status: "approved" });
          return;
        }
        const profiles = await base44.entities.UserProfile.filter({ user_id: me.id }, "-created_date", 1);
        const profile = profiles?.[0];
        // Sem perfil ou já aprovado => libera. Líderes/moderadores também liberam.
        if (!profile || !profile.approval_status || profile.approval_status === "approved" || ["admin", "department_leader"].includes(profile.role)) {
          setState({ loading: false, status: "approved" });
        } else {
          setState({ loading: false, status: profile.approval_status });
        }
      } catch {
        setState({ loading: false, status: "approved" });
      }
    })();
  }, []);

  if (state.loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (state.status === "pending" || state.status === "rejected") {
    return <PendingApproval status={state.status} />;
  }

  return children;
}