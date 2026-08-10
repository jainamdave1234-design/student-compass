import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getUserById } from '@/lib/db';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user without password hash
    const { passwordHash, ...safeUser } = user;
    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    console.error('Auth check API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred checking auth status' },
      { status: 500 }
    );
  }
}
