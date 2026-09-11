import re
import time
import io
from typing import Tuple, List, Dict, Any
import numpy as np
from PIL import Image
import cv2

from app.models import (
    OCRItem,
    BoundingBoxCoord,
    ImageQualityMetrics,
    OCRResponse,
)

# Devanagari Unicode block range
DEVANAGARI_REGEX = re.compile(r"[\u0900-\u097F]")
LATIN_REGEX = re.compile(r"[a-zA-Z]")

def detect_script(text: str) -> str:
    """Classifies script as 'hi' (Hindi/Devanagari), 'en' (Latin/English), or 'mixed' without translation."""
    has_devanagari = bool(DEVANAGARI_REGEX.search(text))
    has_latin = bool(LATIN_REGEX.search(text))
    if has_devanagari and has_latin:
        return "mixed"
    elif has_devanagari:
        return "hi"
    elif has_latin:
        return "en"
    return "numeric" if any(c.isdigit() for c in text) else "symbol"

def evaluate_image_quality(image_np: np.ndarray) -> ImageQualityMetrics:
    """Calculates objective image quality metrics using OpenCV."""
    h, w = image_np.shape[:2]
    gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY) if len(image_np.shape) == 3 else image_np

    # 1. Blur score via Laplacian variance
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    is_blurry = laplacian_var < 80.0

    # 2. Brightness (mean pixel intensity)
    brightness = float(np.mean(gray))

    # 3. Contrast (pixel standard deviation)
    contrast = float(np.std(gray))
    is_low_contrast = contrast < 25.0

    # 4. Orientation ratio
    orientation = "landscape" if w > h else ("portrait" if h > w else "square")

    # 5. Overall readiness for OCR
    if (w < 300 or h < 300) or (is_blurry and laplacian_var < 40.0) or is_low_contrast:
        ocr_readiness = "Poor"
    elif is_blurry or brightness < 40.0 or brightness > 220.0:
        ocr_readiness = "Suboptimal"
    else:
        ocr_readiness = "Ready"

    return ImageQualityMetrics(
        resolution=f"{w}x{h}",
        width=w,
        height=h,
        blurScore=round(laplacian_var, 2),
        isBlurry=is_blurry,
        brightness=round(brightness, 2),
        contrast=round(contrast, 2),
        orientation=orientation,
        ocrReadiness=ocr_readiness,
    )

try:
    from paddlex.inference.models.runners.paddle_static import runner
    _orig_resolve = runner.resolve_paddle_static_engine_config
    runner.resolve_paddle_static_engine_config = lambda m, c: dict(
        _orig_resolve(m, c), run_mode='paddle', enable_new_ir=False
    )
except Exception as _patch_err:
    print(f"[OCREngine] Note on runner patch: {_patch_err}")

