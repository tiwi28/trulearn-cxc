import json
from google import genai
from google.genai import types

# Client auto-reads GEMINI_API_KEY from environment
client = genai.Client()
MODEL = "gemini-2.0-flash-exp"


def summarize_pdf(pdf_path: str) -> str:
    """Upload a PDF and return a summary of its key concepts."""
    try:
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
                    "Identify the main topic or subject area (e.g., 'Photosynthesis', 'World War II'). "
                    "Be thorough -- this summary will be used to generate quiz questions."
                ),
            ],
        )
        return str(response.text)
    except Exception as e:
        print(f"Error summarizing PDF: {e}")
        raise


def extract_concept_from_summary(summary: str) -> str:
    """Extract the main concept/topic from the summary."""
    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=f"""Analyze this summary and identify the MAIN concept or topic in 2-5 words.

Summary:
{summary[:1000]}

Respond with ONLY the main concept. Examples: "Photosynthesis", "Cell Division", "World War II", "Calculus Derivatives"

Main concept:""",
        )
        concept = str(response.text).strip()
        concept = concept.replace('"', '').replace("'", '').strip()
        return concept if concept else "General Study Material"
    except Exception as e:
        print(f"Error extracting concept: {e}")
        return "General Study Material"


def analyze_content_type(summary: str) -> dict:
    """
    Analyze the PDF content to determine optimal question distribution.
    Returns ratio of multiple choice vs open-ended questions.
    """
    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=f"""Analyze this educational content and determine the optimal question format distribution.

Content:
{summary[:2000]}

Consider:
- Does the content contain factual, discrete information? (better for multiple choice)
- Does it contain processes, explanations, or conceptual understanding? (better for open-ended)
- Is it a mix of both?

Respond ONLY with a JSON object:
{{
  "multiple_choice_ratio": 0.5,
  "open_ended_ratio": 0.5,
  "reasoning": "brief explanation"
}}

The ratios should add up to 1.0. Examples:
- Heavy factual content: {{"multiple_choice_ratio": 0.7, "open_ended_ratio": 0.3}}
- Heavy conceptual content: {{"multiple_choice_ratio": 0.3, "open_ended_ratio": 0.7}}
- Balanced: {{"multiple_choice_ratio": 0.5, "open_ended_ratio": 0.5}}

JSON response:""",
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        
        result = json.loads(str(response.text))
        print(f"📊 Content Analysis: {result['reasoning']}")
        print(f"   MC: {result['multiple_choice_ratio']*100:.0f}% | Open: {result['open_ended_ratio']*100:.0f}%")
        
        return result
        
    except Exception as e:
        print(f"Error analyzing content type: {e}")
        # Default to balanced split
        return {
            "multiple_choice_ratio": 0.5,
            "open_ended_ratio": 0.5,
            "reasoning": "Using default balanced distribution"
        }


def generate_questions(summary: str, concept) -> list[dict]:
    """
    Generate 10 quiz questions with intelligent distribution.
    Analyzes content to determine optimal MC vs open-ended split.
    """
    
    if not concept:
        concept = extract_concept_from_summary(summary)
    
    # Analyze content to determine question distribution
    content_analysis = analyze_content_type(summary)
    mc_ratio = content_analysis['multiple_choice_ratio']
    
    # Calculate number of each type (out of 10 total)
    num_mc = round(mc_ratio * 10)
    num_open = 10 - num_mc
    
    # Ensure at least 2 of each type
    if num_mc < 2:
        num_mc = 2
        num_open = 8
    elif num_open < 2:
        num_open = 2
        num_mc = 8
    
    print(f"🎯 Generating {num_mc} multiple choice + {num_open} open-ended questions")
    
    prompt = f"""Based on this summary about "{concept}", generate exactly 10 quiz questions.

IMPORTANT DISTRIBUTION:
- Generate {num_mc} multiple choice questions (questions 1-{num_mc})
- Generate {num_open} open-ended questions (questions {num_mc+1}-10)

Content Analysis: {content_analysis['reasoning']}

Requirements for Multiple Choice:
- Exactly 4 options (A, B, C, D)
- One clearly correct answer
- Plausible but incorrect distractors
- Test factual knowledge and understanding

Requirements for Open-Ended:
- Require 2-3 sentence written answers
- Test conceptual understanding and ability to explain
- Cannot be answered with simple facts
- Encourage explanation in student's own words

Return ONLY valid JSON (no markdown, no code blocks):
[
  {{
    "id": 1,
    "type": "multiple_choice",
    "question": "What is the primary function of chloroplasts?",
    "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}},
    "correct_answer": "B",
    "concept": "{concept}",
    "difficulty": "medium"
  }},
  {{
    "id": {num_mc+1},
    "type": "open_ended",
    "question": "Explain how light energy is converted during photosynthesis.",
    "sample_answer": "Light energy is absorbed by chlorophyll...",
    "concept": "{concept}",
    "difficulty": "medium"
  }}
]

Summary:
{summary}"""

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )

        questions = json.loads(str(response.text))
        
        # Validate we got 10 questions
        if len(questions) != 10:
            print(f"⚠️  Warning: Expected 10 questions, got {len(questions)}")
        
        # Add metadata about distribution
        for q in questions:
            q['distribution_info'] = {
                'total_mc': num_mc,
                'total_open': num_open,
                'content_reasoning': content_analysis['reasoning']
            }
        
        return questions
        
    except json.JSONDecodeError as e:
        print(f"❌ JSON parse error: {e}")
        print(f"Response text: {response.text}")
        return generate_fallback_questions(concept, num_mc, num_open)
    except Exception as e:
        print(f"❌ Error generating questions: {e}")
        return generate_fallback_questions(concept, num_mc, num_open)


