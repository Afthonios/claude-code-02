"use client";

import { useSession, signIn, signOut } from 'next-auth/react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/roles';
import { useState } from 'react';

export default function TestAuthPage() {
  const { data: session, status } = useSession();
  const auth = useAuth();
  const [registrationData, setRegistrationData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [registrationResult, setRegistrationResult] = useState<any>(null);

  const handleRegister = async () => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });
      const result = await response.json();
      setRegistrationResult(result);
    } catch (error) {
      setRegistrationResult({ success: false, error: 'Registration failed' });
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Authentication System Test</h1>
        
        {/* Authentication Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          {session ? (
            <div className="space-y-2">
              <p><strong>Status:</strong> <span className="text-green-600">Authenticated</span></p>
              <p><strong>Email:</strong> {session.user?.email}</p>
              <p><strong>Name:</strong> {session.user?.name}</p>
              <p><strong>Role:</strong> <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{session.user?.role}</span></p>
              <p><strong>User ID:</strong> {session.user?.id}</p>
              <button 
                onClick={() => signOut()}
                className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p><strong>Status:</strong> <span className="text-red-600">Not Authenticated</span></p>
              <div className="space-x-4">
                <button 
                  onClick={() => signIn('directus')}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Sign In (Directus)
                </button>
                <button 
                  onClick={() => signIn('demo')}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Sign In (Demo)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Role-based Permissions */}
        {session && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Role-based Permissions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${auth.hasRole(UserRole.AUTHENTICATED) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className="text-sm">Authenticated</p>
              </div>
              <div className="text-center">
                <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${auth.hasRole(UserRole.CUSTOMER_PAID) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className="text-sm">Paid Customer</p>
              </div>
              <div className="text-center">
                <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${auth.hasRole(UserRole.B2B_MEMBER) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className="text-sm">B2B Member</p>
              </div>
              <div className="text-center">
                <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${auth.hasRole(UserRole.B2B_ADMIN) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className="text-sm">B2B Admin</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <p><strong>Is Admin:</strong> {auth.isAdmin() ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Is B2B User:</strong> {auth.isB2B() ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Is Paid Customer:</strong> {auth.isPaid() ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>
        )}

        {/* Demo Account Login */}
        {!session && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Demo Accounts</h2>
            <p className="text-sm text-gray-600 mb-4">You can test with these demo accounts:</p>
            <div className="space-y-2 text-sm">
              <div className="bg-gray-100 p-3 rounded">
                <p><strong>Demo User:</strong> user@afthonios.com</p>
                <p><strong>Password:</strong> password123</p>
                <p><strong>Role:</strong> User</p>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <p><strong>Demo Admin:</strong> admin@afthonios.com</p>
                <p><strong>Password:</strong> admin123</p>
                <p><strong>Role:</strong> Admin</p>
              </div>
            </div>
          </div>
        )}

        {/* User Registration Test */}
        {!session && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Test User Registration</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={registrationData.firstName}
                  onChange={(e) => setRegistrationData({...registrationData, firstName: e.target.value})}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={registrationData.lastName}
                  onChange={(e) => setRegistrationData({...registrationData, lastName: e.target.value})}
                  className="border rounded px-3 py-2"
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={registrationData.email}
                onChange={(e) => setRegistrationData({...registrationData, email: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="password"
                  placeholder="Password"
                  value={registrationData.password}
                  onChange={(e) => setRegistrationData({...registrationData, password: e.target.value})}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={registrationData.confirmPassword}
                  onChange={(e) => setRegistrationData({...registrationData, confirmPassword: e.target.value})}
                  className="border rounded px-3 py-2"
                />
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={registrationData.acceptTerms}
                  onChange={(e) => setRegistrationData({...registrationData, acceptTerms: e.target.checked})}
                />
                <span className="text-sm">I accept the terms and conditions</span>
              </label>
              <button
                onClick={handleRegister}
                disabled={!registrationData.acceptTerms}
                className="w-full bg-green-500 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded"
              >
                Register New User
              </button>
            </div>
            
            {registrationResult && (
              <div className={`mt-4 p-4 rounded ${registrationResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <h3 className="font-semibold">Registration Result:</h3>
                <pre className="text-sm mt-2">{JSON.stringify(registrationResult, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {/* API Endpoints Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Available Test URLs</h2>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Public Routes:</h3>
                <ul className="space-y-1 text-blue-600">
                  <li><a href="/fr" className="hover:underline">/ (Home)</a></li>
                  <li><a href="/fr/courses" className="hover:underline">/courses</a></li>
                  <li><a href="/fr/auth/login" className="hover:underline">/auth/login</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Protected Routes:</h3>
                <ul className="space-y-1 text-blue-600">
                  <li><a href="/fr/profile" className="hover:underline">/profile (Auth required)</a></li>
                  <li><a href="/fr/my-courses" className="hover:underline">/my-courses (Paid required)</a></li>
                  <li><a href="/fr/b2b/workspace" className="hover:underline">/b2b/workspace (B2B required)</a></li>
                  <li><a href="/fr/admin" className="hover:underline">/admin (Admin required)</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className="text-sm">
            <h3 className="font-medium mb-2">Session Data:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}