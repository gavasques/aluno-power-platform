import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, EyeOff, RotateCcw, Download } from 'lucide-react';
import { SOPRecommendation } from './types';

// Interfaces
interface RecommendationWithId extends SOPRecommendation {
  id: string;
  isIgnored: boolean;
  ignoredAt?: Date;
  ignoredReason?: string;
}

interface IgnoredRecommendation {
  id: string;
  keyword: string;
  campaign: string;
  ruleApplied: string;
  ignoredAt: Date;
  reason: string;
  criteria: {
    keyword: string;
    campaign: string;
    ruleType: string;
    actionType: string;
  };
}

// Funções auxiliares
const generateRecommendationId = (rec: SOPRecommendation): string => {
  // Criar um hash simples baseado nas propriedades
  const str = `${rec.keyword}-${rec.campaign}-${rec.ruleApplied}-${rec.currentBid}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Converter para hexadecimal e adicionar timestamp para garantir unicidade
  return Math.abs(hash).toString(16) + Date.now().toString(36).substring(-4);
};

const generateIgnoreCriteria = (recommendation: RecommendationWithId) => {
  return {
    keyword: recommendation.keyword,
    campaign: recommendation.campaign,
    ruleType: recommendation.ruleApplied.split(':')[0],
    actionType: recommendation.action.toLowerCase().includes('aumentar') ? 'increase' :
                recommendation.action.toLowerCase().includes('reduzir') ? 'decrease' :
                recommendation.action.toLowerCase().includes('desativar') ? 'disable' : 'other'
  };
};

// Sistema de persistência
const STORAGE_KEY = 'amazon_ads_ignored_recommendations';

const saveIgnoredRecommendations = (ignored: IgnoredRecommendation[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ignored));
  } catch (error) {
    console.error('Erro ao salvar recomendações ignoradas:', error);
  }
};

const loadIgnoredRecommendations = (): IgnoredRecommendation[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((item: any) => ({
        ...item,
        ignoredAt: new Date(item.ignoredAt)
      }));
    }
  } catch (error) {
    console.error('Erro ao carregar recomendações ignoradas:', error);
  }
  return [];
};

// Componente principal
interface RecommendationManagerProps {
  recommendations: SOPRecommendation[];
  onRecommendationsUpdate: (recommendations: RecommendationWithId[]) => void;
}

export const RecommendationManager: React.FC<RecommendationManagerProps> = ({
  recommendations,
  onRecommendationsUpdate
}) => {
  const [selectedRecommendations, setSelectedRecommendations] = useState<Set<string>>(new Set());
  const [ignoredRecommendations, setIgnoredRecommendations] = useState<IgnoredRecommendation[]>([]);
  const [showIgnored, setShowIgnored] = useState(false);
  const [ignoreReason, setIgnoreReason] = useState('');
  const [recommendationsWithId, setRecommendationsWithId] = useState<RecommendationWithId[]>([]);

  // Converter recomendações para formato com ID
  useEffect(() => {
    const ignored = loadIgnoredRecommendations();
    setIgnoredRecommendations(ignored);

    const recsWithId = recommendations.map(rec => {
      const id = generateRecommendationId(rec);
      const isIgnored = ignored.some(ig => 
        ig.criteria.keyword === rec.keyword &&
        ig.criteria.campaign === rec.campaign &&
        ig.criteria.ruleType === rec.ruleApplied.split(':')[0]
      );
      
      return {
        ...rec,
        id,
        isIgnored,
        ignoredAt: isIgnored ? ignored.find(ig => ig.id === id)?.ignoredAt : undefined,
        ignoredReason: isIgnored ? ignored.find(ig => ig.id === id)?.reason : undefined
      };
    });
    
    setRecommendationsWithId(recsWithId);
    onRecommendationsUpdate(recsWithId);
  }, [recommendations]);

  // Filtrar recomendações baseado no status
  const filteredRecommendations = recommendationsWithId.filter(rec => 
    showIgnored ? rec.isIgnored : !rec.isIgnored
  );

  const activeRecommendations = recommendationsWithId.filter(rec => !rec.isIgnored);
  const ignoredCount = recommendationsWithId.filter(rec => rec.isIgnored).length;

  const toggleRecommendationSelection = (id: string) => {
    const newSelected = new Set(selectedRecommendations);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRecommendations(newSelected);
  };

  const selectAllVisible = () => {
    const visibleIds = filteredRecommendations.map(rec => rec.id);
    setSelectedRecommendations(new Set(visibleIds));
  };

  const clearSelection = () => {
    setSelectedRecommendations(new Set());
  };

  const ignoreSelectedRecommendations = () => {
    if (selectedRecommendations.size === 0) return;

    const reason = ignoreReason.trim() || 'Desconsiderada pelo usuário';
    const now = new Date();
    const newIgnored: IgnoredRecommendation[] = [];
    
    const updatedRecommendations = recommendationsWithId.map(rec => {
      if (selectedRecommendations.has(rec.id)) {
        const ignoredRec: IgnoredRecommendation = {
          id: rec.id,
          keyword: rec.keyword,
          campaign: rec.campaign,
          ruleApplied: rec.ruleApplied,
          ignoredAt: now,
          reason,
          criteria: generateIgnoreCriteria(rec)
        };
        newIgnored.push(ignoredRec);

        return {
          ...rec,
          isIgnored: true,
          ignoredAt: now,
          ignoredReason: reason
        };
      }
      return rec;
    });

    const allIgnored = [...ignoredRecommendations, ...newIgnored];
    setIgnoredRecommendations(allIgnored);
    saveIgnoredRecommendations(allIgnored);
    
    setRecommendationsWithId(updatedRecommendations);
    onRecommendationsUpdate(updatedRecommendations);
    
    setSelectedRecommendations(new Set());
    setIgnoreReason('');
  };

  const restoreRecommendation = (id: string) => {
    const updatedRecommendations = recommendationsWithId.map(rec => {
      if (rec.id === id) {
        return {
          ...rec,
          isIgnored: false,
          ignoredAt: undefined,
          ignoredReason: undefined
        };
      }
      return rec;
    });

    const updatedIgnored = ignoredRecommendations.filter(ignored => ignored.id !== id);
    setIgnoredRecommendations(updatedIgnored);
    saveIgnoredRecommendations(updatedIgnored);

    setRecommendationsWithId(updatedRecommendations);
    onRecommendationsUpdate(updatedRecommendations);
  };

  const clearAllIgnored = () => {
    const updatedRecommendations = recommendationsWithId.map(rec => ({
      ...rec,
      isIgnored: false,
      ignoredAt: undefined,
      ignoredReason: undefined
    }));

    setIgnoredRecommendations([]);
    saveIgnoredRecommendations([]);
    setRecommendationsWithId(updatedRecommendations);
    onRecommendationsUpdate(updatedRecommendations);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header com controles */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">
            Gerenciamento de Recomendações
          </h3>
          <div className="flex space-x-2">
            <Badge variant={!showIgnored ? "default" : "secondary"}>
              Ativas: {activeRecommendations.length}
            </Badge>
            <Badge variant={showIgnored ? "default" : "secondary"}>
              Ignoradas: {ignoredCount}
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowIgnored(!showIgnored)}
          >
            {showIgnored ? (
              <>
                <Eye className="w-4 h-4 mr-1" />
                Ver Ativas
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 mr-1" />
                Ver Ignoradas
              </>
            )}
          </Button>
          
          {!showIgnored && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllVisible}
                disabled={filteredRecommendations.length === 0}
              >
                Selecionar Todas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                disabled={selectedRecommendations.size === 0}
              >
                Limpar Seleção
              </Button>
            </>
          )}

          {showIgnored && ignoredCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllIgnored}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Limpar Todas Ignoradas
            </Button>
          )}
        </div>
      </div>

      {/* Controles de ignorar */}
      {!showIgnored && selectedRecommendations.size > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">
              {selectedRecommendations.size} recomendação(ões) selecionada(s)
            </span>
            <input
              type="text"
              placeholder="Motivo para ignorar (opcional)"
              value={ignoreReason}
              onChange={(e) => setIgnoreReason(e.target.value)}
              className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
            />
            <Button
              onClick={ignoreSelectedRecommendations}
              variant="destructive"
              size="sm"
            >
              Ignorar Selecionadas
            </Button>
          </div>
        </div>
      )}

      {/* Lista de recomendações */}
      <div className="space-y-2">
        {filteredRecommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {showIgnored ? 'Nenhuma recomendação ignorada' : 'Nenhuma recomendação ativa'}
          </div>
        ) : (
          filteredRecommendations.map((recommendation) => (
            <div key={recommendation.id} className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                {!showIgnored && (
                  <Checkbox
                    checked={selectedRecommendations.has(recommendation.id)}
                    onCheckedChange={() => toggleRecommendationSelection(recommendation.id)}
                  />
                )}
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{recommendation.keyword}</span>
                      <Badge className={getPriorityColor(recommendation.priority)}>
                        {recommendation.priority}
                      </Badge>
                    </div>
                    {showIgnored && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreRecommendation(recommendation.id)}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Restaurar
                      </Button>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Campanha:</strong> {recommendation.campaign}</p>
                    <p><strong>Ação:</strong> {recommendation.action}</p>
                    <p><strong>Regra:</strong> {recommendation.ruleApplied}</p>
                    <p><strong>Justificativa:</strong> {recommendation.justification}</p>
                    {recommendation.isIgnored && recommendation.ignoredReason && (
                      <p className="text-red-600">
                        <strong>Motivo ignorado:</strong> {recommendation.ignoredReason}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <span>Lance: R$ {recommendation.currentBid.toFixed(2)} → R$ {recommendation.newBid.toFixed(2)}</span>
                    <span>Impacto: R$ {Math.abs(recommendation.estimatedImpact).toFixed(2)}</span>
                    <span>ACoS: {(recommendation.acos * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Função para converter recomendações
export const convertToRecommendationsWithId = (
  recommendations: SOPRecommendation[]
): RecommendationWithId[] => {
  const ignoredList = loadIgnoredRecommendations();
  
  return recommendations.map(rec => {
    const id = generateRecommendationId(rec);
    const ignoredItem = ignoredList.find(ig => 
      ig.criteria.keyword === rec.keyword &&
      ig.criteria.campaign === rec.campaign &&
      ig.criteria.ruleType === rec.ruleApplied.split(':')[0]
    );
    
    return {
      ...rec,
      id,
      isIgnored: !!ignoredItem,
      ignoredAt: ignoredItem?.ignoredAt,
      ignoredReason: ignoredItem?.reason
    };
  });
};