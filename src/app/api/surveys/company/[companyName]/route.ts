import { NextRequest } from 'next/server';
import { getSurveysByCompany } from '../../surveyController';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyName: string }> }
) {
  const { companyName } = await params;
  return getSurveysByCompany(request, companyName);
}
