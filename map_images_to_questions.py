#!/usr/bin/env python3
import json
from pathlib import Path

# Load existing questions
with open("questions.json", "r") as f:
    questions = json.load(f)

# Load image map
with open("image_map.json", "r") as f:
    image_map = json.load(f)

# Map images to questions
# Pattern: 10 questions per page, 5 images per page
# So questions 1-2 use img1, 3-4 use img2, 5-6 use img3, 7-8 use img4, 9-10 use img5

for question in questions:
    if question["type"] == "signs":
        q_num = question["number"]
        pdf_format = question["format"]
        
        # Calculate page number (10 questions per page)
        page_num = ((q_num - 1) // 10) + 1
        
        # Calculate which image on that page (2 questions per image)
        img_num = ((q_num - 1) % 10) // 2 + 1
        
        # Build image key
        image_key = f"signs-{pdf_format}-page{page_num}-img{img_num}"
        
        if image_key in image_map:
            question["image"] = image_map[image_key]
            print(f"Q{q_num}: Mapped to {image_map[image_key]}")
        else:
            print(f"Q{q_num}: No image found for {image_key}")

# Save updated questions
with open("questions.json", "w") as f:
    json.dump(questions, f, indent=2)

# Count how many questions have images
with_images = sum(1 for q in questions if q.get("image"))
print(f"\n{with_images} questions now have images")
