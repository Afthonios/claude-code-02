import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    NEXT_PUBLIC_DIRECTUS_URL: process.env.NEXT_PUBLIC_DIRECTUS_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '[SET]' : '[NOT SET]',
    DIRECTUS_AUTHENTICATED_ROLE: process.env.DIRECTUS_AUTHENTICATED_ROLE ? '[SET]' : '[NOT SET]',
    DIRECTUS_B2B_ADMIN_ROLE: process.env.DIRECTUS_B2B_ADMIN_ROLE ? '[SET]' : '[NOT SET]',
    DIRECTUS_B2B_MEMBER_ROLE: process.env.DIRECTUS_B2B_MEMBER_ROLE ? '[SET]' : '[NOT SET]',
    DIRECTUS_CUSTOMER_PAID_ROLE: process.env.DIRECTUS_CUSTOMER_PAID_ROLE ? '[SET]' : '[NOT SET]',
    DIRECTUS_DEFAULT_USER_ROLE: process.env.DIRECTUS_DEFAULT_USER_ROLE ? '[SET]' : '[NOT SET]',
    DIRECTUS_ADMIN_EMAIL: process.env.DIRECTUS_ADMIN_EMAIL ? '[SET]' : '[NOT SET]',
    DIRECTUS_ADMIN_PASSWORD: process.env.DIRECTUS_ADMIN_PASSWORD ? '[SET]' : '[NOT SET]',
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json({
    message: 'Environment variables status',
    env: envVars,
  });
}