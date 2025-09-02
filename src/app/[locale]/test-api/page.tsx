"use client";

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { UserRole } from '@/lib/roles';

export default function TestAPIPage() {
  const { data: session } = useSession();
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const testEndpoint = async (name: string, endpoint: string, options: RequestInit = {}) => {
    setLoading(prev => ({ ...prev, [name]: true }));
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      const result = await response.json();
      setTestResults(prev => ({
        ...prev,
        [name]: {
          status: response.status,
          success: response.ok,
          data: result,
        },
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [name]: {
          status: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }));
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }));
    }
  };

  const testRegistration = () => {
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword123',
      confirmPassword: 'testpassword123',
      acceptTerms: true,
    };

    testEndpoint('registration', '/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(testUser),
    });
  };

  const testInvitation = () => {
    if (!session) return;

    const inviteData = {
      firstName: 'Invited',
      lastName: 'User',
      email: `invited-${Date.now()}@example.com`,
      role: UserRole.B2B_MEMBER,
    };

    testEndpoint('invitation', '/api/auth/invite', {
      method: 'POST',
      body: JSON.stringify(inviteData),
    });
  };

  const testUserProfile = () => {
    if (!session?.user?.id) return;

    testEndpoint('userProfile', `/api/users/${session.user.id}/role`, {
      method: 'GET',
    });
  };

  const testRoleUpdate = () => {
    if (!session?.user?.id) return;

    const roleData = {
      role: UserRole.CUSTOMER_PAID,
      reason: 'Test role update',
    };

    testEndpoint('roleUpdate', `/api/users/${session.user.id}/role`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">API Endpoints Test</h1>
        
        {!session && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            <p><strong>Note:</strong> You need to be logged in to test protected endpoints. Visit <a href="/fr/test-auth" className="underline">/test-auth</a> to authenticate first.</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Registration Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">User Registration</h2>
            <p className="text-gray-600 mb-4">Test the user registration endpoint with a randomly generated email.</p>
            <button
              onClick={testRegistration}
              disabled={loading.registration}
              className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded"
            >
              {loading.registration ? 'Testing...' : 'Test Registration'}
            </button>
            
            {testResults.registration && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Result:</h3>
                <div className={`p-4 rounded ${testResults.registration.success ? 'bg-green-100' : 'bg-red-100'}`}>
                  <p><strong>Status:</strong> {testResults.registration.status}</p>
                  <pre className="text-sm mt-2 overflow-x-auto">{JSON.stringify(testResults.registration.data || testResults.registration.error, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>

          {/* Invitation Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">B2B User Invitation</h2>
            <p className="text-gray-600 mb-4">Test the B2B user invitation endpoint (requires B2B Admin role).</p>
            <button
              onClick={testInvitation}
              disabled={loading.invitation || !session}
              className="bg-purple-500 hover:bg-purple-700 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded"
            >
              {loading.invitation ? 'Testing...' : 'Test Invitation'}
            </button>
            
            {testResults.invitation && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Result:</h3>
                <div className={`p-4 rounded ${testResults.invitation.success ? 'bg-green-100' : 'bg-red-100'}`}>
                  <p><strong>Status:</strong> {testResults.invitation.status}</p>
                  <pre className="text-sm mt-2 overflow-x-auto">{JSON.stringify(testResults.invitation.data || testResults.invitation.error, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Get User Profile</h2>
            <p className="text-gray-600 mb-4">Test fetching the current user's profile information.</p>
            <button
              onClick={testUserProfile}
              disabled={loading.userProfile || !session}
              className="bg-green-500 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded"
            >
              {loading.userProfile ? 'Testing...' : 'Test Get Profile'}
            </button>
            
            {testResults.userProfile && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Result:</h3>
                <div className={`p-4 rounded ${testResults.userProfile.success ? 'bg-green-100' : 'bg-red-100'}`}>
                  <p><strong>Status:</strong> {testResults.userProfile.status}</p>
                  <pre className="text-sm mt-2 overflow-x-auto">{JSON.stringify(testResults.userProfile.data || testResults.userProfile.error, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>

          {/* Role Update Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Update User Role</h2>
            <p className="text-gray-600 mb-4">Test updating the current user's role (requires admin privileges).</p>
            <button
              onClick={testRoleUpdate}
              disabled={loading.roleUpdate || !session}
              className="bg-red-500 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded"
            >
              {loading.roleUpdate ? 'Testing...' : 'Test Role Update'}
            </button>
            
            {testResults.roleUpdate && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Result:</h3>
                <div className={`p-4 rounded ${testResults.roleUpdate.success ? 'bg-green-100' : 'bg-red-100'}`}>
                  <p><strong>Status:</strong> {testResults.roleUpdate.status}</p>
                  <pre className="text-sm mt-2 overflow-x-auto">{JSON.stringify(testResults.roleUpdate.data || testResults.roleUpdate.error, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>

          {/* API Endpoints Reference */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">API Endpoints Reference</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-green-600">✅ Public Endpoints</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li><code>POST /api/auth/register</code> - User registration</li>
                  <li><code>GET/POST /api/auth/[...nextauth]</code> - NextAuth endpoints</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-blue-600">🔒 Protected Endpoints</h3>
                <ul className="text-sm space-y-1 ml-4">
                  <li><code>POST /api/auth/invite</code> - Send B2B invitation (B2B Admin+)</li>
                  <li><code>GET /api/auth/invite</code> - List invitations (B2B Admin+)</li>
                  <li><code>GET /api/users/[userId]/role</code> - Get user profile (Self or Admin)</li>
                  <li><code>PUT /api/users/[userId]/role</code> - Update user role (B2B Admin+)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Current Session Info */}
          {session && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Current Session</h2>
              <div className="text-sm">
                <p><strong>User:</strong> {session.user?.email}</p>
                <p><strong>Role:</strong> {session.user?.role}</p>
                <p><strong>User ID:</strong> {session.user?.id}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}