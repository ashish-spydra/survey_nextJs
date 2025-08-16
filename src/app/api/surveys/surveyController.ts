import { NextRequest, NextResponse } from 'next/server';
import { SurveyResponse } from '../../../models/SurveyResponse';
import { connectDatabase } from '../../../lib/database';

// Submit a new survey response
export const submitSurvey = async (request: NextRequest): Promise<NextResponse> => {
  try {
    console.log('📝 Starting survey submission...');
    
    // Ensure database connection
    try {
      await connectDatabase();
      console.log('✅ Database connected successfully');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return NextResponse.json({
        success: false,
        message: 'Database connection failed',
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 });
    }
    
    let surveyData;
    try {
      surveyData = await request.json();
      console.log('📊 Received survey data:', JSON.stringify(surveyData, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json({
        success: false,
        message: 'Invalid JSON in request body',
        error: 'Request body must be valid JSON'
      }, { status: 400 });
    }
    
    // Validate required fields
    if (!surveyData.userDetails || !surveyData.questionResponses) {
      console.log('❌ Missing required fields');
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: userDetails and questionResponses'
      }, { status: 400 });
    }

    // Validate question responses have correct point totals
    for (const response of surveyData.questionResponses) {
      const currentTotal = Object.values(response.currentState).reduce((sum: number, val: unknown) => sum + (val as number), 0);
      const aspirationalTotal = Object.values(response.aspirationalState).reduce((sum: number, val: unknown) => sum + (val as number), 0);
      
      if (currentTotal !== 100 || aspirationalTotal !== 100) {
        console.log(`❌ Question ${response.questionId}: Points don't total 100 (current: ${currentTotal}, aspirational: ${aspirationalTotal})`);
        return NextResponse.json({
          success: false,
          message: `Question ${response.questionId}: Points must total exactly 100 for both current and aspirational states`
        }, { status: 400 });
      }
    }

    console.log('✅ Validation passed, creating survey response...');

    // Create new survey response
    const surveyResponse = new SurveyResponse({
      ...surveyData,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('User-Agent') || 'unknown',
      submittedAt: new Date()
    });

    console.log('💾 Saving survey response to database...');
    const savedResponse = await surveyResponse.save();
    console.log('✅ Survey response saved successfully:', savedResponse._id);

    return NextResponse.json({
      success: true,
      message: 'Survey submitted successfully',
      data: {
        id: savedResponse._id,
        submittedAt: savedResponse.submittedAt,
        companyName: savedResponse.companyName,
        redirectUrl: `https://blog.staging.smdclab.com/process-type-form/get-user-response/${savedResponse._id}`
      }
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('❌ Error submitting survey:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Ensure we always return a JSON response
    return NextResponse.json({
      success: false,
      message: 'Failed to submit survey',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
};

// Get all survey responses (with pagination)
export const getAllSurveys = async (request: NextRequest): Promise<NextResponse> => {
  try {
    // Ensure database connection
    await connectDatabase();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const surveys = await SurveyResponse.find()
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('userDetails.fullName userDetails.email companyName submittedAt');

    const total = await SurveyResponse.countDocuments();

    return NextResponse.json({
      success: true,
      data: surveys,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error: unknown) {
    console.error('Error fetching surveys:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch surveys',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
};

// Get survey responses by company
export const getSurveysByCompany = async (request: NextRequest, companyName: string): Promise<NextResponse> => {
  try {
    // Ensure database connection
    await connectDatabase();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const surveys = await SurveyResponse.find({ 
      companyName: new RegExp(companyName, 'i') 
    })
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await SurveyResponse.countDocuments({ 
      companyName: new RegExp(companyName, 'i') 
    });

    return NextResponse.json({
      success: true,
      data: surveys,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error: unknown) {
    console.error('Error fetching company surveys:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch company surveys',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
};

// Get detailed survey response by ID
export const getSurveyById = async (request: NextRequest, id: string): Promise<NextResponse> => {
  try {
    // Ensure database connection
    await connectDatabase();
    
    const survey = await SurveyResponse.findById(id);
    
    if (!survey) {
      return NextResponse.json({
        success: false,
        message: 'Survey response not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: survey
    });

  } catch (error: unknown) {
    console.error('Error fetching survey by ID:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch survey',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
};

// Get company analytics
export const getCompanyAnalytics = async (request: NextRequest, companyName: string): Promise<NextResponse> => {
  try {
    // Ensure database connection
    await connectDatabase();
    
    const surveys = await SurveyResponse.find({ 
      companyName: new RegExp(companyName, 'i') 
    });

    if (surveys.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No surveys found for this company'
      }, { status: 404 });
    }

    // Define proper types for analytics
    interface QuestionAnalytics {
      questionTitle: string;
      responses?: Array<{
        current: { A: number; B: number; C: number; D: number };
        aspirational: { A: number; B: number; C: number; D: number };
      }>;
      averages: {
        current: { A: number; B: number; C: number; D: number };
        aspirational: { A: number; B: number; C: number; D: number };
      };
    }

    interface Analytics {
      companyName: string;
      totalResponses: number;
      dateRange: {
        firstResponse: Date;
        lastResponse: Date;
      };
      questionAnalytics: Record<string, QuestionAnalytics>;
    }

    // Calculate aggregated analytics
    const analytics: Analytics = {
      companyName: surveys[0].companyName,
      totalResponses: surveys.length,
      dateRange: {
        firstResponse: surveys[surveys.length - 1].submittedAt,
        lastResponse: surveys[0].submittedAt
      },
      questionAnalytics: {}
    };

    // Aggregate question responses
    surveys.forEach(survey => {
      survey.questionResponses.forEach((qResponse: { questionId: number; questionTitle: string; currentState: { A: number; B: number; C: number; D: number }; aspirationalState: { A: number; B: number; C: number; D: number } }) => {
        if (!analytics.questionAnalytics[qResponse.questionId]) {
          analytics.questionAnalytics[qResponse.questionId] = {
            questionTitle: qResponse.questionTitle,
            responses: [],
            averages: {
              current: { A: 0, B: 0, C: 0, D: 0 },
              aspirational: { A: 0, B: 0, C: 0, D: 0 }
            }
          };
        }
        analytics.questionAnalytics[qResponse.questionId].responses!.push({
          current: qResponse.currentState,
          aspirational: qResponse.aspirationalState
        });
      });
    });

    // Calculate averages
    Object.keys(analytics.questionAnalytics).forEach(questionId => {
      const questionData = analytics.questionAnalytics[questionId];
      const responseCount = questionData.responses!.length;
      
      ['A', 'B', 'C', 'D'].forEach(option => {
        questionData.averages.current[option as keyof typeof questionData.averages.current] = Math.round(
          questionData.responses!.reduce((sum: number, r) => sum + r.current[option as keyof typeof r.current], 0) / responseCount
        );
        questionData.averages.aspirational[option as keyof typeof questionData.averages.aspirational] = Math.round(
          questionData.responses!.reduce((sum: number, r) => sum + r.aspirational[option as keyof typeof r.aspirational], 0) / responseCount
        );
      });
      
      // Remove individual responses from final output (keep only averages)
      delete questionData.responses;
    });

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error: unknown) {
    console.error('Error generating company analytics:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to generate analytics',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
};
