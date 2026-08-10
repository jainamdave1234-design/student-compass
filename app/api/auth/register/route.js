import { NextResponse } from 'next/server';
import { getUserByEmail, createUser } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Please provide all required fields (name, email, password)' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password and create user
    const passwordHash = hashPassword(password);
    const newUser = createUser({
      name,
      email,
      passwordHash,
      role: 'student' // Default role is student
    });

    // Create session token
    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: 'session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration' },
      { status: 500 }
    );
  }
}
