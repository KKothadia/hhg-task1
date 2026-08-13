import type { Area } from "react-easy-crop";
import type { FrameFormat } from "./frame";

type DrawInput = {
  canvas: HTMLCanvasElement;
  imageUrl: string;
  cropPixels: Area | null;
  format: FrameFormat;
  name: string;
  role: string;
  title: string;
};

const BLACK = "#0F1210";
const WHITE = "#FFFAF2";
const ORANGE = "#FF5A1F";
const PINK = "#F72585";

export async function drawFrame(input: DrawInput): Promise<void> {
  const image = await loadImage(input.imageUrl);
  await document.fonts.ready;

  if (input.format === "pfp") {
    drawPfp(input.canvas, image, input.cropPixels);
    return;
  }

  drawIdCard(input.canvas, image, input.cropPixels, input.name, input.role, input.title);
}

export function getCanvasSize(format: FrameFormat): { width: number; height: number } {
  return format === "pfp" ? { width: 1000, height: 1000 } : { width: 1200, height: 1600 };
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Canvas export failed. Try a different image."));
    }, "image/png");
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read the uploaded image."));
    image.src = src;
  });
}

function getFontFamily(variableName: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  return value || fallback;
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  crop: Area | null,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) {
  if (crop) {
    ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, dx, dy, dw, dh);
    return;
  }

  const scale = Math.max(dw / image.naturalWidth, dh / image.naturalHeight);
  const sw = dw / scale;
  const sh = dh / scale;
  const sx = (image.naturalWidth - sw) / 2;
  const sy = (image.naturalHeight - sh) / 2;
  ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
}

function drawPfp(canvas: HTMLCanvasElement, image: HTMLImageElement, crop: Area | null) {
  const { width, height } = getCanvasSize("pfp");
  canvas.width = width;
  canvas.height = height;

  const ctx = getContext(canvas);
  const display = getFontFamily("--font-vanguard", "Impact");
  const body = getFontFamily("--font-helvetica", "Arial");
  const serif = getFontFamily("--font-athelas", "Georgia");

  ctx.fillStyle = WHITE;
  ctx.fillRect(0, 0, width, height);
  drawImageCover(ctx, image, crop, 0, 0, width, height);

  ctx.fillStyle = BLACK;
  ctx.fillRect(0, 0, width, 72);
  ctx.fillRect(0, height - 132, width, 132);
  ctx.fillRect(0, 0, 72, height);
  ctx.fillRect(width - 72, 0, 72, height);

  ctx.fillStyle = ORANGE;
  ctx.beginPath();
  ctx.moveTo(width, 0);
  ctx.lineTo(width, 315);
  ctx.lineTo(width - 315, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.font = `700 54px ${display}`;
  ctx.textBaseline = "middle";
  ctx.fillText("HH GOA", 92, height - 73);

  ctx.fillStyle = ORANGE;
  ctx.fillRect(470, height - 111, 4, 76);

  ctx.fillStyle = WHITE;
  ctx.font = `700 32px ${body}`;
  ctx.fillText("2026", 498, height - 72);

  ctx.save();
  ctx.translate(width - 42, 88);
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = BLACK;
  ctx.font = `700 26px ${body}`;
  ctx.fillText("#FRAMEINGOA", 0, 0);
  ctx.restore();

  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 392, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = PINK;
  ctx.fillRect(72, 72, 182, 18);

  ctx.fillStyle = WHITE;
  ctx.font = `400 28px ${serif}`;
  ctx.fillText("builder tool", 92, 44);
}

function drawIdCard(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  crop: Area | null,
  name: string,
  role: string,
  title: string,
) {
  const { width, height } = getCanvasSize("id-card");
  canvas.width = width;
  canvas.height = height;

  const ctx = getContext(canvas);
  const display = getFontFamily("--font-vanguard", "Impact");
  const body = getFontFamily("--font-helvetica", "Arial");
  const serif = getFontFamily("--font-athelas", "Georgia");
  const safeName = (name.trim() || "YOUR NAME").toUpperCase();
  const safeRole = role.trim() || "Builder";

  ctx.fillStyle = WHITE;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 18;
  ctx.strokeRect(28, 28, width - 56, height - 56);

  ctx.fillStyle = BLACK;
  ctx.fillRect(0, 0, width, 172);

  ctx.fillStyle = ORANGE;
  ctx.beginPath();
  ctx.moveTo(width, 172);
  ctx.lineTo(width, 555);
  ctx.lineTo(width - 365, 172);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.font = `700 76px ${display}`;
  ctx.fillText("HH GOA", 64, 112);
  ctx.font = `700 36px ${body}`;
  ctx.fillText("2026 / BUILDER ID", 66, 152);

  ctx.fillStyle = BLACK;
  ctx.beginPath();
  ctx.arc(width / 2, 84, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.arc(width / 2, 84, 13, 0, Math.PI * 2);
  ctx.fill();

  drawLanyardHole(ctx, width / 2, 50);

  drawImageCover(ctx, image, crop, 90, 250, 1020, 680);
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 10;
  ctx.strokeRect(90, 250, 1020, 680);

  ctx.fillStyle = BLACK;
  ctx.font = `700 ${safeName.length > 14 ? 112 : 142}px ${display}`;
  wrapDisplayText(ctx, safeName, 90, 1086, 1020, safeName.length > 14 ? 110 : 136);

  ctx.fillStyle = ORANGE;
  ctx.fillRect(90, 1244, 1020, 12);

  ctx.fillStyle = BLACK;
  ctx.font = `700 42px ${body}`;
  ctx.fillText(safeRole.toUpperCase(), 90, 1325);

  ctx.font = `400 44px ${serif}`;
  ctx.fillText(title, 90, 1398);

  ctx.fillStyle = BLACK;
  ctx.fillRect(90, 1466, 1020, 78);
  ctx.fillStyle = WHITE;
  ctx.font = `700 30px ${body}`;
  ctx.fillText("FEB 2026 / GOA, INDIA / #FRAMEINGOA", 124, 1516);

  ctx.fillStyle = PINK;
  ctx.fillRect(width - 170, 930, 80, 300);
}

function drawLanyardHole(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(x - 82, 0);
  ctx.quadraticCurveTo(x - 34, y + 42, x, y + 42);
  ctx.quadraticCurveTo(x + 34, y + 42, x + 82, 0);
  ctx.stroke();

  ctx.fillStyle = BLACK;
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(x - 76, y + 8, 152, 54, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.arc(x, y + 35, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = BLACK;
  ctx.beginPath();
  ctx.arc(x, y + 35, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function wrapDisplayText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(/\s+/);
  let line = "";
  let lineY = y;

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next;
    } else {
      ctx.fillText(line, x, lineY);
      line = word;
      lineY += lineHeight;
    }
  }

  ctx.fillText(line, x, lineY);
}

function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas is not available in this browser.");
  }

  return ctx;
}
