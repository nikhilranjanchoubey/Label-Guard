import { ImageQualityMetrics } from "./types";

/**
 * Evaluates image quality indicators in browser canvas before uploading.
 * Checks resolution, luminance, contrast, and gives an objective OCR readiness signal.
 * NOTE: These are optical clarity indicators and NOT legal compliance checks.
 */
export async function analyzeImageQualityClient(file: File): Promise<ImageQualityMetrics> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;

        // Create an offscreen canvas to sample pixels
        const canvas = document.createElement("canvas");
        // Limit sample size for fast instant computation
        const sampleWidth = Math.min(w, 400);
        const sampleHeight = Math.round((sampleWidth / w) * h);
        canvas.width = sampleWidth;
        canvas.height = sampleHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          return resolve(createFallbackMetrics(w, h));
        }

        ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
        const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
        const data = imageData.data;

        // Compute brightness & contrast via pixel luminance
        let totalLuminance = 0;
        const pixelCount = sampleWidth * sampleHeight;
        const luminances = new Float32Array(pixelCount);

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Standard ITU-R BT.601 luminance
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          luminances[i / 4] = lum;
          totalLuminance += lum;
        }

        const meanLuminance = totalLuminance / pixelCount;

        // Variance for contrast
        let varianceSum = 0;
        for (let i = 0; i < pixelCount; i++) {
          const diff = luminances[i] - meanLuminance;
          varianceSum += diff * diff;
        }
        const stdDevContrast = Math.sqrt(varianceSum / pixelCount);

        // Simple edge variance approximation for blur estimation
        let edgeDiffSum = 0;
        for (let y = 0; y < sampleHeight - 1; y++) {
          for (let x = 0; x < sampleWidth - 1; x++) {
            const idx = y * sampleWidth + x;
            const diffX = Math.abs(luminances[idx] - luminances[idx + 1]);
            const diffY = Math.abs(luminances[idx] - luminances[idx + sampleWidth]);
            edgeDiffSum += diffX + diffY;
          }
        }
        const edgeScore = edgeDiffSum / (pixelCount * 2);
        const isBlurry = edgeScore < 8.0;

        const orientation = w > h ? "landscape" : h > w ? "portrait" : "square";

        let ocrReadiness: "Ready" | "Suboptimal" | "Poor" = "Ready";
        if (w < 400 || h < 400 || (isBlurry && edgeScore < 5.0) || stdDevContrast < 20) {
          ocrReadiness = "Poor";
        } else if (isBlurry || meanLuminance < 45 || meanLuminance > 225 || stdDevContrast < 30) {
          ocrReadiness = "Suboptimal";
        }

        URL.revokeObjectURL(objectUrl);

        resolve({
          resolution: `${w}x${h}`,
          width: w,
          height: h,
          blurScore: Math.round(edgeScore * 10) / 10,
          isBlurry,
          brightness: Math.round(meanLuminance),
          contrast: Math.round(stdDevContrast),
          orientation,
          ocrReadiness,
        });
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for quality analysis"));
    };

    img.src = objectUrl;
  });
}

function createFallbackMetrics(w: number, h: number): ImageQualityMetrics {
  return {
    resolution: `${w}x${h}`,
    width: w,
    height: h,
    blurScore: 25.0,
    isBlurry: false,
    brightness: 128,
    contrast: 45,
    orientation: w > h ? "landscape" : "portrait",
    ocrReadiness: w >= 500 && h >= 500 ? "Ready" : "Suboptimal",
  };
}
