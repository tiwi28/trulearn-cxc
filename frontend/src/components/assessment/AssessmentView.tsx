// src/components/assessment/AssessmentView.tsx

import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Alert,
  Divider 
} from '@mui/material';
import QuestionDisplay from './QuestionDisplay';
import AnswerInput from './AnswerInput';
import { Question } from '../../types/assessment.types';

const AssessmentView: React.FC = () => {
  // Mock question data for testing
  const [currentQuestion] = useState<Question>({
    id: 1,
    question_text: 'Explain the process of photosynthesis and how plants convert light energy into chemical energy.',
    concept: 'Photosynthesis',
    difficulty: 'medium',
    variation_group_id: 'photo_001',
    created_at: new Date().toISOString()
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectionResult, setDetectionResult] = useState<{
    detected: boolean;
    score: number;
    message: string;
  } | null>(null);

  const handleSubmitAnswer = async (answerText: string, responseTime: number) => {
    console.log('Submitting answer:', { answerText, responseTime });
    
    setIsSubmitting(true);
    setDetectionResult(null);

    // TODO: Replace with actual API call
    // Simulate API call
    setTimeout(() => {
      // Mock detection result
      const mockResult = {
        detected: Math.random() > 0.5,
        score: Math.random(),
        message: 'Analysis complete'
      };
      
      setDetectionResult(mockResult);
      setIsSubmitting(false);
    }, 2000);

    /* 
    Real implementation will look like:
    
    try {
      const response = await axios.post('/api/answers', {
        question_id: currentQuestion.id,
        student_id: 1, // Replace with actual student ID
        answer_text: answerText,
        response_time_seconds: responseTime
      });
      
      setDetectionResult({
        detected: response.data.detection.overfitting_detected,
        score: response.data.detection.score,
        message: response.data.detection.reason || 'Analysis complete'
      });
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setIsSubmitting(false);
    }
    */
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Educational Assessment
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Answer the question below. The system will analyze your response for understanding.
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Question Display */}
        <QuestionDisplay question={currentQuestion} questionNumber={1} />

        {/* Answer Input */}
        <AnswerInput 
          onSubmit={handleSubmitAnswer}
          isSubmitting={isSubmitting}
        />

        {/* Detection Result Alert */}
        {detectionResult && (
          <Box sx={{ mt: 3 }}>
            <Alert 
              severity={detectionResult.detected ? 'warning' : 'success'}
              sx={{ fontSize: '1rem' }}
            >
              {detectionResult.detected ? (
                <>
                  <Typography variant="h6" component="div" gutterBottom>
                    ⚠️ Potential Memorization Detected
                  </Typography>
                  <Typography variant="body2">
                    Confidence: {(detectionResult.score * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Your answer shows patterns of surface-level memorization. 
                    Try explaining the concept in your own words.
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="h6" component="div" gutterBottom>
                    ✓ Good Understanding Detected
                  </Typography>
                  <Typography variant="body2">
                    Your answer demonstrates genuine comprehension of the concept.
                  </Typography>
                </>
              )}
            </Alert>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AssessmentView;
