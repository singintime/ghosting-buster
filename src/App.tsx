import React from "react";
import "./App.css";
import { fetchTeams } from "./functions/fetchTeams";
import { fetchTeamReviewRequests } from "./functions/fetchTeamReviewRequests";
import { TeamReviewRequests } from "./interfaces/TeamReviewRequests";

function App() {
  const [token, setToken] = React.useState<string>("");
  const [org, setOrg] = React.useState<string>("");
  const [teams, setTeams] = React.useState<string[]>([]);
  const [reviewRequests, setReviewRequests] = React.useState<
    TeamReviewRequests[]
  >([]);
  const [error, setError] = React.useState<string>("");
  const [state, setState] = React.useState<
    "login" | "loading" | "error" | "success"
  >("login");

  const update = React.useCallback(async () => {
    try {
      const teams = await fetchTeams({ token, org });

      setTeams(teams);

      for (const team of teams) {
        const args = { token, org, team };
        const teamReviewRequests = await fetchTeamReviewRequests(args);
        setReviewRequests((value) => [...value, teamReviewRequests]);
      }

      setState("success");
    } catch (err: any) {
      setError(err.message);
      setState("error");
    }
  }, [token, org]);

  React.useEffect(() => {
    if (state === "loading") {
      update();
    }
  }, [state, update]);

  const entries = reviewRequests
    .filter((req) => req.reviewRequests > 0)
    .sort(
      (a, b) =>
        b.reviewRequests - a.reviewRequests || a.team.localeCompare(b.team)
    );

  const maxReviewRequests = Math.max(
    ...entries.map((req) => req.reviewRequests)
  );

  return state === "login" ? (
    <div className="container">
      <div className="login">
        <h1>Ghosting Buster</h1>
        <p>How many PRs require a code review by teams in your GitHub org?</p>
        <form
          className="login-form"
          aria-label="Login form"
          onSubmit={() => setState("loading")}
        >
          <div className="login-row">
            <label htmlFor="tokenInput">GitHub Token:</label>
            <input
              type="password"
              id="tokenInput"
              onChange={(e) => setToken(e.target.value)}
            />
          </div>

          <div className="login-row">
            <label htmlFor="orgInput">Organization:</label>
            <input id="orgInput" onChange={(e) => setOrg(e.target.value)} />
          </div>

          <div className="login-row">
            <button type="submit">Login</button>
          </div>
        </form>
      </div>
    </div>
  ) : (
    <div className="container">
      <header>
        <h1>{org}</h1>
      </header>
      <main className="entries">
        <table>
          <thead>
            <tr>
              <th scope="col">Team name</th>
              <th scope="col">Pending code reviews</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((req) => (
              <tr key={req.team}>
                <td className="team">{req.team}</td>
                <td>
                  <span
                    className="bar"
                    style={{
                      width: `${
                        (90 * req.reviewRequests) / maxReviewRequests
                      }%`,
                    }}
                    aria-hidden="true"
                  >
                    &nbsp;
                  </span>
                  <span className="review-requests">{req.reviewRequests}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
      <footer className="progress-bar" aria-live="polite">
        {state === "loading" && (
          <>
            <div className="progress-bar--loading-back">Loading...</div>
            <div
              className="progress-bar--loading"
              aria-hidden="true"
              style={{
                width: `${(reviewRequests.length / teams.length) * 100 || 0}%`,
              }}
            >
              Loading...
            </div>
          </>
        )}
        {state === "success" && (
          <div className="progress-bar--success">Done.</div>
        )}
        {state === "error" && (
          <div className="progress-bar--error">Error: {error}</div>
        )}
      </footer>
    </div>
  );
}

export default App;
