from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
import uuid
from datetime import datetime


class CaptionStyle(str, Enum):
    SHORT = "short"
    DETAILED = "detailed"
    ALT = "alt"
    CREATIVE = "creative"


class Tone(str, Enum):
    PROFESSIONAL = "professional"
    CASUAL = "casual"
    FUNNY = "funny"


class CaptionRequest(BaseModel):
    image: str = Field(..., description="Base64 encoded image data")
    styles: List[CaptionStyle] = Field(
        default=[CaptionStyle.SHORT, CaptionStyle.DETAILED, CaptionStyle.ALT],
        description="Caption styles to generate"
    )
    tone: Tone = Field(default=Tone.PROFESSIONAL, description="Tone of the caption")
    max_length: int = Field(default=150, ge=10, le=500, description="Maximum caption length")
    language: str = Field(default="en", description="Language code for captions")


class CaptionURLRequest(BaseModel):
    url: str = Field(..., description="URL of the image to caption")
    styles: List[CaptionStyle] = Field(
        default=[CaptionStyle.SHORT, CaptionStyle.DETAILED, CaptionStyle.ALT]
    )
    tone: Tone = Field(default=Tone.PROFESSIONAL)
    max_length: int = Field(default=150, ge=10, le=500)
    language: str = Field(default="en")


class BatchRequest(BaseModel):
    images: List[str] = Field(..., description="List of base64 encoded images")
    styles: List[CaptionStyle] = Field(
        default=[CaptionStyle.SHORT, CaptionStyle.DETAILED, CaptionStyle.ALT]
    )
    tone: Tone = Field(default=Tone.PROFESSIONAL)
    max_length: int = Field(default=150, ge=10, le=500)


class CaptionMetadata(BaseModel):
    processing_time: float
    model_used: str
    image_size: Optional[tuple] = None


class CaptionResult(BaseModel):
    short: Optional[str] = None
    detailed: Optional[str] = None
    alt: Optional[str] = None
    creative: Optional[str] = None


class CaptionResponse(BaseModel):
    image_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    captions: CaptionResult
    metadata: CaptionMetadata
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class BatchResponse(BaseModel):
    results: List[CaptionResponse]
    total_processing_time: float
    success_count: int
    error_count: int


class HistoryItem(BaseModel):
    image_id: str
    thumbnail: str
    captions: CaptionResult
    timestamp: datetime
    is_favorite: bool = False


class HistoryResponse(BaseModel):
    items: List[HistoryItem]
    total_count: int


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
