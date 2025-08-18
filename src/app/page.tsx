'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import MultiStepForm from '../components/MultiStepForm';
import './landing.css';

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'form'>('landing');

  if (currentPage === 'form') {
    return <MultiStepForm />;
  }

  return (
    <div className="landing-page">
      <div className="landing-container">
        {/* Logo */}
        <div className="logo-section">
          <img src="/logo.png" alt="Space Matrix Logo" className="logo" />
        </div>

        {/* Title */}
        <h1 className="main-title">
          Discover your organization&apos;s Workplace DNA!
        </h1>

        {/* Subtitle */}
        <p className="subtitle">
          &quot;Welcome to the survey! In just 5 minutes, discover how your workplace design aligns with your business objectives and culture&quot;
        </p>

        {/* Continue Button */}
        <div className="continue-button-section">
          <button 
            className="continue-button" 
            onClick={() => setCurrentPage('form')}
          >
            <span>CONTINUE</span>
            <ArrowRight className="continue-arrow" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
