import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import DirectusAuthService from '@/lib/directus-auth';
import { UserRole } from '@/lib/roles';

// Validation schema for registration data
const registrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  role: z.enum([UserRole.AUTHENTICATED, UserRole.CUSTOMER_PAID]).optional().default(UserRole.AUTHENTICATED),
  registrationType: z.enum(['standard', 'b2b_invitation']).optional().default('standard'),
  invitationCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validationResult = registrationSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: errors 
        },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password, role, registrationType, invitationCode } = validationResult.data;

    // Handle B2B invitation registration
    if (registrationType === 'b2b_invitation') {
      if (!invitationCode) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invitation code is required for B2B registration',
            code: 'INVITATION_CODE_REQUIRED'
          },
          { status: 400 }
        );
      }

      // TODO: Validate invitation code and determine B2B role
      // This would typically check against a database of pending invitations
      // For now, we'll assume valid invitation codes grant B2B_MEMBER role
      
      // In a real implementation, you'd:
      // 1. Look up the invitation in your database
      // 2. Verify it's not expired
      // 3. Get the intended role from the invitation
      // 4. Mark the invitation as used
    }

    // Determine final role
    let finalRole = role;
    if (registrationType === 'b2b_invitation') {
      // B2B invitations typically create member roles
      // This could be customized based on the invitation details
      finalRole = UserRole.B2B_MEMBER;
    }

    // Register user with Directus
    const registrationData = {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      role: finalRole,
    };
    
    const result = await DirectusAuthService.registerUser(registrationData);

    if (!result.success) {
      // Handle specific error cases
      if (result.error?.includes('email')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'An account with this email already exists',
            code: 'EMAIL_EXISTS' 
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Registration failed',
          code: 'REGISTRATION_FAILED'
        },
        { status: 400 }
      );
    }

    // Registration successful
    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: result.data?.id,
        email: result.data?.email,
        name: `${result.data?.first_name} ${result.data?.last_name}`.trim(),
      },
    });

  } catch (error) {
    console.error('Registration API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

// Handle preflight CORS requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}