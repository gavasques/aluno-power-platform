
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Bot } from "lucide-react";

const PromptsManager = () => {
  const prompts = [
    { id: 1, name: "Descrição de Produto", content: "Crie uma descrição...", category: "Marketing", usage: 1250 },
    { id: 2, name: "Análise de Mercado", content: "Analise o mercado...", category: "Análise", usage: 890 },
    { id: 3, name: "Estratégia de Preço", content: "Sugira estratégias...", category: "Preço", usage: 456 }
  ];

  return (
    <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-red-400" />
            <CardTitle className="text-slate-100">Prompts de IA</CardTitle>
          </div>
          <Button className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Novo Prompt
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="p-4 bg-slate-600/30 border border-red-500/20 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-slate-100">{prompt.name}</h3>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{prompt.category}</Badge>
              </div>
              <p className="text-sm text-slate-400 mb-3">{prompt.content}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">{prompt.usage} usos</span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="bg-slate-600/50 border-slate-500/30 text-slate-300 hover:bg-slate-500/50">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptsManager;
