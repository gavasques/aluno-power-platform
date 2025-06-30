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
    console.log('🔥 AuthContext: useEffect triggered, checking authentication state');
    
    // Verificar se o usuário fez logout explicitamente
    const loggedOut = localStorage.getItem('loggedOut');
    
    if (loggedOut === 'true') {
      console.log('🔥 AuthContext: User explicitly logged out, staying logged out');
      setUser(null);
      return;
    }
    
    // Verificar se há um usuário salvo no localStorage
    const savedUser = localStorage.getItem('user');
    
    if (savedUser) {
      console.log('🔥 AuthContext: Found saved user in localStorage');
      setUser(JSON.parse(savedUser));
    } else {
      console.log('🔥 AuthContext: No saved user found, creating mock admin');
      // Simular usuário admin logado apenas se não há logout em andamento
      const mockAdmin: User = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        name: 'Administrador',
        role: 'admin'
      };
      setUser(mockAdmin);
      localStorage.setItem('user', JSON.stringify(mockAdmin));
    }
  }, []);

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  const login = async (username: string, password: string) => {
    console.log('🔥 AuthContext: login() called for:', username);
    
    // Limpar flag de logout
    localStorage.removeItem('loggedOut');
    console.log('🔥 AuthContext: Cleared logout flag');
    
    // Simular login bem-sucedido
    const mockAdmin: User = {
      id: 1,
      username: username,
      email: `${username}@example.com`,
      name: username === 'admin' ? 'Administrador' : 'Usuário',
      role: username === 'admin' ? 'admin' : 'user'
    };
    
    setUser(mockAdmin);
    localStorage.setItem('user', JSON.stringify(mockAdmin));
    console.log('🔥 AuthContext: User logged in successfully:', mockAdmin);
  };

  const logout = () => {
    console.log('🔥 AuthContext: logout() called');
    console.log('🔥 AuthContext: Current user before logout:', user);
    
    // Marcar que o usuário fez logout explicitamente
    localStorage.setItem('loggedOut', 'true');
    console.log('🔥 AuthContext: Marked as logged out');
    
    setUser(null);
    console.log('🔥 AuthContext: setUser(null) called');
    
    // Limpar localStorage se houver dados salvos
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('session');
    localStorage.removeItem('token');
    console.log('🔥 AuthContext: localStorage cleared');
    
    // Limpar sessionStorage também
    sessionStorage.clear();
    console.log('🔥 AuthContext: sessionStorage cleared');
    
    // Redirecionar para página de login
    console.log('🔥 AuthContext: Redirecting to /login');
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