import mongoose, { Document, Schema } from 'mongoose';

// Interface for individual question response
export interface IQuestionResponse {
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
}

// Interface for user details
export interface IUserDetails {
  fullName: string;
  email: string;
  phoneNumber: string;
  designation: string;
  cohortTeam: string;
  officeTypology: string;
  company: string;
}

// Interface for complete survey response
export interface ISurveyResponse extends Document {
  userDetails: IUserDetails;
  questionResponses: IQuestionResponse[];
  submittedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  completionTime?: number; // in seconds
  companyName?: string; // Derived from email domain or user input
}

// Question Response Schema
const QuestionResponseSchema = new Schema<IQuestionResponse>({
  questionId: { type: Number, required: true },
  questionTitle: { type: String, required: true },
  currentState: {
    A: { type: Number, required: true, min: 0, max: 100 },
    B: { type: Number, required: true, min: 0, max: 100 },
    C: { type: Number, required: true, min: 0, max: 100 },
    D: { type: Number, required: true, min: 0, max: 100 }
  },
  aspirationalState: {
    A: { type: Number, required: true, min: 0, max: 100 },
    B: { type: Number, required: true, min: 0, max: 100 },
    C: { type: Number, required: true, min: 0, max: 100 },
    D: { type: Number, required: true, min: 0, max: 100 }
  }
});

// User Details Schema
const UserDetailsSchema = new Schema<IUserDetails>({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phoneNumber: { type: String, required: false, trim: true, default: '' },
  designation: { type: String, required: true },
  cohortTeam: { type: String, required: true },
  officeTypology: { type: String, required: true },
  company: { type: String, required: true, trim: true }
});

// Main Survey Response Schema
const SurveyResponseSchema = new Schema<ISurveyResponse>({
  userDetails: { type: UserDetailsSchema, required: true },
  questionResponses: { type: [QuestionResponseSchema], required: true },
  submittedAt: { type: Date, default: Date.now },
  ipAddress: { type: String },
  userAgent: { type: String },
  completionTime: { type: Number }, // in seconds
  companyName: { type: String, trim: true }
}, {
  timestamps: true
});

// Add indexes for better query performance
SurveyResponseSchema.index({ 'userDetails.email': 1 });
SurveyResponseSchema.index({ companyName: 1 });
SurveyResponseSchema.index({ submittedAt: -1 });

// Pre-save middleware to extract company name from email
SurveyResponseSchema.pre('save', function(next) {
  if (this.userDetails?.email && !this.companyName) {
    const emailDomain = this.userDetails.email.split('@')[1];
    // Extract company name from domain (remove common TLDs)
    this.companyName = emailDomain
      .replace(/\.(com|org|net|edu|gov|mil|int|co\.uk|co\.in|in)$/i, '')
      .replace(/\./g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  next();
});

// Virtual for response summary
SurveyResponseSchema.virtual('responseSummary').get(function() {
  return {
    totalQuestions: this.questionResponses.length,
    submissionDate: this.submittedAt.toISOString().split('T')[0],
    respondentName: this.userDetails.fullName,
    company: this.companyName
  };
});

// Export the model, but check if it already exists to prevent hot-reload issues
export const SurveyResponse = mongoose.models.SurveyResponse || mongoose.model<ISurveyResponse>('SurveyResponse', SurveyResponseSchema);
