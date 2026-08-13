import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { FrameGenerator } from "@/components/frame-generator";
import { InlineMusicPlayer } from "@/components/music-player";
import { SiteFooter } from "@/components/site-footer";
import { AsciiHeroBackground } from "@/components/ui/ascii-hero-background";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
});

const TEAM_MEMBERS = [
  {
    name: "Sumeet Wagh",
    affiliation: "Karnavati University",
    image: "/user_assets/Sumeet%20Wagh.png",
  },
  {
    name: "Khushi Kothadia",
    affiliation: "Karnavati University",
    image: "/user_assets/Khushi%20Kothadia.png",
  },
  {
    name: "Yamuna Sharma",
    affiliation: "Karnavati University",
    image: "/user_assets/Yamuna%20Sharma.png",
  },
];

const FAQ_ITEMS = [
  {
    question: "What file formats can I upload?",
    answer: "JPG, PNG, and HEIC are accepted. HEIC conversion runs client-side before cropping.",
  },
  {
    question: "Do I need an account?",
    answer: "No login, ever.",
  },
  {
    question: "Where does my photo go?",
    answer: "Your photo is processed entirely in your browser and is never uploaded to a server.",
  },
  {
    question: "Can I use this on mobile?",
    answer: "Yes. The generator is responsive and supports camera upload, drag, crop, and pinch zoom.",
  },
];

export default function Home() {
  return (
    <main className="bg-[#0B6839] text-white">
      <NavHeader />
      <Hero />
      <HowItWorks />
      <FrameGenerator showHero={false} embedded />
      <TeamSection />
      <NowPlaying />
      <FaqStrip />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}

function NavHeader() {
  return (
    <header className="sticky top-0 z-40 grid grid-cols-2 border-b-4 border-[#FF5A1F] bg-[#0B6839] px-5 py-4 text-[11px] font-black uppercase tracking-[0.26em] text-white shadow-[0_8px_0_#071a10] md:grid-cols-4 md:px-10">
      <Link className="hover:text-[#FF5A1F]" href="/">
        HH GOA 2026
      </Link>
      <span className="hidden md:block">NO.01 / FRAMEINGOA</span>
      <span className="text-right md:text-left">15.4909 N</span>
      <Link className="hidden text-right hover:text-[#FF5A1F] md:block" href="#builder">
        Start →
      </Link>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-49px)] flex-col justify-center overflow-hidden bg-[#0B6839] px-5 py-16 text-center text-white md:items-start md:px-10 md:text-left">
      <AsciiHeroBackground />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[rgba(11,104,57,0.92)] via-[rgba(11,104,57,0.55)] to-[rgba(11,104,57,0.18)]" />
      <div className="relative z-20 mx-auto w-full max-w-[1180px] md:mx-0">
        <p className="mb-6 text-[12px] font-bold uppercase tracking-[0.36em] text-white">
          HH GOA 2026 / BUILDER TOOL
        </p>
        <h1 className={`${playfair.className} mx-auto max-w-[14ch] text-[clamp(2.6rem,8vw,7.2rem)] uppercase leading-[0.86] md:mx-0`}>
          MAKE YOUR <span className="inline-block rotate-[-3deg] text-[#FF5A1F]">GOA</span> 2026 FRAME
        </h1>
        <a
          className="hard-shadow-black mt-9 inline-block border-4 border-[#FF5A1F] bg-[#FF5A1F] px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5"
          href="#builder"
        >
          UPLOAD YOUR PHOTO →
        </a>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "UPLOAD",
      copy: "Drop in any photo - portrait, landscape, off-center, doesn't matter.",
    },
    {
      number: "02",
      title: "CUSTOMIZE",
      copy: "Pick PFP frame or Builder ID card. Add your name if it's a badge.",
    },
    {
      number: "03",
      title: "SHARE",
      copy: "Download instantly or post straight to X with #FrameInGoa baked in.",
    },
  ];

  return (
    <section className="px-5 py-16 md:px-10 md:py-20">
      <SectionLabel label="02 / HOW IT WORKS" />
      <div className="grid gap-5 md:grid-cols-3">
        {steps.map((step) => (
          <article className="poster-panel bg-[#0B6839] p-6" key={step.number}>
            <p className="font-display text-6xl leading-none text-[#FF5A1F]">{step.number}</p>
            <h2 className="mt-6 text-xl font-black uppercase tracking-[0.12em] text-white">{step.title}</h2>
            <p className="mt-3 max-w-sm text-base leading-7 text-white/85">{step.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TeamSection() {
  return (
    <section className="bg-[#0B6839] px-5 py-16 text-white md:px-10 md:py-20">
      <SectionLabel label="04 / TEAM" inverted />
      <h2 className="font-display mb-8 text-[clamp(2.4rem,6vw,5.5rem)] uppercase leading-[0.82] text-[#FF5A1F]">
        APIcalypse
      </h2>
      <div className="grid gap-5 md:grid-cols-3">
        {TEAM_MEMBERS.map((member) => (
          <article className="poster-panel overflow-hidden bg-[#0B6839]" key={member.name}>
            <div className="aspect-square bg-[#0B6839]">
              <img
                alt={`${member.name} portrait`}
                className="h-full w-full object-cover object-center"
                src={member.image}
              />
            </div>

            <p className="border-t-4 border-[#FF5A1F] bg-[#FF5A1F] px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              {member.affiliation}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function NowPlaying() {
  return (
    <section className="px-5 py-16 md:px-10 md:py-20">
      <SectionLabel label="05 / NOW PLAYING" />
      <InlineMusicPlayer />
      <p className="mx-auto mt-4 max-w-5xl text-xs font-bold uppercase tracking-[0.18em]">
        Playing the HH Goa playlist through YouTube. Audio starts on visit.
      </p>
    </section>
  );
}

function FaqStrip() {
  return (
    <section className="px-5 py-16 md:px-10 md:py-20">
      <SectionLabel label="06 / DETAILS" />
      <div className="poster-panel bg-[#0B6839]">
        {FAQ_ITEMS.map((item) => (
          <details className="group border-b-4 border-[#FF5A1F] px-5 py-5 last:border-b-0" key={item.question}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-left text-lg font-black uppercase tracking-[0.1em] text-white">
              {item.question}
              <span className="text-3xl leading-none group-open:hidden">+</span>
              <span className="hidden text-3xl leading-none group-open:block">-</span>
            </summary>
            <p className="mt-4 max-w-3xl text-base leading-7">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-[#FF5A1F] px-5 py-14 md:px-10">
      <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <h2 className="font-display text-[clamp(2.6rem,8vw,6.5rem)] uppercase leading-[0.86] text-white">
          READY TO MAKE YOURS?
        </h2>
        <a
          className="hard-shadow-black border-4 border-white bg-[#0B6839] px-6 py-4 text-center text-sm font-black uppercase tracking-[0.18em] text-white"
          href="#builder"
        >
          START →
        </a>
      </div>
    </section>
  );
}

function SectionLabel({ label, inverted = false }: { label: string; inverted?: boolean }) {
  return (
    <div
      className={`mb-6 border-b-4 pb-3 text-[12px] font-black uppercase tracking-[0.32em] ${
        inverted ? "border-[#FF5A1F] text-white" : "border-[#FF5A1F] text-white"
      }`}
    >
      {label}
    </div>
  );
}
