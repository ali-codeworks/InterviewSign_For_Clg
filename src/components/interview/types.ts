import { EvaluationResult } from "@/lib/evaluate";
import { AnswerMode } from "./AnswerOptions";

export type AnswerEntry = {
  topic: string;
  question: string;
  mode: AnswerMode;
  text: string;
  result?: EvaluationResult;
};