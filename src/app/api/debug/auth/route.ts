import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      message: 'NextAuth debug info',
      hasSession: !!session,
      session: session ? {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name,
          role: session.user?.role,
        },
        expires: session.expires,
      } : null,
      providers: authOptions.providers?.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
      })),
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get debug info',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}