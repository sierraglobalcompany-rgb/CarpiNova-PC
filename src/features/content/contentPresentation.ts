import type { ContentRecord } from "../../knowledge/types";

export type PrimaryText = {
  label: "Explicación sencilla" | "Texto normalizado" | "Transcripción de la fuente";
  text: string;
};

export function selectPrimaryText(content: ContentRecord): PrimaryText {
  const learning = content.learning_text.trim();
  if (learning) {
    return { label: "Explicación sencilla", text: learning };
  }

  const normalized = content.normalized_text.trim();
  if (normalized) {
    return { label: "Texto normalizado", text: normalized };
  }

  return {
    label: "Transcripción de la fuente",
    text: content.source_transcription.trim(),
  };
}
