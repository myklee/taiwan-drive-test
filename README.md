# 🚗 Taiwan Drive Test

A web-based practice tool for the Taiwan driving license test, featuring all official questions with images and real-time answer checking.

## Features

- ✅ **1,469 Official Questions** - All questions from the 4 official PDFs
- 🖼️ **377 Images** - Traffic signs and road markings with accurate mappings
- 📊 **4 Question Categories**
  - Signs True/False (240 questions)
  - Signs Multiple Choice (137 questions)
  - Regulations True/False (652 questions)
  - Regulations Multiple Choice (440 questions)
- ⭐ **Favorites System** - Star questions for later review
- 📍 **Question Index** - Quick navigation with 5-column grid layout
- ✓ **Instant Feedback** - Real-time answer checking
- 📱 **Responsive Design** - Works on desktop and mobile

## Quick Start

1. Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/taiwan-drive-test.git
cd taiwan-drive-test
```

2. Open `index.html` in your browser, or serve it locally:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

3. Visit `http://localhost:8000` and start practicing!

## Project Structure

```
taiwan-drive-test/
├── index.html              # Main application
├── app.js                  # Application logic
├── questions.json          # All extracted questions (1,469 total)
├── public/
│   └── images/            # Traffic sign images (267 files)
├── res/                   # Original PDF files
├── extract-questions.js   # Question extraction script
├── extract_images.py      # Image extraction script
├── create_manual_mapping.py  # Manual image-to-question mapping
└── README.md
```

## Development

### Prerequisites

- Node.js (for question extraction)
- Python 3 with PyMuPDF (for image extraction)

### Extracting Questions from PDFs

If you need to re-extract questions from the PDFs:

```bash
npm install
node extract-questions.js
```

### Extracting Images

To extract images from the PDFs:

```bash
pip install PyMuPDF
python3 extract_images.py
python3 create_manual_mapping.py
```

## Data Sources

Questions and images are extracted from official Taiwan driving test PDFs:

- 汽車標誌是非題-英文 (Signs True/False)
- 汽車標誌選擇題-英文 (Signs Multiple Choice)
- 汽車法規是非題-英文 (Regulations True/False)
- 汽車法規選擇題-英文 (Regulations Multiple Choice)

## Image Mapping

All images are manually verified and mapped to their correct questions. See [IMAGE_MAPPING_NOTES.md](IMAGE_MAPPING_NOTES.md) for detailed mapping information.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is for educational purposes. All questions and images are property of the Taiwan Motor Vehicles Office.

## Acknowledgments

- Taiwan Motor Vehicles Office for the official test materials
- All contributors who helped verify question accuracy
