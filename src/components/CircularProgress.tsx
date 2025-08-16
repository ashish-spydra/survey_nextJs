import React from 'react';
import './CircularProgress.css';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 60,
  strokeWidth = 4,
  className = ''
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`circular-progress ${className}`}>
      <svg
        className="circular-progress-svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          className="circular-progress-background"
          stroke="#E5E7EB"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className="circular-progress-bar"
          stroke="#8B0000"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="circular-progress-text">
        <span className="percentage">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

export default CircularProgress;
