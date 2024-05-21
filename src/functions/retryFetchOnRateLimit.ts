export async function retryFetchOnRateLimit(
  input: RequestInfo | URL,
  info: RequestInit | undefined,
  retries = 10
): Promise<Response> {
  if (retries === 0) {
    throw new Error("Fetch failed");
  }

  let response: Response | undefined;

  try {
    response = await fetch(input, info);
  } catch {
    // noop
  }

  if (!response?.ok) {
    const rateLimitReset = response?.headers.get("x-ratelimit-reset");
    const reset = rateLimitReset ? Number(rateLimitReset) * 1000 : Date.now();
    const now = Date.now();
    const delay = reset - now + 1000;

    console.warn(`${retries} retries left, waiting ${delay}ms`);

    await new Promise((resolve) => setTimeout(resolve, delay));

    return await retryFetchOnRateLimit(input, info, retries - 1);
  }

  return response;
}
