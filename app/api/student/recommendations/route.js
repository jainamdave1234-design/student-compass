import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getUserById } from '@/lib/db';
import { getRecommendations } from '@/lib/recommendationEngine';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    const user = getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profile = user.profile;
    const hasProfile = profile && profile.major && (profile.interests && profile.interests.length > 0);

    if (!hasProfile) {
      return NextResponse.json({
        success: true,
        needsAssessment: true,
        recommendations: []
      });
    }

    // Compute matching recommendations
    const recommendations = getRecommendations(profile, user.skills || []);

    return NextResponse.json({
      success: true,
      needsAssessment: false,
      recommendations
    });
  } catch (error) {
    console.error('Recommendations API error:', error);
    return NextResponse.json({ error: 'Server error calculating recommendations' }, { status: 500 });
  }
}
