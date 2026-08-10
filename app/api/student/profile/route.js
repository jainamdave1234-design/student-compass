import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { updateUser, getUserById } from '@/lib/db';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    const user = getUserById(session.userId);
    return NextResponse.json({ success: true, profile: user.profile, skills: user.skills || [] });
  } catch (error) {
    console.error('Get profile API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getAuthUser();
    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    const { profile, skills } = await request.json();

    const updates = {};
    if (profile) updates.profile = profile;
    if (skills) updates.skills = skills;

    const updatedUser = updateUser(session.userId, updates);
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: updatedUser.profile,
      skills: updatedUser.skills
    });
  } catch (error) {
    console.error('Update profile API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
