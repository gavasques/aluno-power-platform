import React, { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useQuery } from '@tanstack/react-query';
import type { Agent } from '@shared/schema';
import { List } from 'lucide-react';

import { useBulletPointsGenerator } from '@/hooks/useBulletPointsGenerator';
import { BulletPointsInput } from '@/components/agents/BulletPointsInput';
import { BulletPointsOutput } from '@/components/agents/BulletPointsOutput';
import { ReplaceDialog } from '@/components/agents/ReplaceDialog';
import { BULLET_POINTS_CONFIG } from '@/lib/bulletPointsConfig';

const BulletPointsAgent: React.FC = () => {
  const { data: agent } = useQuery<Agent>({
    queryKey: ['/api/agents/bullet-points-generator'],
    enabled: true,
  });

  const {
    state,
    updateState,
    updateAgentConfig,
    generateWithAI,
    copyBulletPoints,
    handleReplace,
    handleKeepBoth,
    handleClearAll
  } = useBulletPointsGenerator({ agent });

  useEffect(() => {
    updateAgentConfig();
  }, [updateAgentConfig]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <List className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Gerador de Bullet Points
                </h1>
                <p className="text-lg text-gray-600 mt-1">
                  Crie bullet points persuasivos para produtos Amazon com alta conversão
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 min-h-[calc(100vh-280px)]">
            <BulletPointsInput
              formData={{
                productName: state.productName,
                brand: state.brand,
                textInput: state.textInput,
                targetAudience: state.targetAudience,
                keywords: state.keywords,
                uniqueDifferential: state.uniqueDifferential,
                materials: state.materials,
                warranty: state.warranty
              }}
              onChange={(field, value) => updateState({ [field]: value })}
              onGenerate={generateWithAI}
              onClear={handleClearAll}
              isGenerating={state.isGenerating}
              maxChars={BULLET_POINTS_CONFIG.MAX_CHARS}
              warningThreshold={BULLET_POINTS_CONFIG.WARNING_THRESHOLD}
            />

            <BulletPointsOutput
              value={state.bulletPointsOutput}
              onChange={(value) => updateState({ bulletPointsOutput: value })}
              onCopy={copyBulletPoints}
            />
          </div>
        </div>
      </div>

      <ReplaceDialog
        open={state.showReplaceDialog}
        onOpenChange={(open) => updateState({ showReplaceDialog: open })}
        onReplace={handleReplace}
        onKeepBoth={handleKeepBoth}
      />
    </Layout>
  );
};

export default BulletPointsAgent;