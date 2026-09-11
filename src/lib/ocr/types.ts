export type OCRProcessingState =
  | "IDLE"
  | "UPLOADING"
  | "PROCESSING"
  | "OCR_RUNNING"
  | "OCR_COMPLETE"
  | "ERROR";

export type SurfaceType = "front" | "back" | "side" | "nutritional";

export interface BoundingBoxPercentage {
  x: number; // 0-100%
  y: number; // 0-100%
  width: number; // 0-100%
  height: number; // 0-100%
  pixelCoords?: number[][]; // [[x1,y1],[x2,y2],[x3,y3],[x4,y4]]
}

export interface ExtractionResult {
  id: string;
  text: string;
  confidence: number; // 0.0 - 1.0 (internal optical confidence score)
  language: "en" | "hi" | "mixed" | "numeric" | "symbol";
  boundingBox: BoundingBoxPercentage;
  sourceImageId: string;
  surface: SurfaceType;
}

export interface ImageQualityMetrics {
  resolution: string; // e.g. "2048x1536"
  width: number;
  height: number;
  blurScore: number;
  isBlurry: boolean;
  brightness: number;
  contrast: number;
  orientation: string;
  ocrReadiness: "Ready" | "Suboptimal" | "Poor";
}

export interface OCRDocument {
  imageId: string;
  surface: SurfaceType;
  imageWidth: number;
  imageHeight: number;
  processingTimeMs: number;
  overallConfidence: number;
  results: ExtractionResult[];
  languagesDetected: string[];
  quality?: ImageQualityMetrics;
  previewUrl?: string;
  isDemo: boolean;
}

export interface ScannedSurfaceItem {
  id: string;
  surface: SurfaceType;
  file?: File;
  previewUrl: string;
  quality?: ImageQualityMetrics;
  ocrResult?: OCRDocument;
  state: OCRProcessingState;
  errorMessage?: string;
}
