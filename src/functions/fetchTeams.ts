import { retryFetchOnRateLimit } from "./retryFetchOnRateLimit";

async function fetchTeamsPage(args: {
  token: string;
  org: string;
  page: number;
  result: string[];
}): Promise<string[]> {
  const { token, org, page, result } = args;

  if (!token || !org) {
    return result;
  }

  const response = await retryFetchOnRateLimit(
    `https://api.github.com/orgs/${org}/teams?per_page=100&page=${page}`,
    {
      headers: { Authorization: `Token ${token}` },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch teams");
  }

  const teams = data.map((team: { slug: string }) => team.slug);

  if (teams.length < 100) {
    return [...result, ...teams];
  }

  return fetchTeamsPage({
    token,
    org,
    page: page + 1,
    result: [...result, ...teams],
  });
}

export async function fetchTeams(args: {
  token: string;
  org: string;
}): Promise<string[]> {
  const { token, org } = args;
  return fetchTeamsPage({ token, org, page: 1, result: [] });
}
