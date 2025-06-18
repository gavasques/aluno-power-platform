import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star } from 'lucide-react';
import { ToolReviews } from '@/components/reviews/ToolReviews';
import { ToolDiscounts } from '@/components/discounts/ToolDiscounts';
import { ToolVideos } from '@/components/videos/ToolVideos';
import type { ToolTabsProps } from './ToolDetailTypes';

export const ToolContentTabs: React.FC<ToolTabsProps> = ({
  tool,
  hasVideos,
  user,
  isAdmin,
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
          <TabsTrigger 
            value="overview" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
          >
            Visão Geral
          </TabsTrigger>
          <TabsTrigger 
            value="reviews" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
          >
            Avaliações
          </TabsTrigger>
          <TabsTrigger 
            value="discounts" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
          >
            Descontos
          </TabsTrigger>
          {hasVideos && (
            <TabsTrigger 
              value="videos" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
            >
              Vídeos
            </TabsTrigger>
          )}
        </TabsList>

        <div className="p-6">
          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {tool.features && tool.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Funcionalidades
                  </h3>
                  <ul className="space-y-2">
                    {tool.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(tool.pros && tool.pros.length > 0) || (tool.cons && tool.cons.length > 0) ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Pontos Positivos e Negativos
                  </h3>
                  <div className="space-y-6">
                    {tool.pros && tool.pros.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-800 mb-2">
                          Pontos Positivos
                        </h4>
                        <ul className="space-y-1">
                          {tool.pros.map((pro, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-gray-700">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {tool.cons && tool.cons.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-800 mb-2">
                          Pontos Negativos
                        </h4>
                        <ul className="space-y-1">
                          {tool.cons.map((con, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-gray-700">{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-0">
            <ToolReviews toolId={tool.id} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="discounts" className="mt-0">
            <ToolDiscounts toolId={tool.id} isAdmin={false} />
          </TabsContent>

          {hasVideos && (
            <TabsContent value="videos" className="mt-0">
              <ToolVideos toolId={tool.id} />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
};