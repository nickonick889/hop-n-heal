import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link to="/" className="font-display text-2xl text-text mb-10" style={{ fontFamily: "'DM Serif Display', serif" }}>
        Hop & Heal
      </Link>

      <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-8">
        <h1 className="text-xl font-semibold text-text mb-1">Welcome back</h1>
        <p className="text-sm text-muted mb-6">Log in to your account</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Email</label>
            <input
              type="email" required autoFocus
              value={form.email} onChange={set('email')}
              placeholder="you@example.com"
              className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">Password</label>
            <input
              type="password" required
              value={form.password} onChange={set('password')}
              placeholder="••••••••"
              className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-accent text-[#080808] font-semibold py-3 rounded-full text-sm hover:bg-accent-hover transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="text-sm text-muted text-center mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-accent hover:underline">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
