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

  // Create stable validation handlers
  const createValidationHandler = useCallback((stepIndex: number) => {
    return (isValid: boolean) => {
      setStepValidation(prev => ({ ...prev, [stepIndex]: isValid }));
    };
  }, []);

  // Dynamically create steps based on questions data
  const typedQuestionsData = questionsData as QuestionsData;
  const steps: FormStep[] = useMemo(() => [
    {
      id: 'instructions',
      title: 'Assessment Instructions',
      component: (props: Record<string, unknown>) => (
        <AssessmentInstructions 
          {...props}
          onNext={props.onNext as () => void}
          canGoNext={props.canGoNext as boolean}
          onValidationChange={createValidationHandler(0)}
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
          onValidationChange={createValidationHandler(index + 1)}
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
          onValidationChange={createValidationHandler(typedQuestionsData.questions.length + 1)}
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
    createValidationHandler
  ]);

  const currentStep = steps[currentStepIndex];
  const totalSteps = typedQuestionsData.questions.length + 2; // +2 for instructions and user details
  const progress = getSurveyProgress(typedQuestionsData.questions.length, currentStepIndex);
  const progressPercentage = progress.progressPercentage;

  const handleNext = useCallback(() => {
    // Only proceed if current step is valid
    if (stepValidation[currentStepIndex]) {
      // Mark current step as completed
      setCompletedSteps(prev => new Set([...prev, currentStepIndex]));
      
      // Move to next step if available
      if (currentStepIndex < typedQuestionsData.questions.length + 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      }
    }
  }, [currentStepIndex, stepValidation, typedQuestionsData.questions.length]);

  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex]);

  const canGoNext = currentStepIndex < (typedQuestionsData.questions.length + 1) && stepValidation[currentStepIndex];
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
