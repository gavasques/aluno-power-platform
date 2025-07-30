/**
 * MAIN EXPORT: SupplierInfoDisplayRefactored
 * Refactored from 675-line monolithic component to modular architecture
 * Follows Container/Presentational pattern established in replit.md
 */
import type { Supplier } from '@shared/schema';
import { SupplierInfoContainer } from './SupplierInfoContainer';

interface SupplierInfoDisplayRefactoredProps {
  supplier: Supplier;
}

export default function SupplierInfoDisplayRefactored({ supplier }: SupplierInfoDisplayRefactoredProps) {
  return <SupplierInfoContainer supplier={supplier} />;
}