type ExtractionResult = {
  text: string | null;
  supported: boolean;
  method: "plain_text" | "json" | "csv_tsv" | "markup" | "docx" | "pdf" | "none";
  status: "parser_succeeded" | "parser_failed" | "manual_content";
  note: string | null;
};

function normalizeExtractedText(input: string) {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

export async function extractDocumentText(file: File): Promise<ExtractionResult> {
  const lowerName = file.name.toLowerCase();
  const isTextLike =
    file.type.startsWith("text/") ||
    lowerName.endsWith(".md") ||
    lowerName.endsWith(".txt");

  if (isTextLike) {
    return {
      text: normalizeExtractedText(await file.text()),
      supported: true,
      method: "plain_text",
      status: "parser_succeeded",
      note: null
    };
  }

  if (lowerName.endsWith(".json")) {
    const raw = await file.text();
    try {
      return {
        text: JSON.stringify(JSON.parse(raw), null, 2),
        supported: true,
        method: "json",
        status: "parser_succeeded",
        note: null
      };
    } catch {
      return {
        text: normalizeExtractedText(raw),
        supported: true,
        method: "json",
        status: "parser_failed",
        note: "File JSON tidak valid sempurna, teks mentah digunakan."
      };
    }
  }

  if (lowerName.endsWith(".csv") || lowerName.endsWith(".tsv")) {
    const raw = await file.text();
    return {
      text: normalizeExtractedText(
        raw
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean)
          .join("\n")
      ),
      supported: true,
      method: "csv_tsv",
      status: "parser_succeeded",
      note: null
    };
  }

  if (lowerName.endsWith(".html") || lowerName.endsWith(".xml")) {
    const raw = await file.text();
    return {
      text: normalizeExtractedText(
        raw
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<[^>]+>/g, " ")
      ),
      supported: true,
      method: "markup",
      status: "parser_succeeded",
      note: null
    };
  }

  if (lowerName.endsWith(".docx")) {
    try {
      const mammoth = await import("mammoth");
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await mammoth.extractRawText({ buffer });
      const text = normalizeExtractedText(result.value);

      return {
        text: text || null,
        supported: true,
        method: "docx",
        status: text ? "parser_succeeded" : "parser_failed",
        note: result.messages.length
          ? `DOCX diekstrak dengan ${result.messages.length} catatan parser.`
          : null
      };
    } catch (error) {
      return {
        text: null,
        supported: true,
        method: "docx",
        status: "parser_failed",
        note: error instanceof Error ? error.message : "Parser DOCX gagal."
      };
    }
  }

  if (lowerName.endsWith(".pdf")) {
    let parser:
      | {
          getText: () => Promise<{ text: string }>;
          destroy: () => Promise<void>;
        }
      | null = null;

    try {
      const { PDFParse } = await import("pdf-parse");
      const buffer = Buffer.from(await file.arrayBuffer());
      parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      const text = normalizeExtractedText(result.text);

      return {
        text: text || null,
        supported: true,
        method: "pdf",
        status: text ? "parser_succeeded" : "parser_failed",
        note: text ? null : "PDF berhasil dibaca tetapi tidak mengandung teks yang dapat diekstrak."
      };
    } catch (error) {
      return {
        text: null,
        supported: true,
        method: "pdf",
        status: "parser_failed",
        note:
          error instanceof Error
            ? `Parser PDF gagal: ${error.message}`
            : "Parser PDF gagal."
      };
    } finally {
      await parser?.destroy().catch(() => undefined);
    }
  }

  return {
    text: null,
    supported: false,
    method: "none",
    status: "manual_content",
    note: "Format file belum didukung untuk ekstraksi teks otomatis."
  };
}
