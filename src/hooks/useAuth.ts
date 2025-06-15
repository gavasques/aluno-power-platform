
import { useState } from "react";

// Simulação de usuário logado - em produção seria de um contexto de autenticação
const getCurrentUser = () => ({
  id: "1",
  name: "Guilherme Vasques",
  email: "aluno@lvbrasil.com",
  role: "admin" // admin | support | user
});

export const useAuth = () => {
  const [user] = useState(getCurrentUser());

  const isAdmin = user.role === "admin";
  const isSupport = user.role === "support";
  const hasAdminAccess = isAdmin || isSupport;

  return {
    user,
    isAdmin,
    isSupport,
    hasAdminAccess
  };
};
