
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
    <Card className="bg-white border border-border shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">Prompts de IA</CardTitle>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Prompt
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="p-4 bg-gray-50 border border-border rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-foreground">{prompt.name}</h3>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">{prompt.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{prompt.content}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{prompt.usage} usos</span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="text-foreground border-border hover:bg-gray-100">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive">
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
