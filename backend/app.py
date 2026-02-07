import os
import uuid

from flask import Flask, request, redirect, url_for, jsonify
from werkzeug.utils import secure_filename

from backend.gemini_service import summarize_pdf, generate_questions

app = Flask(__name__)
app.secret_key = os.urandom(24)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
ALLOWED_EXTENSIONS = {"pdf"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024  # 20 MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/", methods=["GET"])
def index():
    """Home page — placeholder until templates are added."""
    return (
        "<h1>TruLearn</h1>"
        "<p>Upload a PDF to generate quiz questions.</p>"
        '<form action="/upload" method="post" enctype="multipart/form-data">'
        '<input type="file" name="pdf_file" accept=".pdf" required>'
        '<button type="submit">Generate Questions</button>'
        "</form>"
    )


@app.route("/upload", methods=["POST"])
def upload_pdf():
    """Handle PDF upload, summarize, generate questions, return JSON."""
    if "pdf_file" not in request.files:
        return jsonify({"error": "No file selected."}), 400

    file = request.files["pdf_file"]
    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    if not allowed_file(str(file.filename)):
        return jsonify({"error": "Only PDF files are allowed."}), 400

    # Save with a unique name to avoid collisions
    filename = secure_filename(str(file.filename))
    unique_name = f"{uuid.uuid4().hex}_{filename}"
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], unique_name)
    file.save(filepath)

    try:
        summary = summarize_pdf(filepath)
        questions = generate_questions(summary)

        return jsonify({
            "filename": file.filename,
            "summary": summary,
            "questions": questions,
        })
    except Exception as e:
        return jsonify({"error": f"Error processing PDF: {str(e)}"}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
