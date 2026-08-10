import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getProgress, saveProgress, getUserActiveProgress, getUserById, updateUser } from '@/lib/db';

export async function GET(request) {
  try {
    const session = await getAuthUser();
    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const careerId = searchParams.get('careerId');

    if (careerId) {
      const progress = getProgress(session.userId, careerId) || {
        userId: session.userId,
        careerId,
        completedSkills: [],
        completedProjects: [],
        active: false
      };
      return NextResponse.json({ success: true, progress });
    } else {
      const activeProgress = getUserActiveProgress(session.userId);
      return NextResponse.json({ success: true, progress: activeProgress || null });
    }
  } catch (error) {
    console.error('Get progress API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getAuthUser();
    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { careerId, completedSkills, completedProjects, active } = await request.json();

    if (!careerId) {
      return NextResponse.json({ error: 'careerId is required' }, { status: 400 });
    }

    // Get current progress record or create empty template
    const currentProgress = getProgress(session.userId, careerId) || {
      userId: session.userId,
      careerId,
      completedSkills: [],
      completedProjects: [],
      active: false
    };

    const updatedRecord = {
      userId: session.userId,
      careerId,
      completedSkills: completedSkills !== undefined ? completedSkills : currentProgress.completedSkills,
      completedProjects: completedProjects !== undefined ? completedProjects : currentProgress.completedProjects,
      active: active !== undefined ? active : currentProgress.active
    };

    // Save progress to database
    saveProgress(updatedRecord);

    // Sync user's global skills list
    if (completedSkills !== undefined) {
      const user = getUserById(session.userId);
      let newGlobalSkills = [...(user.skills || [])];
      
      // Add all newly completed
      completedSkills.forEach(s => {
        if (!newGlobalSkills.includes(s)) {
          newGlobalSkills.push(s);
        }
      });
      
      // Remove any skills that were untoggled
      const removedSkills = currentProgress.completedSkills.filter(s => !completedSkills.includes(s));
      newGlobalSkills = newGlobalSkills.filter(s => !removedSkills.includes(s));

      updateUser(session.userId, { skills: newGlobalSkills });
    }

    return NextResponse.json({ success: true, progress: updatedRecord });
  } catch (error) {
    console.error('Save progress API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
