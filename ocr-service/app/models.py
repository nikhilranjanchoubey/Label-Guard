from typing import List, Optional
from pydantic import BaseModel, Field

class BoundingBoxCoord(BaseModel):
    x: float = Field(..., description="Top-left X coordinate percentage (0-100)")
    y: float = Field(..., description="Top-left Y coordinate percentage (0-100)")
    width: float = Field(..., description="Width percentage (0-100)")
    height: float = Field(..., description="Height percentage (0-100)")
    pixelCoords: Optional[List[List[int]]] = Field(None, description="Raw 4 polygon points [[x1,y1],[x2,y2],[x3,y3],[x4,y4]]")

class OCRItem(BaseModel):
    id: str
    text: str
    confidence: float
    language: str  # "en", "hi", "mixed"
    boundingBox: BoundingBoxCoord

class ImageQualityMetrics(BaseModel):
    resolution: str  # e.g. "2048x1536"
    width: int
    height: int
    blurScore: float  # Laplacian variance
    isBlurry: bool
    brightness: float  # 0 - 255
    contrast: float  # std dev
    orientation: str  # "normal", "rotated_90", etc.
    ocrReadiness: str  # "Ready", "Suboptimal", "Poor"

class OCRResponse(BaseModel):
    success: bool
    processingTimeMs: float
    imageWidth: int
    imageHeight: int
    items: List[OCRItem]
    overallConfidence: float
    quality: ImageQualityMetrics
    languagesDetected: List[str]
    error: Optional[str] = None
