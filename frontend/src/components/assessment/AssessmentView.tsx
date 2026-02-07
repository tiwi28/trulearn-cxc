import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Button,
  Typography, 
  Box, 
  Alert,
  Divider,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import QuestionDisplay from './QuestionDisplay';
import AnswerInput from './AnswerInput';
import PdfUpload from './PdfUpload';
import { Question } from '../../types/assessment.types';

const AssessmentView: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [uploadedPdf, setUploadedPdf] = useState<File | null>(null);
  
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

  const handlePdfUpload = (file: File) => {
    console.log('PDF uploaded:', file.name);
    setUploadedPdf(file);
    setActiveStep(1); // Move to next step (answer question)
    
    // TODO: Send PDF to backend for processing
    /*
    const formData = new FormData();
    formData.append('pdf', file);
    
    axios.post('/api/upload-reference', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then(response => {
      console.log('PDF processed:', response.data);
    });
    */
  };

  const handleSubmitAnswer = async (answerText: string, responseTime: number) => {
    console.log('Submitting answer:', { answerText, responseTime, pdfName: uploadedPdf?.name });
    
    setIsSubmitting(true);
    setDetectionResult(null);

    // TODO: Replace with actual API call (TOMORROW)
    // Sim API call
    setTimeout(() => {
      const mockResult = {
        detected: Math.random() > 0.5,
        score: Math.random(),
        message: 'Analysis complete'
      };
      
      setDetectionResult(mockResult);
      setIsSubmitting(false);
      setActiveStep(2); // Move to results step
    }, 2000);

    /* Real implementation later
    
    try {
      const response = await axios.post('/api/answers', {
        question_id: currentQuestion.id,
        student_id: 1, // Replace with actual student ID
        answer_text: answerText,
        response_time_seconds: responseTime,
        reference_pdf: uploadedPdf?.name
      });
      
      setDetectionResult({
        detected: response.data.detection.overfitting_detected,
        score: response.data.detection.score,
        message: response.data.detection.reason || 'Analysis complete'
      });
      setIsSubmitting(false);
      setActiveStep(2);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setIsSubmitting(false);
    }
    */
  };

  const steps = ['Upload Study Material', 'Answer Question', 'View Results'];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Educational Assessment
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload your study material, answer the question, and get instant feedback on your understanding.
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Divider sx={{ mb: 3 }} />

        {/* Step 1: PDF Upload */}
        {activeStep === 0 && (
          <PdfUpload 
            onFileUpload={handlePdfUpload}
            label="Upload Study Material"
            helperText="Upload the PDF you studied from. We'll use this to detect if you're memorizing vs. understanding."
          />
        )}

        {/* Step 2: Question and Answer */}
        {activeStep === 1 && (
          <>
            <Alert severity="info" sx={{ mb: 3 }}>
              Reference material uploaded: <strong>{uploadedPdf?.name}</strong>
            </Alert>

            <QuestionDisplay question={currentQuestion} questionNumber={1} />

            <AnswerInput 
              onSubmit={handleSubmitAnswer}
              isSubmitting={isSubmitting}
            />
          </>
        )}

        {/* Step 3: Results */}
        {activeStep === 2 && detectionResult && (
          <Box>
            <Alert 
              severity={detectionResult.detected ? 'warning' : 'success'}
              sx={{ fontSize: '1rem', mb: 3 }}
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
                    Your answer shows high similarity to the uploaded study material ({uploadedPdf?.name}). 
                    Try explaining the concept in your own words instead of reproducing the text.
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="h6" component="div" gutterBottom>
                    ✓ Good Understanding Detected
                  </Typography>
                  <Typography variant="body2">
                    Your answer demonstrates genuine comprehension of the concept.
                    Low similarity to source material indicates you understand rather than memorize.
                  </Typography>
                </>
              )}
            </Alert>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setActiveStep(0);
                  setUploadedPdf(null);
                  setDetectionResult(null);
                }}
              >
                Start New Assessment
              </Button>
              <Button 
                variant="contained"
                onClick={() => setActiveStep(1)}
              >
                Try Another Question
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AssessmentView;
