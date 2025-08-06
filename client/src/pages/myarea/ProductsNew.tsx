/**
 * REDIRECT: ProductsNew -> ProductsPro
 * Consolidado em uma única rota para evitar duplicação
 */

import React, { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function ProductsNew() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Redirect to consolidated products page
    setLocation('/produtos-pro');
  }, [setLocation]);

  return null;
}