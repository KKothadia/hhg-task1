export type FrameFormat = "pfp" | "id-card";

export const SHARE_HASHTAG = "FrameInGoa";

export const BUILDER_TITLES = [
  "Ship-It Specialist",
  "Full-Stack Chaos Engineer",
  "Prompt Whisperer",
  "Prototype Sprinter",
  "API Cartographer",
  "Pixel Systems Builder",
] as const;

export type BuilderTitle = (typeof BUILDER_TITLES)[number];

export const DEFAULT_SHARE_CAPTION = "Just built my HH Goa 2026 frame \uD83D\uDD25 #FrameInGoa [link]";

export function buildTweetIntent(caption: string, shareUrl?: string): string {
  const text = caption.trim() || DEFAULT_SHARE_CAPTION;
  const params = new URLSearchParams({
    text,
    hashtags: SHARE_HASHTAG,
  });

  if (shareUrl) {
    params.set("url", shareUrl);
  }

  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

export function getDownloadFilename(format: FrameFormat, date = new Date()): string {
  const stamp = date
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");
  return `hh-goa-2026-${format}-${stamp}.png`;
}

export function getNextBuilderTitle(currentTitle: string): BuilderTitle {
  const currentIndex = BUILDER_TITLES.indexOf(currentTitle as BuilderTitle);
  return BUILDER_TITLES[(currentIndex + 1 + BUILDER_TITLES.length) % BUILDER_TITLES.length];
}

export function isSupportedImageType(file: File): boolean {
  const lowerName = file.name.toLowerCase();
  return (
    file.type.startsWith("image/") ||
    lowerName.endsWith(".heic") ||
    lowerName.endsWith(".heif")
  );
}
