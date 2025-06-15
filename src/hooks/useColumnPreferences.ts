
import { useState, useEffect } from "react";

const STORAGE_KEY = "product-list-visible-columns";

const defaultVisibleColumns = {
  photo: true,
  name: true,
  brand: true,
  category: true,
  sku: true,
  internalCode: false,
  status: true,
  channels: ["sitePropio", "amazonFBA", "mlFull"]
};

export interface ColumnPreferences {
  photo: boolean;
  name: boolean;
  brand: boolean;
  category: boolean;
  sku: boolean;
  internalCode: boolean;
  status: boolean;
  channels: string[];
}

export const useColumnPreferences = () => {
  const [columnPreferences, setColumnPreferences] = useState<ColumnPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultVisibleColumns;
    } catch {
      return defaultVisibleColumns;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columnPreferences));
  }, [columnPreferences]);

  const updateColumnVisibility = (column: keyof Omit<ColumnPreferences, 'channels'>, visible: boolean) => {
    setColumnPreferences(prev => ({
      ...prev,
      [column]: visible
    }));
  };

  const updateChannelVisibility = (channels: string[]) => {
    setColumnPreferences(prev => ({
      ...prev,
      channels
    }));
  };

  return {
    columnPreferences,
    updateColumnVisibility,
    updateChannelVisibility,
    // Mantém compatibilidade com o código existente
    visibleChannels: columnPreferences.channels,
    setVisibleChannels: updateChannelVisibility
  };
};
