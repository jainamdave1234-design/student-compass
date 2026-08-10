'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Assessment() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [skillsList, setSkillsList] = useState([]);
  const router = useRouter();

  // Profile Form States
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedStrengths, setSelectedStrengths] = useState([]);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  // Available options
  const interestsList = [
    { id: 'web-development', label: 'Web Systems & Apps' },
    { id: 'data-science', label: 'Data Analytics & Modeling' },
    { id: 'artificial-intelligence', label: 'AI, ML & Neural Networks' },
    { id: 'cybersecurity', label: 'Systems Security & Penetration Testing' },
    { id: 'cloud-infrastructure', label: 'Cloud Systems & Automation' },
    { id: 'hardware-programming', label: 'Low-level Hardware & IoT Devices' },
    { id: 'research-and-development', label: 'Research & Novel Engineering' },
    { id: 'product-creation', label: 'Product Design & Startups' }
  ];

  const strengthsList = [
    { id: 'analytical', label: 'Analytical (Data structures, algorithms, mathematical models)' },
    { id: 'creative', label: 'Creative (User experience, interfaces, innovative solutions)' },
    { id: 'systematic', label: 'Systematic (Large-scale structures, automation, pipelines)' },
    { id: 'detail-oriented', label: 'Detail-Oriented (Secure coding, vulnerability audits, logic testing)' },
    { id: 'hands-on', label: 'Hands-on (Hardware circuits, soldering, physical mechanics)' }
  ];

  const goalsList = [
    { id: 'high-salary', label: 'High compensation potential' },
    { id: 'remote-work', label: 'Flexible work schedules & remote options' },
    { id: 'research-and-development', label: 'Research-focused / advanced labs work' },
    { id: 'product-creation', label: 'Building systems from scratch / entrepreneurial' },
    { id: 'startup-culture', label: 'Fast-paced, agile startup setups' }
  ];

  useEffect(() => {
    // Authenticate and check if student is logged in
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) {
          router.push('/login');
        }
        return res.json();
      })
      .then(data => {
        if (data && data.user) {
          // Pre-populate if they already filled parts of it
          const u = data.user;
          if (u.profile) {
            setMajor(u.profile.major || '');
            setYear(u.profile.year || '');
            setSelectedInterests(u.profile.interests || []);
            setSelectedStrengths(u.profile.strengths || []);
            setSelectedGoals(u.profile.goals || []);
          }
          setSelectedSkills(u.skills || []);
        }
      })
      .catch(err => console.error(err));

    // Fetch skills catalog to let them check their current skillsets
    // Using a public endpoint that returns all skills.
    fetch('/api/admin/skills')
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          // Filter beginner / introductory skills for easier selection
          setSkillsList(data.skills);
        }
      })
      .catch(err => console.error('Error fetching skills:', err));
  }, []);

  const toggleSelection = (id, list, setList) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/student/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            major,
            year,
            interests: selectedInterests,
            strengths: selectedStrengths,
            goals: selectedGoals
          },
          skills: selectedSkills
        })
      });

      if (res.ok) {
        // Redirect to recommendations dashboard
        router.push('/dashboard');
        router.refresh();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to submit profile.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error submitting assessment.');
    } finally {
      setLoading(false);
    }
  };

  // Render Form Steps
  return (
    <div style={{ flex: 1, padding: '60px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Progress header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem' }}>Career Fit Questionnaire</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Step {step} of 5</p>
          </div>
          <div style={{
            width: '180px',
            height: '6px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(step / 5) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Quiz Body */}
        <div className="glass-card" style={{ padding: '40px' }}>
          
          {/* Step 1: Academic Background */}
          {step === 1 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Tell us about your Academics</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>This helps align recommendations to standard university branches.</p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="major">Academic Major / Branch</label>
                <select
                  id="major"
                  className="form-control"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.4)', cursor: 'pointer' }}
                >
                  <option value="">-- Select Major --</option>
                  <option value="Computer Science">Computer Science / Software Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Electrical Engineering">Electrical & Electronics Engineering</option>
                  <option value="Electronics & Communication">Electronics & Communication Engineering</option>
                  <option value="Robotics / Automation">Robotics / Mechatronics Engineering</option>
                  <option value="Mathematics">Mathematics & Computing</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="year">Current Year of Study</label>
                <select
                  id="year"
                  className="form-control"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.4)', cursor: 'pointer' }}
                >
                  <option value="">-- Select Year --</option>
                  <option value="1st Year">1st Year (Freshman)</option>
                  <option value="2nd Year">2nd Year (Sophomore)</option>
                  <option value="3rd Year">3rd Year (Junior)</option>
                  <option value="4th Year">4th Year (Senior)</option>
                  <option value="Graduated">Graduated / Post-grad</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Tech Interests */}
          {step === 2 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Select your Technology Interests</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Choose fields that excite you or you want to build projects in.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {interestsList.map(item => {
                  const selected = selectedInterests.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleSelection(item.id, selectedInterests, setSelectedInterests)}
                      className="btn"
                      style={{
                        padding: '16px',
                        justifyContent: 'flex-start',
                        background: selected ? 'var(--color-primary-glow)' : 'rgba(255,255,255,0.02)',
                        border: selected ? '1.5px solid var(--color-primary)' : '1.5px solid var(--border-color)',
                        color: selected ? 'var(--color-text)' : 'var(--color-text-muted)',
                        textAlign: 'left',
                        borderRadius: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: '1.5px solid currentColor',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px'
                        }}>
                          {selected && '✓'}
                        </div>
                        {item.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Strengths */}
          {step === 3 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Identify your Strengths</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>How do you naturally tackle problems? Select all that apply.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {strengthsList.map(item => {
                  const selected = selectedStrengths.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleSelection(item.id, selectedStrengths, setSelectedStrengths)}
                      className="btn"
                      style={{
                        padding: '16px',
                        justifyContent: 'flex-start',
                        background: selected ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255,255,255,0.02)',
                        border: selected ? '1.5px solid var(--color-accent)' : '1.5px solid var(--border-color)',
                        color: selected ? 'var(--color-text)' : 'var(--color-text-muted)',
                        textAlign: 'left',
                        borderRadius: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: '1.5px solid currentColor',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px'
                        }}>
                          {selected && '✓'}
                        </div>
                        {item.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Career Goals */}
          {step === 4 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Define your Career Objectives</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>What values and environment are you looking for in your job?</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {goalsList.map(item => {
                  const selected = selectedGoals.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleSelection(item.id, selectedGoals, setSelectedGoals)}
                      className="btn"
                      style={{
                        padding: '16px',
                        justifyContent: 'flex-start',
                        background: selected ? 'rgba(168, 85, 247, 0.1)' : 'rgba(255,255,255,0.02)',
                        border: selected ? '1.5px solid var(--color-secondary)' : '1.5px solid var(--border-color)',
                        color: selected ? 'var(--color-text)' : 'var(--color-text-muted)',
                        textAlign: 'left',
                        borderRadius: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: '1.5px solid currentColor',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px'
                        }}>
                          {selected && '✓'}
                        </div>
                        {item.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5: Current Skills Checkoff */}
          {step === 5 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Check skills you ALREADY have</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Select subjects you have completed in college or learned independently.</p>
              </div>

              <div style={{
                maxHeight: '300px',
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                paddingRight: '8px'
              }}>
                {skillsList.map(skill => {
                  const selected = selectedSkills.includes(skill.id);
                  return (
                    <button
                      key={skill.id}
                      onClick={() => toggleSelection(skill.id, selectedSkills, setSelectedSkills)}
                      className="btn"
                      style={{
                        padding: '10px 14px',
                        fontSize: '0.85rem',
                        justifyContent: 'flex-start',
                        background: selected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)',
                        border: selected ? '1.5px solid var(--color-success)' : '1.5px solid var(--border-color)',
                        color: selected ? 'var(--color-text)' : 'var(--color-text-muted)',
                        textAlign: 'left',
                        borderRadius: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        <div style={{
                          flexShrink: 0,
                          width: '14px',
                          height: '14px',
                          borderRadius: '3px',
                          border: '1px solid currentColor',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '8px'
                        }}>
                          {selected && '✓'}
                        </div>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {skill.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
            {step > 1 ? (
              <button onClick={handlePrev} className="btn btn-secondary">
                &larr; Back
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                onClick={handleNext}
                className="btn btn-primary"
                disabled={step === 1 && (!major || !year)}
              >
                Next Step &rarr;
              </button>
            ) : (
              <button onClick={handleSubmit} className="btn btn-primary" disabled={loading}>
                {loading ? 'Analyzing Profile...' : 'Complete & View Results! 🎉'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
