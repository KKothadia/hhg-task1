import type { Metadata } from "next";
import localFont from "next/font/local";
import { MusicPlayerProvider } from "@/components/music-player";
import "./globals.css";

const vanguard = localFont({
  src: "../public/fonts/vanguard-heavy.otf",
  variable: "--font-vanguard",
  display: "swap",
});

const helvetica = localFont({
  src: [
    {
      path: "../public/fonts/helvetica.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/helvetica-bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-helvetica",
  display: "swap",
});

const athelas = localFont({
  src: "../public/fonts/athelas-regular.ttf",
  variable: "--font-athelas",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HH Goa 2026 - Frame Generator",
  description: "Upload a photo, crop it, and export a branded HH Goa 2026 frame.",
  openGraph: {
    title: "HH Goa 2026 - Frame Generator",
    description: "Make your Goa 2026 frame and share it with #FrameInGoa.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HH Goa 2026 - Frame Generator",
    description: "Make your Goa 2026 frame and share it with #FrameInGoa.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${vanguard.variable} ${helvetica.variable} ${athelas.variable}`}
    >
      <body>
        <MusicPlayerProvider>{children}</MusicPlayerProvider>
      </body>
    </html>
  );
}
