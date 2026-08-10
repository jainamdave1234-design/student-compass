'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Check role and redirect
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div className="glass-card animate-fade-in" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px', textAlign: 'center' }}>Welcome Back</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '32px', textAlign: 'center' }}>
            Log in to monitor your roadmaps and check off goals.
          </p>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--color-danger)',
              color: 'var(--color-danger)',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '20px'
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', marginTop: '24px', color: 'var(--color-text-muted)' }}>
            Don't have an account? <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign up here</Link>
          </p>
        </div>

        {/* Demo Credentials Helper Box */}
        <div className="glass-card animate-fade-in" style={{ padding: '20px', background: 'rgba(99, 102, 241, 0.05)', borderStyle: 'dashed' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--color-accent)', marginBottom: '8px' }}>🔑 Testing Credentials</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            <div>
              <strong>Student:</strong> <code>alex@student.edu</code> / <code>password123</code>
            </div>
            <div>
              <strong>Admin:</strong> <code>admin@compass.edu</code> / <code>password123</code>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
