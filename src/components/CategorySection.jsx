import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        observer.disconnect();
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return [ref, isIntersecting];
}

export default function CategorySection() {
  const [refLeft, leftIntersecting] = useIntersectionObserver({ threshold: 0.2 });
  const [refRight, rightIntersecting] = useIntersectionObserver({ threshold: 0.2 });

  return (
    <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto w-full overflow-hidden">
      <div className="flex flex-col md:flex-row gap-8 justify-between">
        
        {/* ENSEMBLE CARD */}
        <Link 
          to="/products?category=ensemble"
          ref={refLeft}
          className={`group relative w-full md:w-[48%] aspect-[4/5] bg-[#1a1a1a] overflow-hidden shadow-lg ${
            leftIntersecting ? "animate-[slideLeft_0.8s_var(--ease-smooth)_forwards]" : "opacity-0"
          }`}
        >
          {/* Image with zoom effect */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: "url('/images/streetwear_ensemble.png')" }}
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500"></div>

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10 pointer-events-none">
            <h3 className="bebas-neue text-white text-6xl md:text-8xl font-bold tracking-widest drop-shadow-lg text-center">
              ENSEMBLES
            </h3>
          </div>
        </Link>


        {/* HOODIE CARD */}
        <Link 
          to="/products?category=hoodie"
          ref={refRight}
          className={`group relative w-full md:w-[48%] aspect-[4/5] bg-[#1a1a1a] overflow-hidden shadow-lg ${
            rightIntersecting ? "animate-[slideRight_0.8s_var(--ease-smooth)_forwards]" : "opacity-0"
          }`}
        >
          {/* Image with zoom effect */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: "url('/images/streetwear_hoodie.png')" }}
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500"></div>

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10 pointer-events-none">
            <h3 className="bebas-neue text-white text-6xl md:text-8xl font-bold tracking-widest drop-shadow-lg text-center">
              HOODIES
            </h3>
          </div>
        </Link>
        
      </div>
    </section>
  );
}
