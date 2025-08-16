import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import type { UserDetails } from '../hooks/useSurveyData';
import './UserDetailsForm.css';

interface UserDetailsFormProps {
  onSubmit?: (userData: UserFormData) => void;
  onPrevious?: () => void;
  canGoPrevious?: boolean;
  currentStep?: number;
  totalSteps?: number;
  onSaveUserDetails?: (userDetails: UserDetails) => void;
  onSubmitSurvey?: (userDetails: UserDetails) => Promise<boolean>;
  existingUserDetails?: UserDetails | null;
  isSubmitting?: boolean;
  submitError?: string | null;
  submitSuccess?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  officeTypology: string;
  cohortTeam: string;
  company: string;
}

const UserDetailsForm: React.FC<UserDetailsFormProps> = ({ 
  onSubmit, 
//   onPrevious, 
//   canGoPrevious,
  onSaveUserDetails,
  onSubmitSurvey,
  existingUserDetails,
  isSubmitting = false,
  submitError,
  submitSuccess,
  onValidationChange
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    designation: '',
    officeTypology: '',
    cohortTeam: '',
    company: ''
  });

  const [errors, setErrors] = useState<Partial<UserFormData>>({});

  // Load existing user details when component mounts
  useEffect(() => {
    if (existingUserDetails) {
      setFormData({
        firstName: existingUserDetails.fullName.split(' ')[0] || '',
        lastName: existingUserDetails.fullName.split(' ').slice(1).join(' ') || '',
        email: existingUserDetails.email,
        designation: existingUserDetails.designation,
        officeTypology: existingUserDetails.officeTypology,
        cohortTeam: existingUserDetails.cohortTeam,
        company: existingUserDetails.company
      });
    }
  }, [existingUserDetails]);

  // Auto-redirect when survey is submitted successfully
  useEffect(() => {
    if (submitSuccess) {
      const redirectUrl = localStorage.getItem('surveyRedirectUrl');
      if (redirectUrl) {
        // Add a small delay to show the success message before redirecting
        const timer = setTimeout(() => {
          window.open(redirectUrl, '_blank');
        }, 2000); // 2 second delay
        
        return () => clearTimeout(timer);
      }
    }
  }, [submitSuccess]);

  // Check form validity whenever formData changes
  useEffect(() => {
    const isValid = isFormValid();
    onValidationChange?.(isValid);
  }, [formData]); // Remove onValidationChange from dependencies to prevent infinite re-renders

  const isFormValid = (): boolean => {
    const isValid = formData.firstName.trim() !== '' &&
           formData.lastName.trim() !== '' &&
           formData.email.trim() !== '' &&
           /\S+@\S+\.\S+/.test(formData.email) &&
           formData.designation !== '' &&
           formData.officeTypology !== '' &&
           formData.cohortTeam !== '' &&
           formData.company.trim() !== '';
    
    console.log('Form validation check:', {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      designation: formData.designation,
      officeTypology: formData.officeTypology,
      cohortTeam: formData.cohortTeam,
      company: formData.company,
      isValid
    });
    
    return isValid;
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.designation) newErrors.designation = 'Designation is required';
    if (!formData.officeTypology) newErrors.officeTypology = 'Office Typology is required';
    if (!formData.cohortTeam) newErrors.cohortTeam = 'Cohort/Team is required';
    if (!formData.company.trim()) newErrors.company = 'Company is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Create user details object
      const userDetails: UserDetails = {
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phoneNumber: '', // We'll keep this for backend compatibility but empty for now
        designation: formData.designation,
        cohortTeam: formData.cohortTeam,
        officeTypology: formData.officeTypology,
        company: formData.company
      };

      // Save user details first (for display purposes)
      if (onSaveUserDetails) {
        onSaveUserDetails(userDetails);
      }

      // Submit the entire survey with user details
      if (onSubmitSurvey) {
        // Pass user details directly to avoid timing issues
        const success = await onSubmitSurvey(userDetails);
        if (!success) {
          // Error handling is done in the hook
          return;
        }
      }

      // Call the original onSubmit if provided (for backward compatibility)
      onSubmit?.(formData);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const designationOptions = [
    'C-Suite (e.g., CEO, CFO, COO)',
    'Senior Management (e.g., Director, VP)',
    'Mid-Level Management (e.g., Manager, Team Lead)',
    'Entry-Level/Staff (e.g., Associate, Analyst)'
  ];

  const officeTypologyOptions = [
    'R&D Center',
    'HQ',
    'ITES',
    'Regional Office',
    'Back Office/GBS',
    'Knowledge Center/GCC',
    'Support Office',
    'Tech Office',
    'Sales & Consultancy',
    'Factory Office'
  ];

  const cohortTeamOptions = [
    'Executive Leadership',
    'Human Resources',
    'Finance',
    'Marketing',
    'Sales',
    'Operations',
    'IT/Technology',
    'Research & Development',
    'Customer Support'
  ];

  return (
    <div className="user-details-content">
      <div className="user-details-section">
        <div className="question-header">
          <h1 className="question-title">Please provide the required details before submitting the survey</h1>
        </div>

        <form className="user-form" onSubmit={handleSubmit} onKeyPress={handleKeyPress}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                First Name <span className="required">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`form-input ${errors.firstName ? 'error' : ''}`}
                placeholder="Enter your first name"
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Last Name <span className="required">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`form-input ${errors.lastName ? 'error' : ''}`}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Company <span className="required">*</span>
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className={`form-input ${errors.company ? 'error' : ''}`}
                placeholder="Enter your company name"
              />
              {errors.company && <span className="error-message">{errors.company}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Designation <span className="required">*</span>
              </label>
              <select
                value={formData.designation}
                onChange={(e) => handleInputChange('designation', e.target.value)}
                className={`form-select ${errors.designation ? 'error' : ''}`}
              >
                <option value="">Select designation</option>
                {designationOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.designation && <span className="error-message">{errors.designation}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Office Typology <span className="required">*</span>
              </label>
              <select
                value={formData.officeTypology}
                onChange={(e) => handleInputChange('officeTypology', e.target.value)}
                className={`form-select ${errors.officeTypology ? 'error' : ''}`}
              >
                <option value="">Select office typology</option>
                {officeTypologyOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.officeTypology && <span className="error-message">{errors.officeTypology}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Cohort/Team <span className="required">*</span>
              </label>
              <select
                value={formData.cohortTeam}
                onChange={(e) => handleInputChange('cohortTeam', e.target.value)}
                className={`form-select ${errors.cohortTeam ? 'error' : ''}`}
              >
                <option value="">Select cohort/team</option>
                {cohortTeamOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.cohortTeam && <span className="error-message">{errors.cohortTeam}</span>}
            </div>
          </div>



          <div className="submit-section">
            <button 
              type="submit" 
              className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}</span>
              <Check className="submit-icon" size={20} />
            </button>
            
            {submitError && (
              <div className="error-message submit-error">
                {submitError}
              </div>
            )}
            
            {submitSuccess && (
              <div className="success-message">
                <div className="success-content">
                  <div className="success-text">
                    ✅ Survey submitted successfully! Redirecting to your results...
                  </div>
                  <div className="redirecting-spinner">
                    <div className="spinner"></div>
                    <span>Redirecting...</span>
                  </div>
                </div>
              </div>
            )}
            
            <p className="submit-hint">Press <strong>ENTER</strong> key to submit</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserDetailsForm;
