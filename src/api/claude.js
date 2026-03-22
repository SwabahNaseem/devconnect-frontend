// ─── Claude AI Matchmaking ────────────────────────────────────────────────────
// Get your free API key at: https://console.anthropic.com → API Keys → Create Key
// Replace the value below with your key (starts with sk-ant-)
// Without a key the app still works using rule-based fallback scoring

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = 'YOUR_CLAUDE_API_KEY_HERE';  // ← paste your key here

export async function getMatchScore(user, project) {
  // If already a member, return 100
  if (project.member) {
    return {
      score: 100,
      verdict: "You're a Member",
      matchedSkills: user.skills || [],
      missingSkills: [],
      summary: 'You are already part of this project.',
      recommendation: 'Keep building!'
    };
  }

  const prompt = `You are a technical team matchmaking AI. Analyze how well this user matches the project.

USER PROFILE:
- Name: ${user.name}
- Bio: ${user.bio || 'Not provided'}
- Skills: ${(user.skills || []).join(', ') || 'None listed'}
- Age: ${user.age || 'Not specified'}

PROJECT:
- Name: ${project.name}
- Description: ${project.description || 'Not provided'}
- Required Skills: ${(project.skills || []).join(', ') || 'None specified'}
- Current Members: ${project.members?.length || 0}
- Team Size Note: ${(project.members?.length || 0) > 5 ? 'Large team, specific roles needed' : 'Small team, generalists welcome'}

Respond ONLY with a valid JSON object. No markdown, no extra text, just the JSON:
{
  "score": <number 0-100>,
  "verdict": "<one of: Perfect Match | Strong Match | Good Match | Partial Match | Weak Match>",
  "matchedSkills": [<array of skills user has that are relevant to the project>],
  "missingSkills": [<array of project skills the user does not have>],
  "summary": "<exactly 2 sentences explaining the match quality and why>",
  "recommendation": "<one short action phrase such as: Apply now | Build these skills first | Great opportunity | Consider applying>"
}`;

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`Claude API error: ${response.status}`);

    const data  = await response.json();
    const text  = data.content[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);

  } catch (err) {
    console.warn('Claude API unavailable, using fallback matching:', err.message);
    return fallbackMatch(user, project);
  }
}

// Rule-based fallback — works without any API key
function fallbackMatch(user, project) {
  const userSkills    = (user.skills    || []).map(s => s.toLowerCase());
  const projectSkills = (project.skills || []).map(s => s.toLowerCase());

  if (projectSkills.length === 0) {
    return {
      score: 70,
      verdict: 'Good Match',
      matchedSkills: [],
      missingSkills: [],
      summary: 'This project has no specific skill requirements listed. Anyone can contribute.',
      recommendation: 'Apply now'
    };
  }

  const matched = project.skills.filter(s => userSkills.includes(s.toLowerCase()));
  const missing = project.skills.filter(s => !userSkills.includes(s.toLowerCase()));
  const score   = Math.round((matched.length / projectSkills.length) * 100);

  const verdict =
    score >= 90 ? 'Perfect Match' :
    score >= 70 ? 'Strong Match'  :
    score >= 50 ? 'Good Match'    :
    score >= 30 ? 'Partial Match' : 'Weak Match';

  return {
    score,
    verdict,
    matchedSkills: matched,
    missingSkills: missing,
    summary: `You match ${matched.length} of ${projectSkills.length} required skills for this project. ${
      missing.length > 0
        ? `You are missing: ${missing.join(', ')}.`
        : 'You have all the required skills!'
    }`,
    recommendation: score >= 60 ? 'Apply now' : 'Build these skills first'
  };
}
