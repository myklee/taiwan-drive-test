#!/usr/bin/env python3
import json
from pathlib import Path

# Load existing questions
with open("questions.json", "r") as f:
    questions = json.load(f)

# MANUAL MAPPING based on detailed page analysis
# This maps each question number to its correct image file

manual_mapping = {}

# Pages 1-20: Standard pattern - 2 questions per image, 5 images per page
for page in range(1, 21):
    for q_offset in range(10):  # 10 questions per page
        q_num = (page - 1) * 10 + q_offset + 1
        img_num = (q_offset // 2) + 1  # 2 questions per image
        manual_mapping[q_num] = f"signs-true-false-p{page}-img{img_num}"

# PAGE 21: 10 images, 10 questions - 1 question per image
# Images are in order from top to bottom
page21_mapping = {
    201: 1, 202: 2, 203: 3, 204: 4, 205: 5,
    206: 6, 207: 7, 208: 8, 209: 9, 210: 10
}
for q_num, img_num in page21_mapping.items():
    manual_mapping[q_num] = f"signs-true-false-p21-img{img_num}"

# PAGE 22: 8 images, 10 questions
# Based on y-positions and question content:
# Image 1 (y=114): Q211 Northbound
# Image 2 (y=177): Q212 road closed warning
# Image 3 (y=243): Q213 cone barricade
# Image 4 (y=311): Q214 two exits sign
# Image 5 (y=380): Q215 route destination
# Image 6 (y=451): Q216 interchange exit
# Image 7 (y=512): Q217-218 brake indicators (dashboard)
# Image 8 (y=650): Q219-220 charging/engine indicators (dashboard)
page22_mapping = {
    211: 1, 212: 2, 213: 3, 214: 4, 215: 5, 216: 6,
    217: 7, 218: 7,  # Share image 7 (brake indicators)
    219: 8, 220: 8   # Share image 8 (charging/engine)
}
for q_num, img_num in page22_mapping.items():
    manual_mapping[q_num] = f"signs-true-false-p22-img{img_num}"

# PAGE 23: 5 images, 10 questions - 2 questions per image
# Images evenly spaced, dashboard indicators
page23_mapping = {
    221: 1, 222: 1,  # Low oil pressure / Low fuel
    223: 2, 224: 2,  # Engine breakdown / Charging
    225: 3, 226: 3,  # Low fuel / Low oil pressure
    227: 4, 228: 4,  # Door-open / Turn signals
    229: 5, 230: 5   # Turn signals / Vehicle width
}
for q_num, img_num in page23_mapping.items():
    manual_mapping[q_num] = f"signs-true-false-p23-img{img_num}"

# PAGE 24: 7 images, 10 questions
# Based on y-positions (sorted):
# Image 2 (y=120): Q231-232 High beam / Fog lamp
# Image 3 (y=245): Q233-234 Safety belt / Air bag
# Image 4 (y=377): Q235-236 Emergency lights / Triangle
# Image 6 (y=504): Q237 Bike rider LEFT turn
# Image 7 (y=570): Q238 Bike rider RIGHT turn
# Image 1 (y=636): Q239 School Zone
# Image 5 (y=704): Q240 Pedestrian Zone
page24_mapping = {
    231: 2, 232: 2,  # High beam / Fog lamp
    233: 3, 234: 3,  # Safety belt / Air bag
    235: 4, 236: 4,  # Emergency / Triangle
    237: 6,          # Bike LEFT turn
    238: 7,          # Bike RIGHT turn
    239: 1,          # School Zone
    240: 5           # Pedestrian Zone
}
for q_num, img_num in page24_mapping.items():
    manual_mapping[q_num] = f"signs-true-false-p24-img{img_num}"

print("Manual mapping created for Signs True/False questions 1-240")
print("\nApplying mapping...")

# Apply mapping to questions
images_dir = Path("public/images")
mapped_count = 0

for question in questions:
    if question["type"] == "signs" and question["format"] == "true-false":
        q_num = question["number"]
        
        if q_num in manual_mapping:
            img_base = manual_mapping[q_num]
            
            # Find the actual file (could be .png or .jpeg)
            matching_files = list(images_dir.glob(f"{img_base}.*"))
            
            if matching_files:
                question["image"] = f"/images/{matching_files[0].name}"
                mapped_count += 1
                if q_num >= 201:  # Show mapping for pages 21-24
                    print(f"Q{q_num}: {matching_files[0].name}")
            else:
                print(f"WARNING: No image file found for Q{q_num} ({img_base})")
                question["image"] = None
        else:
            print(f"WARNING: No mapping defined for Q{q_num}")
            question["image"] = None

# Apply standard mapping for Signs Multiple Choice
# Pages 1-13: 10 images per page, 1 question per image
# Page 14: 7 images for Q131-137
for question in questions:
    if question["type"] == "signs" and question["format"] == "multiple-choice":
        q_num = question["number"]
        
        if q_num <= 130:
            # Pages 1-13: 10 questions per page, 1 question per image
            page_num = ((q_num - 1) // 10) + 1
            img_num = ((q_num - 1) % 10) + 1
        else:
            # Page 14: Q131-137
            page_num = 14
            img_num = q_num - 130  # Q131->img1, Q132->img2, etc.
        
        img_pattern = f"signs-multiple-choice-p{page_num}-img{img_num}.*"
        matching_imgs = list(images_dir.glob(img_pattern))
        
        if matching_imgs:
            question["image"] = f"/images/{matching_imgs[0].name}"
            if q_num >= 131:  # Show mapping for last page
                print(f"Q{q_num}: {matching_imgs[0].name}")
        else:
            print(f"WARNING: No image file found for Q{q_num} (p{page_num}-img{img_num})")

# Save updated questions
with open("questions.json", "w") as f:
    json.dump(questions, f, indent=2)

print(f"\n✓ Mapped {mapped_count} Signs True/False questions")
print(f"✓ Total questions with images: {sum(1 for q in questions if q.get('image'))}")
print("✓ Saved to questions.json")
