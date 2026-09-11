import sys
import json
import requests

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def test_step3_extraction():
    url = "http://localhost:3000/api/declarations/extract"

    # Test Case 1: Real test_sample_package.jpg via OCR API first
    print("--- TEST 1: Real Mixed Hindi + English Package Scan ---")
    ocr_res = requests.post(
        "http://localhost:3000/api/ocr",
        files={"file": ("sample.jpg", open("ocr-service/tata_salt_back.jpg", "rb"), "image/jpeg")},
        data={"surface": "back"}
    )
    assert ocr_res.status_code == 200, f"OCR failed: {ocr_res.text}"
    ocr_doc = ocr_res.json()["document"]
    print(f"OCR Items count: {len(ocr_doc['results'])}")

    dec_res = requests.post(url, json={"ocrDocument": ocr_doc, "sourceType": "PACKAGE_IMAGE"})
    assert dec_res.status_code == 200, f"Declarations extract failed: {dec_res.text}"
    dec_data = dec_res.json()["result"]

    print(f"Product Category: {dec_data['category']} (Confidence: {dec_data['categoryConfidence']})")
    print(f"Overall Extraction Confidence: {dec_data['overallExtractionConfidence']}")
    print(f"Engine: {dec_data['extractionEngine']}")

    detected = [f for f in dec_data["fields"] if f["status"] == "DETECTED"]
    ambiguous = [f for f in dec_data["fields"] if f["status"] == "AMBIGUOUS"]
    not_detected = [f for f in dec_data["fields"] if f["status"] == "NOT_DETECTED"]

    print(f"Counts: {len(detected)} Detected, {len(ambiguous)} Ambiguous, {len(not_detected)} Not Detected")
    for f in detected:
        print(f"  [DETECTED] {f['fieldType']}: {f.get('normalizedValue')} (Lang: {f.get('language')}, Conf: {f.get('confidence')}, SourceIds: {f.get('sourceOcrItemIds')})")

    # Test Case 2: Ambiguous Character Test (MRP 5O.00 where O is confusable with 0)
    print("\n--- TEST 2: Ambiguous Field Handling (MRP 5O.00) ---")
    ambig_ocr = {
        "imageId": "PKG-AMBIG",
        "surface": "back",
        "results": [
            {"id": "o-1", "text": "MRP 5O.00", "confidence": 0.72, "language": "en", "boundingBox": {"x": 10, "y": 10, "width": 30, "height": 8}},
            {"id": "o-2", "text": "शुद्ध मात्रा 1 किलोग्राम", "confidence": 0.98, "language": "hi", "boundingBox": {"x": 10, "y": 25, "width": 40, "height": 8}},
            {"id": "o-3", "text": "निर्माता: टाटा केमिकल्स लिमिटेड", "confidence": 0.95, "language": "hi", "boundingBox": {"x": 10, "y": 40, "width": 50, "height": 8}}
        ]
    }
    ambig_res = requests.post(url, json={"ocrDocument": ambig_ocr})
    assert ambig_res.status_code == 200
    ambig_data = ambig_res.json()["result"]

    mrp_field = next((f for f in ambig_data["fields"] if f["fieldType"] == "MRP"), None)
    assert mrp_field is not None, "MRP field missing"
    print(f"MRP Status: {mrp_field['status']}")
    print(f"Raw: {mrp_field['rawText']}, Norm: {mrp_field.get('normalizedValue')}, Suggested: {mrp_field.get('possibleInterpretation')}")
    assert mrp_field["status"] == "AMBIGUOUS"
    assert "0" in str(mrp_field.get("possibleInterpretation")), "Did not suggest zero substitution"

    # Test Case 3: Absent Field Handling (Not Detected)
    print("\n--- TEST 3: Absent Declarations (NOT_DETECTED) ---")
    absent_fields = [f["fieldType"] for f in ambig_data["fields"] if f["status"] == "NOT_DETECTED"]
    print(f"Fields properly marked NOT_DETECTED without hallucination: {len(absent_fields)}")
    print(f"Sample not detected fields: {absent_fields[:5]}")
    assert "EXPIRY_DATE" in absent_fields or "CONSUMER_CARE_PHONE" in absent_fields

    print("\n=== ALL STEP 3 TESTS PASSED CLEANLY! ===")

if __name__ == "__main__":
    test_step3_extraction()
