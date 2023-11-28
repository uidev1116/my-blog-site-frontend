export default async function getMessageFromResponse(response: Response) {
  // Enclose `response.json()` in a try since it may throw an error
  // Only return the `message` if there is a `message`
  try {
    const { message } = await response.json();
    return message ?? null;
  } catch (_) {
    return null;
  }
}
