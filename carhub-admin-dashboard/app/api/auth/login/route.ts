// app/api/auth/login/route.ts


export async function POST(request: Request) {
  const { email, password } = await request.json();
  
  // Mock authentication
  if (email === 'admin@example.com' && password === 'password') {
    const tokens = {
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
    };
    
    return NextResponse.json(tokens);
  }
  
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}

// app/api/users/route.ts
import { NextResponse } from 'next/server';

const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    createdAt: '2024-01-15T10:30:00Z',
  },
  // Add more mock users...
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const users = mockUsers.slice(startIndex, endIndex);
  
  return NextResponse.json({
    data: users,
    pagination: {
      page,
      limit,
      total: mockUsers.length,
      totalPages: Math.ceil(mockUsers.length / limit),
    },
  });
}