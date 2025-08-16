import { NextRequest } from 'next/server';
import { getCompanyAnalytics } from '../../surveyController';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyName: string }> }
) {
  const { companyName } = await params;
  return getCompanyAnalytics(request, companyName);
}
