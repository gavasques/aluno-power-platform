
import { useState, useEffect } from "react";

const STORAGE_KEY = "product-list-visible-channels";

const defaultVisibleChannels = ["sitePropio", "amazonFBA", "mlFull"];

export const useColumnPreferences = () => {
  const [visibleChannels, setVisibleChannels] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultVisibleChannels;
    } catch {
      return defaultVisibleChannels;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleChannels));
  }, [visibleChannels]);

  return {
    visibleChannels,
    setVisibleChannels
  };
};
