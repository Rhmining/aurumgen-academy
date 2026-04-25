type ResponseContentPart = {
  type?: string;
  text?: string;
};

type ResponseOutputItem = {
  type?: string;
  content?: ResponseContentPart[];
};

export function extractOpenAiOutputText(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const directText = (payload as { output_text?: unknown }).output_text;
  if (typeof directText === "string" && directText.trim()) {
    return directText;
  }

  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) {
    return "";
  }

  return output
    .flatMap((item) => {
      const typedItem = item as ResponseOutputItem;
      if (typedItem.type !== "message" || !Array.isArray(typedItem.content)) {
        return [];
      }

      return typedItem.content
        .filter((part) => part?.type === "output_text" && typeof part.text === "string")
        .map((part) => part.text ?? "");
    })
    .join("\n")
    .trim();
}
