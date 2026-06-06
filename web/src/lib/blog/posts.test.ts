import { describe, it, expect } from "vitest";
import path from "node:path";
import { getAllPosts, getPostBySlug, getAllSlugs } from "./posts";

const FIX = path.join(__dirname, "__fixtures__", "blog");

describe("posts reader", () => {
  it("returns only valid posts", async () => {
    const posts = await getAllPosts(FIX);
    expect(posts.map((p) => p.slug)).toEqual(["good"]); // malformed skipped
  });
  it("computes a reading time >= 1", async () => {
    const [post] = await getAllPosts(FIX);
    expect(post.readingMinutes).toBeGreaterThanOrEqual(1);
  });
  it("getPostBySlug finds a valid post and returns null otherwise", async () => {
    expect(await getPostBySlug("good", FIX)).not.toBeNull();
    expect(await getPostBySlug("malformed", FIX)).toBeNull();
    expect(await getPostBySlug("missing", FIX)).toBeNull();
  });
  it("getAllSlugs lists every .mdx filename (even malformed)", async () => {
    expect((await getAllSlugs(FIX)).sort()).toEqual(["good", "malformed"]);
  });
  it("returns [] when the dir is absent", async () => {
    expect(await getAllPosts(path.join(FIX, "nope"))).toEqual([]);
  });
});
