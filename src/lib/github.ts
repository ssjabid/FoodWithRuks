/**
 * Server-only GitHub client used to commit uploaded photos into the site repo.
 * Photos live in public/images/uploads and are served as static files by the
 * next Vercel deploy (every push to the production branch redeploys).
 *
 * Env: GITHUB_UPLOAD_TOKEN (fine-grained PAT, Contents: read+write on this repo)
 *      GITHUB_REPO   (owner/name, default ssjabid/FoodWithRuks)
 *      GITHUB_BRANCH (default main)
 */

const API = "https://api.github.com";

export interface FileToCommit {
  /** Repo-relative path, e.g. public/images/uploads/recipes/2026/09/naan-abc12-w1600.webp */
  path: string;
  contentBase64: string;
}

export function getContentRepo() {
  return {
    repo: process.env.GITHUB_REPO || "ssjabid/FoodWithRuks",
    branch: process.env.GITHUB_BRANCH || "main",
  };
}

export function isUploadConfigured(): boolean {
  return Boolean(process.env.GITHUB_UPLOAD_TOKEN);
}

class GitHubError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function gh<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = process.env.GITHUB_UPLOAD_TOKEN;
  if (!token) throw new GitHubError("GITHUB_UPLOAD_TOKEN is not set", 503);
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "agooh-and-ruks-admin",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    let message = `GitHub ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) message = `${message}: ${body.message}`;
    } catch {
      /* no body */
    }
    throw new GitHubError(message, res.status);
  }
  return (await res.json()) as T;
}

/**
 * Commits one or more files to the content branch in a single commit using the
 * Git Data API (blobs -> tree -> commit -> ref). Retries when the branch moved
 * between reading the ref and updating it (e.g. a developer push).
 */
export async function commitFiles(files: FileToCommit[], message: string): Promise<{ sha: string }> {
  const { repo, branch } = getContentRepo();
  const base = `/repos/${repo}`;
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const ref = await gh<{ object: { sha: string } }>(`${base}/git/ref/heads/${encodeURIComponent(branch)}`);
      const parentSha = ref.object.sha;
      const parent = await gh<{ tree: { sha: string } }>(`${base}/git/commits/${parentSha}`);

      const treeEntries = [];
      for (const file of files) {
        const blob = await gh<{ sha: string }>(`${base}/git/blobs`, {
          method: "POST",
          body: JSON.stringify({ content: file.contentBase64, encoding: "base64" }),
        });
        treeEntries.push({ path: file.path, mode: "100644", type: "blob", sha: blob.sha });
      }

      const tree = await gh<{ sha: string }>(`${base}/git/trees`, {
        method: "POST",
        body: JSON.stringify({ base_tree: parent.tree.sha, tree: treeEntries }),
      });

      const commit = await gh<{ sha: string }>(`${base}/git/commits`, {
        method: "POST",
        body: JSON.stringify({ message, tree: tree.sha, parents: [parentSha] }),
      });

      await gh(`${base}/git/refs/heads/${encodeURIComponent(branch)}`, {
        method: "PATCH",
        body: JSON.stringify({ sha: commit.sha, force: false }),
      });

      return { sha: commit.sha };
    } catch (error) {
      lastError = error;
      // 422 = ref moved (not a fast-forward); anything else is not worth retrying
      if (!(error instanceof GitHubError) || error.status !== 422) break;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("GitHub commit failed");
}

/** Public raw URL for a committed file, usable immediately (before the deploy finishes). */
export function rawUrlFor(path: string): string {
  const { repo, branch } = getContentRepo();
  return `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;
}
