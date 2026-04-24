export async function readJsonResponse(response: Response) {
  const responseText = await response.text();
  let payload: Record<string, unknown> | null = null;

  try {
    payload = responseText ? JSON.parse(responseText) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (payload?.error && typeof payload.error === "string") {
      throw new Error(payload.error);
    }

    if (responseText.includes("<!DOCTYPE")) {
      throw new Error("Server mengembalikan halaman error HTML. Cek log server atau Network response untuk detail error.");
    }

    throw new Error("Request gagal.");
  }

  if (!payload) {
    throw new Error("Respons server tidak valid.");
  }

  return payload;
}
