import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { cartCount, setIsDrawerOpen } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent scroll when mobile menu or search is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileMenuOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navItems = [
    { name: "HOME", path: "/" },
    { name: "ENSEMBLES", path: "/products?category=ensemble" },
    { name: "HOODIES", path: "/products?category=hoodie" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 backdrop-blur-[20px] bg-[rgba(10,10,10,0.85)] ${scrolled ? "border-b border-[#2a2a2a]" : "border-b border-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2 group z-50 shrink-0">
            <svg
              width="24"
              height="24"
              viewBox="0 0 100 100"
              fill="none"
              stroke="white"
              strokeWidth="4"
              className="group-hover:scale-110 transition-transform duration-300"
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
            <span className="bebas-neue text-2xl md:text-3xl text-white tracking-[0.15em] pt-1">
              WERNOVA
            </span>
          </Link>

          {/* Center: Desktop Nav */}
          <div className="hidden md:flex items-center justify-center flex-1 gap-12">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`dm-sans text-sm uppercase tracking-[0.2em] transition-all relative group ${location.pathname + location.search === item.path
                  ? "text-white"
                  : "text-[#a0a0a0] hover:text-white"
                  }`}
              >
                {item.name}
                <span className={`absolute -bottom-1 left-1/2 h-[1px] bg-[#38bdf8] transition-all duration-300 ${location.pathname + location.search === item.path
                  ? "w-full left-0"
                  : "w-0 group-hover:w-full group-hover:left-0"
                  }`}></span>
              </Link>
            ))}
          </div>

          {/* Right: Icons & Admin */}
          <div className="flex items-center gap-4 md:gap-6 z-50">


            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`${searchOpen ? 'text-white' : 'text-[#a0a0a0]'} hover:text-white transition-colors`}
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="text-[#a0a0a0] hover:text-white transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#38bdf8] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              className="md:hidden text-[#a0a0a0] hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-30 bg-[#0a0a0a] transition-transform duration-500 ease-[var(--ease-smooth)] flex flex-col justify-center items-center gap-8 ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {navItems.map((item, i) => (
          <Link
            key={item.name}
            to={item.path}
            onClick={() => setMobileMenuOpen(false)}
            className="bebas-neue text-4xl tracking-[0.15em] hover:text-[#38bdf8] transition-colors text-white"
            style={{
              opacity: mobileMenuOpen ? 1 : 0,
              transform: mobileMenuOpen ? "translateY(0)" : "translateY(20px)",
              transition: `all 0.4s var(--ease-smooth) ${0.1 * i + 0.2}s`
            }}
          >
            {item.name}
          </Link>
        ))}
      </div>

      {/* Search Overlay Dropdown */}
      <div
        className={`fixed left-0 w-full bg-[#0a0a0a] border-b border-[#2a2a2a] z-40 transition-all duration-300 ease-[var(--ease-smooth)] flex items-center justify-center ${searchOpen ? "top-20 h-24 opacity-100" : "top-0 h-0 opacity-0 overflow-hidden"
          }`}
      >
        <div className="max-w-2xl w-full px-4 flex items-center gap-4">
          <Search className="text-[#a0a0a0] shrink-0" size={24} />
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <input
              type="text"
              placeholder="Search products... (e.g. T-shirt)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-white text-xl md:text-2xl font-bold focus:outline-none placeholder:text-[#333] tracking-wide"
              autoFocus={searchOpen}
            />
          </form>
          <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="text-[#a0a0a0] hover:text-white transition-colors shrink-0">
            <X size={24} />
          </button>
        </div>
      </div>
    </>
  );
}
