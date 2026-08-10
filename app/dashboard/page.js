'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [activeProgress, setActiveProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedExpl, setSelectedExpl] = useState(null); // For explainability modal
  const router = useRouter();

  const loadDashboardData = async () => {
    try {
      // 1. Fetch user session
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        router.push('/login');
        return;
      }
      const userData = await userRes.json();
      setUser(userData.user);

      // 2. Fetch recommendations
      const recRes = await fetch('/api/student/recommendations');
      const recData = await recRes.json();
      if (recRes.ok && !recData.needsAssessment) {
        setRecommendations(recData.recommendations);
      }

      // 3. Fetch active career progress
      const progRes = await fetch('/api/student/progress');
      if (progRes.ok) {
        const progData = await progRes.json();
        setActiveProgress(progData.progress);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleSetActiveFocus = async (careerId) => {
    try {
      const res = await fetch('/api/student/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerId, active: true })
      });
      if (res.ok) {
        // Reload data
        loadDashboardData();
      }
    } catch (err) {
      console.error('Error setting active focus:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid var(--border-color)', borderTopColor: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>Analyzing career choices...</p>
          <style jsx global>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      </div>
    );
  }

  // If user hasn't done assessment yet
  const needsAssessment = recommendations.length === 0;

  return (
    <div className="container" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      {/* Greetings Banner */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
            Welcome, <span className="text-gradient">{user?.name}</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Academic focus: <strong style={{ color: 'var(--color-text)' }}>{user?.profile?.major}</strong> ({user?.profile?.year})
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/assessment" className="btn btn-secondary">
            🔄 Retake Quiz
          </Link>
        </div>
      </section>

      {needsAssessment ? (
        /* Needs Assessment Layout */
        <section className="glass-card animate-fade-in" style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <div style={{ fontSize: '3rem' }}>🎯</div>
          <h2>Analyze Your Career Suitability</h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '500px', lineHeight: 1.6 }}>
            You haven't completed your career profile quiz. Take a quick 3-minute quiz mapping your branch, interests, and strengths to find the exact roadmaps that match you.
          </p>
          <Link href="/assessment" className="btn btn-primary" style={{ padding: '14px 32px' }}>
            Start Assessment Now &rarr;
          </Link>
        </section>
      ) : (
        /* Dashboard Layout */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* Active focus banner */}
          {activeProgress && (
            <section className="glass-card animate-fade-in" style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.08) 100%)',
              borderColor: 'var(--color-primary-dark)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '24px',
              padding: '28px'
            }}>
              <div>
                <div className="badge badge-primary" style={{ marginBottom: '8px' }}>🚀 Current Goal Focus</div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
                  {recommendations.find(r => r.id === activeProgress.careerId)?.name || 'Active Roadmap'}
                </h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  Keep learning! Complete tasks, projects, and certifications in your path to update your metrics.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-success)' }}>
                    {Math.round(((activeProgress.completedSkills || []).length / 
                      (recommendations.find(r => r.id === activeProgress.careerId)?.skillGap.totalCount || 1)) * 100)}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Progress</div>
                </div>
                <Link href={`/roadmap/${activeProgress.careerId}`} className="btn btn-primary">
                  Resume Roadmap &rarr;
                </Link>
              </div>
            </section>
          )}

          {/* Recommendations list */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h2 style={{ fontSize: '1.8rem' }}>Personalized Match Reports</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {recommendations.map((rec) => {
                const isActiveFocus = activeProgress?.careerId === rec.id;
                
                return (
                  <div key={rec.id} className="glass-card animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', padding: '28px', alignItems: 'center' }}>
                    
                    {/* Career Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.4rem' }}>{rec.name}</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span className="badge badge-accent">💰 {rec.salaryRange}</span>
                          <span className={`badge ${rec.demandLevel === 'Very High' ? 'badge-primary' : 'badge-secondary'}`}>
                            🔥 {rec.demandLevel} Demand
                          </span>
                          {isActiveFocus && <span className="badge badge-success">🎯 Active Focus</span>}
                        </div>
                      </div>

                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.5, maxWidth: '850px' }}>
                        {rec.description}
                      </p>

                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                        <button
                          onClick={() => setSelectedExpl(rec)}
                          className="btn btn-accent"
                          style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
                        >
                          👁️ Why this matches me?
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                          <strong>Skill gap:</strong> 
                          <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{rec.skillGap.matchingCount}</span>
                          <span>/</span>
                          <span>{rec.skillGap.totalCount} acquired</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Circle & Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', minWidth: '150px' }}>
                      <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        background: `conic-gradient(var(--color-primary) ${rec.matchPercentage}%, rgba(255,255,255,0.05) 0)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}>
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          background: 'var(--bg-surface-solid)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.1rem',
                          fontWeight: 800
                        }}>
                          {rec.matchPercentage}%
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                        <Link href={`/roadmap/${rec.id}`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', width: '100%', textAlign: 'center' }}>
                          Explore Roadmap
                        </Link>
                        {!isActiveFocus && (
                          <button
                            onClick={() => handleSetActiveFocus(rec.id)}
                            className="btn btn-primary"
                            style={{ padding: '8px 16px', fontSize: '0.85rem', width: '100%' }}
                          >
                            Set Active Focus
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* Explainability Modal Overlay */}
      {selectedExpl && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card animate-fade-in" style={{
            maxWidth: '550px',
            width: '100%',
            background: 'var(--bg-surface-solid)',
            padding: '32px',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedExpl(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              &times;
            </button>

            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--color-accent)' }}>Suitability Breakdown</h3>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>{selectedExpl.name}</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              <div>
                <strong style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>AI Fit Assessment</strong>
                <p dangerouslySetInnerHTML={{ __html: selectedExpl.suitabilityReason.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--color-primary)">$1</strong>') }} />
              </div>

              <div>
                <strong style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', display: 'block', textTransform: 'uppercase', marginBottom: '8px' }}>Missing Skills (Gaps)</strong>
                {selectedExpl.skillGap.missingSkills.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedExpl.skillGap.missingSkills.map(skill => (
                      <span key={skill.id} className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
                        {skill.name} ({skill.level})
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-success)', fontSize: '0.9rem' }}>🎉 Congratulations! You have acquired all required skills for this profile.</p>
                )}
              </div>

              <div>
                <strong style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', display: 'block', textTransform: 'uppercase', marginBottom: '8px' }}>Acquired Skills</strong>
                {selectedExpl.skillGap.matchingSkills.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedExpl.skillGap.matchingSkills.map(skill => (
                      <span key={skill.id} className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                        {skill.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No matching skills yet. Start the roadmap to acquire them!</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedExpl(null)}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '32px' }}
            >
              Close Report
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
