import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from 'lucide-react';
import { KnowledgeBaseManager } from '../../KnowledgeBaseManager';
import type { KnowledgeBaseTabProps } from '../types';

/**
 * KNOWLEDGE BASE TAB - FASE 4 REFATORAÇÃO
 * 
 * Componente de apresentação pura para aba de base de conhecimento
 * Responsabilidade única: Wrapper para o gerenciador de base de conhecimento
 */
export function KnowledgeBaseTab({ collections, isLoading }: KnowledgeBaseTabProps) {

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Gerenciamento de Base de Conhecimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Gerenciamento de Base de Conhecimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">
              📚 Sistema de Recuperação OpenAI (Retrieval)
            </h3>
            <p className="text-blue-700 text-sm mb-3">
              Faça upload de documentos para que os agentes OpenAI possam usar informações específicas 
              da sua empresa em suas respostas. Ideal para manuais, políticas, catálogos de produtos e conhecimento especializado.
            </p>
            <div className="text-xs text-blue-600 space-y-1">
              <div><strong>Tipos suportados:</strong> PDF, TXT, MD, DOCX (até 10MB cada)</div>
              <div><strong>Como usar:</strong> Ative "Recuperação de Informações" nas configurações do agente OpenAI</div>
              <div><strong>Funcionamento:</strong> O agente busca automaticamente nos documentos quando relevante para a pergunta</div>
            </div>
          </div>
          <KnowledgeBaseManager />
        </CardContent>
      </Card>
    </div>
  );
}