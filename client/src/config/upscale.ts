import { Sparkles, Rocket } from "lucide-react";
import type { ScaleConfig } from "@/types/upscale";

export const SCALE_OPTIONS: ScaleConfig[] = [
  {
    value: 2,
    title: "2x Upscale",
    description: "Dobra a resolução rapidamente",
    time: "~30s",
    color: "blue",
  },
  {
    value: 4,
    title: "4x Upscale", 
    description: "Quadruplica a resolução com máxima qualidade",
    time: "~60s",
    color: "purple",
  },
];

export const UPSCALE_ICONS = {
  2: Sparkles,
  4: Rocket,
} as const;

export const FILE_VALIDATION = {
  allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
  maxSize: 25 * 1024 * 1024, // 25MB
  minDimensions: { width: 64, height: 64 },
} as const;

export const API_ENDPOINTS = {
  upload: '/api/image-upscale/upload',
  process: '/api/image-upscale/process',
  history: '/api/image-upscale/history',
  logs: '/api/ai-img-logs',
} as const;