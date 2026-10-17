import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GROQ_TRANSCRIBE_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const GROQ_MODELS_URL = "https://api.groq.com/openai/v1/models";
const MAX_FILE_BYTES = 20 * 1024 * 1024;

const PREFERRED_MODELS = ["whisper-large-v3-turbo", "whisper-large-v3"];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
  const fallback = available.find((id) => id.includes("whisper"));

  const model = preferred ?? fallback;
  if (!model) throw new Error("No transcription model is available for this API key");

  cachedModel = model;
  return model;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GROQ_API_KEY");
    if (!apiKey) return json({ error: "GROQ_API_KEY is not configured" }, 500);

    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return json({ error: "Audio file is required" }, 400);
    }
    if (file.size === 0 || file.size > MAX_FILE_BYTES) {
      return json({ error: "Audio file size is not valid" }, 400);
    }

    const model = await resolveModel(apiKey);

    const groqForm = new FormData();
    groqForm.append("file", file, file.name || "answer.m4a");
    groqForm.append("model", model);
    groqForm.append("language", "en");
    groqForm.append("response_format", "json");
    groqForm.append("temperature", "0");

    const response = await fetch(GROQ_TRANSCRIBE_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: groqForm,
    });

    if (!response.ok) {
      const detail = await response.text();
      cachedModel = null;
      return json({ error: "Transcription request failed", model, detail }, 502);
    }

    const data = await response.json();
    return json({ text: String(data.text ?? "").trim() });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500,
    );
  }
});