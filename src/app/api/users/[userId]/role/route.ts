import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import DirectusAuthService from '@/lib/directus-auth';
import { UserRole, hasRoleOrHigher } from '@/lib/roles';

// Validation schema for role update
const roleUpdateSchema = z.object({
  role: z.enum([UserRole.AUTHENTICATED, UserRole.CUSTOMER_PAID, UserRole.B2B_MEMBER, UserRole.B2B_ADMIN]),
  reason: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Check if user is authenticated and has permission to update roles
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

    // Check if user has permission to update roles
    const userRole = session.user.role;
    if (!userRole || !hasRoleOrHigher(userRole, UserRole.B2B_ADMIN)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Insufficient permissions to update user roles',
          code: 'INSUFFICIENT_PERMISSIONS'
        },
        { status: 403 }
      );
    }

    const { userId } = params;
    const body = await request.json();
    
    // Validate input data
    const validationResult = roleUpdateSchema.safeParse(body);
    
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

    const { role: newRole, reason } = validationResult.data;

    // Additional role validation based on updater's role
    if (userRole === UserRole.B2B_ADMIN) {
      // B2B Admins cannot assign B2B_ADMIN role (prevent privilege escalation)
      // Only system admins can do this
      if (newRole === UserRole.B2B_ADMIN) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Cannot assign admin privileges',
            code: 'PRIVILEGE_ESCALATION_PREVENTED'
          },
          { status: 403 }
        );
      }
    }

    // Prevent users from updating their own role (except system admins)
    if (userId === session.user.id && userRole !== UserRole.ADMIN) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot update your own role',
          code: 'SELF_ROLE_UPDATE_DENIED'
        },
        { status: 403 }
      );
    }

    // Get admin token for the update
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

    // Update user role using DirectusAuthService
    const result = await DirectusAuthService.updateUserRole(
      userId,
      newRole,
      session.accessToken
    );

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Role update failed',
          code: 'ROLE_UPDATE_FAILED'
        },
        { status: 400 }
      );
    }

    // Log the role change
    console.log(
      `User ${userId} role updated to ${newRole} by ${session.user.email}${reason ? ` (${reason})` : ''}`
    );

    // Role update successful
    return NextResponse.json({
      success: true,
      message: 'User role updated successfully',
      user: {
        id: result.data?.id,
        email: result.data?.email,
        name: `${result.data?.first_name} ${result.data?.last_name}`.trim(),
        role: newRole,
      },
    });

  } catch (error) {
    console.error('Role update API error:', error);
    
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

// Get user details with role information
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    const { userId } = params;

    // Users can view their own profile, or admin users can view any profile
    const userRole = session.user.role;
    const canViewProfile = userId === session.user.id || 
                          (userRole && hasRoleOrHigher(userRole, UserRole.B2B_ADMIN));

    if (!canViewProfile) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Insufficient permissions to view user profile',
          code: 'INSUFFICIENT_PERMISSIONS'
        },
        { status: 403 }
      );
    }

    if (!session.accessToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Access token not available',
          code: 'TOKEN_NOT_AVAILABLE'
        },
        { status: 400 }
      );
    }

    // Get user profile
    const result = await DirectusAuthService.getUserProfile(session.accessToken);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to fetch user profile',
          code: 'PROFILE_FETCH_FAILED'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: result.data?.id,
        email: result.data?.email,
        firstName: result.data?.first_name,
        lastName: result.data?.last_name,
        name: `${result.data?.first_name} ${result.data?.last_name}`.trim(),
        role: result.data?.role_name,
        avatar: result.data?.avatar,
        status: result.data?.status,
        createdAt: result.data?.date_created,
        updatedAt: result.data?.date_updated,
      },
    });

  } catch (error) {
    console.error('Get user profile API error:', error);
    
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