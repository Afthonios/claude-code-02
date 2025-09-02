import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import DirectusAuthService from '@/lib/directus-auth';
import { UserRole, hasRoleOrHigher } from '@/lib/roles';

// Validation schema for invitation data
const invitationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  role: z.enum([UserRole.B2B_MEMBER, UserRole.B2B_ADMIN, UserRole.CUSTOMER_PAID]),
  organizationId: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and has permission to invite
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // Check if user has permission to invite others
    const userRole = session.user.role;
    if (!userRole || !hasRoleOrHigher(userRole, UserRole.B2B_ADMIN)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Insufficient permissions to send invitations',
          code: 'INSUFFICIENT_PERMISSIONS'
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate input data
    const validationResult = invitationSchema.safeParse(body);
    
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

    const { firstName, lastName, email, role } = validationResult.data;

    // Additional role validation based on inviter's role
    if (userRole === UserRole.B2B_ADMIN && role === UserRole.B2B_ADMIN) {
      // B2B Admins cannot invite other B2B Admins (prevent privilege escalation)
      // Only system admins can do this
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot invite users with admin privileges',
          code: 'PRIVILEGE_ESCALATION_PREVENTED'
        },
        { status: 403 }
      );
    }

    // Get admin token for the invitation
    if (!session.accessToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Admin access token not available',
          code: 'TOKEN_NOT_AVAILABLE'
        },
        { status: 400 }
      );
    }

    // Send invitation using DirectusAuthService
    const result = await DirectusAuthService.inviteUser({
      first_name: firstName,
      last_name: lastName,
      email,
      inviteRole: role,
    });

    if (!result.success) {
      // Handle specific error cases
      if (result.error?.includes('email')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'A user with this email already exists',
            code: 'EMAIL_EXISTS' 
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Invitation failed',
          code: 'INVITATION_FAILED'
        },
        { status: 400 }
      );
    }

    // TODO: Send invitation email
    // This would typically integrate with an email service to send:
    // - Welcome message with role information
    // - Instructions to set password
    // - Link to complete registration
    // - Organization information (if applicable)

    console.log(`Invitation sent to ${email} with role ${role} by ${session.user.email}`);

    // Invitation successful
    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      invitedUser: {
        id: result.data?.id,
        email: result.data?.email,
        name: `${result.data?.first_name} ${result.data?.last_name}`.trim(),
        role: role,
      },
    });

  } catch (error) {
    console.error('Invitation API error:', error);
    
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

// Get pending invitations (for admin dashboard)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // Check if user has permission to view invitations
    const userRole = session.user.role;
    if (!userRole || !hasRoleOrHigher(userRole, UserRole.B2B_ADMIN)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Insufficient permissions to view invitations',
          code: 'INSUFFICIENT_PERMISSIONS'
        },
        { status: 403 }
      );
    }

    // TODO: Implement invitation listing
    // This would fetch pending invitations from your database
    // For now, return empty array
    
    return NextResponse.json({
      success: true,
      invitations: [],
    });

  } catch (error) {
    console.error('Get invitations API error:', error);
    
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
      'Access-Control-Allow-Methods': 'GET, POST',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}