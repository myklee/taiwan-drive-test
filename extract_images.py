#!/usr/bin/env python3
import fitz  # PyMuPDF
import os
import json
from pathlib import Path

# Create output directory
output_dir = Path("public/images")
output_dir.mkdir(parents=True, exist_ok=True)

pdf_files = [
    {"path": "res/汽車標誌是非題-英文1131106.pdf", "type": "signs", "format": "true-false"},
    {"path": "res/汽車標誌選擇題-英文1131106.pdf", "type": "signs", "format": "multiple-choice"},
]

image_map = {}

for pdf_info in pdf_files:
    pdf_path = pdf_info["path"]
    pdf_type = pdf_info["type"]
    pdf_format = pdf_info["format"]
    
    print(f"Processing {pdf_path}...")
    
    # Open PDF
    doc = fitz.open(pdf_path)
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        
        # Get images on this page
        image_list = page.get_images()
        
        print(f"  Page {page_num + 1}: Found {len(image_list)} images")
        
        for img_index, img in enumerate(image_list):
            xref = img[0]
            
            # Extract image
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            
            # Save image
            image_filename = f"{pdf_type}-{pdf_format}-p{page_num + 1}-img{img_index + 1}.{image_ext}"
            image_path = output_dir / image_filename
            
            with open(image_path, "wb") as img_file:
                img_file.write(image_bytes)
            
            # Store in map
            key = f"{pdf_type}-{pdf_format}-page{page_num + 1}-img{img_index + 1}"
            image_map[key] = f"/images/{image_filename}"
            
            print(f"    Saved: {image_filename}")
    
    doc.close()

# Save image map
with open("image_map.json", "w") as f:
    json.dump(image_map, f, indent=2)

print(f"\nExtracted {len(image_map)} images")
print("Saved image map to image_map.json")
