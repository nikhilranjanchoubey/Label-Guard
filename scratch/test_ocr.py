import sys
sys.path.append("ocr-service")
from app.ocr_engine import ocr_engine

with open("public/demo/tata-salt-back.jpg", "rb") as f:
    resp = ocr_engine.process_image(f.read())

print("Total items:", len(resp.items))
for it in resp.items[:20]:
    print(f'{it.id}: "{it.text}" | x:{it.boundingBox.x:.2f} y:{it.boundingBox.y:.2f} w:{it.boundingBox.width:.2f} h:{it.boundingBox.height:.2f}')
