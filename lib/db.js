import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'db.json');

// Read database
export function readDb() {
  try {
    if (!fs.existsSync(dbPath)) {
      const emptyDb = { users: [], careers: [], skills: [], roadmaps: [], resources: [], userProgress: [] };
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(dbPath, JSON.stringify(emptyDb, null, 2), 'utf8');
      return emptyDb;
    }
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return { users: [], careers: [], skills: [], roadmaps: [], resources: [], userProgress: [] };
  }
}

// Write database (atomic write)
export function writeDb(data) {
  try {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempPath = dbPath + '.tmp';
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, dbPath);
    return true;
  } catch (error) {
    console.error("Error writing database:", error);
    return false;
  }
}

// User Helpers
export function getUsers() {
  return readDb().users || [];
}

export function getUserByEmail(email) {
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id) {
  const users = getUsers();
  return users.find(u => u.id === id);
}

export function createUser(user) {
  const db = readDb();
  const newUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    skills: [],
    profile: {
      major: '',
      year: '',
      interests: [],
      strengths: [],
      goals: []
    },
    ...user
  };
  db.users.push(newUser);
  writeDb(db);
  return newUser;
}

export function updateUser(id, updates) {
  const db = readDb();
  const index = db.users.findIndex(u => u.id === id);
  if (index !== -1) {
    db.users[index] = { ...db.users[index], ...updates };
    writeDb(db);
    return db.users[index];
  }
  return null;
}

// Careers Helpers
export function getCareers() {
  return readDb().careers || [];
}

export function getCareerById(id) {
  return getCareers().find(c => c.id === id);
}

export function createCareer(career) {
  const db = readDb();
  const newCareer = {
    ...career,
    id: career.id || `career-${Date.now()}`
  };
  db.careers.push(newCareer);
  writeDb(db);
  return newCareer;
}

export function updateCareer(id, updates) {
  const db = readDb();
  const index = db.careers.findIndex(c => c.id === id);
  if (index !== -1) {
    db.careers[index] = { ...db.careers[index], ...updates };
    writeDb(db);
    return db.careers[index];
  }
  return null;
}

export function deleteCareer(id) {
  const db = readDb();
  db.careers = db.careers.filter(c => c.id !== id);
  db.roadmaps = db.roadmaps.filter(r => r.careerId !== id);
  db.userProgress = db.userProgress.filter(p => p.careerId !== id);
  writeDb(db);
  return true;
}

// Skills Helpers
export function getSkills() {
  return readDb().skills || [];
}

export function getSkillById(id) {
  return getSkills().find(s => s.id === id);
}

export function createSkill(skill) {
  const db = readDb();
  const newSkill = {
    ...skill,
    id: skill.id || `skill-${Date.now()}`
  };
  db.skills.push(newSkill);
  writeDb(db);
  return newSkill;
}

export function updateSkill(id, updates) {
  const db = readDb();
  const index = db.skills.findIndex(s => s.id === id);
  if (index !== -1) {
    db.skills[index] = { ...db.skills[index], ...updates };
    writeDb(db);
    return db.skills[index];
  }
  return null;
}

export function deleteSkill(id) {
  const db = readDb();
  db.skills = db.skills.filter(s => s.id !== id);
  
  // Clean from careers requiredSkills
  db.careers = db.careers.map(c => ({
    ...c,
    requiredSkills: c.requiredSkills.filter(sid => sid !== id)
  }));
  
  // Clean from roadmaps steps
  db.roadmaps = db.roadmaps.map(r => ({
    ...r,
    steps: r.steps.map(s => ({
      ...s,
      skillIds: s.skillIds.filter(sid => sid !== id)
    }))
  }));

  // Clean resources
  db.resources = db.resources.filter(res => res.skillId !== id);

  writeDb(db);
  return true;
}

// Roadmaps Helpers
export function getRoadmaps() {
  return readDb().roadmaps || [];
}

export function getRoadmapByCareerId(careerId) {
  return getRoadmaps().find(r => r.careerId === careerId);
}

export function saveRoadmap(roadmap) {
  const db = readDb();
  const index = db.roadmaps.findIndex(r => r.careerId === roadmap.careerId);
  const updatedRoadmap = {
    id: roadmap.id || `roadmap-${Date.now()}`,
    ...roadmap
  };
  if (index !== -1) {
    db.roadmaps[index] = updatedRoadmap;
  } else {
    db.roadmaps.push(updatedRoadmap);
  }
  writeDb(db);
  return updatedRoadmap;
}

// Resources & Projects Helpers
export function getResources() {
  return readDb().resources || [];
}

export function getResourcesBySkillId(skillId) {
  return getResources().filter(r => r.skillId === skillId);
}

export function createResource(res) {
  const db = readDb();
  const newRes = {
    ...res,
    id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
  };
  db.resources.push(newRes);
  writeDb(db);
  return newRes;
}

export function updateResource(id, updates) {
  const db = readDb();
  const index = db.resources.findIndex(r => r.id === id);
  if (index !== -1) {
    db.resources[index] = { ...db.resources[index], ...updates };
    writeDb(db);
    return db.resources[index];
  }
  return null;
}

export function deleteResource(id) {
  const db = readDb();
  db.resources = db.resources.filter(r => r.id !== id);
  writeDb(db);
  return true;
}

// Progress Helpers
export function getProgressList() {
  return readDb().userProgress || [];
}

export function getProgress(userId, careerId) {
  return getProgressList().find(p => p.userId === userId && p.careerId === careerId);
}

export function getUserActiveProgress(userId) {
  return getProgressList().find(p => p.userId === userId && p.active === true);
}

export function saveProgress(progressData) {
  const db = readDb();
  const index = db.userProgress.findIndex(p => p.userId === progressData.userId && p.careerId === progressData.careerId);
  
  const record = {
    completedSkills: [],
    completedProjects: [],
    active: false,
    ...progressData,
    updatedAt: new Date().toISOString()
  };

  // If setting this progress to active, make all other user progress records inactive
  if (record.active) {
    db.userProgress = db.userProgress.map(p => {
      if (p.userId === record.userId && p.careerId !== record.careerId) {
        return { ...p, active: false };
      }
      return p;
    });
  }

  if (index !== -1) {
    db.userProgress[index] = { ...db.userProgress[index], ...record };
  } else {
    db.userProgress.push(record);
  }
  writeDb(db);
  return record;
}
