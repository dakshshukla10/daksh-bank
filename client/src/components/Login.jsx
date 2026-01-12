import { useState } from 'react';

function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignup) {
        // Signup
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, name, pin })
        });

        const data = await response.json();

        if (data.success) {
          setSuccess('Account created! You can now sign in.');
          setIsSignup(false);
          setName('');
          setPin('');
        } else {
          setError(data.message || 'Signup failed');
        }
      } else {
        // Login
        const response = await fetch('/api/auth/verify-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, pin })
        });

        const data = await response.json();

        if (data.success) {
          onLogin(data.user);
        } else {
          setError(data.message || 'Invalid credentials');
        }
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setSuccess('');
    setPin('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-bank-primary px-8 py-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Daksh Bank</h1>
          <p className="text-blue-200 mt-1">{isSignup ? 'Create Account' : 'Savings Tracker'}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bank-accent focus:border-transparent outline-none transition"
              placeholder="Enter your user ID"
              required
            />
          </div>

          {isSignup && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bank-accent focus:border-transparent outline-none transition"
                placeholder="Enter your name"
                required
              />
            </div>
          )}

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              PIN {isSignup && <span className="text-gray-400">(4-6 digits)</span>}
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bank-accent focus:border-transparent outline-none transition"
              placeholder={isSignup ? "Create a secret PIN" : "Enter your PIN"}
              required
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-bank-primary hover:bg-bank-secondary text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isSignup ? 'Creating...' : 'Signing in...'}
              </span>
            ) : (
              isSignup ? 'Create Account' : 'Sign In'
            )}
          </button>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-bank-accent hover:text-bank-primary transition"
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
