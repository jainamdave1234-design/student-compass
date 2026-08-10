'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (res.ok) return res.json();
        return null;
      })
      .then(data => {
        if (data && data.success) {
          setUser(data.user);
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', padding: '60px 0' }}>
      
      {/* Hero Section */}
      <section className="container animate-fade-in" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <div className="badge badge-primary" style={{ padding: '6px 16px', fontSize: '0.85rem', marginBottom: '8px' }}>
          ✨ The Ultimate Guidance Platform for Engineers
        </div>
        
        <h1 style={{ fontSize: '3.5rem', maxWidth: '900px', lineHeight: 1.15, fontWeight: 800 }}>
          Navigate Your Engineering Career with <span className="text-gradient">Precision Guidance</span>
        </h1>
        
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', maxWidth: '650px', lineHeight: 1.6 }}>
          Stop guessing your future. Get analytical career matching, identify exact skill gaps, and follow structured roadmaps with projects and certifications tailored to your engineering branch.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          {user ? (
            <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              Go to Dashboard &rarr;
            </Link>
          ) : (
            <>
              <Link href="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
                Start Assessment
              </Link>
              <Link href="/login" className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
                Explore Career Paths
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Interactive Highlights Grid */}
      <section className="container">
        <h2 style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: '48px' }}>
          Engineered for <span className="text-gradient-cyan">Actionable Learning</span>
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          
          <div className="glass-card glass-card-glow" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <h3>Weighted Recommendation</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Matches your interests, technical strengths, and academic branch against real-world engineering roles to determine dynamic alignment scores.
            </p>
          </div>

          <div className="glass-card glass-card-glow" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-accent)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <h3>Granular Skill Gap Analysis</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Compares your current skills with industry standards. Instantly lists what you already know and visualizes exactly which skills you need to build next.
            </p>
          </div>

          <div className="glass-card glass-card-glow" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-secondary)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8l-4 4 4 4M8 12h8"/>
              </svg>
            </div>
            <h3>Structured Roadmaps</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Breaks down learning into sequential phases. Complete courses, read specialized publications, pass quizzes, and check off practical hardware/software projects.
            </p>
          </div>

        </div>
      </section>

      {/* Featured Career Paths */}
      <section className="container" style={{
        padding: '60px',
        borderRadius: '24px',
        background: 'rgba(13, 17, 39, 0.25)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Explore Professional Engineering Disciplines</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            We provide deep roadmaps for the most critical technology professions in the modern market.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px'
        }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>Web Systems</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Full-Stack Software Engineer, Frontend/Backend architecture.</p>
          </div>
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ color: 'var(--color-secondary)', marginBottom: '8px' }}>Intelligence Systems</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>AI/ML Engineer, Data Scientist, Research Specialist.</p>
          </div>
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ color: 'var(--color-accent)', marginBottom: '8px' }}>Hardware & IoT</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Embedded Firmware Developer, PCB Designer, Robotics Engineer.</p>
          </div>
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ color: 'var(--color-success)', marginBottom: '8px' }}>Security & Networks</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Security Analyst, Network architect, penetration testing.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
