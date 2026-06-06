export class GitHubCommitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitHubCommitError";
  }
}

const API = "https://api.github.com";

export type CommitInput = { path: string; content: string; message: string };

export async function commitFile({ path, content, message }: CommitInput): Promise<{ commitSha: string }> {
  if (process.env.E2E_MOCK === "1") return { commitSha: "e2e-mock-sha" };

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH ?? "main";
  if (!token) throw new GitHubCommitError("GITHUB_TOKEN is not set");
  if (!repo) throw new GitHubCommitError("GITHUB_REPO is not set");

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
  const url = `${API}/repos/${repo}/contents/${path}`;

  let sha: string | undefined;
  const existing = await fetch(`${url}?ref=${branch}`, { headers });
  if (existing.ok) {
    sha = ((await existing.json()) as { sha?: string }).sha;
  } else if (existing.status !== 404) {
    throw new GitHubCommitError(`GitHub GET ${existing.status}`);
  }

  const res = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) throw new GitHubCommitError(`GitHub PUT ${res.status}`);
  const json = (await res.json()) as { commit?: { sha?: string } };
  return { commitSha: json.commit?.sha ?? "unknown" };
}
