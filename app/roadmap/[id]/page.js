'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function Roadmap() {
  const params = useParams();
  const careerId = params.id;
  const router = useRouter();

  // Load States
  const [loading, setLoading] = useState(true);
  const [careerName, setCareerName] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [progress, setProgress] = useState({ completedSkills: [], completedProjects: [] });
  
  // Selected Node State
  const [selectedSkill, setSelectedSkill] = useState(null);

  const fetchRoadmapData = async () => {
    try {
      // 1. Fetch Auth session
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        router.push('/login');
        return;
      }

      // 2. Fetch career list to map careerId -> careerName
      const recRes = await fetch('/api/student/recommendations');
      if (recRes.ok) {
        const recData = await recRes.json();
        const currentCareer = recData.recommendations?.find(r => r.id === careerId);
        if (currentCareer) {
          setCareerName(currentCareer.name);
        }
      }

      // 3. Fetch detailed roadmap
      const roadmapRes = await fetch(`/api/student/roadmap?careerId=${careerId}`);
      if (!roadmapRes.ok) {
        throw new Error('Roadmap not found');
      }
      const roadmapData = await roadmapRes.json();
      setRoadmap(roadmapData.roadmap);

      // Select the first skill of the first step by default
      if (roadmapData.roadmap?.steps?.length > 0 && roadmapData.roadmap.steps[0].skills?.length > 0) {
        setSelectedSkill(roadmapData.roadmap.steps[0].skills[0]);
      }

      // 4. Fetch student progress
      const progressRes = await fetch(`/api/student/progress?careerId=${careerId}`);
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        if (progressData.progress) {
          setProgress(progressData.progress);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (careerId) {
      fetchRoadmapData();
    }
  }, [careerId]);

  // Handle skill check toggle
  const toggleSkillCompleted = async (skillId) => {
    const isCompleted = progress.completedSkills.includes(skillId);
    let updatedSkills;

    if (isCompleted) {
      updatedSkills = progress.completedSkills.filter(id => id !== skillId);
    } else {
      updatedSkills = [...progress.completedSkills, skillId];
    }

    const updatedProgress = { ...progress, completedSkills: updatedSkills };
    setProgress(updatedProgress);

    try {
      await fetch('/api/student/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerId, completedSkills: updatedSkills })
      });
    } catch (err) {
      console.error('Error saving skill progress:', err);
    }
  };

  // Handle project check toggle
  const toggleProjectCompleted = async (projectId) => {
    const isCompleted = progress.completedProjects.includes(projectId);
    let updatedProjects;

    if (isCompleted) {
      updatedProjects = progress.completedProjects.filter(id => id !== projectId);
    } else {
      updatedProjects = [...progress.completedProjects, projectId];
    }

    const updatedProgress = { ...progress, completedProjects: updatedProjects };
    setProgress(updatedProgress);

    try {
      await fetch('/api/student/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerId, completedProjects: updatedProjects })
      });
    } catch (err) {
      console.error('Error saving project progress:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid var(--border-color)', borderTopColor: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>Mapping curriculum...</p>
        </div>
      </div>
    );
  }

  // Calculate overall metrics
  const totalSkills = roadmap?.steps?.reduce((acc, step) => acc + (step.skills?.length || 0), 0) || 0;
  const completedSkillsCount = progress.completedSkills?.length || 0;
  const progressPercent = totalSkills > 0 ? Math.round((completedSkillsCount / totalSkills) * 100) : 0;

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header and Back navigation */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>
            &larr; Back to Dashboard
          </Link>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>
            Roadmap: <span className="text-gradient-cyan">{careerName || 'Interactive Path'}</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Complete the sequential skill nodes and their hands-on projects to achieve professional proficiency.
          </p>
        </div>

        {/* Progress Tracker Widget */}
        <div className="glass-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '24px', minWidth: '280px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              <span>Curriculum Completed</span>
              <span style={{ color: 'var(--color-success)' }}>{progressPercent}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--color-success)', transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dark)', marginTop: '6px' }}>
              {completedSkillsCount} of {totalSkills} skills mastered
            </div>
          </div>
        </div>
      </section>

      {/* Main Roadmap Explorer Workspace */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '32px',
        alignItems: 'start'
      }}>
        
        {/* Left Side: Interactive Steps & Node Graph */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {roadmap?.steps?.map((step) => {
            // Check if all skills in this step are completed
            const stepSkillsCount = step.skills?.length || 0;
            const completedStepSkillsCount = step.skills?.filter(s => progress.completedSkills.includes(s.id)).length || 0;
            const isStepCompleted = stepSkillsCount > 0 && stepSkillsCount === completedStepSkillsCount;
            const isStepActive = !isStepCompleted && step.skills?.some(s => !progress.completedSkills.includes(s.id));

            return (
              <div key={step.stepNumber} className="roadmap-step-container">
                
                {/* Node indicator */}
                <div className={`roadmap-step-node ${isStepCompleted ? 'completed' : isStepActive ? 'active' : ''}`}>
                  {step.stepNumber}
                </div>

                <div className="glass-card" style={{ padding: '24px', borderLeftWidth: '4px', borderLeftColor: isStepCompleted ? 'var(--color-success)' : isStepActive ? 'var(--color-primary)' : 'var(--border-color)' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>{step.title}</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '20px', lineHeight: 1.4 }}>
                    {step.description}
                  </p>

                  {/* Horizontal list of Skill Nodes */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {step.skills?.map((skill) => {
                      const isSkillDone = progress.completedSkills.includes(skill.id);
                      const isSkillSelected = selectedSkill?.id === skill.id;
                      
                      return (
                        <button
                          key={skill.id}
                          onClick={() => setSelectedSkill(skill)}
                          className="btn"
                          style={{
                            padding: '12px 18px',
                            background: isSkillDone 
                              ? 'rgba(16, 185, 129, 0.08)' 
                              : isSkillSelected 
                                ? 'var(--color-primary-glow)' 
                                : 'rgba(0,0,0,0.2)',
                            border: isSkillSelected
                              ? '2px solid var(--color-accent)'
                              : isSkillDone
                                ? '1.5px solid var(--color-success)'
                                : '1.5px solid var(--border-color)',
                            color: isSkillDone 
                              ? '#34d399' 
                              : isSkillSelected 
                                ? 'var(--color-text)' 
                                : 'var(--color-text-muted)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '4px',
                            minWidth: '140px',
                            boxShadow: isSkillSelected ? '0 0 15px var(--color-accent-glow)' : 'none'
                          }}
                        >
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', opacity: 0.8 }}>
                            {skill.level}
                          </span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                            {skill.name}
                          </span>
                          {isSkillDone && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              ✓ Mastered
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Right Side: Skill Detail Panel & Resource Drawer */}
        <div style={{ position: 'sticky', top: '100px' }}>
          {selectedSkill ? (
            <div className="glass-card animate-fade-in" style={{
              background: 'var(--bg-surface-solid)',
              borderWidth: '1.5px',
              borderColor: 'var(--border-color-hover)',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              
              {/* Skill Info */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-primary">{selectedSkill.category}</span>
                  <span className={`badge ${selectedSkill.level === 'Beginner' ? 'badge-accent' : selectedSkill.level === 'Intermediate' ? 'badge-primary' : 'badge-secondary'}`}>
                    {selectedSkill.level} Level
                  </span>
                </div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>{selectedSkill.name}</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {selectedSkill.description}
                </p>
              </div>

              {/* Toggle Mastery Button */}
              <div>
                <button
                  onClick={() => toggleSkillCompleted(selectedSkill.id)}
                  className="btn"
                  style={{
                    width: '100%',
                    background: progress.completedSkills.includes(selectedSkill.id) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    border: progress.completedSkills.includes(selectedSkill.id) ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                    color: progress.completedSkills.includes(selectedSkill.id) ? 'var(--color-danger)' : 'var(--color-success)',
                    padding: '14px'
                  }}
                >
                  {progress.completedSkills.includes(selectedSkill.id) ? '✕ Mark Skill as Incomplete' : '✓ Mark Skill as Mastered'}
                </button>
              </div>

              {/* Learning Curriculum list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', color: 'var(--color-accent)' }}>
                  📖 Recommended Tutorials & Courses
                </h3>
                
                {selectedSkill.resources?.courses?.length > 0 || selectedSkill.resources?.books?.length > 0 || selectedSkill.resources?.certifications?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* Courses */}
                    {selectedSkill.resources.courses.map(res => (
                      <a key={res.id} href={res.url} target="_blank" rel="noopener noreferrer" className="glass-card" style={{
                        padding: '16px',
                        background: 'rgba(0,0,0,0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        transition: 'transform 0.2s'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{res.platform}</span>
                          <span style={{ color: 'var(--color-text-dark)' }}>⏱️ {res.duration}</span>
                        </div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{res.title}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{res.description}</p>
                      </a>
                    ))}

                    {/* Certifications */}
                    {selectedSkill.resources.certifications?.map(res => (
                      <a key={res.id} href={res.url} target="_blank" rel="noopener noreferrer" className="glass-card" style={{
                        padding: '16px',
                        background: 'rgba(168,85,247,0.03)',
                        borderColor: 'rgba(168,85,247,0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 600 }}>OFFICIAL CERTIFICATION</div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{res.title}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{res.description}</p>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-text-dark)', fontSize: '0.85rem' }}>No standard courses configured yet. Researching new materials...</p>
                )}
              </div>

              {/* Hands-on Projects */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', color: 'var(--color-secondary)' }}>
                  🛠️ Practical Implementation Projects
                </h3>

                {selectedSkill.resources?.projects?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedSkill.resources.projects.map(proj => {
                      const isProjDone = progress.completedProjects.includes(proj.id);
                      
                      return (
                        <div key={proj.id} className="glass-card" style={{
                          padding: '18px',
                          background: isProjDone ? 'rgba(16,185,129,0.03)' : 'rgba(0,0,0,0.15)',
                          borderColor: isProjDone ? 'rgba(16,185,129,0.2)' : 'var(--border-color)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-secondary)' }}>
                              ⏳ {proj.duration}
                            </span>
                            <button
                              onClick={() => toggleProjectCompleted(proj.id)}
                              style={{
                                background: isProjDone ? 'var(--color-success)' : 'none',
                                border: isProjDone ? '1px solid var(--color-success)' : '1px solid var(--border-color)',
                                color: isProjDone ? 'white' : 'var(--color-text-muted)',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              {isProjDone ? '✓ Completed' : 'Mark Done'}
                            </button>
                          </div>
                          
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{proj.title}</h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{proj.description}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-text-dark)', fontSize: '0.85rem' }}>No custom projects assigned for this skill yet.</p>
                )}
              </div>

            </div>
          ) : (
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Select a skill node from the roadmap to view details, tutorials, and practical projects.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