class OCREngine:
    def __init__(self):
        self._paddle_ocr = None
        self._init_attempted = False
        self._error_msg = None

    def _get_paddle_instance(self):
        """Lazy loads PaddleOCR instance supporting Hindi + English detection & recognition."""
        if not self._init_attempted:
            self._init_attempted = True
            try:
                from paddleocr import PaddleOCR
                # Initialize PaddleOCR with Hindi language (covers both Devanagari and English alphanumeric digits)
                try:
                    self._paddle_ocr = PaddleOCR(lang="hi")
                except TypeError:
                    self._paddle_ocr = PaddleOCR()
                print("[OCREngine] PaddleOCR initialized successfully with 'hi' (Hindi + English) model.")
            except Exception as e:
                self._error_msg = str(e)
                print(f"[OCREngine] PaddleOCR initialization warning/error: {e}")
        return self._paddle_ocr

    def process_image(self, image_bytes: bytes) -> OCRResponse:
        start_time = time.time()

        # Load image via PIL and convert to OpenCV format
        try:
            pil_image = Image.open(io.BytesIO(image_bytes))
            if pil_image.mode != "RGB":
                pil_image = pil_image.convert("RGB")
            image_np = np.array(pil_image)
            image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
        except Exception as e:
            return OCRResponse(
                success=False,
                processingTimeMs=0,
                imageWidth=0,
                imageHeight=0,
                items=[],
                overallConfidence=0.0,
                quality=ImageQualityMetrics(
                    resolution="0x0",
                    width=0,
                    height=0,
                    blurScore=0,
                    isBlurry=True,
                    brightness=0,
                    contrast=0,
                    orientation="unknown",
                    ocrReadiness="Poor",
                ),
                languagesDetected=[],
                error=f"Invalid image format: {str(e)}",
            )

        img_h, img_w = image_bgr.shape[:2]
        quality = evaluate_image_quality(image_bgr)

        # Run OCR extraction
        paddle = self._get_paddle_instance()
        ocr_items: List[OCRItem] = []
        languages_detected_set = set()

        if paddle is not None:
            try:
                # PaddleOCR 3.7.0 uses predict(image_bgr)
                predict_results = list(paddle.predict(image_bgr))
                if predict_results and isinstance(predict_results[0], dict):
                    res = predict_results[0]
                    rec_texts = res.get("rec_texts", [])
                    rec_scores = res.get("rec_scores", [])
                    dt_polys = res.get("dt_polys", [])

                    for idx, (text, score, poly) in enumerate(zip(rec_texts, rec_scores, dt_polys)):
                        text_str = str(text).strip()
                        if not text_str:
                            continue

                        confidence = float(score)
                        points = [[float(pt[0]), float(pt[1])] for pt in poly]

                        # Compute bounding box normalized percentages
                        xs = [p[0] for p in points]
                        ys = [p[1] for p in points]
                        min_x, max_x = max(0, min(xs)), min(img_w, max(xs))
                        min_y, max_y = max(0, min(ys)), min(img_h, max(ys))

                        box_x_pct = round((min_x / img_w) * 100, 2)
                        box_y_pct = round((min_y / img_h) * 100, 2)
                        box_w_pct = round(((max_x - min_x) / img_w) * 100, 2)
                        box_h_pct = round(((max_y - min_y) / img_h) * 100, 2)

                        script = detect_script(text_str)
                        if script in ("hi", "en", "mixed"):
                            languages_detected_set.add(script)

                        ocr_items.append(
                            OCRItem(
                                id=f"OCR-{idx+1:03d}",
                                text=text_str,
                                confidence=round(confidence, 4),
                                language=script,
                                boundingBox=BoundingBoxCoord(
                                    x=box_x_pct,
                                    y=box_y_pct,
                                    width=box_w_pct,
                                    height=box_h_pct,
                                    pixelCoords=[[int(round(p[0])), int(round(p[1]))] for p in points],
                                ),
                            )
                        )
                elif hasattr(paddle, "ocr"):
                    # Fallback for classic paddle.ocr API
                    result = paddle.ocr(image_bgr)
                    if result and result[0]:
                        for idx, line in enumerate(result[0]):
                            points = line[0]
                            text_info = line[1]
                            text_str = str(text_info[0]).strip()
                            confidence = float(text_info[1])
                            if not text_str:
                                continue

                            xs = [p[0] for p in points]
                            ys = [p[1] for p in points]
                            min_x, max_x = max(0, min(xs)), min(img_w, max(xs))
                            min_y, max_y = max(0, min(ys)), min(img_h, max(ys))

                            box_x_pct = round((min_x / img_w) * 100, 2)
                            box_y_pct = round((min_y / img_h) * 100, 2)
                            box_w_pct = round(((max_x - min_x) / img_w) * 100, 2)
                            box_h_pct = round(((max_y - min_y) / img_h) * 100, 2)

                            script = detect_script(text_str)
                            if script in ("hi", "en", "mixed"):
                                languages_detected_set.add(script)

                            ocr_items.append(
                                OCRItem(
                                    id=f"OCR-{idx+1:03d}",
                                    text=text_str,
                                    confidence=round(confidence, 4),
                                    language=script,
                                    boundingBox=BoundingBoxCoord(
                                        x=box_x_pct,
                                        y=box_y_pct,
                                        width=box_w_pct,
                                        height=box_h_pct,
                                        pixelCoords=[[int(round(p[0])), int(round(p[1]))] for p in points],
                                    ),
                                )
                            )
            except Exception as ocr_err:
                print(f"[OCREngine] Error during PaddleOCR execution: {ocr_err}")
                return OCRResponse(
                    success=False,
                    processingTimeMs=round((time.time() - start_time) * 1000, 2),
                    imageWidth=img_w,
                    imageHeight=img_h,
                    items=[],
                    overallConfidence=0.0,
                    quality=quality,
                    languagesDetected=[],
                    error=f"OCR engine execution failure: {str(ocr_err)}",
                )
        else:
            return OCRResponse(
                success=False,
                processingTimeMs=round((time.time() - start_time) * 1000, 2),
                imageWidth=img_w,
                imageHeight=img_h,
                items=[],
                overallConfidence=0.0,
                quality=quality,
                languagesDetected=[],
                error=f"PaddleOCR is not initialized: {self._error_msg or 'Module loading'}",
            )

        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        overall_conf = (
            round(sum(item.confidence for item in ocr_items) / len(ocr_items), 4)
            if ocr_items
            else 0.0
        )

        return OCRResponse(
            success=True,
            processingTimeMs=elapsed_ms,
            imageWidth=img_w,
            imageHeight=img_h,
            items=ocr_items,
            overallConfidence=overall_conf,
            quality=quality,
            languagesDetected=list(languages_detected_set),
        )

ocr_engine = OCREngine()
