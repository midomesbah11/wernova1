import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full bg-[#050505] border-t border-[#1a1a1a] pt-24 pb-12 px-4 md:px-8 mt-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16 md:gap-8 mb-24">

        {/* Brand */}
        <div className="flex flex-col max-w-sm">
          <Link to="/" className="flex items-center gap-2 mb-6 pointer-events-none md:pointer-events-auto">
            <svg
              width="24"
              height="24"
              viewBox="0 0 100 100"
              fill="none"
              stroke="white"
              strokeWidth="4"
            >
              <path
                d="M 10 30 L 30 80 L 50 40 L 70 80 L 90 30"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 30 30 L 50 80 L 70 30"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="bebas-neue text-3xl text-white tracking-[0.15em] pt-1">
              WERNOVA
            </span>
          </Link>
          <p className="dm-sans text-[#a0a0a0] text-sm leading-relaxed">
            Redefining technical streetwear. Engineered for the modern urban environment, designed entirely from scratch to break the mold of convention.
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 w-full md:w-auto">
          {/* Shop */}
          <div className="flex flex-col gap-4">
            <h4 className="bebas-neue text-white text-xl tracking-widest">SHOP</h4>
            <Link to="/products" className="dm-sans text-[#a0a0a0] hover:text-white transition-colors text-sm">All Products</Link>
            <Link to="/products?category=ensemble" className="dm-sans text-[#a0a0a0] hover:text-white transition-colors text-sm">Ensembles</Link>
            <Link to="/products?category=hoodie" className="dm-sans text-[#a0a0a0] hover:text-white transition-colors text-sm">Hoodies</Link>
          </div>

          {/* About */}
          <div className="flex flex-col gap-4">
            <h4 className="bebas-neue text-white text-xl tracking-widest">ABOUT</h4>
            <span className="dm-sans text-[#a0a0a0] hover:text-white transition-colors text-sm cursor-pointer">Brand Story</span>
            <span className="dm-sans text-[#a0a0a0] hover:text-white transition-colors text-sm cursor-pointer">Lookbook</span>
            <span className="dm-sans text-[#a0a0a0] hover:text-white transition-colors text-sm cursor-pointer">Stockists</span>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-4 col-span-2 md:col-span-1">
            <h4 className="bebas-neue text-white text-xl tracking-widest">SUPPORT</h4>
            <span className="dm-sans text-[#a0a0a0] hover:text-white transition-colors text-sm cursor-pointer">Shipping & Returns</span>
            <span className="dm-sans text-[#a0a0a0] hover:text-white transition-colors text-sm cursor-pointer">Contact Us</span>
            <span className="dm-sans text-[#a0a0a0] hover:text-white transition-colors text-sm cursor-pointer">FAQ</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto border-t border-[#1a1a1a] flex flex-col md:flex-row justify-between items-center pt-8 gap-4">
        <p className="dm-sans text-[#666666] text-xs uppercase tracking-widest text-center md:text-left">
          &copy; {new Date().getFullYear()} WERNOVA STORE. All Rights Reserved.
        </p>
        <div className="flex gap-6">
          <span className="dm-sans text-[#666666] hover:text-white transition-colors text-xs uppercase tracking-widest cursor-pointer">Privacy</span>
          <span className="dm-sans text-[#666666] hover:text-white transition-colors text-xs uppercase tracking-widest cursor-pointer">Terms</span>
        </div>
      </div>
    </footer>
  );
}
