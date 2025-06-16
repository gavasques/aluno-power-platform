
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePrompts } from '@/contexts/PromptsContext';
import { Button } from '@/components/ui/button';
import { BrainCircuit } from 'lucide-react';
import { PromptDetailHeader } from '@/components/prompts/PromptDetailHeader';
import { PromptImages } from '@/components/prompts/PromptImages';
import { PromptContent } from '@/components/prompts/PromptContent';
import { PromptInfo } from '@/components/prompts/PromptInfo';

const PromptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPromptById } = usePrompts();

  const prompt = getPromptById(id || '');

  if (!prompt) {
    return (
      <div className="w-full p-6">
        <div className="text-center py-12">
          <BrainCircuit className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Prompt não encontrado</h3>
          <p className="text-muted-foreground mb-4">
            O prompt solicitado não existe ou foi removido.
          </p>
          <Button onClick={() => navigate('/hub/prompts-ia')}>
            Voltar para Prompts IA
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6">
      <PromptDetailHeader prompt={prompt} />
      
      <PromptImages images={prompt.images || []} />
      
      <PromptInfo 
        description={prompt.description}
        usageExamples={prompt.usageExamples}
        categoryName={prompt.category.name}
      />
      
      <PromptContent 
        content={prompt.content}
        title={prompt.title}
      />
    </div>
  );
};

export default PromptDetail;
