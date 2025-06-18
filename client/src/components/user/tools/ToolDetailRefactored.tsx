import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useTools } from "@/contexts/ToolsContext";
import { useAuth } from "@/contexts/AuthContext";
import { ToolNavigation } from './ToolNavigation';
import { ToolHeader } from './ToolHeader';
import { ToolContentTabs } from './ToolContentTabs';

const ToolDetailRefactored = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tools, toolTypes } = useTools();
  const { user, isAdmin } = useAuth();

  const tool = tools.find(t => t.id.toString() === id);

  // Fetch videos to check if tab should be shown
  const { data: videos = [] } = useQuery({
    queryKey: ['/api/tools', tool?.id, 'videos'],
    queryFn: () => fetch(`/api/tools/${tool?.id}/videos`).then(res => res.json()),
    enabled: !!tool,
  });

  const handleBackNavigation = () => {
    navigate("/hub/ferramentas");
  };

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ferramenta não encontrada</h2>
          <Button onClick={handleBackNavigation}>
            Voltar para Ferramentas
          </Button>
        </div>
      </div>
    );
  }

  const toolType = toolTypes.find(t => t.id === tool.typeId);
  const hasVideos = videos && videos.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <ToolNavigation onBack={handleBackNavigation} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ToolHeader tool={tool} toolType={toolType} />
        
        <ToolContentTabs 
          tool={tool}
          hasVideos={hasVideos}
          user={user}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
};

export default ToolDetailRefactored;