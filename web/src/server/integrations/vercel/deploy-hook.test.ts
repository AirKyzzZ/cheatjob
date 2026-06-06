import { describe, it, expect, vi, afterEach } from "vitest";
import { triggerDeploy } from "./deploy-hook";

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.E2E_MOCK;
  delete process.env.VERCEL_DEPLOY_HOOK_URL;
});

describe("triggerDeploy", () => {
  it("POSTs the hook and reports success", async () => {
    process.env.VERCEL_DEPLOY_HOOK_URL = "https://hook.test/abc";
    const fetchMock = vi.fn(async () => new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await triggerDeploy()).toEqual({ triggered: true });
    expect(fetchMock).toHaveBeenCalledWith("https://hook.test/abc", { method: "POST" });
  });

  it("returns triggered:false when the url is unset", async () => {
    const spy = vi.spyOn(global, "fetch");
    expect(await triggerDeploy()).toEqual({ triggered: false });
    expect(spy).not.toHaveBeenCalled();
  });

  it("short-circuits under E2E_MOCK", async () => {
    process.env.E2E_MOCK = "1";
    process.env.VERCEL_DEPLOY_HOOK_URL = "https://hook.test/abc";
    const spy = vi.spyOn(global, "fetch");
    expect(await triggerDeploy()).toEqual({ triggered: false });
    expect(spy).not.toHaveBeenCalled();
  });
});
