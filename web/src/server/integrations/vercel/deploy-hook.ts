export async function triggerDeploy(): Promise<{ triggered: boolean }> {
  if (process.env.E2E_MOCK === "1") return { triggered: false };
  const url = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!url) return { triggered: false };
  const res = await fetch(url, { method: "POST" });
  return { triggered: res.ok };
}
