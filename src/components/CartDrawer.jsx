import { useCart } from "../context/CartContext";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function CartDrawer() {
  const { isDrawerOpen, setIsDrawerOpen, cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={() => setIsDrawerOpen(false)}
      ></div>

      {/* Drawer */}
      <div 
        className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-[#111111] border-l border-[#2a2a2a] z-50 flex flex-col shadow-2xl animate-[slideLeft_0.4s_var(--ease-smooth)_forwards]"
        style={{ animationName: isDrawerOpen ? 'slideLeft' : 'none' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#2a2a2a]">
          <h2 className="bebas-neue text-3xl text-white tracking-widest leading-none pt-1">YOUR CART</h2>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="text-[#a0a0a0] hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[#a0a0a0] space-y-4">
              <div className="w-16 h-16 rounded-full border border-dashed border-[#2a2a2a] flex items-center justify-center mb-4">
                <span className="dm-sans text-xs">EMPTY</span>
              </div>
              <p className="dm-sans">Your cart is currently empty.</p>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="text-white border-b border-white pb-1 hover:text-[#a0a0a0] hover:border-[#a0a0a0] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.cartItemId} className="flex gap-4">
                {/* Img placeholder */}
                <div className="w-24 h-32 bg-[#1a1a1a] flex-shrink-0 border border-[#2a2a2a] overflow-hidden">
                  {item.images && item.images[0] ? (
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-[#2a2a2a] font-mono p-1 text-center">NO IMG</div>
                  )}
                </div>
                
                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="bebas-neue text-xl text-white leading-tight">{item.name}</h4>
                      <button onClick={() => removeFromCart(item.cartItemId)} className="text-[#a0a0a0] hover:text-white p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="dm-sans text-sm text-[#a0a0a0] mt-1 space-y-1">
                      <p>Size: <span className="text-white">{item.size}</span></p>
                      <p>{item.price} DA</p>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center border border-[#2a2a2a] bg-[#1a1a1a]">
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="p-2 text-[#a0a0a0] hover:text-white transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="dm-sans text-white text-sm w-8 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="p-2 text-[#a0a0a0] hover:text-white transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-[#2a2a2a] bg-[#1a1a1a]">
            <div className="flex justify-between items-center mb-6">
              <span className="dm-sans text-[#a0a0a0] uppercase tracking-widest text-sm">Total</span>
              <span className="dm-sans text-2xl text-white font-medium">{cartTotal} DA</span>
            </div>
            <Link 
              to="/checkout"
              onClick={() => setIsDrawerOpen(false)}
              className="w-full bg-white text-black py-4 bebas-neue text-xl tracking-widest hover:bg-[#e0e0e0] transition-colors block text-center"
            >
              CHECKOUT
            </Link>
            <p className="dm-sans text-[#666666] text-xs text-center mt-4">
              Taxes and shipping calculated at checkout.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
