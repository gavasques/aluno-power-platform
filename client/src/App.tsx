import React from 'react';
import { Router } from "wouter";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Login from '@/pages/Login';
import Dashboard from '@/pages/user/Dashboard';

console.log('📱 App.tsx loaded - imports successful');

// Main App Router
function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('🔍 App Router State:', { isAuthenticated, isLoading });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🔐 User not authenticated, showing login');
    return <Login />;
  }

  console.log('✅ User authenticated, showing dashboard');
  return <Dashboard />;
}

// Main App Component
export default function App() {
  console.log('🚀 App component rendering');
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <Router>
            <AppRouter />
            <Toaster />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}