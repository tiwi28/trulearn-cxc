import json

from google import genai
from google.genai import types

# Client auto-reads GEMINI_API_KEY from environment
client = genai.Client()
MODEL = "gemini-3-flash-preview"


def summarize_pdf(pdf_path: str) -> str:
    """Upload a PDF and return a summary of its key concepts."""
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    response = client.models.generate_content(
        model=MODEL,
        contents=[
            types.Part.from_bytes(
                data=pdf_bytes,
                mime_type="application/pdf",
            ),
            (
                "Read this entire document carefully. "
                "Provide a detailed summary of the key concepts, main ideas, "
                "important facts, definitions, and any formulas or processes described. "
                "Be thorough -- this summary will be used to generate quiz questions."
            ),
        ],
    )
    return str(response.text)


def generate_questions(summary: str) -> list[dict]:
    """Given a summary, generate 10 quiz questions and return as a list of dicts."""
    prompt = f"""Based on the following summary of a document, generate exactly 10 quiz questions.

Requirements:
- Questions 1-5: Multiple choice with exactly 4 options (A, B, C, D) and one correct answer.
- Questions 6-10: Open-ended questions that require a short written answer (2-3 sentences).
- All questions should test understanding of the key concepts in the summary.
- For multiple choice, make the distractors plausible but clearly wrong.

Return your response as a JSON array with this exact structure:
[
  {{
    "number": 1,
    "type": "multiple_choice",
    "question": "...",
    "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}},
    "correct_answer": "B"
  }},
  {{
    "number": 6,
    "type": "open_ended",
    "question": "...",
    "sample_answer": "..."
  }}
]

Summary:
{summary}"""

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )

    questions = json.loads(str(response.text))
    return questions
