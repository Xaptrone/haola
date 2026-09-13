import assert from "node:assert/strict";
import { test } from "node:test";
import {
  parseInstagramUrl,
  resolveLandingInstagramMedia,
  splitInstagramUrlList,
} from "./instagram.ts";

test("parses a post URL", () => {
  const parsed = parseInstagramUrl("https://www.instagram.com/p/Dc0aQl0zT41/");
  assert.equal(parsed.kind, "media");
  if (parsed.kind !== "media") return;
  assert.equal(parsed.shortcode, "Dc0aQl0zT41");
  assert.equal(parsed.href, "https://www.instagram.com/p/Dc0aQl0zT41/");
  assert.equal(
    parsed.embedSrc,
    "https://www.instagram.com/p/Dc0aQl0zT41/embed/",
  );
});

test("parses reel, reels, and tv paths to the same shortcode", () => {
  for (const url of [
    "https://www.instagram.com/reel/Dc0aQl0zT41/",
    "https://instagram.com/reels/Dc0aQl0zT41",
    "https://www.instagram.com/tv/Dc0aQl0zT41/?utm_source=ig_web",
  ]) {
    const parsed = parseInstagramUrl(url);
    assert.equal(parsed.kind, "media");
    if (parsed.kind === "media") {
      assert.equal(parsed.shortcode, "Dc0aQl0zT41");
    }
  }
});

test("strips query strings and accepts a host without scheme", () => {
  const parsed = parseInstagramUrl(
    "www.instagram.com/p/Dc0aQl0zT41/?img_index=1",
  );
  assert.equal(parsed.kind, "media");
  if (parsed.kind === "media") {
    assert.equal(parsed.shortcode, "Dc0aQl0zT41");
  }
});

test("parses a profile URL", () => {
  const parsed = parseInstagramUrl("https://www.instagram.com/chelseaxu1225/");
  assert.equal(parsed.kind, "profile");
  if (parsed.kind === "profile") {
    assert.equal(parsed.handle, "chelseaxu1225");
    assert.equal(parsed.href, "https://www.instagram.com/chelseaxu1225/");
  }
});

test("rejects reserved paths, other hosts, and empty input", () => {
  assert.equal(parseInstagramUrl("").kind, "invalid");
  assert.equal(parseInstagramUrl("https://www.instagram.com/explore/").kind, "invalid");
  assert.equal(parseInstagramUrl("https://www.youtube.com/watch?v=abc").kind, "invalid");
  assert.equal(parseInstagramUrl("not a url").kind, "invalid");
});

test("splitInstagramUrlList accepts commas and newlines", () => {
  assert.deepEqual(
    splitInstagramUrlList(
      "https://www.instagram.com/p/DZuQ6xhz2Au/, https://www.instagram.com/p/DZ6z5UXT_eA/",
    ),
    [
      "https://www.instagram.com/p/DZuQ6xhz2Au/",
      "https://www.instagram.com/p/DZ6z5UXT_eA/",
    ],
  );
  assert.deepEqual(
    splitInstagramUrlList("https://www.instagram.com/p/DaBo88XTLbb/\nhttps://www.instagram.com/p/DaKjxw8TEEZ/"),
    [
      "https://www.instagram.com/p/DaBo88XTLbb/",
      "https://www.instagram.com/p/DaKjxw8TEEZ/",
    ],
  );
});

test("resolveLandingInstagramMedia keeps order, drops junk and duplicates", () => {
  const media = resolveLandingInstagramMedia(
    "https://www.instagram.com/p/DZuQ6xhz2Au/, not-a-url, https://www.instagram.com/p/DZuQ6xhz2Au/, https://www.instagram.com/p/DZ6z5UXT_eA/",
  );
  assert.deepEqual(
    media.map((item) => item.shortcode),
    ["DZuQ6xhz2Au", "DZ6z5UXT_eA"],
  );
});

test("resolveLandingInstagramMedia falls back to the featured set", () => {
  const media = resolveLandingInstagramMedia("", "");
  assert.equal(media.length, 6);
  assert.equal(media[0].shortcode, "DZuQ6xhz2Au");
  assert.equal(media[5].shortcode, "DUPew4eEz_k");
});

test("a single URL env still makes a one-reel gallery", () => {
  const media = resolveLandingInstagramMedia("", "https://www.instagram.com/p/Dc0aQl0zT41/");
  assert.equal(media.length, 1);
  assert.equal(media[0].shortcode, "Dc0aQl0zT41");
});
