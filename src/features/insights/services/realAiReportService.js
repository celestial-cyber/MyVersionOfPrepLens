function safeJsonParse(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(raw.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function normalizeArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean).slice(0, 8);
}

export async function generateAiReportWithApi(reportContext) {
  const apiKey = import.meta.env.VITE_AI_API_KEY;
  if (!apiKey) return null;

  const apiUrl = import.meta.env.VITE_AI_API_URL || 'https://api.openai.com/v1/chat/completions';
  const model = import.meta.env.VITE_AI_MODEL || 'gpt-4o-mini';

  const payload = {
    model,
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content:
          'You are an assessment analyst for placement training. Analyze category scores, attempted topics, unattempted questions, wrong answers, and performance metrics. Return only valid JSON with keys: summary, strengths, weaknesses, improvementPlan. Keep each array <= 5 items and make actions specific.',
      },
      {
        role: 'user',
        content: JSON.stringify(reportContext),
      },
    ],
    response_format: { type: 'json_object' },
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';
    const parsed = safeJsonParse(content);
    if (!parsed) return null;

    return {
      summary: String(parsed.summary || ''),
      strengths: normalizeArray(parsed.strengths),
      weaknesses: normalizeArray(parsed.weaknesses),
      improvementPlan: normalizeArray(parsed.improvementPlan),
      source: 'real-ai-api',
    };
  } catch {
    return null;
  }
}
