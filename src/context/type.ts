export type AnswerPreference = "Text" | "Sign Video" | "Both";

export type UserData = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  city: string;
  hearingStatus: string;
  answerPreference: AnswerPreference;
  avatarUrl: string;
  usernameChangedAt: string | null;
};
