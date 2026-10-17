import { supabase } from "./supabase";

export type EvaluationItem = {
  topic: string;
  question: string;
  answer: string;
};

export type EvaluationResult = {
  score: number;
  verdict: "Correct" | "Partially correct" | "Incorrect";
  feedback: string;
  missingPoints: string[];
  sampleAnswer: string;
};

export type EvaluationResponse = {
  results: EvaluationResult[];
  overallScore: number;
};

export const evaluateAnswers = async (
  roundId: string,
  items: EvaluationItem[],
): Promise<EvaluationResponse> => {
  const { data, error } = await supabase.functions.invoke("evaluate-answers", {
    body: { roundId, items },
  });
  if (error) throw error;
  return data as EvaluationResponse;
};