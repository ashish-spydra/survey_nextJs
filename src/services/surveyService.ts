// Survey API Service
const API_BASE_URL = '/api';

export interface SurveySubmissionData {
  userDetails: {
    fullName: string;
    email: string;
    phoneNumber: string;
    designation: string;
    cohortTeam: string;
    officeTypology: string;
    company: string;
  };
  questionResponses: Array<{
    questionId: number;
    questionTitle: string;
    currentState: {
      A: number;
      B: number;
      C: number;
      D: number;
    };
    aspirationalState: {
      A: number;
      B: number;
      C: number;
      D: number;
    };
  }>;
  completionTime?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

class SurveyService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Submit survey response
  async submitSurvey(surveyData: SurveySubmissionData): Promise<ApiResponse<unknown>> {
    try {
      console.log('surveyService: Submitting survey data:', surveyData);
      
      const response = await fetch(`${this.baseURL}/surveys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(surveyData),
      });

      const result = await response.json();
      console.log('surveyService: API response received:', result);

      if (!response.ok) {
        console.error('surveyService: API request failed:', response.status, result);
        throw new Error(result.message || 'Failed to submit survey');
      }

      console.log('surveyService: API request successful, returning result');
      return result;
    } catch (error: unknown) {
      console.error('Survey submission error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }

  // Get all surveys (admin function)
  async getAllSurveys(page = 1, limit = 10): Promise<ApiResponse<unknown>> {
    try {
      const response = await fetch(`${this.baseURL}/surveys?page=${page}&limit=${limit}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch surveys');
      }

      return result;
    } catch (error: unknown) {
      console.error('Fetch surveys error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }

  // Get surveys by company
  async getSurveysByCompany(companyName: string, page = 1, limit = 10): Promise<ApiResponse<unknown>> {
    try {
      const response = await fetch(`${this.baseURL}/surveys/company/${encodeURIComponent(companyName)}?page=${page}&limit=${limit}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch surveys');
      }

      return result;
    } catch (error: unknown) {
      console.error('Fetch company surveys error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }

  // Get survey by ID
  async getSurveyById(id: string): Promise<ApiResponse<unknown>> {
    try {
      const response = await fetch(`${this.baseURL}/surveys/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch survey');
      }

      return result;
    } catch (error: unknown) {
      console.error('Fetch survey by ID error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }

  // Get company analytics
  async getCompanyAnalytics(companyName: string): Promise<ApiResponse<unknown>> {
    try {
      const response = await fetch(`${this.baseURL}/surveys/analytics/${encodeURIComponent(companyName)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch analytics');
      }

      return result;
    } catch (error: unknown) {
      console.error('Fetch company analytics error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }
}

export const surveyService = new SurveyService();
