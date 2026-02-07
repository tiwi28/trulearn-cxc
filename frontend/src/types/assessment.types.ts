export interface MultipleChoiceQuestion {
  id: number;
  type: 'multiple_choice';
  question: string;
  concept: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: 'A' | 'B' | 'C' | 'D';
  variation_group_id?: string;
  created_at?: string;
}

export interface OpenEndedQuestion {
  id: number;
  type: 'open_ended';
  question: string;
  concept: string;
  difficulty: 'easy' | 'medium' | 'hard';
  sample_answer: string;
  variation_group_id?: string;
  created_at?: string;
}

export type Question = MultipleChoiceQuestion | OpenEndedQuestion;

export interface Answer {
  id?: number;
  question_id: number;
  student_id: number;
  answer_text: string; // Selected option (A/B/C/D) or written response
  response_time_seconds: number;
  submitted_at?: string;
}

export interface DetectionResult {
  id: number;
  answer_id: number;
  overfitting_detected: boolean;
  confidence_score: number;
  detection_type: 'memorization' | 'surface' | 'behavioral' | 'genuine';
  evidence: {
    similarity_score?: number;
    semantic_similarity?: number;
    behavioral_score?: number;
    response_time?: number;
    reason: string;
  };
  detected_at: string;
}

export interface Assessment {
  id: number;
  title: string;
  concept: string;
  questions: Question[];
  created_at: string;
}

export interface Student {
  id: number;
  name: string;
  email: string;
}