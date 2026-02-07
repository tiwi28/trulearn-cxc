import apiClient from './client';
import { Answer, DetectionResult } from '../types/assessment.types';

export interface CreateAssessmentRequest {
  title: string;
  concept: string;
  question_ids: number[];
}

export interface CreateAssessmentResponse {
  id: number;
  title: string;
  concept: string;
  questions: number[];
  created_at: string;
}

export interface SubmitAnswerRequest {
  question_id: number;
  student_id: number;
  answer_text: string;
  response_time_seconds: number;
  reference_pdf?: string;
}

export interface SubmitAnswerResponse {
  answer_id: number;
  status: 'submitted' | 'processing' | 'analyzed';
  detection?: DetectionResult;
}


//Create new assessment

export const createAssessment = async (
  request: CreateAssessmentRequest
): Promise<CreateAssessmentResponse> => {
  try {
    const response = await apiClient.post<CreateAssessmentResponse>(
      '/api/assessments',
      request
    );
    return response.data;
  } catch (error) {
    console.error('Error creating assessment:', error);
    throw error;
  }
};

/**
 * Submit student answer
 */
export const submitAnswer = async (
  request: SubmitAnswerRequest
): Promise<SubmitAnswerResponse> => {
  try {
    const response = await apiClient.post<SubmitAnswerResponse>(
      '/api/answers',
      request
    );
    return response.data;
  } catch (error) {
    console.error('Error submitting answer:', error);
    
    // Mock response for testing
    console.warn('Using mock answer submission - backend not connected');
    return {
      answer_id: Math.floor(Math.random() * 1000),
      status: 'submitted',
    };
  }
};


//Run detection on submitted answer (Update: connected to flask backend) 
export const runDetection = async (
  answerId: number,
  answerData: SubmitAnswerRequest  
): Promise<DetectionResult> => {
  try {
    const response = await apiClient.post<DetectionResult>(
      `/api/answers/${answerId}/detect`,
      answerData  // ← FIXED: Flask needs this data for detection
    );
    return response.data;
  } catch (error) {
    console.error('Error running detection:', error);
    
    // Mock detection result for testing
    console.warn('Using mock detection - backend not connected');
    const mockScore = Math.random();
    return {
      id: Math.floor(Math.random() * 1000),
      answer_id: answerId,
      overfitting_detected: mockScore > 0.6,
      confidence_score: mockScore,
      detection_type: mockScore > 0.8 ? 'memorization' : mockScore > 0.6 ? 'surface' : 'behavioral',
      evidence: {
        similarity_score: mockScore,
        response_time: answerData?.response_time_seconds || 45,  // ← Use real time
        reason: mockScore > 0.6
          ? 'High similarity to reference material detected'
          : 'Answer demonstrates genuine understanding'
      },
      detected_at: new Date().toISOString()
    };
  }
};

// get assesment details by ID
export const getAssessment = async (assessmentId: number) => {
  try {
    const response = await apiClient.get(`/api/assessments/${assessmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching assessment:', error);
    throw error;
  }
};