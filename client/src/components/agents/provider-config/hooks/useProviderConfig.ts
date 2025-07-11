// Custom Hook for Provider Configuration Logic - Centralized state management

import { useMemo } from 'react';
import { ProviderConfigurationProps, ProviderConfigHookReturn, BaseFormData } from '../types';
import { DEFAULT_FORM_DATA } from '../constants';

export function useProviderConfig(props: ProviderConfigurationProps): ProviderConfigHookReturn {
  const isMultiStepMode = 'selectedProvider' in props && props.selectedProvider !== undefined;
  
  // Create unified formData with proper defaults
  const formData = useMemo((): BaseFormData => {
    if (isMultiStepMode) {
      return {
        ...DEFAULT_FORM_DATA,
        provider: props.selectedProvider || DEFAULT_FORM_DATA.provider,
        model: props.selectedModel || DEFAULT_FORM_DATA.model,
        temperature: props.temperature || DEFAULT_FORM_DATA.temperature,
        maxTokens: props.maxTokens || DEFAULT_FORM_DATA.maxTokens,
      };
    }
    return { ...DEFAULT_FORM_DATA, ...props.formData };
  }, [isMultiStepMode, props.selectedProvider, props.selectedModel, props.temperature, props.maxTokens, props.formData]);

  // Memoized update functions to prevent unnecessary re-renders
  const updateProvider = useMemo(() => (value: string) => {
    if (isMultiStepMode && props.onProviderChange) {
      props.onProviderChange(value);
    } else if (props.setFormData) {
      props.setFormData({ ...formData, provider: value, model: '' });
    }
  }, [isMultiStepMode, props.onProviderChange, props.setFormData, formData]);

  const updateModel = useMemo(() => (value: string) => {
    if (isMultiStepMode && props.onModelChange) {
      props.onModelChange(value);
    } else if (props.setFormData) {
      props.setFormData({ ...formData, model: value });
    }
  }, [isMultiStepMode, props.onModelChange, props.setFormData, formData]);

  const updateTemperature = useMemo(() => (value: number) => {
    if (isMultiStepMode && props.onTemperatureChange) {
      props.onTemperatureChange(value);
    } else if (props.setFormData) {
      props.setFormData({ ...formData, temperature: value });
    }
  }, [isMultiStepMode, props.onTemperatureChange, props.setFormData, formData]);

  const updateMaxTokens = useMemo(() => (value: number) => {
    if (isMultiStepMode && props.onMaxTokensChange) {
      props.onMaxTokensChange(value);
    } else if (props.setFormData) {
      props.setFormData({ ...formData, maxTokens: value });
    }
  }, [isMultiStepMode, props.onMaxTokensChange, props.setFormData, formData]);

  const updateAdvancedSettings = useMemo(() => (settings: any) => {
    if (isMultiStepMode && props.onAdvancedSettingsChange) {
      props.onAdvancedSettingsChange(settings);
    } else if (props.setFormData) {
      props.setFormData({ ...formData, ...settings });
    }
  }, [isMultiStepMode, props.onAdvancedSettingsChange, props.setFormData, formData]);

  return {
    formData,
    isMultiStepMode,
    updateProvider,
    updateModel,
    updateTemperature,
    updateMaxTokens,
    updateAdvancedSettings
  };
}