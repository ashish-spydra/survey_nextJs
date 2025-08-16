import React, { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import './AssessmentInstructions.css';

interface AssessmentInstructionsProps {
  onNext?: () => void;
  onPrevious?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  currentStep?: number;
  totalSteps?: number;
  onValidationChange?: (isValid: boolean) => void;
}

const AssessmentInstructions: React.FC<AssessmentInstructionsProps> = ({ 
  onNext, 
  onValidationChange 
}) => {
  // Mark as valid immediately - no validation needed for instructions
  useEffect(() => {
    onValidationChange?.(true);
  }, []); // Empty dependency array - only run once on mount
  return (
    <div className="assessment-step-content">
      <div className="instructions-section">
        <h1 className="instructions-title">Assessment Instructions:</h1>
        
        <p className="instruction-text">
          You&apos;ll be presented with a series of questions about your organization&apos;s workplace preferences.
        </p>

        <div className="instructions-list">
          <ul>
            <li>Each question presents four options</li>
            <li>Allocate a total of 100 points across the four options to reflect:</li>
            <li className="indented">Your organisation&apos;s Current State (how it is today)</li>
            <li className="indented">Your organisation&apos;s Aspirational State (how you want it to be in future)</li>
            <li>Do not assign equal points to any of the four options</li>
            <li>Ensure that all 100 points are fully distributed in each section (Current & Aspirational State) before proceeding to the next question</li>
          </ul>
        </div>

        {/* Next Button - Part of main content */}
        <div className="next-button-section">
          <button 
            className="next-button" 
            onClick={onNext}
          >
            <span>NEXT</span>
            <ArrowRight className="next-arrow" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentInstructions;
