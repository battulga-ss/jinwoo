import { useState } from 'react';
import { api } from '../lib/api';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const res = await api.post('/auth/login', {
          email: form.email,
          password: form.password,
        });
        localStorage.setItem('token', res.data.data.authToken);

        if (res.data.data.role === 'ADMIN') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/profile';
        }
      } else {
        await api.post('/auth/register', form);
        setIsLogin(true);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{
        backgroundImage:
          'url(https://w.wallhaven.cc/full/2y/wallhaven-2ym7v9.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-70" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl mx-auto mb-4">
            ⚡
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {isLogin ? 'Sign in to your account' : 'Start your journey today'}
          </p>
        </div>

        <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 flex flex-col gap-3">
          {!isLogin && (
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wide mb-1 block">
                Name
              </label>
              <input
                className="w-full bg-gray-800 text-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 focus:border-transparent transition"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wide mb-1 block">
              Email
            </label>
            <input
              className="w-full bg-gray-800 text-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 focus:border-transparent transition"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wide mb-1 block">
              Password
            </label>
            <input
              className="w-full bg-gray-800 text-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 focus:border-transparent transition"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-xl p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3 rounded-xl font-medium text-sm transition mt-1 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '...' : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-4">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            className="text-blue-400 hover:text-blue-300 transition font-medium"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
          >
            {isLogin ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
