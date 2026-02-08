import React, { useState, useRef } from 'react';
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
  LinearProgress,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import QuestionDisplay from './QuestionDisplay';
import PdfUpload from './PdfUpload';
import { Question, DetectionResult } from '../../types/assessment.types';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import SendIcon from '@mui/icons-material/Send';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { generateQuestions, uploadPdfForQuestions } from '../../api/llmApi';
import { submitAnswer, runDetection } from '../../api/assessmentApi';

interface QuestionResult {
  question: Question;
  answer: string;
  detection?: DetectionResult; // Optional - only for open-ended questions
  isCorrect?: boolean; // For multiple choice questions
}

const AssessmentView: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [uploadedPdf, setUploadedPdf] = useState<File | null>(null);
  const [referenceSummary, setReferenceSummary] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);

  // Tracks all answers: question ID → answer text
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // Results after batch submission
  const [allResults, setAllResults] = useState<QuestionResult[]>([]);
  //will try to use expandedQuestionId for UI changes later (i.e disabling other accordions while one is open and highlighting open accordions, etc.)
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);
  
  const accordionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const answeredCount = Object.keys(answers).length;

  const handlePdfUpload = async (file: File) => {
    setUploadedPdf(file);
    setLoadingQuestions(true);

    try {
      const { text, concept, filename } = await uploadPdfForQuestions(file);
      setReferenceSummary(text);  // Store for adaptive practice

      const response = await generateQuestions({
        concept: concept,
        difficulty: 'medium',
        num_variations: 5,
        reference_text: text,
        filename: filename
      });

      setQuestions(response.questions);
      setAnswers({});
      setActiveStep(1);
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error processing PDF. Please try again.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAnswerChange = (questionId: number, answerText: string) => {
    setAnswers(prev => {
      const updated = { ...prev };
      if (answerText.trim() === '') {
        delete updated[questionId];
      } else {
        updated[questionId] = answerText;
      }
      return updated;
    });
  };

  const handleAccordionChange = (expandedQuestionId: number, isExpanding: boolean) => {
    if (isExpanding) {
      setExpandedQuestionId(expandedQuestionId);
      // Wait for the accordion to expand, then center the element (including details) in the viewport
      setTimeout(() => {
        const el = accordionRefs.current[expandedQuestionId];
        if (!el) return;

        // Center the expanded question box in the middle of the screen
        const rect = el.getBoundingClientRect();
        const elementCenterY = rect.top + rect.height / 2 + window.scrollY;
        const viewportCenterY = window.innerHeight / 2;
        const targetScrollTop = Math.max(0, Math.round(elementCenterY - viewportCenterY));
        window.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
      }, 200); // delay for accordion anim (subject to change)
    } else {
      setExpandedQuestionId(null);
    }
  };

  const handleSubmitAll = async () => {
    if (answeredCount === 0) {
      alert('Please answer at least one question before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitProgress(0);

    const results: QuestionResult[] = [];
    const answeredQuestions = questions.filter(q => answers[q.id]);
    let processed = 0;

    try {
      for (const question of answeredQuestions) {
        const answerText = answers[question.id];

<<<<<<< HEAD
        // Multiple choice: only check if answer is correct
        if (question.type === 'multiple_choice') {
          const isCorrect = answerText === question.correct_answer;
          results.push({ question, answer: answerText, isCorrect });
        }
        // Open-ended: run detection
        else {
          const sampleAnswer = question.sample_answer;
          const answerData = {
            question_id: question.id,
            student_id: 1,
            answer_text: answerText,
            response_time_seconds: 0,
            reference_pdf: uploadedPdf?.name,
            sample_answer: sampleAnswer,
            concept: question.concept,
          };
=======
        const answerData = {
          question_id: question.id,
          student_id: 1,
          answer_text: answerText,
          response_time_seconds: 0,
          reference_pdf: uploadedPdf?.name,
          sample_answer: sampleAnswer,
          correct_answer: question.type === 'multiple_choice' ? question.correct_answer : undefined,
          question_type: question.type,
          concept: question.concept,
        };
>>>>>>> 624415dadf58f70e6ba14c5cc9eb3be259855ea2

          const submitResponse = await submitAnswer(answerData);
          const detection = await runDetection(submitResponse.answer_id, answerData);

          results.push({ question, answer: answerText, detection });
        }

        processed++;
        setSubmitProgress(Math.round((processed / answeredQuestions.length) * 100));
      }

      setAllResults(results);
      setActiveStep(2);
    } catch (error) {
      console.error('Error submitting answers:', error);
      alert('Error analyzing answers. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdaptivePractice = async () => {
    const conceptPerformance = analyzePerformanceByConcept();

    if (conceptPerformance.size === 0) {
      alert('No concept data available for adaptive practice.');
      return;
    }

    setLoadingQuestions(true);

    try {
      const allAdaptiveQuestions: Question[] = [];

      for (const [concept, data] of conceptPerformance.entries()) {
        console.log(
          `Generating ${data.suggestedDifficulty} questions for ${concept} ` +
          `(${data.correctPercentage}% correct)`
        );

        const response = await generateQuestions({
          concept: concept,
          difficulty: data.suggestedDifficulty,
          num_variations: 5,
          filename: uploadedPdf?.name,
          reference_text: referenceSummary
        });

        allAdaptiveQuestions.push(...response.questions);
      }

      setQuestions(allAdaptiveQuestions);
      setAnswers({});
      setAllResults([]);
      setExpandedQuestionId(null); // Close any open accordion
      setActiveStep(1);

      // Scroll to top of page after generating new questions
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);

    } catch (error) {
      console.error('Error generating adaptive questions:', error);
      alert('Error generating adaptive practice. Please try again.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Compute summary stats from results
  const getResultsSummary = () => {
    if (allResults.length === 0) return null;

    const totalAnswered = allResults.length;
    const totalQuestions = questions.length;

    // Count multiple choice results
    const mcResults = allResults.filter(r => r.question.type === 'multiple_choice');
    const mcCorrect = mcResults.filter(r => r.isCorrect).length;

    // Only analyze open-ended questions for memorization detection
    const openEndedResults = allResults.filter(r => r.question.type === 'open_ended' && r.detection);
    const genuineCount = openEndedResults.filter(r => r.detection!.detection_type === 'genuine').length;
    const memorizedCount = openEndedResults.filter(r => r.detection!.overfitting_detected).length;
    const surfaceCount = openEndedResults.filter(r => r.detection!.detection_type === 'surface').length;

<<<<<<< HEAD
    const avgSimilarity = openEndedResults.length > 0
      ? openEndedResults.reduce((sum, r) => sum + (r.detection!.confidence_score || 0), 0) / openEndedResults.length
      : 0;

    // Calculate percentages based on open-ended questions only
    const understandingPct = openEndedResults.length > 0
      ? Math.round((genuineCount / openEndedResults.length) * 100)
      : 0;
    const memorizationPct = openEndedResults.length > 0
      ? Math.round((memorizedCount / openEndedResults.length) * 100)
      : 0;
    const mcAccuracyPct = mcResults.length > 0
      ? Math.round((mcCorrect / mcResults.length) * 100)
      : 0;
=======
    const understandingPct = Math.round((genuineCount / totalAnswered) * 100);
    const memorizationPct = Math.round(avgSimilarity * 100);
>>>>>>> 624415dadf58f70e6ba14c5cc9eb3be259855ea2

    let overallMessage: string;
    let overallType: 'success' | 'warning' | 'error';

    // Base assessment on open-ended understanding and MC accuracy
    if (openEndedResults.length === 0) {
      // Only multiple choice answered
      if (mcAccuracyPct >= 80) {
        overallMessage = `Great job on multiple choice! You got ${mcAccuracyPct}% correct. Try answering open-ended questions to demonstrate deeper understanding.`;
        overallType = 'success';
      } else if (mcAccuracyPct >= 60) {
        overallMessage = `You got ${mcAccuracyPct}% of multiple choice correct. Review the material and try the open-ended questions for better learning.`;
        overallType = 'warning';
      } else {
        overallMessage = `Only ${mcAccuracyPct}% correct on multiple choice. Review the material and try again.`;
        overallType = 'error';
      }
    } else if (memorizationPct > 50) {
      overallMessage = "You're relying too heavily on memorization. Try explaining concepts in your own words instead of repeating what's in the notes.";
      overallType = 'error';
    } else if (genuineCount === openEndedResults.length && mcAccuracyPct >= 80) {
      overallMessage = "Excellent! You demonstrate genuine understanding of the material. Your answers show real comprehension, not just memorization.";
      overallType = 'success';
    } else if (surfaceCount > genuineCount) {
      overallMessage = "Your answers show surface-level understanding. Try to go deeper — explain the 'why' behind concepts, not just the 'what'.";
      overallType = 'warning';
    } else {
      overallMessage = "Good effort! Most of your answers show understanding, but review the flagged questions to strengthen weak areas.";
      overallType = 'warning';
    }

    return {
      totalAnswered,
      totalQuestions,
      mcResults: mcResults.length,
      mcCorrect,
      mcAccuracyPct,
      openEndedResults: openEndedResults.length,
      genuineCount,
      memorizedCount,
      surfaceCount,
      avgSimilarity,
      understandingPct,
      memorizationPct,
      overallMessage,
      overallType
    };
  };

  interface ConceptPerformance {
    concept: string;
    totalQuestions: number;
    correctCount: number;
    correctPercentage: number;
    suggestedDifficulty: 'easy' | 'medium' | 'hard';
  }

  const analyzePerformanceByConcept = (): Map<string, ConceptPerformance> => {
    const conceptMap = new Map<string, ConceptPerformance>();

    allResults.forEach((result) => {
      const concept = result.question.concept;

      if (!conceptMap.has(concept)) {
        conceptMap.set(concept, {
          concept,
          totalQuestions: 0,
          correctCount: 0,
          correctPercentage: 0,
          suggestedDifficulty: 'medium'
        });
      }

      const conceptData = conceptMap.get(concept)!;
      conceptData.totalQuestions += 1;

      // For multiple choice: count as correct if answer matches
      // For open-ended: count as correct if genuine OR (surface AND low confidence)
      let isCorrect = false;
      if (result.question.type === 'multiple_choice') {
        isCorrect = result.isCorrect || false;
      } else if (result.detection) {
        isCorrect =
          result.detection.detection_type === 'genuine' ||
          (result.detection.detection_type === 'surface' &&
           result.detection.confidence_score < 0.7);
      }

      if (isCorrect) conceptData.correctCount += 1;
    });

    // Calculate percentages and assign difficulty
    conceptMap.forEach((data) => {
      data.correctPercentage = Math.round(
        (data.correctCount / data.totalQuestions) * 100
      );

      if (data.correctPercentage >= 80) {
        data.suggestedDifficulty = 'hard';
      } else if (data.correctPercentage >= 50) {
        data.suggestedDifficulty = 'medium';
      } else {
        data.suggestedDifficulty = 'easy';
      }
    });

    return conceptMap;
  };

  const steps = ['Upload Material', 'Answer Questions', 'Results'];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #AEE0F9 0%, #6BB6D6 100%)',
      py: 6,
      // Hide scrollbar but keep scroll functionality
      '&::-webkit-scrollbar': {
        display: 'none'
      },
      scrollbarWidth: 'none', // Firefox
      msOverflowStyle: 'none', // IE and Edge
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
              Think Harder, Learn Smarter
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
                '& .MuiStepLabel-label': { fontWeight: 500 }
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        '&.Mui-completed': { color: '#AEE0F9' },
                        '&.Mui-active': { color: '#6BB6D6' }
                      }
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <Divider sx={{ mb: 4 }} />

            {/* Step 0: PDF Upload */}
            {activeStep === 0 && (
              <Fade in timeout={600}>
                <Box>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <AutoStoriesIcon sx={{ fontSize: 64, color: '#AEE0F9', mb: 2 }} />
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
                      <CircularProgress size={60} sx={{ color: '#AEE0F9', mb: 2 }} />
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

            {/* Step 1: All Questions */}
            {activeStep === 1 && (
              <Fade in timeout={600}>
                <Box>
                  <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {questions.length} questions generated from: {uploadedPdf?.name}
                    </Typography>
                    <Typography variant="body2">
                      Answer the questions below, then submit when you're ready. You don't have to answer all of them.
                    </Typography>
                  </Alert>

                  {questions.map((question, index) => {
                    const isAnswered = !!answers[question.id];
                    const typeLabel = question.type === 'multiple_choice' ? 'Multiple Choice' : 'Open Response';
                    const typeColor = question.type === 'multiple_choice' ? 'rgb(0, 91, 137)' : '#6bb6d6';

                    return (
                      <Accordion
                        key={question.id}
                        ref={(el) => {
                          if (el) accordionRefs.current[question.id] = el;
                        }}
                        disableGutters
                        expanded={expandedQuestionId === question.id}
                        onChange={(_, isExpanded) => handleAccordionChange(question.id, isExpanded)}
                        sx={{
                          mb: 2,
                          borderRadius: '12px !important',
                          border: '2px solid',
                          borderColor: isAnswered ? '#51cf66' : '#e0e0e0',
                          '&:before': { display: 'none' },
                          overflow: 'hidden',
                          transition: 'border-color 0.3s ease',
                          boxShadow: 'none'
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          sx={{
                            px: 2.5,
                            '& .MuiAccordionSummary-content': {
                              alignItems: 'center',
                              gap: 1.5,
                              my: 1,
                              minWidth: 0
                            }
                          }}
                        >
                          {/* Question number */}
                          <Box
                            sx={{
                              bgcolor: isAnswered ? '#51cf66' : '#AEE0F9',
                              color: isAnswered ? 'white' : '#1a1a1a',
                              minWidth: 32,
                              height: 32,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              flexShrink: 0
                            }}
                          >
                            {index + 1}
                          </Box>

                          {/* Type label */}
                          <Chip
                            label={typeLabel}
                            size="small"
                            sx={{
                              bgcolor: `${typeColor}12`,
                              color: typeColor,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 24,
                              flexShrink: 0
                            }}
                          />

                          {/* Question preview */}
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#495057',
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              minWidth: 0
                            }}
                          >
                            {question.question}
                          </Typography>

                          {/* Answered checkmark */}
                          {isAnswered && (
                            <CheckCircleIcon sx={{ color: '#51cf66', fontSize: 22, flexShrink: 0 }} />
                          )}
                        </AccordionSummary>

                        <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                          <QuestionDisplay
                            question={question}
                            questionNumber={index + 1}
                            totalQuestions={questions.length}
                            selectedAnswer={question.type === 'multiple_choice' ? answers[question.id] : undefined}
                            onSelectAnswer={question.type === 'multiple_choice'
                              ? (val) => handleAnswerChange(question.id, val)
                              : undefined
                            }
                            isAnswered={isAnswered}
                          />

                          {/* Inline textarea for open-ended questions */}
                          {question.type === 'open_ended' && (
                            <Box sx={{ mt: 1 }}>
                              <TextField
                                fullWidth
                                multiline
                                rows={4}
                                placeholder="Write your answer here..."
                                value={answers[question.id] || ''}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                variant="outlined"
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '& fieldset': {
                                      borderColor: isAnswered ? '#51cf66' : '#e0e0e0',
                                      borderWidth: 2
                                    },
                                    '&:hover fieldset': {
                                      borderColor: '#AEE0F9'
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: '#AEE0F9'
                                    }
                                  }
                                }}
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                {(answers[question.id] || '').length} characters
                              </Typography>
                            </Box>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}

                  {/* Submit button */}
                  {!isSubmitting ? (
                    <Box sx={{ textAlign: 'center', mt: 4, mb: 2 }}>
                      <Button
                        variant="contained"
                        size="large"
                        endIcon={<SendIcon />}
                        onClick={handleSubmitAll}
                        disabled={answeredCount === 0}
                        sx={{
                          borderRadius: 3,
                          px: 5,
                          py: 2,
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #AEE0F9 0%, #6BB6D6 100%)',
                          boxShadow: '0 4px 16px rgba(174, 224, 249, 0.4)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #7DC8E8 0%, #4A9ABF 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(174, 224, 249, 0.5)',
                          },
                          '&:disabled': {
                            background: '#e9ecef',
                            color: '#adb5bd',
                            boxShadow: 'none'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Submit Assessment ({answeredCount}/{questions.length} answered)
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', mt: 4, mb: 2 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 4,
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f4ff 100%)',
                          border: '2px solid #AEE0F9'
                        }}
                      >
                        <CircularProgress size={48} sx={{ color: '#AEE0F9', mb: 2 }} />
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                          Analyzing your answers...
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={submitProgress}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'rgba(174, 224, 249, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              background: 'linear-gradient(90deg, #AEE0F9 0%, #6BB6D6 100%)'
                            }
                          }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {submitProgress}% complete
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </Box>
              </Fade>
            )}

            {/* Step 2: Comprehensive Results */}
            {activeStep === 2 && (() => {
              const summary = getResultsSummary();
              if (!summary) return null;

              return (
                <Fade in timeout={600}>
                  <Box>
                    {/* Overall Summary */}
                    <Card
                      elevation={0}
                      sx={{
                        mb: 4,
                        background: summary.overallType === 'success'
                          ? 'linear-gradient(135deg, #f0fff4 0%, #d4f4dd 100%)'
                          : summary.overallType === 'error'
                            ? 'linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%)'
                            : 'linear-gradient(135deg, #fffbeb 0%, #fff3bf 100%)',
                        border: '2px solid',
                        borderColor: summary.overallType === 'success' ? '#51cf66'
                          : summary.overallType === 'error' ? '#ff6b6b' : '#ffd43b',
                        borderRadius: 3
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                          {summary.overallType === 'success' ? (
                            <CheckCircleOutlineIcon sx={{ fontSize: 72, color: '#51cf66', mb: 1 }} />
                          ) : (
                            <WarningAmberIcon sx={{ fontSize: 72, color: summary.overallType === 'error' ? '#ff6b6b' : '#ffd43b', mb: 1 }} />
                          )}
                          <Typography variant="h4" fontWeight={800} sx={{
                            color: summary.overallType === 'success' ? '#2b8a3e'
                              : summary.overallType === 'error' ? '#c92a2a' : '#e67700'
                          }}>
                            Assessment Complete
                          </Typography>
                        </Box>

                        {/* Stats Grid */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, textAlign: 'center', minWidth: 140, bgcolor: 'white' }}>
                            <Typography variant="h4" fontWeight={800} color="#AEE0F9">
                              {summary.totalAnswered}/{summary.totalQuestions}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                              Questions Answered
                            </Typography>
                          </Paper>
                          {summary.mcResults > 0 && (
                            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, textAlign: 'center', minWidth: 140, bgcolor: 'white' }}>
                              <Typography variant="h4" fontWeight={800} color={summary.mcAccuracyPct >= 70 ? '#51cf66' : '#ff6b6b'}>
                                {summary.mcAccuracyPct}%
                              </Typography>
                              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                MC Accuracy ({summary.mcCorrect}/{summary.mcResults})
                              </Typography>
                            </Paper>
                          )}
                          {summary.openEndedResults > 0 && (
                            <>
                              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, textAlign: 'center', minWidth: 140, bgcolor: 'white' }}>
                                <Typography variant="h4" fontWeight={800} color="#51cf66">
                                  {summary.understandingPct}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                  Understanding
                                </Typography>
                              </Paper>
                              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, textAlign: 'center', minWidth: 140, bgcolor: 'white' }}>
                                <Typography variant="h4" fontWeight={800} color={summary.memorizedCount > 0 ? '#ff6b6b' : '#51cf66'}>
                                  {summary.memorizationPct}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                  Memorization
                                </Typography>
                              </Paper>
                            </>
                          )}
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="body1" textAlign="center" sx={{ fontWeight: 500, color: '#495057' }}>
                          {summary.overallMessage}
                        </Typography>
                      </CardContent>
                    </Card>

                    {/* Per-Question Breakdown */}
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                      Question Breakdown
                    </Typography>

                    {allResults.map((result, index) => {
                      const isMC = result.question.type === 'multiple_choice';
                      const isCorrect = isMC ? result.isCorrect : result.detection?.detection_type === 'genuine';
                      const borderColor = isMC
                        ? (result.isCorrect ? '#51cf66' : '#ff6b6b')
                        : (result.detection?.overfitting_detected ? '#ff6b6b'
                            : result.detection?.detection_type === 'genuine' ? '#51cf66' : '#ffd43b');

                      return (
                        <Card
                          key={result.question.id}
                          elevation={0}
                          sx={{
                            mb: 2,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor
                          }}
                        >
                          <CardContent sx={{ py: 2, px: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {isCorrect ? (
                                <CheckCircleOutlineIcon sx={{ color: '#51cf66', fontSize: 28, flexShrink: 0 }} />
                              ) : (
                                <WarningAmberIcon sx={{
                                  color: isMC ? '#ff6b6b' : (result.detection?.overfitting_detected ? '#ff6b6b' : '#ffd43b'),
                                  fontSize: 28,
                                  flexShrink: 0
                                }} />
                              )}

                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={600} noWrap>
                                  Q{index + 1}: {result.question.question}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {isMC
                                    ? (result.isCorrect
                                        ? `Correct! You selected ${result.answer}`
                                        : `Incorrect. You selected ${result.answer}, correct answer is ${result.question.type === 'multiple_choice' ? result.question.correct_answer : ''}`)
                                    : result.detection?.evidence.reason || 'No analysis available'
                                  }
                                </Typography>
                              </Box>

                              <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                                {isMC ? (
                                  <Typography variant="caption" fontWeight={600} sx={{
                                    color: result.isCorrect ? '#2b8a3e' : '#c92a2a',
                                    textTransform: 'uppercase',
                                    fontSize: '0.7rem'
                                  }}>
                                    {result.isCorrect ? 'CORRECT' : 'INCORRECT'}
                                  </Typography>
                                ) : (
                                  <>
                                    <Typography variant="caption" fontWeight={600} sx={{
                                      color: result.detection?.detection_type === 'genuine' ? '#2b8a3e'
                                        : result.detection?.overfitting_detected ? '#c92a2a' : '#e67700',
                                      textTransform: 'uppercase',
                                      fontSize: '0.7rem'
                                    }}>
                                      {result.detection?.detection_type || 'UNKNOWN'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Similarity: {((result.detection?.confidence_score || 0) * 100).toFixed(0)}%
                                    </Typography>
                                  </>
                                )}
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      );
                    })}

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
                      <Button
                        variant="contained"
                        onClick={handleAdaptivePractice}
                        size="large"
                        startIcon={<EmojiObjectsIcon />}
                        sx={{
                          borderRadius: 2,
                          px: 4,
                          background: 'linear-gradient(135deg, #ffd43b 0%, #fab005 100%)',
                          color: '#1a1a1a',
                          fontWeight: 600,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #fab005 0%, #f59f00 100%)',
                          }
                        }}
                      >
                        Adaptive Practice
                      </Button>

                      <Button
                        variant="outlined"
                        onClick={() => {
                          setActiveStep(0);
                          setUploadedPdf(null);
                          setQuestions([]);
                          setAnswers({});
                          setAllResults([]);
                          setExpandedQuestionId(null); // Close any open accordion
                          // Scroll to top
                          setTimeout(() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }, 100);
                        }}
                        size="large"
                        sx={{
                          borderRadius: 2,
                          px: 4,
                          borderColor: '#AEE0F9',
                          color: '#1a1a1a'
                        }}
                      >
                        Start New Assessment
                      </Button>
                    </Box>
                  </Box>
                </Fade>
              );
            })()}
          </Paper>
        </Grow>
      </Container>
    </Box>
  );
};

export default AssessmentView;