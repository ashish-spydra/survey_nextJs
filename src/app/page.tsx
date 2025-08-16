'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import MultiStepForm from '../components/MultiStepForm';

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'form'>('landing');

  const handleContinue = () => {
    setCurrentPage('form');
  };

  // Render landing page
  if (currentPage === 'landing') {
    return (
      <div className="app-container">
        {/* Logo */}
        <img src="/logo.png" alt="Space Matrix Logo" className="logo" />

        {/* Title */}
        <h1 className="title">
          Welcome to Space Matrix&apos;s Office Typology Assessment
        </h1>
        <p className="subtitle">
          Discover your organization&apos;s current and aspirational office typology through our comprehensive assessment tool.
        </p>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="continue-button"
        >
          <span>CONTINUE</span>
          <ArrowRight className="arrow-icon" size={20} />
        </button>
      </div>
    );
  }

  // Render multi-step form
  return <MultiStepForm />;
}
