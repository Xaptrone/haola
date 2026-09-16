import assert from "node:assert/strict";
import { test } from "node:test";
import {
  afterConfirmSteps,
  BRAND_IP_HOLD,
  cloneOffer,
  defaultBrandIpOffer,
  draftIpId,
  mediaKindFromSrc,
  normalizeOffer,
  offerHold,
} from "./brand-ip.ts";

test("default Brand IP offer holds the catalog price", () => {
  const offer = defaultBrandIpOffer();
  assert.equal(offerHold(offer), BRAND_IP_HOLD);
  assert.equal(offer.lines.length, 3);
  assert.ok(offer.media.some((item) => item.kind === "video"));
  assert.ok(offer.media.some((item) => item.kind === "image"));
});

test("offerHold sums line items and falls back when empty", () => {
  const offer = defaultBrandIpOffer();
  offer.lines = [
    { id: "a", label: "Lock", credits: 100 },
    { id: "b", label: "Reels", credits: 50 },
  ];
  assert.equal(offerHold(offer), 150);
  offer.lines = [];
  assert.equal(offerHold(offer), BRAND_IP_HOLD);
});

test("mediaKindFromSrc classifies Instagram, images, and files", () => {
  assert.equal(
    mediaKindFromSrc("https://www.instagram.com/p/DZuQ6xhz2Au/"),
    "video",
  );
  assert.equal(mediaKindFromSrc("https://cdn.example.com/look.jpg"), "image");
  assert.equal(mediaKindFromSrc("fxgen:still"), "image");
  assert.equal(mediaKindFromSrc("https://cdn.example.com/cut.mp4"), "video");
});

test("normalizeOffer fills missing commercial fields", () => {
  const next = normalizeOffer({ headline: "  Custom pack  ", lines: [] });
  assert.equal(next.headline, "Custom pack");
  assert.ok(next.included.length > 0);
  assert.equal(offerHold(next), BRAND_IP_HOLD);
});

test("cloneOffer does not share arrays", () => {
  const offer = defaultBrandIpOffer();
  const copy = cloneOffer(offer);
  copy.included.push("Extra");
  copy.lines[0]!.credits = 1;
  assert.notEqual(offer.included.at(-1), "Extra");
  assert.equal(offer.lines[0]!.credits, 400);
});

test("normalizeOffer drops session-only blob videos", () => {
  const next = normalizeOffer({
    media: [
      { id: "blob", kind: "video", src: "blob:https://fxgen.local/1", caption: "temp" },
      {
        id: "keep",
        kind: "video",
        src: "https://www.instagram.com/p/DZuQ6xhz2Au/",
        caption: "reel",
      },
    ],
  });
  assert.equal(next.media.find((item) => item.id === "blob")?.src, "");
  assert.match(next.media.find((item) => item.id === "keep")?.src ?? "", /instagram/);
});

test("draft id is stable per business", () => {
  assert.equal(draftIpId("bws-asiam"), "ip-draft:bws-asiam");
});

test("afterConfirmSteps splits the then-list", () => {
  assert.deepEqual(afterConfirmSteps("Hold now.\n\nApprove in Content."), [
    "Hold now.",
    "Approve in Content.",
  ]);
});
