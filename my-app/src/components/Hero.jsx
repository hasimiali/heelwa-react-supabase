"use client";

import heroVideo from "../assets/videos/hero.mp4";
import "./hero.css";

export default function HeroSection() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={heroVideo}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Centered enchanted logo */}
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <img
            src="/images/logos/heelwa_heroes.png"
            alt="HEELWA"
            className="heelwa-enchanted-logo"
          />

          {/* Subtitle */}
          <p className="heelwa-enchanted-subtitle mt-4">raya series 2026</p>
        </div>
      </div>
    </div>
  );
}
