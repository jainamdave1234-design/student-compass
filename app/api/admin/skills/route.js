import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getSkills, createSkill, updateSkill, deleteSkill } from '@/lib/db';

async function checkAdmin() {
  const session = await getAuthUser();
  return session && session.role === 'admin';
}

export async function GET() {
  try {
    if (!await checkAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: true, skills: getSkills() });
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

    if (!data.name || !data.category || !data.level) {
      return NextResponse.json({ error: 'Name, Category, and Level are required' }, { status: 400 });
    }

    const skillId = data.id || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newSkill = createSkill({
      ...data,
      id: skillId
    });

    return NextResponse.json({ success: true, skill: newSkill });
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
      return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 });
    }

    const updated = updateSkill(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, skill: updated });
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

    deleteSkill(id);
    return NextResponse.json({ success: true, message: 'Skill and references deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
