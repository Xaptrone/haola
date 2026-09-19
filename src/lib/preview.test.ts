import assert from "node:assert/strict";
import { test } from "node:test";
import {
  activePreviewPreset,
  previewPresetFromLocation,
  previewSurfacesEnabled,
} from "./preview.ts";

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

test("preview surfaces stay off unless explicitly enabled", () => {
  assert.equal(previewSurfacesEnabled({}), false);
  assert.equal(
    previewSurfacesEnabled({ NODE_ENV: "development" }),
    false,
  );
  assert.equal(
    previewSurfacesEnabled({ NODE_ENV: "production" }),
    false,
  );
  assert.equal(
    previewSurfacesEnabled({ NEXT_PUBLIC_FXGEN_PREVIEW: "1" }),
    true,
  );
  assert.equal(
    previewSurfacesEnabled({
      NODE_ENV: "development",
      NEXT_PUBLIC_FXGEN_PREVIEW: "0",
    }),
    false,
  );
});

test("production does not boot a demo from preview URLs", () => {
  const env = { NODE_ENV: "production" };
  assert.equal(activePreviewPreset("/preview", "", env), null);
  assert.equal(
    activePreviewPreset("/work/business", "preview=1", env),
    null,
  );
  assert.equal(
    activePreviewPreset("/preview", "", {
      NODE_ENV: "production",
      NEXT_PUBLIC_FXGEN_PREVIEW: "1",
    }),
    "business-ready",
  );
});
