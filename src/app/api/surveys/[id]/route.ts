import { NextRequest } from 'next/server';
import { getSurveyById } from '../surveyController';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return getSurveyById(request, id);
}
