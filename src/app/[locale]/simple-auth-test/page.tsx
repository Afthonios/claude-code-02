"use client";

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export default function SimpleAuthTest() {
  const { data: session, status } = useSession();
  const [credentials, setCredentials] = useState({
    email: 'user@afthonios.com',
    password: 'password123'
  });
  const [directusTest, setDirectusTest] = useState<any>(null);

  const handleDemoLogin = async () => {
    try {
      const result = await signIn('demo', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });
      
      console.log('Sign in result:', result);
      
      if (result?.error) {
        alert('Login failed: ' + result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDirectusLogin = async () => {
    try {
      const result = await signIn('directus', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });
      
      console.log('Sign in result:', result);
      
      if (result?.error) {
        alert('Login failed: ' + result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const testDirectusAPI = async () => {
    try {
      const response = await fetch('/api/test-directus', {
        method: 'POST',
      });
      const result = await response.json();
      setDirectusTest(result);
    } catch (error) {
      setDirectusTest({
        error: 'Failed to test Directus API',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Simple Auth Test</h1>
        
        {session ? (
          <div className="text-center space-y-4">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <p className="font-semibold">✅ Authenticated!</p>
            </div>
            
            <div className="text-left space-y-2 bg-gray-50 p-4 rounded">
              <p><strong>Email:</strong> {session.user?.email}</p>
              <p><strong>Name:</strong> {session.user?.name}</p>
              <p><strong>Role:</strong> <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{session.user?.role}</span></p>
              <p><strong>ID:</strong> <span className="font-mono text-sm">{session.user?.id}</span></p>
            </div>
            
            <button 
              onClick={() => signOut()}
              className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Login Credentials</h2>
              <input
                type="email"
                placeholder="Email"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="password"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDemoLogin}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Sign In (Demo Provider)
              </button>
              
              <button
                onClick={handleDirectusLogin}
                className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              >
                Sign In (Directus Provider)
              </button>

              <button
                onClick={testDirectusAPI}
                className="w-full bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
              >
                Test Directus API Connection
              </button>
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Demo Accounts:</h3>
              <div className="space-y-1">
                <p><strong>User:</strong> user@afthonios.com / password123</p>
                <p><strong>Admin:</strong> admin@afthonios.com / admin123</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">Status: {status}</p>
        </div>
      </div>
    </div>
  );
}