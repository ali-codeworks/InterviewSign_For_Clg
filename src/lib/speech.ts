import * as Speech from "expo-speech";

type Handlers = Pick<Speech.SpeechOptions, "onDone" | "onStopped" | "onError">;

const SPEECH_RATE = 0.82;
const SPEECH_PITCH = 1.0;

let cachedVoice: string | undefined;
let voiceResolved = false;
let latestRequest = 0;

const resolveVoice = async () => {
  if (voiceResolved) return cachedVoice;
  voiceResolved = true;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const english = voices.filter((voice) =>
      voice.language?.toLowerCase().startsWith("en"),
    );
    const preferred =
      english.find(
        (voice) =>
          voice.language === "en-US" &&
          voice.quality === Speech.VoiceQuality.Enhanced,
      ) ??
      english.find((voice) => voice.quality === Speech.VoiceQuality.Enhanced) ??
      english.find((voice) => voice.language === "en-US") ??
      english[0];
    cachedVoice = preferred?.identifier;
  } catch {
    cachedVoice = undefined;
  }
  return cachedVoice;
};

export const speakQuestion = async (text: string, handlers: Handlers) => {
  Speech.stop();
  const requestId = ++latestRequest;
  const voice = await resolveVoice();
  if (requestId !== latestRequest) return;
  Speech.speak(text, {
    language: "en-US",
    voice,
    rate: SPEECH_RATE,
    pitch: SPEECH_PITCH,
    ...handlers,
  });
};

export const stopSpeaking = () => {
  latestRequest++;
  Speech.stop();
};
