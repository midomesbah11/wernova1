import { Link } from "react-router-dom";
import { ArrowDown } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative w-full h-screen flex items-center overflow-hidden bg-[var(--bg-primary)]">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="noise-bg"></div>
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[50vw] md:h-[50vw] rounded-full blur-[100px] opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)",
            animation: "pulseGradient 8s ease-in-out infinite"
          }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-16 md:mt-0">
        {/* Left Content */}
        <div className="flex flex-col items-start text-left">
          <div className="overflow-hidden mb-4">
            <h1 
              className="bebas-neue text-white leading-[0.9]"
              style={{ 
                fontSize: "clamp(3rem, 10vw, 10rem)",
                opacity: 0,
                transform: "translateY(100px)",
                animation: "floatUp 0.8s var(--ease-smooth) forwards 0.2s"
              }}
            >
              DEFINE YOUR<br/>STREET
            </h1>
          </div>
          
          <p 
            className="dm-sans text-[#a0a0a0] text-lg md:text-xl mb-10 max-w-md"
            style={{
              opacity: 0,
              transform: "translateY(20px)",
              animation: "floatUp 0.6s var(--ease-smooth) forwards 0.4s"
            }}
          >
            New Season. New Identity. Push the boundaries of modern streetwear with our latest collection.
          </p>
          
          <div 
            className="flex flex-wrap gap-4"
            style={{
              opacity: 0,
              transform: "translateY(20px)",
              animation: "floatUp 0.6s var(--ease-smooth) forwards 0.6s"
            }}
          >
            <Link 
              to="/products" 
              className="px-8 py-4 bg-white text-black dm-sans font-bold text-sm tracking-wider hover:bg-[#e0e0e0] hover:scale-105 transition-all duration-300"
            >
              SHOP NOW
            </Link>
          </div>
        </div>

        {/* Right Floating Element */}
        <div 
          className="hidden md:flex justify-center items-center"
          style={{
            opacity: 0,
            transform: "translateY(40px)",
            animation: "floatUp 1s var(--ease-smooth) forwards 0.8s"
          }}
        >
          <div className="relative w-full max-w-md aspect-[3/4] border border-dashed border-[#2a2a2a] bg-[#111111] flex items-center justify-center overflow-hidden group">
            {/* Using an abstract shape/image placeholder */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1a1a1a] to-[#222222] opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
            <div className="bebas-neue text-[#2a2a2a] text-4xl tracking-widest rotate-90 absolute right-4">WERNOVA</div>
            <div className="dm-sans text-[#a0a0a0] text-sm tracking-widest text-center px-4 relative z-10 uppercase border border-[#2a2a2a] py-2 bg-[#111111]">
              PRODUCT IMAGE
            </div>
            
            {/* Floating abstract decorative elements */}
            <div className="absolute top-1/4 left-1/4 w-16 h-16 border border-white/10 rounded-full animate-[breathe_4s_infinite]"></div>
            <div className="absolute bottom-1/3 right-1/4 w-24 h-24 border border-white/5 rotate-45 animate-[swingHanger_6s_infinite]"></div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        style={{
          opacity: 0,
          animation: "floatUp 0.6s var(--ease-smooth) forwards 1.2s"
        }}
      >
        <span className="dm-sans text-[10px] text-[#a0a0a0] uppercase tracking-widest">Scroll</span>
        <ArrowDown size={16} className="text-[#a0a0a0] animate-bounce" />
      </div>
    </div>
  );
}
