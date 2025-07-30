/**
 * PRESENTATION: InfographicPresentation
 * Pure UI component for advanced infographic generation functionality
 * Extracted from AdvancedInfographicGenerator.tsx (671 lines) for modularization
 */
import React, { memo } from 'react';
import { PermissionGuard } from '@/components/guards/PermissionGuard';
import Layout from '@/components/layout/Layout';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductInputStep } from './components/ProductInputStep';
import { ConceptSelectionStep } from './components/ConceptSelectionStep';
import { GenerationStep } from './components/GenerationStep';
import type { InfographicState, InfographicActions } from './types';

interface InfographicPresentationProps {
  state: InfographicState;
  departments: any[];
  actions: InfographicActions;
}

export const InfographicPresentation = memo<InfographicPresentationProps>(({
  state,
  departments,
  actions
}) => {
  const renderCurrentStep = () => {
    switch (state.session.step) {
      case 'input':
        return (
          <ProductInputStep
            state={state}
            departments={departments}
            onImageUpload={actions.handleImageUpload}
            onFormSubmit={actions.handleFormSubmit}
            onFormFieldChange={actions.updateFormField}
          />
        );

      case 'concepts':
        return (
          <ConceptSelectionStep
            concepts={state.session.concepts || []}
            selectedConceptId={state.session.selectedConceptId}
            onConceptSelect={actions.handleConceptSelect}
            onNext={() => {}} // Transition handled in action
          />
        );

      case 'prompt':
      case 'generating':
      case 'completed':
        const selectedConcept = state.session.concepts?.find(
          c => c.id === state.session.selectedConceptId
        );
        
        return (
          <GenerationStep
            session={state.session}
            selectedConcept={selectedConcept}
            showProcessingModal={state.showProcessingModal}
            loading={state.loading}
            onGenerate={actions.generateInfographic}
            onDownload={actions.downloadImage}
            onReset={actions.resetSession}
          />
        );

      default:
        return null;
    }
  };

  return (
    <PermissionGuard feature="agents.advanced_infographic">
      <Layout>
        <div className="container mx-auto px-4 py-8">
          {/* Navigation */}
          {state.session.step !== 'input' && (
            <div className="mb-6">
              <Link href="/agents">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para Agentes
                </Button>
              </Link>
            </div>
          )}

          {/* Main Content */}
          {renderCurrentStep()}
        </div>
      </Layout>
    </PermissionGuard>
  );
});