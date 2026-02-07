from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import shutil
import time
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from llm.gemini_generator import question_generator
from llm.pdf_processor import pdf_processor
from ml.detector import detector

router = APIRouter()

# Request models
class GenerateQuestionsRequest(BaseModel):
    concept: str
    difficulty: str = 'medium'
    num_variations: int = 5
    reference_text: Optional[str] = None

class SubmitAnswerRequest(BaseModel):
    question_id: int
    student_id: int
    answer_text: str
    response_time_seconds: int
    reference_pdf: Optional[str] = None

# Storage
pdf_storage = {}

@router.post("/api/upload-reference")
async def upload_pdf(pdf: UploadFile = File(...)):
    """Upload and process PDF"""
    
    try:
        # Save temp
        os.makedirs("uploads", exist_ok=True)
        filepath = f"uploads/{pdf.filename}"
        
        with open(filepath, "wb") as f:
            shutil.copyfileobj(pdf.file, f)
        
        # Process
        result = pdf_processor.process_pdf(filepath)
        pdf_storage[pdf.filename] = result['text']
        
        # Cleanup
        os.remove(filepath)
        
        return {
            'text': result['text'][:1000],
            'concept': result['concept'],
            'filename': pdf.filename
        }
    except Exception as e:
        raise HTTPException(500, f"Error: {str(e)}")

@router.post("/api/questions/generate")
async def generate_questions(req: GenerateQuestionsRequest):
    """Generate questions with Gemini"""
    
    try:
        return question_generator.generate_questions(
            concept=req.concept,
            difficulty=req.difficulty,
            num_variations=req.num_variations,
            reference_text=req.reference_text
        )
    except Exception as e:
        raise HTTPException(500, f"Error: {str(e)}")

@router.post("/api/answers")
async def submit_answer(req: SubmitAnswerRequest):
    """Submit answer"""
    
    return {
        'answer_id': int(time.time() * 1000),
        'status': 'submitted'
    }

@router.post("/api/answers/{answer_id}/detect")
async def run_detection(answer_id: int, req: SubmitAnswerRequest):
    """Run detection"""
    
    try:
        ref_text = pdf_storage.get(req.reference_pdf, "")
        
        result = detector.detect(
            answer=req.answer_text,
            reference=ref_text,
            response_time=req.response_time_seconds
        )
        
        result['id'] = int(time.time() * 1000)
        result['answer_id'] = answer_id
        result['detected_at'] = time.strftime('%Y-%m-%dT%H:%M:%SZ')
        
        return result
    except Exception as e:
        raise HTTPException(500, f"Error: {str(e)}")

@router.get("/api/health")
async def health():
    return {
        'status': 'healthy',
        'service': 'TruLearn API',
        'gemini': '✅'
    }