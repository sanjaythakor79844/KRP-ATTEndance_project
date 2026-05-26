import { useState } from 'react';
import { Lock, LogIn } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple password check - in production, this should be on backend
    const MANAGER_PASSWORD = 'krp@2024'; // Change this to your secure password

    if (password === MANAGER_PASSWORD) {
      // Store auth in localStorage
      localStorage.setItem('krp_auth', 'true');
      localStorage.setItem('krp_auth_time', Date.now().toString());
      onLogin();
    } else {
      setError('Incorrect password. Access denied.');
      setPassword('');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🎓 KRP Academy
            </h1>
            <p className="text-gray-600">
              Manager Dashboard Access
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Manager Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter manager password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="w-5 h-5" />
              {loading ? 'Verifying...' : 'Access Dashboard'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>
                  <strong>Manager Access Only:</strong> This dashboard is restricted to authorized managers. 
                  Students do not have access to prevent accidental data changes.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} KRP Academy. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
