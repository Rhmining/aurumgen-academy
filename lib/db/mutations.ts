export async function createPlaceholderRecord<T>(payload: T) {
  return {
    ok: true,
    payload
  };
}
