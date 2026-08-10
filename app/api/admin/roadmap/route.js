import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { saveRoadmap, getRoadmapByCareerId } from '@/lib/db';

async function checkAdmin() {
  const session = await getAuthUser();
  return session && session.role === 'admin';
}

export async function POST(request) {
  try {
    if (!await checkAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { careerId, steps } = await request.json();

    if (!careerId || !steps || !Array.isArray(steps)) {
      return NextResponse.json({ error: 'careerId and steps array are required' }, { status: 400 });
    }

    // Load existing roadmap to keep the ID
    const existing = getRoadmapByCareerId(careerId);
    
    const saved = saveRoadmap({
      id: existing ? existing.id : undefined,
      careerId,
      steps: steps.map(s => ({
        stepNumber: parseInt(s.stepNumber),
        title: s.title,
        description: s.description,
        skillIds: s.skillIds || []
      }))
    });

    return NextResponse.json({ success: true, roadmap: saved });
  } catch (error) {
    console.error('Save roadmap admin API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
