"use client";

import Cropper, { type Area, type Point } from "react-easy-crop";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Playfair_Display } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { canvasToBlob, drawFrame, getCanvasSize } from "@/lib/canvas";
import {
  BUILDER_TITLES,
  DEFAULT_SHARE_CAPTION,
  type FrameFormat,
  buildTweetIntent,
  getDownloadFilename,
  getNextBuilderTitle,
  isSupportedImageType,
} from "@/lib/frame";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
});

export function FrameGenerator({
  showHero = true,
  embedded = false,
}: {
  showHero?: boolean;
  embedded?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [format, setFormat] = useState<FrameFormat>("pfp");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropPixels, setCropPixels] = useState<Area | null>(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [title, setTitle] = useState<(typeof BUILDER_TITLES)[number]>(BUILDER_TITLES[0]);
  const [caption, setCaption] = useState(DEFAULT_SHARE_CAPTION);
  const [isExporting, setIsExporting] = useState(false);

  const canRender = Boolean(imageUrl);
  const canvasSize = useMemo(() => getCanvasSize(format), [format]);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;

    let cancelled = false;
    drawFrame({
      canvas: canvasRef.current,
      imageUrl,
      cropPixels,
      format,
      name,
      role,
      title,
    }).catch((drawError: unknown) => {
      if (!cancelled) {
        setError(drawError instanceof Error ? drawError.message : "Could not render the frame.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [cropPixels, format, imageUrl, name, role, title]);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCropPixels(croppedAreaPixels);
  }, []);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;

      setError("");
      if (!isSupportedImageType(file)) {
        setError("Upload a JPG, PNG, or HEIC image.");
        return;
      }

      try {
        const sourceBlob = await convertIfHeic(file);
        const nextUrl = URL.createObjectURL(sourceBlob);

        setImageUrl((previousUrl) => {
          if (previousUrl) URL.revokeObjectURL(previousUrl);
          return nextUrl;
        });
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCropPixels(null);
        document.getElementById("builder")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Could not process this image. Try a JPG or PNG export.",
        );
      }
    },
    [],
  );

  const handleDownload = useCallback(async () => {
    if (!canvasRef.current) return;

    setIsExporting(true);
    setError("");

    try {
      const blob = await canvasToBlob(canvasRef.current);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = getDownloadFilename(format);
      link.click();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Download failed. Try re-uploading the image.",
      );
    } finally {
      setIsExporting(false);
    }
  }, [format]);

  const handleShare = useCallback(async () => {
    await handleDownload();
    window.open(buildTweetIntent(caption), "_blank", "noopener,noreferrer");
  }, [caption, handleDownload]);

  const Wrapper = embedded ? "div" : "main";

  return (
    <Wrapper className={embedded ? "bg-[#0B6839] text-white" : "min-h-screen bg-[#0B6839] text-white"}>
      {showHero ? (
        <section className="poster-grid relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#0B6839] px-5 py-12 text-center text-white md:items-start md:px-10 md:py-14 md:text-left">
        <div className="absolute left-5 right-5 top-5 grid grid-cols-2 border-b-4 border-[#FF5A1F] pb-4 text-[11px] font-bold uppercase tracking-[0.28em] md:left-10 md:right-10 md:grid-cols-4">
          <span>HH GOA 2026 / BUILDER TOOL</span>
          <span className="hidden md:block">NO.01 / FRAMEINGOA</span>
          <span className="text-right md:text-left">15.4909 N</span>
          <span className="hidden text-right md:block">73.8278 E</span>
        </div>

        <div className="mx-auto w-full max-w-[1180px] pt-20 md:mx-0">
          <p className="mb-6 text-[12px] font-bold uppercase tracking-[0.36em] text-orange-200/40">
            HH GOA 2026 / BUILDER TOOL
          </p>
          <h1 className={`${playfair.className} mx-auto max-w-[14ch] text-[clamp(2.6rem,8vw,7.2rem)] uppercase leading-[0.86] md:mx-0`}>
            MAKE YOUR <span className="inline-block rotate-[-3deg] text-[#FF5A1F]">GOA</span> 2026 FRAME
          </h1>
          <button
            className="hard-shadow-black mt-9 border-4 border-[#FF5A1F] bg-[#FF5A1F] px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-orange-500/40"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            UPLOAD YOUR PHOTO →
          </button>
        </div>
        </section>
      ) : null}

      <section id="builder" className="w-full px-5 py-16 md:px-10 md:py-20">
        {embedded ? (
          <div className="mb-6 border-b-4 border-[#FF5A1F] pb-3 text-[11px] font-black uppercase tracking-[0.28em]">
            03 / UPLOAD YOUR PHOTO
          </div>
        ) : null}
        <div className="grid gap-8 border-b-4 border-[#FF5A1F] pb-10 lg:grid-cols-[0.84fr_1.16fr]">
          <div className="min-w-0">
            <div className="mb-5 flex flex-col items-start gap-2 border-b-4 border-[#FF5A1F] pb-3 text-[11px] font-bold uppercase tracking-[0.28em] sm:flex-row sm:items-center sm:justify-between">
              <span>No.02 / Format</span>
              <span className="sm:text-right">Tap to switch</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <FormatButton
                active={format === "pfp"}
                label="PFP Frame"
                meta="1:1 square / circle-safe"
                onClick={() => setFormat("pfp")}
              />
              <FormatButton
                active={format === "id-card"}
                label="Builder ID Card"
                meta="portrait badge / social share"
                onClick={() => setFormat("id-card")}
              />
            </div>

            <div className="mt-8">
              <input
                ref={fileInputRef}
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/heic,image/heif,.jpg,.jpeg,.png,.heic,.heif"
                onChange={(event) => void handleFile(event.target.files?.[0])}
              />

              <button
                className={`poster-panel w-full min-w-0 break-words border-dashed p-6 text-left transition sm:min-h-48 ${
                  isDragging
                    ? "border-solid bg-[#FF5A1F] text-white"
                    : "bg-[#0B6839] text-white"
                }`}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  void handleFile(event.dataTransfer.files[0]);
                }}
              >
                <span className="font-display block text-[clamp(1.75rem,8vw,3rem)] uppercase leading-none md:text-5xl">
                  Drop photo here
                </span>
                <span className="mt-4 block text-xs font-bold uppercase tracking-[0.18em] sm:text-sm">
                  JPG / PNG / HEIC accepted
                </span>
              </button>
            </div>

            {imageUrl ? (
              <div className="mt-8">
                <div className="mb-3 flex flex-col items-start gap-2 text-[11px] font-bold uppercase tracking-[0.24em] sm:flex-row sm:items-center sm:justify-between">
                  <span>Crop / Reposition</span>
                  <span className="sm:text-right">{Math.round(zoom * 100)}%</span>
                </div>
                <div className="cropper-shell poster-panel relative aspect-square bg-[#0B6839]">
                  <Cropper
                    image={imageUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={format === "pfp" ? 1 : 1020 / 680}
                    minZoom={1}
                    maxZoom={4}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    showGrid={false}
                    restrictPosition
                  />
                  {format === "pfp" ? (
                    <div className="pointer-events-none absolute inset-[11%] z-10 rounded-full border-2 border-[#FFFAF2] shadow-[0_0_0_9999px_rgba(15,18,16,0.26)]" />
                  ) : null}
                </div>
                <input
                  aria-label="Zoom"
                  className="zoom-slider mt-5 w-full"
                  type="range"
                  min={1}
                  max={4}
                  step={0.01}
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                />
              </div>
            ) : null}
          </div>

          <div className="min-w-0">
            <div className="mb-5 flex flex-col items-start gap-2 border-b-4 border-[#FF5A1F] pb-3 text-[11px] font-bold uppercase tracking-[0.28em] sm:flex-row sm:items-center sm:justify-between">
              <span>No.03 / Preview</span>
              <span className="sm:text-right">{canvasSize.width}x{canvasSize.height} PNG</span>
            </div>

            {format === "id-card" ? (
              <div className="mb-7 grid gap-5 md:grid-cols-2">
                <LabelInput label="Name" value={name} onChange={setName} placeholder="Your name" />
                <LabelInput label="Stack / Role" value={role} onChange={setRole} placeholder="Frontend, AI, Design" />
                <div className="md:col-span-2">
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.26em]">
                    Builder Title
                  </div>
                  <button
                    className="hard-shadow-black w-full border-4 border-[#FF5A1F] bg-[#0B6839] px-4 py-3 text-left font-bold uppercase tracking-[0.1em] text-white hover:bg-[#FF5A1F]"
                    type="button"
                    onClick={() => setTitle(getNextBuilderTitle(title))}
                  >
                    {title} / Reroll
                  </button>
                </div>
              </div>
            ) : null}

            <div className="grid gap-7 xl:grid-cols-[minmax(0,0.95fr)_minmax(280px,0.55fr)]">
              <div className="poster-panel bg-[#0B6839] p-3">
                {canRender ? (
                  <canvas
                    ref={canvasRef}
                    className="block h-auto w-full bg-white"
                    style={{ aspectRatio: `${canvasSize.width} / ${canvasSize.height}` }}
                  />
                ) : (
                  <div
                    className="grid w-full place-items-center bg-[#0B6839] p-6 text-center text-white"
                    style={{ aspectRatio: `${canvasSize.width} / ${canvasSize.height}` }}
                  >
                    <p className="font-display max-w-sm text-[clamp(2rem,6vw,3rem)] uppercase leading-[0.88]">
                      Upload to generate your frame
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-end gap-5">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.28em]">
                    X Caption
                  </span>
                  <textarea
                    className="min-h-28 w-full resize-none border-0 border-b-4 border-[#FF5A1F] bg-[#0B6839] px-0 py-3 text-base text-white outline-none placeholder:text-white/50 focus:border-[#FF5A1F]"
                    value={caption}
                    onChange={(event) => setCaption(event.target.value)}
                  />
                </label>

                <p className="border-l-4 border-[#FF5A1F] pl-4 text-sm leading-6">
                  X cannot attach a local canvas image automatically. Download first, then attach
                  the PNG in the composer. The caption opens pre-filled with #FrameInGoa.
                </p>

                {error ? (
                  <p className="border-4 border-[#FF5A1F] bg-[#FF5A1F] p-3 text-sm font-bold text-white">
                    {error}
                  </p>
                ) : null}

                <div className="sticky bottom-0 grid gap-3 bg-[#0B6839] py-4 sm:grid-cols-2 xl:static xl:grid-cols-1 xl:py-0">
                  <button
                    className="hard-shadow-black border-4 border-[#FF5A1F] bg-[#FF5A1F] px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-white disabled:opacity-45"
                    type="button"
                    disabled={!canRender || isExporting}
                    onClick={() => void handleDownload()}
                  >
                    {isExporting ? "Exporting" : "Download"}
                  </button>
                  <button
                    className="hard-shadow-black border-4 border-[#FF5A1F] bg-[#0B6839] px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-white disabled:opacity-45"
                    type="button"
                    disabled={!canRender || isExporting}
                    onClick={() => void handleShare()}
                  >
                    Share to X
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {embedded ? null : <SiteFooter />}
    </Wrapper>
  );
}

