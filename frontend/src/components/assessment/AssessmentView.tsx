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
  StepLabel,
  Card,
  CardContent,
  Fade,
  Grow
} from '@mui/material';
import QuestionDisplay from './QuestionDisplay';
import AnswerInput from './AnswerInput';
import PdfUpload from './PdfUpload';
import { Question } from '../../types/assessment.types';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PsychologyIcon from '@mui/icons-material/Psychology';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';

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
    setActiveStep(1);
  };

  const handleSubmitAnswer = async (answerText: string, responseTime: number) => {
    console.log('Submitting answer:', { answerText, responseTime, pdfName: uploadedPdf?.name });
    
    setIsSubmitting(true);
    setDetectionResult(null);

    // TODO: Replace with actual API call
    setTimeout(() => {
      const mockResult = {
        detected: Math.random() > 0.5,
        score: Math.random(),
        message: 'Analysis complete'
      };
      
      setDetectionResult(mockResult);
      setIsSubmitting(false);
      setActiveStep(2);
    }, 2000);
  };

  const steps = ['Upload Material', 'Answer Question', 'View Results'];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 6
    }}>
      <Container maxWidth="md">
        {/* Header */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <EmojiObjectsIcon sx={{ fontSize: 48, color: '#ffd700', mr: 1 }} />
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 800,
                  color: 'white',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                TruLearn
              </Typography>
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255,255,255,0.95)',
                fontWeight: 300,
                letterSpacing: '0.5px'
              }}
            >
              Understanding Over Memorization
            </Typography>
          </Box>
        </Fade>

        <Grow in timeout={1000}>
          <Paper 
            elevation={8} 
            sx={{ 
              p: 4,
              borderRadius: 4,
              background: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* Stepper */}
            <Stepper 
              activeStep={activeStep} 
              sx={{ 
                mb: 4,
                '& .MuiStepLabel-label': {
                  fontWeight: 500
                }
              }}
            >
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        '&.Mui-completed': {
                          color: '#667eea'
                        },
                        '&.Mui-active': {
                          color: '#764ba2'
                        }
                      }
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <Divider sx={{ mb: 4 }} />

            {/* Step 1: PDF Upload */}
            {activeStep === 0 && (
              <Fade in timeout={600}>
                <Box>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <AutoStoriesIcon sx={{ fontSize: 64, color: '#667eea', mb: 2 }} />
                    <Typography variant="h5" gutterBottom fontWeight={600}>
                      Let's Get Started
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Upload your study material to begin the assessment
                    </Typography>
                  </Box>
                  <PdfUpload 
                    onFileUpload={handlePdfUpload}
                    label="Upload Study Material"
                    helperText="We'll analyze your understanding based on this reference material"
                  />
                </Box>
              </Fade>
            )}

            {/* Step 2: Question and Answer */}
            {activeStep === 1 && (
              <Fade in timeout={600}>
                <Box>
                  <Alert 
                    severity="info" 
                    icon={<AutoStoriesIcon />}
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                      '& .MuiAlert-message': {
                        width: '100%'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Reference Material
                        </Typography>
                        <Typography variant="body2">
                          {uploadedPdf?.name}
                        </Typography>
                      </Box>
                      <PsychologyIcon sx={{ fontSize: 32, opacity: 0.6 }} />
                    </Box>
                  </Alert>

                  <QuestionDisplay question={currentQuestion} questionNumber={1} />

                  <AnswerInput 
                    onSubmit={handleSubmitAnswer}
                    isSubmitting={isSubmitting}
                  />
                </Box>
              </Fade>
            )}

            {/* Step 3: Results */}
            {activeStep === 2 && detectionResult && (
              <Fade in timeout={600}>
                <Box>
                  <Card
                    elevation={0}
                    sx={{ 
                      mb: 3,
                      background: detectionResult.detected 
                        ? 'linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%)'
                        : 'linear-gradient(135deg, #f0fff4 0%, #d4f4dd 100%)',
                      border: '2px solid',
                      borderColor: detectionResult.detected ? '#ff6b6b' : '#51cf66',
                      borderRadius: 3
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ textAlign: 'center', mb: 3 }}>
                        {detectionResult.detected ? (
                          <WarningAmberIcon sx={{ fontSize: 72, color: '#ff6b6b', mb: 2 }} />
                        ) : (
                          <CheckCircleOutlineIcon sx={{ fontSize: 72, color: '#51cf66', mb: 2 }} />
                        )}
                      </Box>

                      {detectionResult.detected ? (
                        <>
                          <Typography 
                            variant="h5" 
                            component="div" 
                            gutterBottom 
                            textAlign="center"
                            fontWeight={700}
                            color="#c92a2a"
                          >
                            Potential Memorization Detected
                          </Typography>
                          <Typography 
                            variant="body1" 
                            textAlign="center" 
                            sx={{ mb: 2, fontWeight: 500 }}
                          >
                            Confidence: {(detectionResult.score * 100).toFixed(1)}%
                          </Typography>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="body1" color="text.secondary" textAlign="center">
                            Your answer shows high similarity to the uploaded study material. 
                            Try explaining the concept in your own words to demonstrate true understanding.
                          </Typography>
                          <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2 }}>
                            <Typography variant="body2" fontWeight={600} gutterBottom>
                              💡 Tips for Better Understanding:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              • Use analogies and real-world examples<br/>
                              • Explain concepts to someone else<br/>
                              • Connect ideas to what you already know
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        <>
                          <Typography 
                            variant="h5" 
                            component="div" 
                            gutterBottom 
                            textAlign="center"
                            fontWeight={700}
                            color="#2b8a3e"
                          >
                            Excellent Understanding! 
                          </Typography>
                          <Typography 
                            variant="body1" 
                            textAlign="center" 
                            sx={{ mb: 2, fontWeight: 500 }}
                          >
                            Authenticity Score: {((1 - detectionResult.score) * 100).toFixed(1)}%
                          </Typography>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="body1" color="text.secondary" textAlign="center">
                            Your answer demonstrates genuine comprehension of the concept.
                            Low similarity to source material indicates you truly understand rather than memorize.
                          </Typography>
                          <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2 }}>
                            <Typography variant="body2" fontWeight={600} gutterBottom>
                              🎯 Keep up the great work!
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              You're demonstrating deep understanding by expressing ideas in your own words.
                            </Typography>
                          </Box>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => {
                        setActiveStep(0);
                        setUploadedPdf(null);
                        setDetectionResult(null);
                      }}
                      size="large"
                      sx={{ 
                        borderRadius: 2,
                        px: 3
                      }}
                    >
                      Start New Assessment
                    </Button>
                    <Button 
                      variant="contained"
                      onClick={() => setActiveStep(1)}
                      size="large"
                      sx={{ 
                        borderRadius: 2,
                        px: 3,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5568d3 0%, #653a8a 100%)',
                        }
                      }}
                    >
                      Try Another Question
                    </Button>
                  </Box>
                </Box>
              </Fade>
            )}
          </Paper>
        </Grow>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Built with ❤️ to promote genuine learning
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AssessmentView;