import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getRoadmapByCareerId, getSkillById, getResourcesBySkillId } from '@/lib/db';

export async function GET(request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const careerId = searchParams.get('careerId');

    if (!careerId) {
      return NextResponse.json({ error: 'careerId is required' }, { status: 400 });
    }

    const roadmap = getRoadmapByCareerId(careerId);
    if (!roadmap) {
      return NextResponse.json({ error: 'Roadmap not found for this career' }, { status: 404 });
    }

    // Populate roadmap steps with full skill details and resources
    const populatedSteps = roadmap.steps.map(step => {
      const populatedSkills = step.skillIds.map(skillId => {
        const skill = getSkillById(skillId);
        if (!skill) return null;
        
        // Find resources and projects for this skill
        const allResources = getResourcesBySkillId(skillId);
        const courses = allResources.filter(r => r.type === 'course');
        const books = allResources.filter(r => r.type === 'book');
        const certifications = allResources.filter(r => r.type === 'certification');
        const projects = allResources.filter(r => r.type === 'project');

        return {
          ...skill,
          resources: {
            courses,
            books,
            certifications,
            projects
          }
        };
      }).filter(Boolean);

      return {
        ...step,
        skills: populatedSkills
      };
    });

    return NextResponse.json({
      success: true,
      roadmap: {
        id: roadmap.id,
        careerId: roadmap.careerId,
        steps: populatedSteps
      }
    });
  } catch (error) {
    console.error('Roadmap fetch API error:', error);
    return NextResponse.json({ error: 'Server error loading roadmap' }, { status: 500 });
  }
}
