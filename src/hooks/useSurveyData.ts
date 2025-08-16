import { useState, useCallback } from 'react';
import { surveyService, type SurveySubmissionData } from '../services/surveyService';

export interface QuestionResponse {
  questionId: number;
  questionTitle: string;
  currentState: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
  aspirationalState: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
}

export interface UserDetails {
  fullName: string;
  email: string;
  phoneNumber: string;
  designation: string;
  cohortTeam: string;
  officeTypology: string;
  company: string;
}

export interface SurveyData {
  userDetails: UserDetails | null;
  questionResponses: QuestionResponse[];
  startTime: number;
}

export const useSurveyData = () => {
  const [surveyData, setSurveyData] = useState<SurveyData>({
    userDetails: null,
    questionResponses: [],
    startTime: Date.now()
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Save question response
  const saveQuestionResponse = useCallback((response: QuestionResponse) => {
    setSurveyData(prev => {
      const existingIndex = prev.questionResponses.findIndex(
        r => r.questionId === response.questionId
      );

      const updatedResponses = [...prev.questionResponses];
      
      if (existingIndex >= 0) {
        // Update existing response
        updatedResponses[existingIndex] = response;
      } else {
        // Add new response
        updatedResponses.push(response);
      }

      return {
        ...prev,
        questionResponses: updatedResponses
      };
    });
  }, []);

  // Save user details
  const saveUserDetails = useCallback((userDetails: UserDetails) => {
    setSurveyData(prev => ({
      ...prev,
      userDetails
    }));
  }, []);

  // Get question response by ID
  const getQuestionResponse = useCallback((questionId: number): QuestionResponse | null => {
    return surveyData.questionResponses.find(r => r.questionId === questionId) || null;
  }, [surveyData.questionResponses]);

  // Submit survey
  const submitSurvey = useCallback(async (userDetails: UserDetails): Promise<boolean> => {
    console.log('Survey data before submit:', surveyData);
    console.log('User details passed:', userDetails);
    console.log('Question responses count:', surveyData.questionResponses.length);
    console.log('Question responses:', surveyData.questionResponses);
    
    if (!userDetails || surveyData.questionResponses.length === 0) {
      if (!userDetails) {
        setSubmitError('Missing user details');
      } else if (surveyData.questionResponses.length === 0) {
        setSubmitError('Please complete all survey questions before submitting');
      } else {
        setSubmitError('Missing required survey data');
      }
      return false;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const completionTime = Math.round((Date.now() - surveyData.startTime) / 1000);
      
      const submissionData: SurveySubmissionData = {
        userDetails: userDetails,
        questionResponses: surveyData.questionResponses,
        completionTime
      };

      const result = await surveyService.submitSurvey(submissionData);

      if (result.success) {
        setSubmitSuccess(true);
        console.log('Survey submitted successfully:', result.data);
        // Store the redirect URL if provided
        if (result.data && typeof result.data === 'object' && 'redirectUrl' in result.data) {
          // Store in localStorage or state for the frontend to use
          localStorage.setItem('surveyRedirectUrl', result.data.redirectUrl as string);
        }
        return true;
      } else {
        setSubmitError(result.error || 'Failed to submit survey');
        return false;
      }
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [surveyData.questionResponses, surveyData.startTime, surveyData]);

  // Reset survey data
  const resetSurvey = useCallback(() => {
    setSurveyData({
      userDetails: null,
      questionResponses: [],
      startTime: Date.now()
    });
    setIsSubmitting(false);
    setSubmitError(null);
    setSubmitSuccess(false);
  }, []);

  // Get survey progress
  const getSurveyProgress = useCallback((totalQuestions: number) => {
    const completedQuestions = surveyData.questionResponses.length;
    const hasUserDetails = surveyData.userDetails !== null;
    
    return {
      completedQuestions,
      totalQuestions,
      hasUserDetails,
      progressPercentage: Math.round(
        ((completedQuestions + (hasUserDetails ? 1 : 0)) / (totalQuestions + 1)) * 100
      )
    };
  }, [surveyData]);

  return {
    // Data
    surveyData,
    
    // Actions
    saveQuestionResponse,
    saveUserDetails,
    getQuestionResponse,
    submitSurvey,
    resetSurvey,
    getSurveyProgress,
    
    // Status
    isSubmitting,
    submitError,
    submitSuccess
  };
};
