
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import CircularProgress from './CircularProgress';
import './FormFooter.css';

interface FormFooterProps {
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  progressPercentage: number;
  currentStep: number;
  totalSteps: number;
}

const FormFooter: React.FC<FormFooterProps> = ({
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  progressPercentage,
  currentStep,
  totalSteps
}) => {
  return (
    <div className="form-footer">
      {/* Progress Section */}
      <div className="footer-progress-section">
        <CircularProgress 
          percentage={progressPercentage} 
          size={60} 
          strokeWidth={4} 
        />
        <div className="progress-info">
          <span className="progress-warning">Never submit password! Submission guidelines</span>
          <ChevronDown className="progress-arrow" size={16} />
        </div>
      </div>

      {/* Navigation Section */}
      <div className="footer-navigation-section">
        {/* Scroll Arrows */}
        <div className="scroll-arrows">
          <button className="scroll-button" onClick={onPrevious} disabled={!canGoPrevious}>
            <ChevronUp size={16} />
          </button>
          <button className="scroll-button" onClick={onNext} disabled={!canGoNext}>
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormFooter;
