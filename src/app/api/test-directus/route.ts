import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Test the Directus login API directly
    const response = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: process.env.DIRECTUS_ADMIN_EMAIL,
        password: process.env.DIRECTUS_ADMIN_PASSWORD,
      }),
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
      directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL,
      hasCredentials: !!(process.env.DIRECTUS_ADMIN_EMAIL && process.env.DIRECTUS_ADMIN_PASSWORD),
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to test Directus API',
      details: error instanceof Error ? error.message : 'Unknown error',
      directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL,
      hasCredentials: !!(process.env.DIRECTUS_ADMIN_EMAIL && process.env.DIRECTUS_ADMIN_PASSWORD),
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to test Directus login',
    directusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL,
    hasCredentials: !!(process.env.DIRECTUS_ADMIN_EMAIL && process.env.DIRECTUS_ADMIN_PASSWORD),
  });
}