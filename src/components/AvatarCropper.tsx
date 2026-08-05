import { Minus, Plus, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { haptic } from "@/lib/native/haptics";

/** Rendered size of the square crop stage, in CSS pixels. */
const STAGE = 288;
/** Output avatar edge length — small enough to store inline, sharp on retina. */
const OUTPUT = 512;
const QUALITY = 0.85;
const MAX_ZOOM = 4;

type Point = { x: number; y: number };

/**
 * Circular 1:1 avatar cropper: drag to reposition, pinch or slide to zoom,
 * live preview, then export a compressed square JPEG data URL.
 */
export function AvatarCropper({
  open,
  source,
  busy,
  onCancel,
  onCropped,
}: {
  open: boolean;
  source: string | null;
  busy?: boolean;
  onCancel: () => void;
  onCropped: (dataUrl: string) => void | Promise<void>;
}) {
  const { t } = useTranslation();
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [preview, setPreview] = useState<string>("");
  const dragRef = useRef<{ id: number; start: Point; origin: Point } | null>(null);
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const pointers = useRef(new Map<number, Point>());

  useEffect(() => {
    if (!open || !source) return;
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setPreview("");
    const element = new Image();
    element.onload = () => setImage(element);
    element.src = source;
    return () => {
      element.onload = null;
    };
  }, [open, source]);

  const baseScale = image ? STAGE / Math.min(image.width, image.height) : 1;
  const displayW = image ? image.width * baseScale * zoom : 0;
  const displayH = image ? image.height * baseScale * zoom : 0;

  const clamp = useCallback(
    (next: Point): Point => {
      const maxX = Math.max(0, (displayW - STAGE) / 2);
      const maxY = Math.max(0, (displayH - STAGE) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, next.x)),
        y: Math.min(maxY, Math.max(-maxY, next.y)),
      };
    },
    [displayW, displayH],
  );

  useEffect(() => {
    setOffset((current) => clamp(current));
  }, [clamp]);

  /** Renders the current crop to a canvas and returns a compressed data URL. */
  const render = useCallback((): string => {
    if (!image) return "";
    const total = baseScale * zoom;
    const left = STAGE / 2 + offset.x - displayW / 2;
    const top = STAGE / 2 + offset.y - displayH / 2;
    const sx = -left / total;
    const sy = -top / total;
    const size = STAGE / total;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const context = canvas.getContext("2d");
    if (!context) return "";
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, OUTPUT, OUTPUT);
    context.imageSmoothingQuality = "high";
    context.drawImage(image, sx, sy, size, size, 0, 0, OUTPUT, OUTPUT);
    return canvas.toDataURL("image/jpeg", QUALITY);
  }, [image, baseScale, zoom, offset, displayW, displayH]);

  // Keep the small round preview in step with the crop.
  useEffect(() => {
    if (!image) return;
    const id = window.setTimeout(() => setPreview(render()), 120);
    return () => window.clearTimeout(id);
  }, [image, render]);

  const distanceBetween = () => {
    const [a, b] = [...pointers.current.values()];
    if (!a || !b) return 0;
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onPointerDown = (event: React.PointerEvent) => {
    (event.target as Element).setPointerCapture?.(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      pinchRef.current = { distance: distanceBetween(), zoom };
      dragRef.current = null;
      return;
    }
    dragRef.current = {
      id: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      origin: offset,
    };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinchRef.current && pointers.current.size === 2) {
      const next = distanceBetween();
      if (pinchRef.current.distance > 0) {
        const factor = next / pinchRef.current.distance;
        setZoom(Math.min(MAX_ZOOM, Math.max(1, pinchRef.current.zoom * factor)));
      }
      return;
    }
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    setOffset(
      clamp({
        x: drag.origin.x + (event.clientX - drag.start.x),
        y: drag.origin.y + (event.clientY - drag.start.y),
      }),
    );
  };

  const endPointer = (event: React.PointerEvent) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinchRef.current = null;
    if (dragRef.current?.id === event.pointerId) dragRef.current = null;
  };

  const nudgeZoom = (delta: number) => {
    haptic.select();
    setZoom((current) => Math.min(MAX_ZOOM, Math.max(1, Number((current + delta).toFixed(2)))));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle>{t("settings.cropTitle")}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">{t("settings.cropHint")}</p>

        <div
          className="relative mx-auto touch-none overflow-hidden rounded-3xl bg-muted select-none"
          style={{ width: STAGE, height: STAGE, maxWidth: "100%" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
        >
          {image ? (
            <img
              src={image.src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute top-1/2 left-1/2 max-w-none"
              style={{
                width: displayW,
                height: displayH,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
              }}
            />
          ) : null}
          {/* Circular mask overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "rgba(0,0,0,0.45)",
              WebkitMaskImage:
                "radial-gradient(circle at center, transparent 0 49.5%, #000 50%)",
              maskImage: "radial-gradient(circle at center, transparent 0 49.5%, #000 50%)",
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 m-auto rounded-full border-2 border-white/80"
            aria-hidden
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => nudgeZoom(-0.2)}
            className="press flex size-9 shrink-0 items-center justify-center rounded-full bg-muted"
          >
            <Minus className="size-4" aria-hidden />
          </button>
          <Slider
            value={[zoom]}
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            aria-label={t("settings.zoom")}
            onValueChange={([value]) => setZoom(value ?? 1)}
            className="flex-1"
          />
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => nudgeZoom(0.2)}
            className="press flex size-9 shrink-0 items-center justify-center rounded-full bg-muted"
          >
            <Plus className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Reset crop"
            onClick={() => {
              haptic.select();
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
            className="press flex size-9 shrink-0 items-center justify-center rounded-full bg-muted"
          >
            <RotateCcw className="size-4" aria-hidden />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="size-14 overflow-hidden rounded-full bg-muted">
            {preview ? (
              <img src={preview} alt={t("settings.cropPreview")} className="size-full object-cover" />
            ) : null}
          </span>
          <p className="text-xs text-muted-foreground">{t("settings.cropPreview")}</p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="press h-12 flex-1 rounded-2xl"
            onClick={onCancel}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            className="press h-12 flex-1 rounded-2xl"
            disabled={!image || busy}
            onClick={() => {
              haptic.light();
              const result = render();
              if (result) void onCropped(result);
            }}
          >
            {t("common.save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
