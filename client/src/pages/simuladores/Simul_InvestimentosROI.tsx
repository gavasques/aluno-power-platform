/**
 * Investment and ROI Simulator - Main Entry Point
 * 
 * This file serves as the main entry point for the Investment and ROI Simulator.
 * All business logic and UI components have been refactored into modular components
 * following SOLID principles for improved maintainability, testability, and reusability.
 * 
 * Refactored Architecture:
 * - Modular components for each UI section
 * - Custom hooks for business logic and API operations
 * - Utilities for common operations and formatting
 * - Type definitions in shared types file
 * - Local storage persistence utilities
 * 
 * Location: client/src/components/simulators/investment-roi/
 */

import InvestimentosROIRefactored from '@/components/simulators/investment-roi/InvestimentosROIRefactored';

export default function Simul_InvestimentosROI() {
  return <InvestimentosROIRefactored />;
}