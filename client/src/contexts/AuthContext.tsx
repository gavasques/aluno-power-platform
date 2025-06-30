import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  toggleRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Simulando um usuário admin para desenvolvimento
  // Em produção, isso viria de uma API de autenticação
  useEffect(() => {
    // Simular usuário admin logado
    const mockAdmin: User = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      name: 'Administrador',
      role: 'admin'
    };
    setUser(mockAdmin);
  }, []);

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  const login = async (username: string, password: string) => {
    // Implementar lógica de login aqui
    console.log('Login attempt:', username);
  };

  const logout = () => {
    setUser(null);
    // Limpar localStorage se houver dados salvos
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    // Redirecionar para página de login
    window.location.href = '/login';
  };

  const toggleRole = () => {
    if (user) {
      setUser({
        ...user,
        role: user.role === 'admin' ? 'user' : 'admin'
      });
    }
  };

  const value = {
    user,
    isAdmin,
    isAuthenticated,
    login,
    logout,
    toggleRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}