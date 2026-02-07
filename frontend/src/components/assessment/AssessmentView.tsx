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
  Grow,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText
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
import { generateQuestions, uploadPdfForQuestions } from '../../api/llmApi';
import { submitAnswer, runDetection } from '../../api/assessmentApi';

const AssessmentView: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [uploadedPdf, setUploadedPdf] = useState<File | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectionResult, setDetectionResult] = useState<{
    detected: boolean;
    score: number;
    message: string;
  } | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  const handlePdfUpload = async (file: File) => {
    console.log('PDF uploaded:', file.name);
    setUploadedPdf(file);
    setLoadingQuestions(true);
    
    try {
      // Step 1: Upload PDF and extract text
      const { text, concept } = await uploadPdfForQuestions(file);
      console.log('Extracted concept:', concept);
      
      // Step 2: Generate questions using LLM
      const response = await generateQuestions({
        concept: concept,
        difficulty: 'medium',
        num_variations: 5, // Generate 5 questions
        reference_text: text
      });
      
      setQuestions(response.questions);
      setCurrentQuestionIndex(0);
      setActiveStep(1); // Move to question selection step
      
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error processing PDF. Using mock questions for demo.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
    setActiveStep(2); // Move to answer step
  };

  const handleSubmitAnswer = async (answerText: string, responseTime: number) => {
    console.log('Submitting answer:', { answerText, responseTime });
  
    setIsSubmitting(true);
    setDetectionResult(null);

    try {
      // Prepare answer data once
      const answerData = {
        question_id: currentQuestion.id,
        student_id: 1,
        answer_text: answerText,
        response_time_seconds: responseTime,
        reference_pdf: uploadedPdf?.name
      };

      // Submit answer
      const submitResponse = await submitAnswer(answerData);
      
      // Run detection with both answerId AND answerData
      const detection = await runDetection(
        submitResponse.answer_id,
        answerData  // ← This is the missing second parameter
      );
      
      setDetectionResult({
        detected: detection.overfitting_detected,
        score: detection.confidence_score,
        message: detection.evidence.reason
      });
      
      setActiveStep(3);
      
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Error analyzing answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = ['Upload Material', 'Select Question', 'Answer Question', 'View Results'];

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
              Think Smarter, Learn Harder
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
              {steps.map((label) => (
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
                      Upload Your Study Material
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      We'll analyze it and generate personalized questions
                    </Typography>
                  </Box>
                  <PdfUpload 
                    onFileUpload={handlePdfUpload}
                    label="Upload Study Material"
                    helperText="Upload your textbook, notes, or study guide (PDF format)"
                  />
                  
                  {loadingQuestions && (
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                      <CircularProgress size={60} sx={{ color: '#667eea', mb: 2 }} />
                      <Typography variant="body1" fontWeight={600}>
                        Analyzing your material...
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Our AI is generating personalized questions
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Fade>
            )}

            {/* Step 2: Question Selection */}
            {activeStep === 1 && (
              <Fade in timeout={600}>
                <Box>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <PsychologyIcon sx={{ fontSize: 64, color: '#764ba2', mb: 2 }} />
                    <Typography variant="h5" gutterBottom fontWeight={600}>
                      Choose a Question
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Select any question to test your understanding
                    </Typography>
                  </Box>

                  <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {questions.length} questions generated from: {uploadedPdf?.name}
                    </Typography>
                  </Alert>

                  <List>
                    {questions.map((question, index) => (
                      <ListItem key={question.id} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                          onClick={() => handleQuestionSelect(index)}
                          sx={{
                            borderRadius: 2,
                            border: '2px solid',
                            borderColor: '#e9ecef',
                            '&:hover': {
                              borderColor: '#667eea',
                              bgcolor: '#f8f9ff'
                            }
                          }}
                        >
                          <Box sx={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: '50%', 
                            bgcolor: '#667eea', 
                            color: 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontWeight: 700,
                            mr: 2
                          }}>
                            {index + 1}
                          </Box>
                          <ListItemText
                            primary={question.question}
                            primaryTypographyProps={{
                              fontWeight: 500,
                              fontSize: '1rem'
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Fade>
            )}

            {/* Step 3: Answer Question */}
            {activeStep === 2 && currentQuestion && (
              <Fade in timeout={600}>
                <Box>
                  <Alert 
                    severity="info" 
                    icon={<AutoStoriesIcon />}
                    sx={{ 
                      mb: 3,
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </Typography>
                    <Typography variant="body2">
                      Reference: {uploadedPdf?.name}
                    </Typography>
                  </Alert>

                  <QuestionDisplay 
                    question={currentQuestion} 
                    questionNumber={currentQuestionIndex + 1}
                    totalQuestions={questions.length}
                  />

                  <AnswerInput 
                    onSubmit={handleSubmitAnswer}
                    isSubmitting={isSubmitting}
                  />

                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setActiveStep(1)}
                      sx={{ borderRadius: 2 }}
                    >
                      Choose Different Question
                    </Button>
                  </Box>
                </Box>
              </Fade>
            )}

            {/* Step 4: Results */}
            {activeStep === 3 && detectionResult && (
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
                            Memorization Detected
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
                            {detectionResult.message}
                          </Typography>
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
                            Authenticity: {((1 - detectionResult.score) * 100).toFixed(1)}%
                          </Typography>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="body1" color="text.secondary" textAlign="center">
                            {detectionResult.message}
                          </Typography>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => setActiveStep(1)}
                      size="large"
                      sx={{ borderRadius: 2, px: 3 }}
                    >
                      Try Another Question
                    </Button>
                    <Button 
                      variant="contained"
                      onClick={() => {
                        setActiveStep(0);
                        setUploadedPdf(null);
                        setQuestions([]);
                        setDetectionResult(null);
                      }}
                      size="large"
                      sx={{ 
                        borderRadius: 2,
                        px: 3,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}
                    >
                      Start New Assessment
                    </Button>
                  </Box>
                </Box>
              </Fade>
            )}
          </Paper>
        </Grow>
      </Container>
    </Box>
  );
};

export default AssessmentView;