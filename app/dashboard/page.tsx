'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Lead } from '@/types';

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      loadLeads();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();

      if (data.authenticated) {
        setIsAuthenticated(true);
      } else {
        setError(data.error || 'Invalid password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const loadLeads = async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const response = await fetch('/api/leads', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to load leads: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[Dashboard] Loaded leads:', data.length);
      
      if (!Array.isArray(data)) {
        console.error('[Dashboard] Expected array but got:', typeof data, data);
        setLeads([]);
        return;
      }

      setLeads(
        data.map((lead: any) => ({
          ...lead,
          createdAt: lead.createdAt ? new Date(lead.createdAt) : new Date(),
        }))
      );
    } catch (error) {
      console.error('[Dashboard] Error loading leads:', error);
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Failed to load leads. Please refresh the page.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      });

      if (!response.ok) {
        throw new Error('Failed to update lead');
      }

      await loadLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Failed to update lead. Please try again.');
    }
  };

  const handleDeleteLead = async (id: string) => {
    // Confirmation is now handled by the AdminDashboard component's ConfirmDialog
    try {
      const response = await fetch(`/api/leads?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadLeads();
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Phone', 'Address', 'Problem', 'Emergency Level', 'Status', 'Created At'];
    const rows = leads.map((lead) => [
      lead.name,
      lead.phone,
      lead.address,
      lead.problem,
      lead.emergencyLevel.toString(),
      lead.status,
      new Date(lead.createdAt).toLocaleString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Admin Dashboard Login
          </h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter password"
                required
              />
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              aria-label={isLoggingIn ? 'Logging in...' : 'Login'}
            >
              {isLoggingIn ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Logging in...</span>
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-gray-600 hover:text-primary"
            >
              ← Back to Chat
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage leads and view analytics</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              View Chat
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12" role="status" aria-live="polite">
            <LoadingSpinner size="lg" text="Loading leads..." />
          </div>
        ) : loadError ? (
          <div className="bg-white rounded-lg shadow p-6 text-center" role="alert" aria-live="assertive">
            <svg
              className="mx-auto h-12 w-12 text-red-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Leads</h3>
            <p className="text-gray-600 mb-4">{loadError}</p>
            <button
              onClick={loadLeads}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 font-medium"
              aria-label="Retry loading leads"
            >
              Try Again
            </button>
          </div>
        ) : (
          <AdminDashboard
            leads={leads}
            onUpdateLead={handleUpdateLead}
            onDeleteLead={handleDeleteLead}
            onExportCSV={handleExportCSV}
          />
        )}
      </div>
    </main>
  );
}

