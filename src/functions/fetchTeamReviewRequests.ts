import { retryFetchOnRateLimit } from "./retryFetchOnRateLimit";
import { TeamReviewRequests } from "../interfaces/TeamReviewRequests";

export async function fetchTeamReviewRequests(args: {
  token: string;
  org: string;
  team: string;
}): Promise<TeamReviewRequests> {
  const { token, org, team } = args;

  const query = `is:open is:pr team-review-requested:${org}/${team}`;
  const response = await retryFetchOnRateLimit(
    `https://api.github.com/search/issues?q=${encodeURIComponent(query)}`,
    { headers: { Authorization: `Token ${token}` } }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || `Failed to fetch review requests for team ${team}`
    );
  }

  return { team, reviewRequests: data.total_count };
}
