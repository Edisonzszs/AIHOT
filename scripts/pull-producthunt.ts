// Pulls Product Hunt's top voted products of the last ~30 hours and pushes them into the site through
// the external ingest API, so they flow through the same prefilter → score → publish pipeline as any
// collected source (the PH leaderboard itself has no RSS; the official API needs client credentials).
//   node scripts/pull-producthunt.ts [--min-votes 30] [--limit 20]
// Needs PH_API_KEY, PH_API_SECRET, INGEST_TOKEN in the environment; API_BASE_URL points at the API.
const argv = process.argv.slice(2);
const at = (name: string) => {
  const i = argv.indexOf(name);
  return i >= 0 ? Number(argv[i + 1]) : undefined;
};
const minVotes = at("--min-votes") ?? 30;
const limit = Math.min(at("--limit") ?? 20, 50);

const key = process.env.PH_API_KEY ?? "";
const secret = process.env.PH_API_SECRET ?? "";
const ingestToken = process.env.INGEST_TOKEN ?? "";
const apiBase = process.env.API_BASE_URL ?? "http://127.0.0.1:3001";
if (!key || !secret || !ingestToken) {
  console.error("missing PH_API_KEY / PH_API_SECRET / INGEST_TOKEN");
  process.exit(1);
}

const tokenRes = await fetch("https://api.producthunt.com/v2/oauth/token", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ client_id: key, client_secret: secret, grant_type: "client_credentials" }),
  signal: AbortSignal.timeout(20_000),
});
const tokenJson = await tokenRes.json() as { access_token?: string; error?: string; error_description?: string };
if (!tokenRes.ok || !tokenJson.access_token) {
  console.error(JSON.stringify({ error: "token request failed", status: tokenRes.status, body: tokenJson }));
  process.exit(1);
}

const postedAfter = new Date(Date.now() - 30 * 3600_000).toISOString();
const query = `query {
  posts(first: ${limit}, order: VOTES, postedAfter: "${postedAfter}") {
    edges { node { name tagline url votesCount createdAt } }
  }
}`;
const postsRes = await fetch("https://api.producthunt.com/v2/api/graphql", {
  method: "POST",
  headers: { "content-type": "application/json", authorization: `Bearer ${tokenJson.access_token}` },
  body: JSON.stringify({ query }),
  signal: AbortSignal.timeout(20_000),
});
const postsJson = await postsRes.json() as { data?: { posts?: { edges?: Array<{ node: { name: string; tagline: string; url: string; votesCount: number; createdAt: string } }> } }; errors?: unknown };
const edges = postsJson.data?.posts?.edges ?? [];
if (!edges.length) {
  console.log(JSON.stringify({ pulled: 0, note: "no posts in window", graphqlErrors: postsJson.errors ?? null }));
  process.exit(0);
}

const items = edges
  .map(({ node }) => node)
  .filter((p) => p.votesCount >= minVotes)
  .map((p) => ({
    title: `${p.name}：${p.tagline}（Product Hunt ${p.votesCount} 票）`,
    url: p.url,
    publishedAt: p.createdAt,
  }));

const pushRes = await fetch(`${apiBase}/api/ingest/items`, {
  method: "POST",
  headers: { "content-type": "application/json", authorization: `Bearer ${ingestToken}` },
  body: JSON.stringify({ sourceId: "external-producthunt", items }),
  signal: AbortSignal.timeout(30_000),
});
const pushJson = await pushRes.json() as { ok?: boolean; created?: number; error?: string };
console.log(JSON.stringify({ pulled: edges.length, pushed: items.length, minVotes, created: pushJson.created ?? 0, status: pushRes.status }));
if (!pushRes.ok || !pushJson.ok) {
  console.error(JSON.stringify({ error: "ingest failed", body: pushJson }));
  process.exit(1);
}
