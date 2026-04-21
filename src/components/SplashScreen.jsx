import { useEffect, useState } from "react";

export default function SplashScreen({ onComplete }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Start fading out at 2.4s to finish at 2.8s
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 2400);

    // Call onComplete at 2.8s
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const letters = "WERNOVA".split("");


  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-primary)] transition-opacity duration-400 ease-out ${fade ? "opacity-0" : "opacity-100"
        }`}
    >
      <div className="flex flex-col items-center">
        {/* Geometric Logo */}
        <svg
          width="60"
          height="60"
          viewBox="0 0 100 100"
          fill="none"
          stroke="white"
          strokeWidth="3"
          className="mb-6"
        >
          <path
            d="M 10 30 L 30 80 L 50 40 L 70 80 L 90 30"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 200,
              strokeDashoffset: 200,
              animation: "svgDraw 0.8s var(--ease-smooth) forwards"
            }}
          />
          <path
            d="M 30 30 L 50 80 L 70 30"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 200,
              strokeDashoffset: 200,
              animation: "svgDraw 0.8s var(--ease-smooth) 0.2s forwards"
            }}
          />
        </svg>

        {/* WERNOVA Text Reveal */}
        <div className="flex mb-1" style={{ overflow: "hidden" }}>
          {letters.map((char, i) => (
            <span
              key={i}
              className="bebas-neue text-6xl md:text-8xl text-white"
              style={{
                opacity: 0,
                transform: "translateY(10px)",
                animation: `letterReveal 0.4s var(--ease-smooth) forwards ${0.8 + i * 0.08}s`
              }}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Decorative Line */}
        <div
          className="h-px bg-white w-full mb-3 origin-center"
          style={{
            transform: "scaleX(0)",
            animation: "lineExpand 0.6s var(--ease-smooth) forwards 1.4s"
          }}
        />

        {/* STORE Subtext */}
        <div
          className="dm-sans text-white text-sm md:text-base tracking-[0.3em] font-light"
          style={{
            opacity: 0,
            transform: "translateY(20px)",
            animation: "floatUp 0.4s var(--ease-smooth) forwards 1.6s"
          }}
        >
          STORE
        </div>
      </div>
    </div>
  );
}
