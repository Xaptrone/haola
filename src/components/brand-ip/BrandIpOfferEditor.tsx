"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { BrandIpMediaTile } from "@/components/brand-ip/BrandIpMedia";
import {
  cloneOffer,
  mediaKindFromSrc,
  offerHold,
} from "@/lib/brand-ip";
import { rm } from "@/lib/credits";
import { uid } from "@/lib/ids";
import type { BrandIpMedia, BrandIpOffer } from "@/lib/types";

const inputClass =
  "min-h-14 w-full rounded-[14px] border border-line bg-canvas px-4 text-ink outline-none placeholder:text-muted";
const areaClass =
  "min-h-28 w-full rounded-[14px] border border-line bg-canvas px-4 py-3 text-ink outline-none placeholder:text-muted";

export function BrandIpOfferEditor({
  offer,
  onSave,
  saveLabel = "Save package",
}: {
  offer: BrandIpOffer;
  onSave: (next: BrandIpOffer) => void;
  saveLabel?: string;
}) {
  const [draft, setDraft] = useState(() => cloneOffer(offer));
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function patch(next: Partial<BrandIpOffer>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function addMedia(item: BrandIpMedia) {
    setDraft((current) => ({ ...current, media: [...current.media, item] }));
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        const cleaned: BrandIpOffer = {
          ...draft,
          included: draft.included.map((item) => item.trim()).filter(Boolean),
          lines: draft.lines.filter((line) => line.label.trim()),
          media: draft.media.filter((item) => item.src.trim()),
        };
        if (!cleaned.lines.length) {
          setMessage("Add at least one priced line.");
          return;
        }
        onSave(cleaned);
        setMessage("Saved. Businesses see this on confirm.");
      }}
    >
      <label className="block text-sm text-muted">
        Headline
        <input
          className={`${inputClass} mt-2`}
          value={draft.headline}
          onChange={(e) => patch({ headline: e.target.value })}
        />
      </label>
      <label className="block text-sm text-muted">
        Promise
        <textarea
          className={`${areaClass} mt-2`}
          value={draft.promise}
          onChange={(e) => patch({ promise: e.target.value })}
        />
      </label>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          You get
        </p>
        <div className="mt-3 space-y-2">
          {draft.included.map((item, i) => (
            <div key={`inc-${i}`} className="flex gap-2">
              <input
                className={inputClass}
                value={item}
                onChange={(e) => {
                  const included = [...draft.included];
                  included[i] = e.target.value;
                  patch({ included });
                }}
              />
              <Button
                type="button"
                variant="quiet"
                className="min-h-14 shrink-0"
                onClick={() =>
                  patch({ included: draft.included.filter((_, idx) => idx !== i) })
                }
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          className="mt-3 min-h-11"
          onClick={() => patch({ included: [...draft.included, ""] })}
        >
          Add deliverable
        </Button>
      </div>
      <label className="block text-sm text-muted">
        Extra note
        <textarea
          className={`${areaClass} mt-2`}
          value={draft.extraInfo}
          onChange={(e) => patch({ extraInfo: e.target.value })}
          placeholder="Usage window, languages, what is not included"
        />
      </label>
      <label className="block text-sm text-muted">
        Ownership
        <textarea
          className={`${areaClass} mt-2`}
          value={draft.ownership}
          onChange={(e) => patch({ ownership: e.target.value })}
        />
      </label>
      <label className="block text-sm text-muted">
        After they confirm
        <textarea
          className={`${areaClass} mt-2`}
          value={draft.afterConfirm}
          onChange={(e) => patch({ afterConfirm: e.target.value })}
        />
        <span className="mt-2 block text-xs text-muted">One step per line.</span>
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm text-muted">
          Turnaround
          <input
            className={`${inputClass} mt-2`}
            value={draft.turnaround}
            onChange={(e) => patch({ turnaround: e.target.value })}
          />
        </label>
        <label className="block text-sm text-muted">
          Creator
          <input
            className={`${inputClass} mt-2`}
            value={draft.creatorName}
            onChange={(e) => patch({ creatorName: e.target.value })}
          />
        </label>
        <label className="block text-sm text-muted">
          KOL
          <input
            className={`${inputClass} mt-2`}
            value={draft.kolName}
            onChange={(e) => patch({ kolName: e.target.value })}
          />
        </label>
      </div>

      <div>
        <div className="flex items-end justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            Price
          </p>
          <p className="font-mono text-sm text-ink">{rm(offerHold(draft))}</p>
        </div>
        <div className="mt-3 space-y-2">
          {draft.lines.map((line) => (
            <div key={line.id} className="flex flex-col gap-2 sm:grid sm:grid-cols-[1fr_120px_auto] sm:gap-2">
              <input
                className={inputClass}
                value={line.label}
                onChange={(e) =>
                  patch({
                    lines: draft.lines.map((row) =>
                      row.id === line.id ? { ...row, label: e.target.value } : row,
                    ),
                  })
                }
              />
              <input
                className={inputClass}
                inputMode="numeric"
                value={String(line.credits)}
                onChange={(e) =>
                  patch({
                    lines: draft.lines.map((row) =>
                      row.id === line.id
                        ? { ...row, credits: Math.max(0, Number(e.target.value) || 0) }
                        : row,
                    ),
                  })
                }
              />
              <Button
                type="button"
                variant="quiet"
                className="min-h-14"
                onClick={() =>
                  patch({ lines: draft.lines.filter((row) => row.id !== line.id) })
                }
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          className="mt-3 min-h-11"
          onClick={() =>
            patch({
              lines: [
                ...draft.lines,
                { id: uid("line"), label: "", credits: 0 },
              ],
            })
          }
        >
          Add line
        </Button>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          Samples
        </p>
        <p className="mt-2 text-sm text-muted">
          Paste Instagram, image, or video URLs. Upload stills to keep them. Video
          files last for this session unless you paste a link.
        </p>
        <div className="mt-3 space-y-3">
          {draft.media.map((item) => (
            <div
              key={item.id}
              className="grid gap-3 rounded-[14px] border border-line bg-canvas p-3 sm:grid-cols-[92px_1fr]"
            >
              <BrandIpMediaTile item={item} size="still" />
              <div className="space-y-2">
                <select
                  className={inputClass}
                  value={item.kind}
                  onChange={(e) => {
                    const kind = e.target.value === "image" ? "image" : "video";
                    patch({
                      media: draft.media.map((row) =>
                        row.id === item.id ? { ...row, kind } : row,
                      ),
                    });
                  }}
                >
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                </select>
                <input
                  className={inputClass}
                  value={item.src}
                  onChange={(e) =>
                    patch({
                      media: draft.media.map((row) =>
                        row.id === item.id ? { ...row, src: e.target.value } : row,
                      ),
                    })
                  }
                  placeholder="https://"
                />
                <input
                  className={inputClass}
                  value={item.caption}
                  onChange={(e) =>
                    patch({
                      media: draft.media.map((row) =>
                        row.id === item.id
                          ? { ...row, caption: e.target.value }
                          : row,
                      ),
                    })
                  }
                  placeholder="Caption"
                />
                <Button
                  type="button"
                  variant="quiet"
                  onClick={() =>
                    patch({
                      media: draft.media.filter((row) => row.id !== item.id),
                    })
                  }
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            className={inputClass}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Instagram, image, or video URL"
          />
          <Button
            type="button"
            variant="ghost"
            className="min-h-14 shrink-0"
            onClick={() => {
              const src = url.trim();
              if (!src) return;
              addMedia({
                id: uid("media"),
                kind: mediaKindFromSrc(src),
                src,
                caption: "",
              });
              setUrl("");
            }}
          >
            Add URL
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line bg-elevated px-5 text-sm text-ink">
            Upload image
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                void readImageAsDataUrl(file)
                  .then((src) =>
                    addMedia({
                      id: uid("media"),
                      kind: "image",
                      src,
                      caption: file.name,
                    }),
                  )
                  .catch(() => setMessage("Could not read that image."));
              }}
            />
          </label>
          <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line bg-elevated px-5 text-sm text-ink">
            Upload video
            <input
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                addMedia({
                  id: uid("media"),
                  kind: "video",
                  src: URL.createObjectURL(file),
                  caption: `${file.name} · this session`,
                });
              }}
            />
          </label>
        </div>
      </div>

      <Button type="submit" className="min-h-14 w-full sm:w-auto">
        {saveLabel}
      </Button>
      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </form>
  );
}

function readImageAsDataUrl(file: File): Promise<string> {
  if (file.size <= 1_200_000 && /svg|png|jpe?g|webp|gif/i.test(file.type)) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("read failed"));
      reader.readAsDataURL(file);
    });
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blobUrl = URL.createObjectURL(file);
    img.onload = () => {
      const max = 1200;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(blobUrl);
        reject(new Error("canvas"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(blobUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error("image"));
    };
    img.src = blobUrl;
  });
}
