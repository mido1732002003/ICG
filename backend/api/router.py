from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List
import base64
import time
from datetime import datetime

from models.schemas import (
    CaptionRequest,
    CaptionURLRequest,
    BatchRequest,
    CaptionResponse,
    BatchResponse,
    HistoryResponse,
    HistoryItem,
    ErrorResponse
)
from services.caption_service import caption_service

router = APIRouter(prefix="/api", tags=["captions"])

# In-memory history storage (in production, use a database)
history_storage: List[HistoryItem] = []


@router.post("/caption", response_model=CaptionResponse)
async def generate_caption(request: CaptionRequest):
    """Generate captions for a single base64-encoded image."""
    try:
        response = await caption_service.generate_captions(
            image_base64=request.image,
            styles=request.styles,
            tone=request.tone,
            max_length=request.max_length
        )
        
        # Add to history
        history_storage.insert(0, HistoryItem(
            image_id=response.image_id,
            thumbnail=request.image[:500] + "..." if len(request.image) > 500 else request.image,
            captions=response.captions,
            timestamp=response.timestamp,
            is_favorite=False
        ))
        
        # Keep only last 50 items
        if len(history_storage) > 50:
            history_storage.pop()
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/caption-url", response_model=CaptionResponse)
async def generate_caption_from_url(request: CaptionURLRequest):
    """Generate captions from an image URL."""
    try:
        response = await caption_service.generate_captions_from_url(
            url=request.url,
            styles=request.styles,
            tone=request.tone,
            max_length=request.max_length
        )
        
        # Add to history
        history_storage.insert(0, HistoryItem(
            image_id=response.image_id,
            thumbnail=request.url,
            captions=response.captions,
            timestamp=response.timestamp,
            is_favorite=False
        ))
        
        if len(history_storage) > 50:
            history_storage.pop()
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/caption-upload", response_model=CaptionResponse)
async def generate_caption_from_upload(file: UploadFile = File(...)):
    """Generate captions from an uploaded image file."""
    try:
        contents = await file.read()
        image_base64 = base64.b64encode(contents).decode()
        
        response = await caption_service.generate_captions(
            image_base64=image_base64,
            styles=["short", "detailed", "alt"],
            tone="professional",
            max_length=150
        )
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch", response_model=BatchResponse)
async def process_batch(request: BatchRequest):
    """Process multiple images in batch."""
    start_time = time.time()
    results = []
    error_count = 0
    
    for image in request.images:
        try:
            response = await caption_service.generate_captions(
                image_base64=image,
                styles=request.styles,
                tone=request.tone,
                max_length=request.max_length
            )
            results.append(response)
        except Exception as e:
            error_count += 1
            # Create error response
            results.append(CaptionResponse(
                captions={"error": str(e)},
                metadata={"processing_time": 0, "model_used": "error"}
            ))
    
    return BatchResponse(
        results=results,
        total_processing_time=time.time() - start_time,
        success_count=len(results) - error_count,
        error_count=error_count
    )


@router.get("/history", response_model=HistoryResponse)
async def get_history(limit: int = 20, offset: int = 0):
    """Get caption generation history."""
    items = history_storage[offset:offset + limit]
    return HistoryResponse(
        items=items,
        total_count=len(history_storage)
    )


@router.post("/history/{image_id}/favorite")
async def toggle_favorite(image_id: str):
    """Toggle favorite status for a history item."""
    for item in history_storage:
        if item.image_id == image_id:
            item.is_favorite = not item.is_favorite
            return {"status": "success", "is_favorite": item.is_favorite}
    
    raise HTTPException(status_code=404, detail="Image not found in history")


@router.delete("/history/{image_id}")
async def delete_history_item(image_id: str):
    """Delete a history item."""
    for i, item in enumerate(history_storage):
        if item.image_id == image_id:
            history_storage.pop(i)
            return {"status": "success"}
    
    raise HTTPException(status_code=404, detail="Image not found in history")


@router.delete("/history")
async def clear_history():
    """Clear all history."""
    history_storage.clear()
    return {"status": "success"}
