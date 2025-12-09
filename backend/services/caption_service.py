import base64
import hashlib
import io
import time
import os
import logging
import json
from typing import Dict, List, Optional
import httpx
from PIL import Image
from cachetools import TTLCache
from dotenv import load_dotenv

from models.schemas import (
    CaptionStyle, 
    Tone, 
    CaptionResult, 
    CaptionResponse, 
    CaptionMetadata
)

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

caption_cache: TTLCache = TTLCache(maxsize=100, ttl=3600)

HF_API_URL = "https://router.huggingface.co/v1/chat/completions"

class CaptionService:
    def __init__(self, hf_api_key: Optional[str] = None):
        self.api_key = hf_api_key or os.getenv("HF_API_TOKEN")
        if not self.api_key:
            logger.warning("HF_API_TOKEN not found in environment variables. Deep captioning will fail.")

    def _get_image_hash(self, image_data: bytes) -> str:
        return hashlib.md5(image_data).hexdigest()
    
    def _decode_base64_image(self, base64_string: str) -> bytes:
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]
        return base64.b64decode(base64_string)
    
    def _process_image(self, image_data: bytes, max_size: int = 1024) -> bytes:
        image = Image.open(io.BytesIO(image_data))
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")
        if max(image.size) > max_size:
            ratio = max_size / max(image.size)
            new_size = (int(image.size[0] * ratio), int(image.size[1] * ratio))
            image = image.resize(new_size, Image.Resampling.LANCZOS)
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=85)
        return buffer.getvalue()

    async def _call_hf_api(self, image_data: bytes, prompt: str) -> str:
        if not self.api_key:
            return "Error: HF_API_TOKEN not configured."
            
        try:
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            # Data URI format for standard OpenAI Vision API
            data_uri = f"data:image/jpeg;base64,{image_base64}"
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            # Using OpenAI Chat Completion format which is supported by HF Router
            payload = {
                "model": "Qwen/Qwen3-VL-30B-A3B-Instruct",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": data_uri
                                }
                            }
                        ]
                    }
                ],
                "max_tokens": 512,
                "temperature": 0.7
            }

            logger.info("Sending request to HF Router (Qwen3-VL)...")
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(HF_API_URL, json=payload, headers=headers)
                
                if response.status_code == 200:
                    result = response.json()
                    # Parse OpenAI-format response
                    # {'choices': [{'message': {'content': 'Caption...'}, ...}]}
                    choices = result.get("choices", [])
                    if choices and len(choices) > 0:
                        content = choices[0].get("message", {}).get("content", "")
                        logger.info(f"HF Success! Length: {len(content)}")
                        return content
                    else:
                        logger.warning(f"Unexpected JSON format: {result}")
                        return str(result)
                else:
                    logger.error(f"HF Error {response.status_code}: {response.text}")
                    return f"Error: {response.status_code} - {response.text}"
        except Exception as e:
            logger.error(f"HF Connection Error: {str(e)}")
            return f"Error: {str(e)}"
        return ""

    def _generate_style_variations(self, base_caption: str, styles: List[CaptionStyle], tone: Tone, max_length: int) -> CaptionResult:
        result = CaptionResult()
        if not base_caption: return result
        
        cleaned = base_caption.strip()
        
        for style in styles:
            if style == CaptionStyle.SHORT:
                result.short = cleaned.split('.')[0][:100]
            elif style == CaptionStyle.DETAILED:
                result.detailed = cleaned[:max_length]
            elif style == CaptionStyle.ALT:
                result.alt = cleaned.split('.')[0].lower()[:150]
            elif style == CaptionStyle.CREATIVE:
                result.creative = f"Visual: {cleaned[:50]}..."
        return result

    async def generate_captions(self, image_base64: str, styles: List[CaptionStyle], tone: Tone = Tone.PROFESSIONAL, max_length: int = 150) -> CaptionResponse:
        start_time = time.time()
        image_data = self._decode_base64_image(image_base64)
        processed_image = self._process_image(image_data)
        with Image.open(io.BytesIO(image_data)) as img: image_size = img.size

        prompt = "Describe this image in detail."
        base_caption = await self._call_hf_api(processed_image, prompt)
        
        if not base_caption or base_caption.startswith("Error"):
            logger.warning(f"HF Caption failed: {base_caption}")
            # Fallback or just return error (since fallback was likely Ollama which we just removed)
            if not base_caption: base_caption = "Error: Caption generation failed."

        return CaptionResponse(
            captions=self._generate_style_variations(base_caption, styles, tone, max_length),
            metadata=CaptionMetadata(processing_time=time.time()-start_time, model_used="HF-Qwen3-VL-30B", image_size=image_size)
        )

    async def generate_captions_from_url(self, url: str, styles: List[CaptionStyle], tone: Tone = Tone.PROFESSIONAL, max_length: int = 150) -> CaptionResponse:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            return await self.generate_captions(base64.b64encode(response.content).decode(), styles, tone, max_length)

caption_service = CaptionService()
