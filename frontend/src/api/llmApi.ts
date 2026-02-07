import apiClient from './client';
import { Question } from '../types/assessment.types';

export interface GenerateQuestionsRequest {
  concept: string;
  difficulty?: string;
  num_variations?: number;
  reference_text?: string; // PDF text content
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
  try {
    const response = await apiClient.post<GenerateQuestionsResponse>(
      '/api/questions/generate',
      request
    );
    return response.data;
  } catch (error) {
    console.error('Error generating questions:', error);
    
    // Return mock data if backend not available (for testing)
    console.warn('Using mock question data - backend not connected');
    return {
      questions: generateMockQuestions(request.concept || 'General Concept'),
      generation_time: 0,
      model_used: 'mock'
    };
  }
};

/**
 * Upload PDF and extract text + concept for question generation
 */
export const uploadPdfForQuestions = async (
  file: File
): Promise<{ text: string; concept: string; filename: string }> => {
  try {
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
  } catch (error) {
    console.error('Error uploading PDF:', error);
    
    // Mock response for testing
    console.warn('Using mock PDF extraction - backend not connected');
    return {
      text: 'Mock extracted text from PDF. This would normally contain the actual content.',
      concept: 'General Study Material',
      filename: file.name
    };
  }
};

/**
 * Generate 10 mock questions (5 MC + 5 open-ended)
 * Used when backend is not available
 */
function generateMockQuestions(concept: string): Question[] {
  return [
    // Multiple Choice Questions (1-5)
    {
      id: 1,
      type: 'multiple_choice',
      question: `What is the primary purpose of ${concept}?`,
      concept: concept,
      difficulty: 'medium',
      options: {
        A: 'To provide energy',
        B: 'To store information',
        C: 'To facilitate growth',
        D: 'To enable communication'
      },
      correct_answer: 'A'
    },
    {
      id: 2,
      type: 'multiple_choice',
      question: `Which statement best describes ${concept}?`,
      concept: concept,
      difficulty: 'medium',
      options: {
        A: 'It is a simple process',
        B: 'It involves multiple steps',
        C: 'It requires external input',
        D: 'It is self-sustaining'
      },
      correct_answer: 'B'
    },
    {
      id: 3,
      type: 'multiple_choice',
      question: `What are the key components of ${concept}?`,
      concept: concept,
      difficulty: 'medium',
      options: {
        A: 'Proteins and enzymes',
        B: 'Cells and tissues',
        C: 'Molecules and atoms',
        D: 'All of the above'
      },
      correct_answer: 'D'
    },
    {
      id: 4,
      type: 'multiple_choice',
      question: `How does ${concept} function in a system?`,
      concept: concept,
      difficulty: 'medium',
      options: {
        A: 'By converting energy',
        B: 'By transmitting signals',
        C: 'By maintaining balance',
        D: 'By facilitating reactions'
      },
      correct_answer: 'A'
    },
    {
      id: 5,
      type: 'multiple_choice',
      question: `Which is true about ${concept}?`,
      concept: concept,
      difficulty: 'medium',
      options: {
        A: 'It occurs spontaneously',
        B: 'It requires catalysts',
        C: 'It is temperature dependent',
        D: 'All of the above'
      },
      correct_answer: 'D'
    },
    // Open-Ended Questions (6-10)
    {
      id: 6,
      type: 'open_ended',
      question: `Explain the main concepts of ${concept} in your own words.`,
      concept: concept,
      difficulty: 'medium',
      sample_answer: `The main concepts of ${concept} include understanding its fundamental principles and how they apply in various contexts.`
    },
    {
      id: 7,
      type: 'open_ended',
      question: `How would you describe ${concept} to someone unfamiliar with the topic?`,
      concept: concept,
      difficulty: 'medium',
      sample_answer: `To explain ${concept} simply, I would start with the basics and use everyday examples to illustrate the key ideas.`
    },
    {
      id: 8,
      type: 'open_ended',
      question: `What are the key processes or steps involved in ${concept}?`,
      concept: concept,
      difficulty: 'medium',
      sample_answer: `The key processes in ${concept} involve several sequential steps that work together to achieve the desired outcome.`
    },
    {
      id: 9,
      type: 'open_ended',
      question: `Why is ${concept} important? Provide specific examples.`,
      concept: concept,
      difficulty: 'medium',
      sample_answer: `${concept} is important because it plays a crucial role in many real-world applications, such as...`
    },
    {
      id: 10,
      type: 'open_ended',
      question: `Compare and contrast different aspects of ${concept}.`,
      concept: concept,
      difficulty: 'medium',
      sample_answer: `Different aspects of ${concept} can be compared by examining their similarities and differences in function and application.`
    }
  ];
}