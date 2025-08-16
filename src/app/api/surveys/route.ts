import { NextRequest } from 'next/server';
import {
  submitSurvey,
  getAllSurveys
} from './surveyController';

// POST /api/surveys - Submit a new survey response
export async function POST(request: NextRequest) {
  return submitSurvey(request);
}

// GET /api/surveys - Get all survey responses (with pagination)
export async function GET(request: NextRequest) {
  return getAllSurveys(request);
}
