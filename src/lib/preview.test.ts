import assert from "node:assert/strict";
import { test } from "node:test";
import { previewPresetFromLocation } from "./preview.ts";

test("preview routes boot a demo workspace without login", () => {
  assert.equal(previewPresetFromLocation("/preview"), "business-ready");
  assert.equal(
    previewPresetFromLocation("/work/business", "preview=1"),
    "business-ready",
  );
  assert.equal(
    previewPresetFromLocation("/work/business", "preview=1&as=new"),
    "business-new",
  );
  assert.equal(
    previewPresetFromLocation("/work/studio", "as=aisha&preview=1"),
    "creator-active",
  );
  assert.equal(
    previewPresetFromLocation("/work/studio", "?as=new&preview=1"),
    "creator-new",
  );
  assert.equal(
    previewPresetFromLocation("/oversight/manager", "preview=1"),
    "manager",
  );
});

test("non-preview URLs do not boot a demo", () => {
  assert.equal(previewPresetFromLocation("/work/business"), null);
  assert.equal(previewPresetFromLocation("/"), null);
  assert.equal(previewPresetFromLocation("/login"), null);
});
