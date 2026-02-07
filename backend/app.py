import os
import uuid
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

from gemini_service import (
    summarize_pdf, 
    generate_questions, 
    extract_concept_from_summary,
    generate_variation_question
)

app = Flask(__name__)
app.secret_key = os.urandom(24)

# Enable CORS for frontend
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
ALLOWED_EXTENSIONS = {"pdf"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024  # 20 MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# In-memory storage (use database in production)
pdf_storage = {}
question_storage = {}


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/", methods=["GET"])
def index():
    """API welcome page"""
    return jsonify({
        "message": "🎓 Welcome to TruLearn API",
        "tagline": "Think Smarter, Learn Harder",
        "endpoints": {
            "health": "/api/health",
            "upload_pdf": "/api/upload-reference",
            "generate_questions": "/api/questions/generate",
            "generate_variation": "/api/questions/variation"
        }
    })


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "TruLearn API (Flask)",
        "gemini": "✅"
    })


@app.route("/api/upload-reference", methods=["POST"])
def upload_pdf():
    """Upload PDF, extract text, identify concept."""
    
    if "pdf" not in request.files:
        return jsonify({"error": "No file uploaded. Use 'pdf' as the field name."}), 400

    file = request.files["pdf"]
    
    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    if not allowed_file(str(file.filename)):
        return jsonify({"error": "Only PDF files are allowed."}), 400

    filename = secure_filename(str(file.filename))
    unique_name = f"{uuid.uuid4().hex}_{filename}"
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], unique_name)
    
    try:
        file.save(filepath)
        
        print(f"\n📄 Processing PDF: {filename}")
        
        # Summarize PDF
        summary = summarize_pdf(filepath)
        print(f"✅ Generated summary ({len(summary)} chars)")
        
        # Extract concept
        concept = extract_concept_from_summary(summary)
        print(f"✅ Identified concept: {concept}")
        
        # Store for later use
        pdf_storage[filename] = {
            'summary': summary,
            'concept': concept,
            'uploaded_at': time.time()
        }
        
        return jsonify({
            "text": summary[:1000],
            "concept": concept,
            "filename": filename,
            "full_summary_length": len(summary)
        })
        
    except Exception as e:
        print(f"❌ Error processing PDF: {e}")
        return jsonify({"error": f"Error processing PDF: {str(e)}"}), 500
        
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)


@app.route("/api/questions/generate", methods=["POST"])
def generate_quiz_questions():
    """
    Generate 10 questions with intelligent distribution.
    Analyzes PDF content to determine optimal MC vs open-ended split.
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
    
    concept = data.get("concept")
    reference_text = data.get("reference_text")
    filename = data.get("filename")  # To retrieve stored summary
    
    if not concept:
        return jsonify({"error": "Concept is required"}), 400
    
    try:
        print(f"\n🤖 Generating questions for concept: {concept}")
        start_time = time.time()
        
        # Get summary from storage if available
        summary = reference_text
        if not summary and filename and filename in pdf_storage:
            summary = pdf_storage[filename]['summary']
        elif not summary:
            summary = f"Generate questions about the concept: {concept}"
        
        # Generate questions with smart distribution
        questions = generate_questions(summary, concept)
        
        # Store questions for later variation generation
        question_storage[concept] = {
            'questions': questions,
            'summary': summary,
            'generated_at': time.time()
        }
        
        generation_time = time.time() - start_time
        print(f"✅ Generated {len(questions)} questions in {generation_time:.2f}s")
        
        return jsonify({
            "questions": questions,
            "generation_time": generation_time,
            "model_used": "gemini-2.0-flash-exp"
        })
        
    except Exception as e:
        print(f"❌ Error generating questions: {e}")
        return jsonify({"error": f"Error generating questions: {str(e)}"}), 500


@app.route("/api/questions/variation", methods=["POST"])
def generate_question_variation():
    """
    Generate a variation of a question when student needs more practice.
    Used when detection score indicates insufficient understanding.
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
    
    original_question = data.get("original_question")
    previous_answer = data.get("previous_answer")
    concept = data.get("concept")
    
    if not all([original_question, previous_answer, concept]):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        print(f"\n🔄 Generating variation for question {original_question.get('id')}")
        
        # Get stored summary
        summary = ""
        if concept in question_storage:
            summary = question_storage[concept]['summary']
        
        # Generate variation
        variation = generate_variation_question(
            original_question,
            previous_answer,
            summary
        )
        
        print(f"✅ Generated variation question")
        
        return jsonify({
            "question": variation,
            "is_variation": True
        })
        
    except Exception as e:
        print(f"❌ Error generating variation: {e}")
        return jsonify({"error": f"Error generating variation: {str(e)}"}), 500


@app.route("/api/answers", methods=["POST"])
def submit_answer():
    """Submit student answer"""
    data = request.get_json()
    
    return jsonify({
        "answer_id": int(time.time() * 1000),
        "status": "submitted",
        "message": "Answer submitted successfully"
    })


@app.route("/api/answers/<int:answer_id>/detect", methods=["POST"])
def run_detection(answer_id):
    """
    Run memorization detection (mock for now).
    Returns score that determines if student needs more practice.
    """
    data = request.get_json()
    
    # Mock detection - replace with real ML model later
    import random
    mock_score = random.random()
    
    # Score interpretation:
    # 0.0 - 0.4: Good understanding (continue to next question)
    # 0.4 - 0.7: Moderate concern (maybe continue)
    # 0.7 - 1.0: High memorization (generate variation, retry question)
    
    needs_practice = mock_score > 0.7
    
    return jsonify({
        "id": int(time.time() * 1000),
        "answer_id": answer_id,
        "overfitting_detected": mock_score > 0.6,
        "confidence_score": mock_score,
        "detection_type": "memorization" if mock_score > 0.7 else "surface" if mock_score > 0.4 else "genuine",
        "needs_more_practice": needs_practice,
        "evidence": {
            "similarity_score": mock_score,
            "response_time": data.get("response_time_seconds", 45),
            "reason": (
                "High similarity to reference material - needs more practice" if mock_score > 0.7
                else "Moderate understanding - review recommended" if mock_score > 0.4
                else "Good understanding demonstrated"
            )
        },
        "detected_at": time.strftime('%Y-%m-%dT%H:%M:%SZ')
    })


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 Starting TruLearn API Server (Flask)")
    print("="*60)
    print("📍 Running on: http://localhost:5000")
    print("📖 Features:")
    print("   • Smart question distribution (analyzes content)")
    print("   • Question variations for practice")
    print("   • Memorization detection (mock)")
    print("="*60 + "\n")
    
    app.run(debug=True, port=5000, host="0.0.0.0")