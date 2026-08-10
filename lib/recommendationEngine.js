import { getCareers, getSkills } from './db.js';

// Map careers to their scoring profiles
const CAREER_PROFILES = {
  'fullstack-engineer': {
    interests: ['web-development', 'product-creation'],
    strengths: ['creative', 'analytical'],
    goals: ['remote-work', 'product-creation', 'startup-culture', 'high-salary'],
    majors: {
      'computer science': 1.0,
      'information technology': 1.0,
      'software engineering': 1.0,
      'computer engineering': 0.9,
      'electrical engineering': 0.5,
      'electronics engineering': 0.5
    }
  },
  'aiml-specialist': {
    interests: ['data-science', 'artificial-intelligence', 'research-and-development'],
    strengths: ['analytical'],
    goals: ['research-and-development', 'high-salary'],
    majors: {
      'computer science': 1.0,
      'information technology': 0.8,
      'software engineering': 0.9,
      'computer engineering': 0.9,
      'electrical engineering': 0.7,
      'electronics engineering': 0.7,
      'mathematics': 1.0
    }
  },
  'cybersecurity-analyst': {
    interests: ['cybersecurity', 'cloud-infrastructure'],
    strengths: ['detail-oriented', 'systematic'],
    goals: ['high-salary', 'remote-work'],
    majors: {
      'computer science': 1.0,
      'information technology': 1.0,
      'software engineering': 0.9,
      'computer engineering': 0.9,
      'electrical engineering': 0.4,
      'electronics engineering': 0.4
    }
  },
  'devops-engineer': {
    interests: ['cloud-infrastructure', 'web-development'],
    strengths: ['systematic', 'analytical'],
    goals: ['high-salary', 'remote-work', 'startup-culture'],
    majors: {
      'computer science': 1.0,
      'information technology': 1.0,
      'software engineering': 0.9,
      'computer engineering': 0.9,
      'electrical engineering': 0.6,
      'electronics engineering': 0.6
    }
  },
  'embedded-engineer': {
    interests: ['hardware-programming', 'research-and-development'],
    strengths: ['hands-on', 'detail-oriented'],
    goals: ['research-and-development', 'high-salary'],
    majors: {
      'computer engineering': 1.0,
      'electrical engineering': 1.0,
      'electronics engineering': 1.0,
      'robotics': 1.0,
      'computer science': 0.6,
      'information technology': 0.4
    }
  }
};

/**
 * Calculates career recommendations based on user profile and current skills.
 * @param {Object} profile - User profile data (major, interests, strengths, goals)
 * @param {Array<string>} userSkills - Array of skill IDs the user already possesses
 * @returns {Array<Object>} Sorted list of recommended careers with suitability metrics
 */
export function getRecommendations(profile, userSkills = []) {
  const careers = getCareers();
  const allSkills = getSkills();
  
  const studentMajor = (profile.major || '').toLowerCase().trim();
  const studentInterests = profile.interests || [];
  const studentStrengths = profile.strengths || [];
  const studentGoals = profile.goals || [];

  const recommendations = careers.map(career => {
    const p = CAREER_PROFILES[career.id] || { interests: [], strengths: [], goals: [], majors: {} };
    
    // 1. Interest Score (Max 40 points)
    let interestScore = 0;
    if (p.interests.length > 0) {
      const matchCount = studentInterests.filter(i => p.interests.includes(i)).length;
      interestScore = (matchCount / p.interests.length) * 40;
    }

    // 2. Strengths Score (Max 25 points)
    let strengthScore = 0;
    if (p.strengths.length > 0) {
      const matchCount = studentStrengths.filter(s => p.strengths.includes(s)).length;
      strengthScore = (matchCount / p.strengths.length) * 25;
    }

    // 3. Goals Score (Max 20 points)
    let goalScore = 0;
    if (p.goals.length > 0) {
      const matchCount = studentGoals.filter(g => p.goals.includes(g)).length;
      goalScore = (matchCount / p.goals.length) * 20;
    }

    // 4. Major Alignment (Max 15 points)
    let majorScore = 0;
    // Direct match or partial string matching
    const majorKeys = Object.keys(p.majors);
    const matchedKey = majorKeys.find(key => studentMajor.includes(key) || key.includes(studentMajor));
    if (matchedKey) {
      majorScore = p.majors[matchedKey] * 15;
    } else if (studentMajor) {
      // Baseline major match for related technical fields
      majorScore = 5; 
    }

    // Total raw match percentage
    let matchPercentage = Math.round(interestScore + strengthScore + goalScore + majorScore);
    
    // Ensure boundaries: min 30% for a positive feedback loop, max 98% (saving 100% for completed roadmaps)
    matchPercentage = Math.max(30, Math.min(98, matchPercentage));

    // 5. Skill Gap Analysis
    const reqSkills = career.requiredSkills || [];
    const matchingSkills = reqSkills.filter(sid => userSkills.includes(sid));
    const missingSkills = reqSkills.filter(sid => !userSkills.includes(sid));

    const matchingSkillsDetails = matchingSkills.map(sid => allSkills.find(s => s.id === sid)).filter(Boolean);
    const missingSkillsDetails = missingSkills.map(sid => allSkills.find(s => s.id === sid)).filter(Boolean);

    // 6. Generate Personalization Explanation (Explainability)
    let explanationParts = [];
    
    // Match interests
    const commonInterests = studentInterests.filter(i => p.interests.includes(i));
    if (commonInterests.length > 0) {
      const interestNames = commonInterests.map(i => i.replace('-', ' '));
      explanationParts.push(`Your strong interest in **${interestNames.join(', ')}** aligns directly with the core tasks of this path.`);
    }

    // Match strengths
    const commonStrengths = studentStrengths.filter(s => p.strengths.includes(s));
    if (commonStrengths.length > 0) {
      explanationParts.push(`This role leverages your natural strengths as a **${commonStrengths.join(' and ')}** thinker.`);
    }

    // Match major
    if (matchedKey) {
      explanationParts.push(`Your academic background in **${profile.major}** provides the ideal technical foundation.`);
    }

    // Match goals
    const commonGoals = studentGoals.filter(g => p.goals.includes(g));
    if (commonGoals.length > 0) {
      const goalNames = commonGoals.map(g => g.replace('-', ' '));
      explanationParts.push(`It supports your career objectives of securing **${goalNames.join(', ')}**.`);
    }

    if (explanationParts.length === 0) {
      explanationParts.push(`This engineering discipline offers solid alignment with your tech interests and analytical background.`);
    }

    const suitabilityReason = explanationParts.join(' ') + ` Additionally, you have already acquired **${matchingSkills.length} out of ${reqSkills.length}** required skills for this roadmap.`;

    return {
      id: career.id,
      name: career.name,
      description: career.description,
      whyItSuits: career.whyItSuits,
      salaryRange: career.salaryRange,
      demandLevel: career.demandLevel,
      matchPercentage,
      suitabilityReason,
      skillGap: {
        matchingCount: matchingSkills.length,
        totalCount: reqSkills.length,
        matchingSkills: matchingSkillsDetails,
        missingSkills: missingSkillsDetails
      }
    };
  });

  // Sort by match percentage descending
  return recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);
}
