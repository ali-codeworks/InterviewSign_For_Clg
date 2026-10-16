import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";

export type IconName = ComponentProps<typeof Ionicons>["name"];

export type RoundOption = {
  id: string;
  title: string;
  icon: IconName;
  color: string;
  bg: string;
  topics: string[];
};

export type Round = {
  id: string;
  title: string;
  description: string;
  questions: number;
  minutes: number;
  icon: IconName;
  color: string;
  bg: string;
  optionLabel: string;
  options: RoundOption[];
};

export const palette = {
  blue: { color: "#2563eb", bg: "#eff6ff" },
  purple: { color: "#7c3aed", bg: "#f5f3ff" },
  cyan: { color: "#0891b2", bg: "#ecfeff" },
  pink: { color: "#db2777", bg: "#fdf2f8" },
  orange: { color: "#ea580c", bg: "#fff7ed" },
  green: { color: "#16a34a", bg: "#f0fdf4" },
  indigo: { color: "#4f46e5", bg: "#eef2ff" },
  teal: { color: "#0d9488", bg: "#f0fdfa" },
  yellow: { color: "#ca8a04", bg: "#fefce8" },
  amber: { color: "#d97706", bg: "#fffbeb" },
  red: { color: "#dc2626", bg: "#fef2f2" },
  emerald: { color: "#059669", bg: "#ecfdf5" },
  sky: { color: "#0284c7", bg: "#f0f9ff" },
  gray: { color: "#374151", bg: "#f3f4f6" },
};
