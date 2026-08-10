import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getResources, createResource, updateResource, deleteResource } from '@/lib/db';

async function checkAdmin() {
  const session = await getAuthUser();
  return session && session.role === 'admin';
}

export async function GET() {
  try {
    if (!await checkAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: true, resources: getResources() });
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

    if (!data.skillId || !data.title || !data.type) {
      return NextResponse.json({ error: 'Skill ID, Title, and Type are required' }, { status: 400 });
    }

    const newResource = createResource(data);
    return NextResponse.json({ success: true, resource: newResource });
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
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    const updated = updateResource(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, resource: updated });
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

    deleteResource(id);
    return NextResponse.json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
