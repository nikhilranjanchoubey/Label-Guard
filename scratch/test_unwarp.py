import cv2
from paddleocr import PaddleOCR

# Test without document orientation/unwarping pipeline
ocr = PaddleOCR(use_doc_orientation_classify=False, use_doc_unwarping=False, lang="hi")
res = list(ocr.predict("public/demo/tata-salt-back.jpg"))[0]
print("Keys in result:", res.keys())
for i, (t, p) in enumerate(zip(res["rec_texts"][:10], res["dt_polys"][:10])):
    xs = [pt[0] for pt in p]
    ys = [pt[1] for pt in p]
    print(f"{t}: x=[{min(xs):.1f}, {max(xs):.1f}]")
