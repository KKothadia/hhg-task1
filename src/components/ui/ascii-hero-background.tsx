"use client";

const ASCII_ROWS = [
  "HHGOA2026////FRAMEINGOA////UPLOAD////CROP////EXPORT",
  "/////010101////LAT15.4909N////LONG73.8278E/////",
  "MAKE/YOUR/GOA/FRAME////BUILDER/TOOL////NO.01",
  "████░░▒▒////HACKERHOUSE////GOA////2026////▒▒░░████",
];

export function AsciiHeroBackground() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-[#0B6839]">
      <div className="ascii-mobile-field absolute inset-0 lg:hidden" />
      <div className="ascii-field hidden lg:block">
        {Array.from({ length: 22 }).map((_, rowIndex) => (
          <p
            className="ascii-row text-orange-200/40"
            key={`ascii-row-${rowIndex}`}
            style={{ animationDelay: `${rowIndex * -0.42}s` }}
          >
            {ASCII_ROWS[rowIndex % ASCII_ROWS.length].repeat(4)}
          </p>
        ))}
      </div>
      <div className="absolute left-5 top-5 h-16 w-16 border-l-4 border-t-4 border-[#FF5A1F] md:left-10 md:top-10" />
      <div className="absolute bottom-5 right-5 h-16 w-16 border-b-4 border-r-4 border-[#FF5A1F] md:bottom-10 md:right-10" />
    </div>
  );
}
