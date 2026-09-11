from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import OCRResponse
from app.ocr_engine import ocr_engine

app = FastAPI(
    title="LabelGuard OCR Microservice",
    version="1.0.0",
    description="Bilingual English + Hindi packaged commodity OCR extraction service using PaddleOCR and OpenCV",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "LabelGuard OCR Microservice",
        "engine": "PaddleOCR + OpenCV",
        "supported_languages": ["en", "hi"],
    }

@app.post("/ocr/extract", response_model=OCRResponse)
async def extract_text(file: UploadFile = File(...)):
    # Validate MIME type
    if file.content_type not in ["image/jpeg", "image/png", "image/webp", "image/bmp"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image type: {file.content_type}. Please upload JPEG, PNG, or WEBP.",
        )

    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")
        if len(contents) > 15 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds 15MB maximum limit.")

        response = ocr_engine.process_image(contents)
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
