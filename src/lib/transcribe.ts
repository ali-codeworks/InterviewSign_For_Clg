import { File } from "expo-file-system";

const FUNCTION_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/transcribe-audio`;
const API_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY as string;

export const transcribeAudio = async (uri: string): Promise<string> => {
  const file = new File(uri);

  const form = new FormData();
  form.append("file", file);

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { apikey: API_KEY },
    body: form,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();
  return String(data.text ?? "").trim();
};