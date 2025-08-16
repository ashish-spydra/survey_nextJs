import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import questionsData from '../data/questions.json';
import type { QuestionsData } from '../types/questions';
import type { QuestionResponse } from '../hooks/useSurveyData';
import './QuestionPage.css';

interface QuestionPageProps {
  onNext?: () => void;
  onPrevious?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  currentStep?: number;
  totalSteps?: number;
  questionNumber?: number;
  onSaveResponse?: (response: QuestionResponse) => void;
  existingResponse?: QuestionResponse | null;
  onValidationChange?: (isValid: boolean) => void;
}

interface PointsState {
  current: { A: number; B: number; C: number; D: number };
  aspirational: { A: number; B: number; C: number; D: number };
}

const QuestionPage: React.FC<QuestionPageProps> = ({ 
  onNext, 
  questionNumber = 1,
  onSaveResponse,
  existingResponse,
  onValidationChange
}) => {
  const [points, setPoints] = useState<PointsState>({
    current: { A: 0, B: 0, C: 0, D: 0 },
    aspirational: { A: 0, B: 0, C: 0, D: 0 }
  });

  // Load existing response data when component mounts
  useEffect(() => {
    if (existingResponse) {
      setPoints({
        current: existingResponse.currentState,
        aspirational: existingResponse.aspirationalState
      });
    }
  }, [existingResponse]);

  const handlePointChange = (
    type: 'current' | 'aspirational',
    option: 'A' | 'B' | 'C' | 'D',
    value: number
  ) => {
    setPoints(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [option]: Math.max(0, Math.min(100, value))
      }
    }));
  };

  const getTotalPoints = (type: 'current' | 'aspirational') => {
    return Object.values(points[type]).reduce((sum, val) => sum + val, 0);
  };

  const hasEqualPoints = (pointsObj: { A: number; B: number; C: number; D: number }) => {
    const values = Object.values(pointsObj);
    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        if (values[i] === values[j] && values[i] > 0) {
          return true;
        }
      }
    }
    return false;
  };

  const canProceed = () => {
    const currentTotal = getTotalPoints('current');
    const aspirationalTotal = getTotalPoints('aspirational');
    const currentHasEqual = hasEqualPoints(points.current);
    const aspirationalHasEqual = hasEqualPoints(points.aspirational);
    
    return currentTotal === 100 && 
           aspirationalTotal === 100 && 
           !currentHasEqual && 
           !aspirationalHasEqual;
  };

  // Notify parent about validation status whenever points change
  useEffect(() => {
    const isValid = canProceed();
    onValidationChange?.(isValid);
  }, [points]); // Remove onValidationChange from dependencies to prevent infinite re-renders

  const getValidationMessage = () => {
    const currentTotal = getTotalPoints('current');
    const aspirationalTotal = getTotalPoints('aspirational');
    const currentHasEqual = hasEqualPoints(points.current);
    const aspirationalHasEqual = hasEqualPoints(points.aspirational);

    if (currentTotal !== 100 || aspirationalTotal !== 100) {
      return "Please ensure both Current and Aspirational states total exactly 100 points each.";
    }
    
    if (currentHasEqual) {
      return "Current State: Do not assign equal points to any of the four options.";
    }
    
    if (aspirationalHasEqual) {
      return "Aspirational State: Do not assign equal points to any of the four options.";
    }
    
    return "";
  };

  // Handle next button click - save response and proceed
  const handleNext = () => {
    if (canProceed() && onSaveResponse) {
      const response: QuestionResponse = {
        questionId: questionNumber,
        questionTitle: questionData.title,
        currentState: points.current,
        aspirationalState: points.aspirational
      };
      
      onSaveResponse(response);
    }
    
    if (onNext) {
      onNext();
    }
  };

  // Get the question data based on questionNumber
  const typedQuestionsData = questionsData as QuestionsData;
  const questionData = typedQuestionsData.questions.find(q => q.id === questionNumber) || typedQuestionsData.questions[0];

  return (
    <div className="question-page-content">
      <div className="question-section">
        <div className="question-header">
          <h1 className="question-title">{questionData.title}</h1>
        </div>

        <div className="question-table">
          <div className="table-header">
            <div className="option-header-cell"></div>
            <div className="state-header-cell">Current</div>
            <div className="state-header-cell">Aspirational</div>
          </div>

          {questionData.options.map((option, index) => {
            const optionKey = String.fromCharCode(65 + index) as 'A' | 'B' | 'C' | 'D';
            return (
              <div key={optionKey} className="table-row">
                <div className="option-cell">
                  <span className="option-text">{option}</span>
                </div>
                <div className="input-cell">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={points.current[optionKey]}
                    onChange={(e) => handlePointChange('current', optionKey, parseInt(e.target.value) || 0)}
                    className="points-input"
                  />
                </div>
                <div className="input-cell">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={points.aspirational[optionKey]}
                    onChange={(e) => handlePointChange('aspirational', optionKey, parseInt(e.target.value) || 0)}
                    className="points-input"
                  />
                </div>
              </div>
            );
          })}

          <div className="table-footer">
            <div className="footer-cell"></div>
            <div className="total-cell">
              <input
                type="number"
                value={getTotalPoints('current')}
                readOnly
                className="total-input"
              />
            </div>
            <div className="total-cell">
              <input
                type="number"
                value={getTotalPoints('aspirational')}
                readOnly
                className="total-input"
              />
            </div>
          </div>
        </div>

        {/* Next Button */}
        <div className="next-button-section">
          <button 
            className={`next-button ${!canProceed() ? 'disabled' : ''}`}
            onClick={canProceed() ? handleNext : undefined}
            disabled={!canProceed()}
          >
            <span>NEXT</span>
            <ArrowRight className="next-arrow" size={20} />
          </button>
          {!canProceed() && (
            <p className="proceed-warning">
              {getValidationMessage()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;
