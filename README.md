# AI Image Caption & Alt Text Generator

An AI-powered web application that generates descriptive captions and accessibility alt-text for uploaded images using the BLIP vision model.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-green.svg)
![React](https://img.shields.io/badge/react-18.2-blue.svg)

## Features

- 🖼️ **Multiple Upload Methods**: Drag & drop, file picker, URL input, clipboard paste
- 📝 **Multiple Caption Styles**: Short, detailed, alt-text, and creative captions
- 🎭 **Tone Selection**: Professional, casual, or funny styles
- 📦 **Batch Processing**: Upload and process multiple images at once
- 📋 **History & Favorites**: Save and revisit generated captions
- 📊 **Export Options**: Download results as JSON or CSV
- 🌙 **Dark Theme**: Modern, accessible dark UI with glassmorphism effects
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Dropzone (drag & drop)
- React Hot Toast (notifications)
- Axios (API client)

### Backend
- Python 3.9+
- FastAPI
- Hugging Face BLIP Model (via Inference API)
- Pillow (image processing)

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- (Optional) Hugging Face API token for faster processing

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd image-captioner
   ```

2. **Set up the backend**
   ```bash
   cd backend
   python -m venv venv
   
   # Windows
   .\venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   
   pip install -r requirements.txt
   ```

3. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   python -m uvicorn main:app --reload --port 8000
   ```

2. **Start the frontend dev server** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open in browser**: http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/caption` | Generate captions for base64 image |
| POST | `/api/caption-url` | Generate captions from image URL |
| POST | `/api/batch` | Process multiple images |
| GET | `/api/history` | Get caption history |
| POST | `/api/history/{id}/favorite` | Toggle favorite status |
| DELETE | `/api/history/{id}` | Delete history item |

### Request Example

```json
{
  "image": "base64_encoded_image_data",
  "styles": ["short", "detailed", "alt"],
  "tone": "professional",
  "max_length": 150
}
```

### Response Example

```json
{
  "image_id": "uuid",
  "captions": {
    "short": "A golden retriever playing in a sunny park",
    "detailed": "This image shows a golden retriever dog running...",
    "alt": "dog running in grass field on sunny day"
  },
  "metadata": {
    "processing_time": 2.3,
    "model_used": "blip-image-captioning-large",
    "image_size": [1920, 1080]
  }
}
```

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Optional: For faster Hugging Face API access
HF_API_TOKEN=your_hugging_face_token
```

## Project Structure

```
image-captioner/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUpload.jsx
│   │   │   ├── CaptionDisplay.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── History.jsx
│   │   │   └── BatchProcessor.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── api/
│   │   └── router.py
│   ├── services/
│   │   └── caption_service.py
│   ├── models/
│   │   └── schemas.py
│   ├── main.py
│   └── requirements.txt
└── README.md
```

## License

MIT License - see LICENSE file for details.
