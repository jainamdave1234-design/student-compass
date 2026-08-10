'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminConsole() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('careers');
  const [loading, setLoading] = useState(true);

  // Entities state
  const [careers, setCareers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resources, setResources] = useState([]);

  // Modals state
  const [editingCareer, setEditingCareer] = useState(null); // { id, name, description, salaryRange, demandLevel, requiredSkills } or empty
  const [editingSkill, setEditingSkill] = useState(null); // { id, name, category, description, level }
  const [editingResource, setEditingResource] = useState(null); // { id, skillId, title, type, url, description, platform, difficulty, duration }

  // Load Admin Console Data
  const loadConsoleData = async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) {
        router.push('/login');
        return;
      }
      const authData = await authRes.json();
      if (authData.user?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      // Load all lists
      const careersRes = await fetch('/api/admin/careers');
      const skillsRes = await fetch('/api/admin/skills');
      const resourcesRes = await fetch('/api/admin/resources');

      if (careersRes.ok) setCareers((await careersRes.json()).careers);
      if (skillsRes.ok) setSkills((await skillsRes.json()).skills);
      if (resourcesRes.ok) setResources((await resourcesRes.json()).resources);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsoleData();
  }, []);

  // CRUD CAREERS
  const handleSaveCareer = async (e) => {
    e.preventDefault();
    const isNew = !editingCareer.id;
    const url = '/api/admin/careers';
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCareer)
      });
      if (res.ok) {
        setEditingCareer(null);
        loadConsoleData();
      } else {
        alert('Failed to save career profile');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCareer = async (id) => {
    if (!confirm('Are you sure you want to delete this career? This will cascade delete associated roadmaps.')) return;
    try {
      const res = await fetch(`/api/admin/careers?id=${id}`, { method: 'DELETE' });
      if (res.ok) loadConsoleData();
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD SKILLS
  const handleSaveSkill = async (e) => {
    e.preventDefault();
    const isNew = !editingSkill.id;
    const url = '/api/admin/skills';
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSkill)
      });
      if (res.ok) {
        setEditingSkill(null);
        loadConsoleData();
      } else {
        alert('Failed to save skill entry');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!confirm('Are you sure? This will remove the skill reference from all careers, roadmaps, and resources.')) return;
    try {
      const res = await fetch(`/api/admin/skills?id=${id}`, { method: 'DELETE' });
      if (res.ok) loadConsoleData();
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD RESOURCES
  const handleSaveResource = async (e) => {
    e.preventDefault();
    const isNew = !editingResource.id;
    const url = '/api/admin/resources';
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingResource)
      });
      if (res.ok) {
        setEditingResource(null);
        loadConsoleData();
      } else {
        alert('Failed to save resource details');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteResource = async (id) => {
    if (!confirm('Delete this learning resource?')) return;
    try {
      const res = await fetch(`/api/admin/resources?id=${id}`, { method: 'DELETE' });
      if (res.ok) loadConsoleData();
    } catch (err) {
      console.error(err);
    }
  };

  // Checkbox lists togglers for Careers skills mapping
  const toggleCareerSkillRequirement = (skillId) => {
    const isRequired = editingCareer.requiredSkills?.includes(skillId);
    let updated;
    if (isRequired) {
      updated = editingCareer.requiredSkills.filter(id => id !== skillId);
    } else {
      updated = [...(editingCareer.requiredSkills || []), skillId];
    }
    setEditingCareer({ ...editingCareer, requiredSkills: updated });
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>Loading Admin Workspace...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Console Title Banner */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem' }}>System Administrator Console</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Manage career configurations, skills catalog, and learning path nodes.</p>
        </div>
      </section>

      {/* Tabs list */}
      <section style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '1px' }}>
        <button
          onClick={() => setActiveTab('careers')}
          className={`btn ${activeTab === 'careers' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '12px 12px 0 0', padding: '12px 24px' }}
        >
          💼 Careers ({careers.length})
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`btn ${activeTab === 'skills' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '12px 12px 0 0', padding: '12px 24px' }}
        >
          🔑 Skills Catalog ({skills.length})
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`btn ${activeTab === 'resources' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '12px 12px 0 0', padding: '12px 24px' }}
        >
          📚 Curated Resources ({resources.length})
        </button>
      </section>

      {/* Tab Workspaces */}
      <section className="glass-card animate-fade-in" style={{ padding: '32px' }}>
        
        {/* Careers manager tab */}
        {activeTab === 'careers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Available Careers Configurations</h3>
              <button
                onClick={() => setEditingCareer({ name: '', description: '', whyItSuits: '', salaryRange: '', demandLevel: 'Medium', requiredSkills: [] })}
                className="btn btn-accent"
              >
                + Configure New Career
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--color-text-muted)' }}>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Salary Range</th>
                    <th style={{ padding: '12px' }}>Demand Level</th>
                    <th style={{ padding: '12px' }}>Skills Count</th>
                    <th style={{ padding: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {careers.map(car => (
                    <tr key={car.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{car.name}</td>
                      <td style={{ padding: '12px' }}>{car.salaryRange}</td>
                      <td style={{ padding: '12px' }}>
                        <span className="badge badge-primary">{car.demandLevel}</span>
                      </td>
                      <td style={{ padding: '12px' }}>{(car.requiredSkills || []).length} required</td>
                      <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                        <button onClick={() => setEditingCareer(car)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                          Edit
                        </button>
                        <button onClick={() => handleDeleteCareer(car.id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Skills inventory tab */}
        {activeTab === 'skills' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Registered Skills</h3>
              <button
                onClick={() => setEditingSkill({ name: '', category: '', description: '', level: 'Beginner' })}
                className="btn btn-accent"
              >
                + Register New Skill
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--color-text-muted)' }}>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Category</th>
                    <th style={{ padding: '12px' }}>Level</th>
                    <th style={{ padding: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {skills.map(sk => (
                    <tr key={sk.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{sk.name}</td>
                      <td style={{ padding: '12px' }}>{sk.category}</td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${sk.level === 'Beginner' ? 'badge-accent' : sk.level === 'Intermediate' ? 'badge-primary' : 'badge-secondary'}`}>
                          {sk.level}
                        </span>
                      </td>
                      <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                        <button onClick={() => setEditingSkill(sk)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                          Edit
                        </button>
                        <button onClick={() => handleDeleteSkill(sk.id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Resources tab */}
        {activeTab === 'resources' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Assigned Resources & Projects</h3>
              <button
                onClick={() => setEditingResource({ skillId: skills[0]?.id || '', title: '', type: 'course', url: '', description: '', platform: '', difficulty: 'Beginner', duration: '' })}
                className="btn btn-accent"
                disabled={skills.length === 0}
              >
                + Assign New Resource
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--color-text-muted)' }}>
                    <th style={{ padding: '12px' }}>Title</th>
                    <th style={{ padding: '12px' }}>Mapped Skill</th>
                    <th style={{ padding: '12px' }}>Type</th>
                    <th style={{ padding: '12px' }}>Platform</th>
                    <th style={{ padding: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map(res => {
                    const sk = skills.find(s => s.id === res.skillId);
                    return (
                      <tr key={res.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{res.title}</td>
                        <td style={{ padding: '12px' }}>{sk ? sk.name : 'Unknown Skill'}</td>
                        <td style={{ padding: '12px' }}>
                          <span className={`badge ${res.type === 'project' ? 'badge-secondary' : res.type === 'certification' ? 'badge-accent' : 'badge-primary'}`}>
                            {res.type}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>{res.platform || 'Independent'}</td>
                        <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                          <button onClick={() => setEditingResource(res)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                            Edit
                          </button>
                          <button onClick={() => handleDeleteResource(res.id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* MODAL: CAREERS EDITOR */}
      {editingCareer && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card animate-fade-in" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-surface-solid)', padding: '32px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>{editingCareer.id ? 'Edit Career Config' : 'Configure New Career'}</h3>
            
            <form onSubmit={handleSaveCareer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Career Name</label>
                <input type="text" className="form-control" value={editingCareer.name} onChange={(e) => setEditingCareer({ ...editingCareer, name: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Profile Description</label>
                <textarea className="form-control" rows="3" value={editingCareer.description} onChange={(e) => setEditingCareer({ ...editingCareer, description: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Why it matches (Explanation logic summary)</label>
                <textarea className="form-control" rows="2" value={editingCareer.whyItSuits} onChange={(e) => setEditingCareer({ ...editingCareer, whyItSuits: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Salary Range</label>
                  <input type="text" className="form-control" placeholder="$80,000 - $120,000" value={editingCareer.salaryRange} onChange={(e) => setEditingCareer({ ...editingCareer, salaryRange: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Demand Level</label>
                  <select className="form-control" value={editingCareer.demandLevel} onChange={(e) => setEditingCareer({ ...editingCareer, demandLevel: e.target.value })}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Very High">Very High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Require Skills (Map nodes to roadmap)</label>
                <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
                  {skills.map(sk => {
                    const checked = editingCareer.requiredSkills?.includes(sk.id);
                    return (
                      <label key={sk.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={checked || false} onChange={() => toggleCareerSkillRequirement(sk.id)} />
                        {sk.name} ({sk.category})
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                <button type="button" onClick={() => setEditingCareer(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Career Configuration</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SKILLS EDITOR */}
      {editingSkill && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card animate-fade-in" style={{ maxWidth: '500px', width: '100%', background: 'var(--bg-surface-solid)', padding: '32px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>{editingSkill.id ? 'Edit Skill Record' : 'Register New Skill'}</h3>
            
            <form onSubmit={handleSaveSkill} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Skill Name</label>
                <input type="text" className="form-control" value={editingSkill.name} onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input type="text" className="form-control" placeholder="e.g. Frontend Development, Data Science" value={editingSkill.category} onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Difficulty Level</label>
                <select className="form-control" value={editingSkill.level} onChange={(e) => setEditingSkill({ ...editingSkill, level: e.target.value })}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows="3" value={editingSkill.description} onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })} required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                <button type="button" onClick={() => setEditingSkill(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Skill Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESOURCES EDITOR */}
      {editingResource && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card animate-fade-in" style={{ maxWidth: '550px', width: '100%', background: 'var(--bg-surface-solid)', padding: '32px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>{editingResource.id ? 'Edit Curated Resource' : 'Assign New Resource'}</h3>
            
            <form onSubmit={handleSaveResource} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Associated Skill Node</label>
                <select className="form-control" value={editingResource.skillId} onChange={(e) => setEditingResource({ ...editingResource, skillId: e.target.value })} required>
                  {skills.map(sk => (
                    <option key={sk.id} value={sk.id}>{sk.name} ({sk.category})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Resource Title</label>
                <input type="text" className="form-control" value={editingResource.title} onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Resource Type</label>
                  <select className="form-control" value={editingResource.type} onChange={(e) => setEditingResource({ ...editingResource, type: e.target.value })}>
                    <option value="course">Online Course</option>
                    <option value="book">Reference Book / Docs</option>
                    <option value="certification">Official Certification</option>
                    <option value="project">Practical Implementation Project</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Platform / Author</label>
                  <input type="text" className="form-control" placeholder="e.g. Coursera, Udemy, MIT" value={editingResource.platform} onChange={(e) => setEditingResource({ ...editingResource, platform: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">URL / Reference Link</label>
                <input type="text" className="form-control" placeholder="https://..." value={editingResource.url} onChange={(e) => setEditingResource({ ...editingResource, url: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Time Duration</label>
                  <input type="text" className="form-control" placeholder="e.g. 20 hours, 2 weeks" value={editingResource.duration} onChange={(e) => setEditingResource({ ...editingResource, duration: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Recommended Level</label>
                  <select className="form-control" value={editingResource.difficulty} onChange={(e) => setEditingResource({ ...editingResource, difficulty: e.target.value })}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description / Guidelines Summary</label>
                <textarea className="form-control" rows="2" value={editingResource.description} onChange={(e) => setEditingResource({ ...editingResource, description: e.target.value })} required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                <button type="button" onClick={() => setEditingResource(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Resource Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
