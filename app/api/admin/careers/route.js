import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getCareers, createCareer, updateCareer, deleteCareer, saveRoadmap, getRoadmapByCareerId } from '@/lib/db';

async function checkAdmin() {
  const session = await getAuthUser();
  return session && session.role === 'admin';
}

export async function GET() {
  try {
    if (!await checkAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: true, careers: getCareers() });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!await checkAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await request.json();
    
    if (!data.name || !data.description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }

    // Standardize ID
    const careerId = data.id || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCareer = createCareer({
      ...data,
      id: careerId,
      requiredSkills: data.requiredSkills || []
    });

    // Seed empty roadmap
    const existingRoadmap = getRoadmapByCareerId(newCareer.id);
    if (!existingRoadmap) {
      saveRoadmap({
        careerId: newCareer.id,
        steps: [
          {
            stepNumber: 1,
            title: 'Foundational Knowledge',
            description: 'Core baseline principles and concepts.',
            skillIds: data.requiredSkills ? [data.requiredSkills[0]].filter(Boolean) : []
          }
        ]
      });
    }

    return NextResponse.json({ success: true, career: newCareer });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    if (!await checkAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id, ...updates } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Career ID is required' }, { status: 400 });
    }

    const updated = updateCareer(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Career not found' }, { status: 404 });
    }

    // Also verify or sync roadmap step skills if necessary, but keep it simple
    return NextResponse.json({ success: true, career: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    if (!await checkAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
    }

    deleteCareer(id);
    return NextResponse.json({ success: true, message: 'Career and associated data deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
