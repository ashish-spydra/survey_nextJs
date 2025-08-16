import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../lib/database';

export async function GET() {
  try {
    console.log('🔌 Testing database connection...');
    await connectDatabase();
    console.log('✅ Database connection successful');
    
    return NextResponse.json({ 
      success: true,
      message: 'Database connection successful!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    return NextResponse.json({ 
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
