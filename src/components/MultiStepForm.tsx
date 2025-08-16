import React, { useState, useCallback, useMemo } from 'react';
import FormHeader from './FormHeader';
import FormFooter from './FormFooter';
import AssessmentInstructions from './AssessmentInstructions';
import QuestionPage from './QuestionPage';
import UserDetailsForm from './UserDetailsForm';
import questionsData from '../data/questions.json';
import type { QuestionsData } from '../types/questions';
import { useSurveyData } from '../hooks/useSurveyData';
import './MultiStepForm.css';

export interface FormStep {
  id: string;
  title: string;
  component: React.ComponentType<Record<string, unknown>>;
  isCompleted: boolean;
}

const MultiStepForm: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepValidation, setStepValidation] = useState<Record<number, boolean>>({
    0: true // Assessment instructions are always valid
  });

  const handleStepValidation = useCallback((stepIndex: number, isValid: boolean) => {
    setStepValidation(prev => ({
      ...prev,
      [stepIndex]: isValid
    }));
  }, []); // Empty dependency array since this function doesn't depend on any props or state

  const {
    surveyData,
    saveQuestionResponse,
    saveUserDetails,
    getQuestionResponse,
    submitSurvey,
    getSurveyProgress,
    isSubmitting,
    submitError,
    submitSuccess
  } = useSurveyData();

  // Dynamically create steps based on questions data
  const typedQuestionsData = questionsData as QuestionsData;
  const steps: FormStep[] = useMemo(() => [
    {
      id: 'instructions',
      title: 'Assessment Instructions',
      component: (props: Record<string, unknown>) => (
        <AssessmentInstructions 
          {...props}
          onValidationChange={(isValid: boolean) => handleStepValidation(0, isValid)}
        />
      ),
      isCompleted: completedSteps.has(0)
    },
    ...typedQuestionsData.questions.map((question, index) => ({
      id: `question-${question.id}`,
      title: `Question ${question.id}`,
      component: (props: Record<string, unknown>) => (
        <QuestionPage 
          {...props} 
          questionNumber={question.id}
          onSaveResponse={saveQuestionResponse}
          existingResponse={getQuestionResponse(question.id)}
          onValidationChange={(isValid: boolean) => handleStepValidation(index + 1, isValid)}
        />
      ),
      isCompleted: completedSteps.has(index + 1)
    })),
    {
      id: 'user-details',
      title: 'User Details',
      component: (props: Record<string, unknown>) => (
        <UserDetailsForm 
          {...props}
          onSaveUserDetails={saveUserDetails}
          onSubmitSurvey={submitSurvey}
          existingUserDetails={surveyData.userDetails}
          isSubmitting={isSubmitting}
          submitError={submitError}
          submitSuccess={submitSuccess}
          onValidationChange={(isValid: boolean) => handleStepValidation(typedQuestionsData.questions.length + 1, isValid)}
        />
      ),
      isCompleted: completedSteps.has(typedQuestionsData.questions.length + 1)
    }
  ], [
    completedSteps,
    saveQuestionResponse,
    getQuestionResponse,
    saveUserDetails,
    submitSurvey,
    surveyData.userDetails,
    isSubmitting,
    submitError,
    submitSuccess,
    typedQuestionsData.questions,
    handleStepValidation
  ]);

  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  const progress = getSurveyProgress(typedQuestionsData.questions.length);
  const progressPercentage = progress.progressPercentage;

  const handleNext = useCallback(() => {
    // Only proceed if current step is valid
    if (stepValidation[currentStepIndex]) {
      // Mark current step as completed
      setCompletedSteps(prev => new Set([...prev, currentStepIndex]));
      
      // Move to next step if available
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      }
    }
  }, [currentStepIndex, stepValidation, steps.length]);

  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex]);

  const canGoNext = currentStepIndex < steps.length - 1 && stepValidation[currentStepIndex];
  const canGoPrevious = currentStepIndex > 0;

  const CurrentStepComponent = currentStep.component;

  return (
    <div className="multistep-form">
      <FormHeader />
      
      <div className="form-content">
        <CurrentStepComponent 
          onNext={handleNext}
          onPrevious={handlePrevious}
          canGoNext={canGoNext}
          canGoPrevious={canGoPrevious}
          currentStep={currentStepIndex + 1}
          totalSteps={totalSteps}
        />
      </div>

      <FormFooter 
        onNext={handleNext}
        onPrevious={handlePrevious}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        progressPercentage={progressPercentage}
        currentStep={currentStepIndex + 1}
        totalSteps={totalSteps}
      />
    </div>
  );
};

export default MultiStepForm;