def generate_variation_question(
    original_question: dict,
    previous_answer: str,
    summary: str
) -> dict:
    """
    Generate a variation of the same question to re-test understanding.
    Used when student doesn't demonstrate sufficient understanding.
    """
    
    question_type = original_question['type']
    concept = original_question['concept']
    
    prompt = f"""Generate a VARIATION of this question that tests the same concept but in a different way.

Original Question:
{original_question['question']}

Student's Previous Answer (showed insufficient understanding):
{previous_answer}

Requirements:
- Same concept, different wording/approach
- Same type: {question_type}
- Different enough that memorization won't help
- Test genuine understanding of the underlying concept

Context from study material:
{summary[:1500]}

Return ONLY a JSON object:
{{
  "id": {original_question['id']},
  "type": "{question_type}",
  "question": "your varied question here",
  {"options" if question_type == "multiple_choice" else "sample_answer"}: ...,
  {"correct_answer" if question_type == "multiple_choice" else ""}: ...,
  "concept": "{concept}",
  "difficulty": "{original_question.get('difficulty', 'medium')}",
  "is_variation": true,
  "original_question_id": {original_question['id']}
}}"""

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        
        variation = json.loads(str(response.text))
        print(f"🔄 Generated variation for question {original_question['id']}")
        return variation
        
    except Exception as e:
        print(f"Error generating variation: {e}")
        # Return slightly modified version of original
        variation = original_question.copy()
        variation['is_variation'] = True
        variation['question'] = f"[Variation] {original_question['question']}"
        return variation


def generate_fallback_questions(concept: str, num_mc: int, num_open: int) -> list[dict]:
    """Generate fallback questions if Gemini fails."""
    
    questions = []
    question_id = 1
    
    # Generate MC questions
    mc_templates = [
        f"What is a key characteristic of {concept}?",
        f"Which statement best describes {concept}?",
        f"What is the primary purpose of {concept}?",
        f"How does {concept} function?",
        f"What are the key components of {concept}?",
        f"Which is true about {concept}?",
        f"What role does {concept} play?",
        f"Which process involves {concept}?",
    ]
    
    for i in range(num_mc):
        questions.append({
            "id": question_id,
            "type": "multiple_choice",
            "question": mc_templates[i % len(mc_templates)],
            "options": {
                "A": f"Option A about {concept}",
                "B": f"Option B about {concept}",
                "C": f"Option C about {concept}",
                "D": f"Option D about {concept}"
            },
            "correct_answer": ["A", "B", "C", "D"][i % 4],
            "concept": concept,
            "difficulty": "medium"
        })
        question_id += 1
    
    # Generate open-ended questions
    open_templates = [
        f"Explain the main concepts of {concept} in your own words.",
        f"How would you describe {concept} to someone unfamiliar with it?",
        f"What are the key processes involved in {concept}?",
        f"Why is {concept} important? Provide specific examples.",
        f"Compare and contrast different aspects of {concept}.",
        f"Describe how {concept} works in detail.",
        f"What are the implications of {concept}?",
        f"How does {concept} relate to other concepts?",
    ]
    
    for i in range(num_open):
        questions.append({
            "id": question_id,
            "type": "open_ended",
            "question": open_templates[i % len(open_templates)],
            "sample_answer": f"A comprehensive explanation of {concept} would include...",
            "concept": concept,
            "difficulty": "medium"
        })
        question_id += 1
    
    return questions