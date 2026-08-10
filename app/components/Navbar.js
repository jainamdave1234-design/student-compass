'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]); // Refetch user on route change

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setUser(null);
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isActive = (path) => {
    return pathname === path ? 'nav-link nav-link-active' : 'nav-link';
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link href="/" className="nav-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="url(#logo-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 6L9 12L12 18L15 12L12 6Z" fill="url(#logo-grad-2)"/>
            <defs>
              <linearGradient id="logo-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#a855f7" />
              </linearGradient>
              <linearGradient id="logo-grad-2" x1="9" y1="6" x2="15" y2="18" gradientUnits="userSpaceOnUse">
                <stop stopColor="#06b6d4" />
                <stop offset="1" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-gradient">Student Compass</span>
        </Link>

        {!loading && (
          <ul className="nav-links">
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <>
                    <li><Link href="/admin" className={isActive('/admin')}>Admin Console</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link href="/dashboard" className={isActive('/dashboard')}>Dashboard</Link></li>
                    <li><Link href="/assessment" className={isActive('/assessment')}>Career Quiz</Link></li>
                  </>
                )}
                <li>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                    Hi, <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{user.name.split(' ')[0]}</span>
                  </span>
                </li>
                <li>
                  <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link href="/login" className={isActive('/login')}>Login</Link></li>
                <li>
                  <Link href="/register" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        )}
      </div>
    </nav>
  );
}
