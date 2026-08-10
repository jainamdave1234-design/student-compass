import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    
    // Clear session cookie
    response.cookies.set({
      name: 'session',
      value: '',
      httpOnly: true,
      expires: new Date(0), // Set to epoch to expire immediately
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during logout' },
      { status: 500 }
    );
  }
}
