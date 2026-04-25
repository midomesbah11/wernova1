
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleQuickAdd = (e) => {
    e.preventDefault();
    const sizes = product.sizes_stock ? Object.keys(product.sizes_stock).filter(s => product.sizes_stock[s] > 0) : [];
    if (sizes.length > 0) {
      addToCart(product, sizes[0]); // quick add first available size
    } else {
      addToCart(product, "OS");
    }
  };

  const isSoldOut = product.stock === 0 || 
    (product.sizes_stock && Object.values(product.sizes_stock).every(qty => parseInt(qty) === 0));

  return (
    <div className={`group flex flex-col w-full text-left transition-opacity duration-500 ${isSoldOut ? 'opacity-60' : 'opacity-100'}`}>
      <Link to={`/products/${product.id}`} className="relative block aspect-[4/5] bg-[#111111] overflow-hidden mb-4 border border-transparent group-hover:border-[#2a2a2a] transition-all duration-500 rounded-xl">
        
        {/* Badge */}
        {product.badge && (
          <div className="absolute top-4 left-4 z-20 bg-white text-black bebas-neue text-lg px-3 py-1 tracking-wider pointer-events-none">
            {product.badge}
          </div>
        )}

        {/* Image / Placeholder */}
        {product.images && product.images[0] ? (
          <img 
            src={product.images[0]} 
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover text-[#a0a0a0] dm-sans flex items-center justify-center bg-[#111111] group-hover:scale-105 transition-transform duration-[600ms] ease-[var(--ease-smooth)]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#111111] dm-sans text-[#a0a0a0] border border-dashed border-[#2a2a2a] m-4">
            {product.name}
          </div>
        )}

        {/* Overlay Add to cart */}
        {!isSoldOut && (
          <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-[var(--ease-smooth)] z-20">
            <button 
              onClick={handleQuickAdd}
              className="w-full py-4 bg-white text-black dm-sans font-bold text-sm tracking-wider hover:bg-black hover:text-white transition-colors rounded-xl"
            >
              + QUICK ADD
            </button>
          </div>
        )}
        
        {isSoldOut && (
           <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center transition-opacity duration-300 group-hover:bg-black/70 backdrop-blur-[2px]">
             <span className="bebas-neue text-2xl text-white tracking-widest px-6 py-3 border-2 border-white/50 bg-black/50 shadow-[0_0_30px_rgba(0,0,0,0.8)] transform -rotate-12 scale-110">SOLD OUT</span>
           </div>
        )}
      </Link>

      {/* Info */}
      <h4 className="bebas-neue text-xl md:text-2xl text-white">{product.name}</h4>
      <div className="flex gap-3 items-center mt-1">
        <span className="dm-sans text-white">{product.price} DA</span>
        {product.originalPrice && (
          <span className="dm-sans text-[#666666] line-through text-sm">{product.originalPrice} DA</span>
        )}
      </div>
    </div>
  );
}
