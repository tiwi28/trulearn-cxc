import apiClient from './client';
import { Question } from '../types/assessment.types';

export interface GenerateQuestionsRequest {
  concept: string;
  difficulty?: string;
  num_variations?: number;
  reference_text?: string; // PDF text content
  filename?: string; // PDF filename — lets backend look up full stored summary
}

export interface GenerateQuestionsResponse {
  questions: Question[];
  generation_time: number;
  model_used: string;
}

/**
 * Generate questions using LLM API
 * Returns 10 questions: 5 multiple choice + 5 open-ended
 */
export const generateQuestions = async (
  request: GenerateQuestionsRequest
): Promise<GenerateQuestionsResponse> => {
  const response = await apiClient.post<GenerateQuestionsResponse>(
    '/api/questions/generate',
    request
  );
  return response.data;
};

/**
 * Upload PDF and extract text + concept for question generation
 */
export const uploadPdfForQuestions = async (
  file: File
): Promise<{ text: string; concept: string; filename: string }> => {
  const formData = new FormData();
  formData.append('pdf', file);  // Flask expects 'pdf' field name

  const response = await apiClient.post<{ text: string; concept: string; filename: string }>(
    '/api/upload-reference',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};