function FormatButton({
  active,
  label,
  meta,
  onClick,
}: {
  active: boolean;
  label: string;
  meta: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`poster-panel grid min-h-40 w-full grid-cols-[minmax(0,1fr)_64px] gap-4 p-4 text-left transition sm:grid-cols-[minmax(0,1fr)_96px] ${
        active
          ? "bg-[#FF5A1F] text-white"
          : "bg-[#0B6839] text-white hover:bg-[#FF5A1F]"
      }`}
      type="button"
      onClick={onClick}
    >
      <span className="min-w-0 break-words">
        <span className="font-display block text-[clamp(1.75rem,8vw,2.25rem)] uppercase leading-none">{label}</span>
        <span className="mt-3 block text-[10px] font-bold uppercase tracking-[0.2em] sm:text-[11px]">
          {meta}
        </span>
      </span>
      <span className="relative block border-4 border-current">
        <span className="absolute inset-3 border-2 border-current" />
        <span className="absolute right-0 top-0 h-12 w-12 bg-[#FF5A1F]" />
      </span>
    </button>
  );
}

function LabelInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.26em]">
        {label}
      </span>
      <input
        className="w-full border-0 border-b-4 border-[#FF5A1F] bg-[#0B6839] px-0 py-3 text-lg text-white outline-none placeholder:text-white/50 focus:border-[#FF5A1F]"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

async function convertIfHeic(file: File): Promise<Blob> {
  const lowerName = file.name.toLowerCase();
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    lowerName.endsWith(".heic") ||
    lowerName.endsWith(".heif");

  if (!isHeic) {
    return file;
  }

  try {
    const heic2any = (await import("heic2any")).default;
    const converted = await heic2any({ blob: file, toType: "image/png", quality: 0.92 });
    return Array.isArray(converted) ? converted[0] : converted;
  } catch {
    throw new Error("HEIC conversion failed. Export the photo as JPG/PNG and try again.");
  }
}
