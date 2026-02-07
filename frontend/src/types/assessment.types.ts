// src/types/assessment.types.ts

export interface Question {
  id: number;
  question_text: string;
  concept: string;
  difficulty: 'easy' | 'medium' | 'hard';
  variation_group_id?: string;
  source_material?: string;
  created_at: string;
}

export interface Answer {
  id?: number;
  question_id: number;
  student_id: number;
  answer_text: string;
  response_time_seconds: number;
  submitted_at?: string;
}

export interface DetectionResult {
  id: number;
  answer_id: number;
  overfitting_detected: boolean;
  confidence_score: number;
  detection_type: 'memorization' | 'surface' | 'behavioral';
  evidence: {
    similarity_score?: number;
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
