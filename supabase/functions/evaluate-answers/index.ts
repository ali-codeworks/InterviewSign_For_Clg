import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODELS_URL = "https://api.groq.com/openai/v1/models";
const MAX_ITEMS = 20;
const MAX_ANSWER_LENGTH = 4000;

const PREFERRED_MODELS = [
  "llama-3.3-70b-versatile",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "llama-3.1-8b-instant",
];

const EXCLUDED_KEYWORDS = [
  "whisper",
  "tts",
  "guard",
  "orpheus",
  "embed",
  "safeguard",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Item = { topic: string; question: string; answer: string };

type Result = {
  score: number;
  verdict: "Correct" | "Partially correct" | "Incorrect";
  feedback: string;
  missingPoints: string[];
  sampleAnswer: string;
};

const technicalRounds = new Set(["technical", "coding"]);

let cachedModel: string | null = null;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const resolveModel = async (apiKey: string) => {
  if (cachedModel) return cachedModel;

  const response = await fetch(GROQ_MODELS_URL, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) {
    throw new Error(`Could not list Groq models: ${await response.text()}`);
  }

  const data = await response.json();
  const available: string[] = (data.data ?? []).map(
    (model: { id: string }) => model.id,
  );

  const preferred = PREFERRED_MODELS.find((id) => available.includes(id));
  const fallback = available.find(
    (id) => !EXCLUDED_KEYWORDS.some((keyword) => id.includes(keyword)),
  );

  const model = preferred ?? fallback;
  if (!model) throw new Error("No chat model is available for this API key");

  cachedModel = model;
  return model;
};

const buildSystemPrompt = (roundId: string) => {
  const criteria = technicalRounds.has(roundId)
    ? "Judge technical correctness, depth of understanding and completeness. Be strict about factual errors."
    : "There is no single correct answer. Judge clarity, relevance to the question, structure (for example the STAR method for experience based questions), confidence and professionalism.";

  return `You are an experienced interviewer evaluating a candidate's answers in a mock interview.
${criteria}
Score each answer from 0 to 10. Use the verdict "Correct" for scores 8 to 10, "Partially correct" for 4 to 7 and "Incorrect" for 0 to 3.
The feedback is spoken aloud to the candidate, so write it in the second person as exactly 2 short sentences with a maximum of 35 words in total: the first states what was good or wrong, the second states the most important improvement.
List up to 3 missing points and give a sample answer of at most 40 words.
If an answer is empty or irrelevant, score it 0.
Respond only with a JSON object in this exact shape, with one entry per answer in the same order:
{"results":[{"score":number,"verdict":string,"feedback":string,"missingPoints":string[],"sampleAnswer":string}]}`;
};

const normalize = (raw: Partial<Result> | undefined): Result => {
  const score = Math.min(10, Math.max(0, Number(raw?.score) || 0));
  const verdict =
    score >= 8 ? "Correct" : score >= 4 ? "Partially correct" : "Incorrect";
  return {
    score,
    verdict,
    feedback: String(raw?.feedback ?? "No feedback available."),
    missingPoints: Array.isArray(raw?.missingPoints)
      ? raw.missingPoints.slice(0, 3).map(String)
      : [],
    sampleAnswer: String(raw?.sampleAnswer ?? ""),
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GROQ_API_KEY");
    if (!apiKey) return json({ error: "GROQ_API_KEY is not configured" }, 500);

    const { roundId, items } = (await req.json()) as {
      roundId: string;
      items: Item[];
    };

    if (!roundId || !Array.isArray(items) || items.length === 0) {
      return json({ error: "Invalid request body" }, 400);
    }

    const trimmed = items.slice(0, MAX_ITEMS).map((item) => ({
      topic: String(item.topic),
      question: String(item.question),
      answer: String(item.answer).slice(0, MAX_ANSWER_LENGTH),
    }));

    const model = await resolveModel(apiKey);

    const response = await fetch(GROQ_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: buildSystemPrompt(roundId) },
          { role: "user", content: JSON.stringify({ answers: trimmed }) },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      cachedModel = null;
      return json({ error: "Evaluation request failed", model, detail }, 502);
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    const results: Result[] = trimmed.map((_, index) =>
      normalize(parsed.results?.[index]),
    );
    const overallScore =
      Math.round(
        (results.reduce((sum, r) => sum + r.score, 0) / results.length) * 10,
      ) / 10;

    return json({ results, overallScore });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500,
    );
  }
});