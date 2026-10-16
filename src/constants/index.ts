import { behavioralQuestions } from "./behavioral";
import { codingQuestions } from "./coding";
import { communicationQuestions } from "./communication";
import { hrQuestions } from "./hr";
import { managerQuestions } from "./manager";
import { situationalQuestions } from "./situational";
import { stressQuestions } from "./stress";
import { technicalBackendQuestions } from "./technical-backend";
import { technicalFrontendQuestions } from "./technical-frontend";
import { technicalOtherQuestions } from "./technical-other";

type OptionQuestions = Record<string, string[]>;
type RoundQuestions = Record<string, OptionQuestions>;

export const questions: Record<string, RoundQuestions> = {
  hr: hrQuestions,
  technical: {
    ...technicalFrontendQuestions,
    ...technicalBackendQuestions,
    ...technicalOtherQuestions,
  },
  manager: managerQuestions,
  behavioral: behavioralQuestions,
  communication: communicationQuestions,
  coding: codingQuestions,
  situational: situationalQuestions,
  stress: stressQuestions,
};

export const getQuestions = (
  roundId: string,
  optionId: string,
  topics: string[],
): { topic: string; question: string }[] => {
  const optionQuestions = questions[roundId]?.[optionId];
  if (!optionQuestions) return [];
  return topics.flatMap((topic) =>
    (optionQuestions[topic] ?? []).map((question) => ({ topic, question })),
  );
};
