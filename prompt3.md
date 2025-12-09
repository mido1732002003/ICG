# AI Image Caption & Alt Text Generator

Build an AI-powered web application that generates descriptive captions and accessibility alt-text for uploaded images using computer vision and language models.

---

## Project Overview

Create a web tool that:
1. Accepts image uploads (drag & drop or file picker)
2. Generates multiple caption styles (short, detailed, creative)
3. Creates accessibility-friendly alt text
4. Supports batch processing for multiple images

---

## Tech Stack

- **Frontend**: React + Vite, Tailwind CSS
- **Backend**: Python + FastAPI
- **AI Models**: 
  - BLIP-2 or LLaVA for image captioning (via Hugging Face)
  - OR OpenAI GPT-4 Vision API
  - OR Mistral's vision model (when available)
- **Image Processing**: Pillow for preprocessing
- **Deployment**: Railway or Vercel

---

## Features Required

### 1. Image Upload
- Drag and drop interface
- File picker (supports JPG, PNG, WebP, GIF)
- URL input for web images
- Paste from clipboard
- Preview before processing

### 2. Caption Generation
- **Short Caption**: 1 sentence, social media style
- **Detailed Description**: Full paragraph describing the image
- **Alt Text**: Accessibility-focused, concise description
- **Creative/Poetic**: Artistic interpretation of the image

### 3. Customization Options
- Tone selector (Professional, Casual, Funny)
- Language selection (English, Arabic, etc.)
- Maximum length control
- Keywords to include/exclude

### 4. Batch Processing
- Upload multiple images at once
- Queue display with progress
- Download all results as JSON/CSV

### 5. History & Favorites
- Save generated captions
- Mark favorites
- Copy to clipboard with one click
- Re-generate with different settings

---

## UI/UX Requirements

- Dark theme consistent with portfolio
- Large drop zone with visual feedback
- Side-by-side image/caption display
- Skeleton loading states during AI processing
- Toast notifications for success/error
- Mobile-friendly responsive design

---

## API Endpoints

```
POST /api/caption - Generate captions for single image
POST /api/batch - Process multiple images
GET /api/history - Get caption history
POST /api/caption-url - Generate from image URL
```

---

## Request/Response Format

```json
// Request
{
  "image": "base64_encoded_image",
  "styles": ["short", "detailed", "alt"],
  "tone": "professional",
  "max_length": 150
}

// Response
{
  "image_id": "uuid",
  "captions": {
    "short": "A golden retriever playing in a sunny park",
    "detailed": "A happy golden retriever dog is running across...",
    "alt": "Dog running in grass field on sunny day"
  },
  "metadata": {
    "processing_time": 2.3,
    "model_used": "blip-2"
  }
}
```

---

## File Structure

```
image-captioner/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUpload/
│   │   │   ├── CaptionDisplay/
│   │   │   └── Settings/
│   │   ├── hooks/
│   │   └── services/
│   └── package.json
├── backend/
│   ├── api/
│   ├── services/
│   │   └── vision/
│   ├── models/
│   └── requirements.txt
└── README.md
```

---

## UI Layout

```
┌────────────────────────────────────────────────────────┐
│  🖼️ AI Image Captioner                    [History 📋] │
├────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │                                                    │ │
│ │     📤 Drop image here or click to upload         │ │
│ │                                                    │ │
│ │     Supports: JPG, PNG, WebP, GIF                 │ │
│ │                                                    │ │
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│ Settings:                                              │
│ ┌──────────────┐ ┌──────────────┐ ┌────────────────┐  │
│ │ Style: All ▼ │ │ Tone: Pro ▼  │ │ Length: 150 ▼ │  │
│ └──────────────┘ └──────────────┘ └────────────────┘  │
├────────────────────────────────────────────────────────┤
│ Results:                                               │
│ ┌─────────────────────┐ ┌────────────────────────────┐│
│ │                     │ │ 📝 Short Caption          ││
│ │   [Image Preview]   │ │ "A dog playing in park"   ││
│ │                     │ │                    [Copy] ││
│ │                     │ ├────────────────────────────┤│
│ │                     │ │ 📄 Detailed Description   ││
│ │                     │ │ "A joyful golden..."      ││
│ │                     │ │                    [Copy] ││
│ │                     │ ├────────────────────────────┤│
│ │                     │ │ ♿ Alt Text               ││
│ │                     │ │ "Dog in grass field"      ││
│ │                     │ │                    [Copy] ││
│ └─────────────────────┘ └────────────────────────────┘│
└────────────────────────────────────────────────────────┘
```

---

## Implementation Notes

- Compress images client-side before upload (max 2MB)
- Use web workers for heavy image processing
- Implement retry logic for AI API calls
- Add rate limiting to prevent abuse
- Cache results for identical images (hash-based)
- Include sample images for demo

---

## Deliverables

1. Complete web application with all features
2. Clean, well-structured code
3. API documentation
4. README with setup and usage instructions
5. Add to portfolio config with description
