// Refactored Provider Configuration - Main entry point using modular components
import ProviderConfigurationRefactored from './provider-config/ProviderConfigurationRefactored';
import { ProviderConfigurationProps } from './provider-config/types';

export default function ProviderConfiguration(props: ProviderConfigurationProps) {
  return <ProviderConfigurationRefactored {...props} />;
}