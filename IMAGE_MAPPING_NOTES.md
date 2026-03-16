# Image Mapping Notes

## Overview

- **Signs True/False PDF**: 240 questions across 24 pages with 130 total images
- **Signs Multiple Choice PDF**: 137 questions across 14 pages with 137 total images

## Mapping Strategy - MANUALLY VERIFIED

All mappings have been created by analyzing the actual PDF page structure and image positions using PyMuPDF.

## Signs True/False (240 questions)

### Pages 1-20 (Questions 1-200)

- **Pattern**: 10 questions per page, 5 images per page
- **Ratio**: 2 questions per image (consistent)
- **Status**: ✅ Verified

### Page 21 (Questions 201-210)

- **Images**: 10 images
- **Ratio**: 1 question per image
- **Content**: Freeway signs (speed limits, exits, service areas)
- **Mapping**: Q201→img1, Q202→img2, ..., Q210→img10
- **Status**: ✅ Manually verified via PDF analysis

### Page 22 (Questions 211-220)

- **Images**: 8 images
- **Ratio**: Mixed (6 individual, 2 shared)
- **Mapping**:
  - Q211: img1 (Northbound)
  - Q212: img2 (Road closed warning)
  - Q213: img3 (Cone barricade)
  - Q214: img4 (Two exits sign)
  - Q215: img5 (Route destination)
  - Q216: img6 (Interchange exit)
  - Q217-218: img7 (Brake indicators - shared)
  - Q219-220: img8 (Charging/engine indicators - shared)
- **Status**: ✅ Manually verified via PDF analysis

### Page 23 (Questions 221-230)

- **Images**: 5 images
- **Ratio**: 2 questions per image
- **Content**: Dashboard indicators
- **Mapping**: Standard 2:1 ratio
- **Status**: ✅ Manually verified via PDF analysis

### Page 24 (Questions 231-240)

- **Images**: 7 images
- **Ratio**: Mixed
- **Mapping** (based on y-position analysis):
  - Q231-232: img2 (High beam / Fog lamp)
  - Q233-234: img3 (Safety belt / Air bag)
  - Q235-236: img4 (Emergency lights / Triangle)
  - Q237: img6 (Bike rider LEFT turn) 🚴
  - Q238: img7 (Bike rider RIGHT turn) 🚴
  - Q239: img1 (School Zone)
  - Q240: img5 (Pedestrian Zone)
- **Status**: ✅ Manually verified via PDF analysis

## Signs Multiple Choice (137 questions)

### Pages 1-13 (Questions 1-130)

- **Pattern**: 10 questions per page, 10 images per page
- **Ratio**: 1 question per image (consistent)
- **Mapping**: Q1→p1-img1, Q2→p1-img2, ..., Q10→p1-img10, Q11→p2-img1, etc.
- **Status**: ✅ Manually verified via PDF analysis

### Page 14 (Questions 131-137)

- **Images**: 7 images
- **Ratio**: 1 question per image
- **Content**: Various signs including bike rider gestures
- **Mapping**:
  - Q131: img1 (High speed rail station)
  - Q132: img2 (Bus/transit stations)
  - Q133: img3 (Bicycles only)
  - Q134: img4 (Diagonal pedestrian crossing)
  - Q135: img5 (Horizontal lines - slow down)
  - Q136: img6 (Bike rider RIGHT turn) 🚴
  - Q137: img7 (Bike rider deceleration/pause) 🚴
- **Status**: ✅ Manually verified via PDF analysis

## Methodology

The mapping was created using:

1. PyMuPDF to extract image positions (y-coordinates) from each page
2. Text extraction to identify question numbers and content
3. Manual correlation of image positions with question order
4. Verification of question content against expected image types

## Files

- `create_manual_mapping.py` - Manual mapping script based on PDF analysis
- `map_images_to_questions.py` - Old automated script (deprecated)
- `questions.json` - Output file with verified image mappings

## Notes

- **Signs True/False**: Images on page 24 are NOT in sequential order by y-position
- **Signs True/False**: Bike rider images (Q237-238) are separate JPEG files
- **Signs Multiple Choice**: Consistent 1:1 ratio throughout (simpler structure)
- **Signs Multiple Choice**: Bike rider images (Q136-137) on page 14
- All other images are PNG files
- **Total: 377 questions have images** (240 Signs T/F + 137 Signs MC)
