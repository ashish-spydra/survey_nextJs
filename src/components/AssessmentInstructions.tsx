import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import './AssessmentInstructions.css';

interface AssessmentInstructionsProps {
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
  canGoNext?: boolean;
}

const AssessmentInstructions: React.FC<AssessmentInstructionsProps> = ({ 
  onValidationChange, 
  onNext, 
  canGoNext 
}) => {
  const hasValidated = useRef(false);

  useEffect(() => {
    // Only validate once and only if onValidationChange exists
    if (onValidationChange && !hasValidated.current) {
      hasValidated.current = true;
      onValidationChange(true);
    }
  }, [onValidationChange]);

  return (
    <div className="assessment-instructions">
      <div className="instructions-container">
        <h1 className="instructions-title">Assessment Instructions:</h1>
        
        <div className="instructions-content">
          <div className="instructions-list">
            <ul>
              <li>Each question presents four options</li>
              <li>Allocate a total of 100 points across the four options to reflect:</li>
              <li className="indented">
                Your organisation&apos;s <strong>Current State</strong> (how it is today)
              </li>
              <li className="indented">
                Your organisation&apos;s <strong>Aspirational State</strong> (how you want it to be in future)
              </li>
              <li>Do not assign equal points to any of the four options</li>
              <li className="final-instruction">Ensure that all 100 points are fully distributed in each section (Current & Aspirational State) before proceeding to the next question</li>
            </ul>
          </div>
        </div>

        {/* Next Button */}
        <div className="next-button-section">
          <button 
            className="next-button" 
            onClick={onNext}
            disabled={!canGoNext}
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
