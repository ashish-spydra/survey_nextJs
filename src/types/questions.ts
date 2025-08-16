export interface Question {
  id: number;
  title: string;
  options: string[];
}

export interface QuestionsData {
  questions: Question[];
}

export interface QuestionResponse {
  questionId: number;
  current: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
  aspirational: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
}

export interface SurveyResponse {
  responses: QuestionResponse[];
  completedAt?: Date;
}
