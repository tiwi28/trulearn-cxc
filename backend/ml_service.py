from sentence_transformers import SentenceTransformer, CrossEncoder, util

# Load models once at module level to avoid reloading per request
similarity_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
nli_model = CrossEncoder("cross-encoder/nli-deberta-v3-base")

NLI_LABELS = ["contradiction", "entailment", "neutral"]
MEMORIZATION_THRESHOLD = 0.85


def check_similarity(student_answer: str, pdf_summary: str) -> dict:
    """Compare student answer against PDF summary to detect memorization.

    Returns a dict with the cosine similarity score and a memorization flag.
    High similarity (>0.85) suggests the student is copying from the source.
    """
    answer_embedding = similarity_model.encode(student_answer, convert_to_tensor=True)
    summary_embedding = similarity_model.encode(pdf_summary, convert_to_tensor=True)

    score = util.cos_sim(answer_embedding, summary_embedding).item()

    return {
        "score": round(score, 4),
        "is_memorized": score > MEMORIZATION_THRESHOLD,
    }


def check_correctness(student_answer: str, sample_answer: str) -> dict:
    """Check if the student's answer is correct using NLI.

    Compares (sample_answer, student_answer) — if the student's answer
    is entailed by the sample answer, it is considered correct.

    Returns a dict with the predicted label and all three NLI scores.
    """
    scores = nli_model.predict([(sample_answer, student_answer)])[0]

    score_dict = {
        label: round(float(s), 4)
        for label, s in zip(NLI_LABELS, scores)
    }
    predicted_label = NLI_LABELS[scores.argmax()]

    return {
        "label": predicted_label,
        "scores": score_dict,
    }
