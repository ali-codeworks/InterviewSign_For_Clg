import { AnswerEntry } from "@/components/interview/types";
import { evaluateAnswers, EvaluationResult } from "@/lib/evaluate";
import { useCallback, useState } from "react";

export type EvaluationStatus = "idle" | "loading" | "done" | "error";

export function useEvaluation(roundId: string) {
  const [status, setStatus] = useState<EvaluationStatus>("idle");
  const [results, setResults] = useState<Record<number, EvaluationResult>>({});
  const [overallScore, setOverallScore] = useState<number | null>(null);

  const run = useCallback(
    async (entries: AnswerEntry[]) => {
      const indexes = entries
        .map((entry, i) =>
          entry.mode === "text" && entry.text.trim().length > 0 ? i : -1,
        )
        .filter((i) => i >= 0);

      if (indexes.length === 0) {
        setResults({});
        setOverallScore(null);
        setStatus("done");
        return;
      }

      setStatus("loading");
      try {
        const response = await evaluateAnswers(
          roundId,
          indexes.map((i) => ({
            topic: entries[i].topic,
            question: entries[i].question,
            answer: entries[i].text,
          })),
        );
        const mapped: Record<number, EvaluationResult> = {};
        indexes.forEach((entryIndex, position) => {
          mapped[entryIndex] = response.results[position];
        });
        setResults(mapped);
        setOverallScore(response.overallScore);
        setStatus("done");
      } catch {
        setStatus("error");
      }
    },
    [roundId],
  );

  return { status, results, overallScore, run };
}