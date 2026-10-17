import { questions } from "@/constants";

export type PickedQuestion = { topic: string; question: string };

const shuffle = <T>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const pickQuestions = (
  roundId: string,
  optionId: string,
  topics: string[],
  total: number,
): PickedQuestion[] => {
  const optionQuestions = questions[roundId]?.[optionId];
  if (!optionQuestions || topics.length === 0) return [];

  const base = Math.floor(total / topics.length);
  const extra = total % topics.length;

  return topics.flatMap((topic, i) => {
    const count = base + (i >= topics.length - extra ? 1 : 0);
    return shuffle(optionQuestions[topic] ?? [])
      .slice(0, count)
      .map((question) => ({ topic, question }));
  });
};
