import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import CategorySection from "../components/CategorySection";
import ProductGrid from "../components/ProductGrid";
import { products as localProducts } from "../data/products";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [products, setProducts] = useState(localProducts.slice(0, 4));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProducts();

    const subscription = supabase
      .channel('home_products_channel')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, payload => {
        setProducts(prev => prev.map(p => {
          if (p.id === payload.new.id) {
            let imgs = [];
            if (Array.isArray(payload.new.images)) imgs = payload.new.images;
            else if (typeof payload.new.images === 'string') {
              try { imgs = JSON.parse(payload.new.images); } catch(e) { imgs = [payload.new.images]; }
            }
            return { ...p, ...payload.new, images: imgs, img: imgs[0] || '' };
          }
          return p;
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error: sbError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (sbError) throw sbError;

      if (data && data.length > 0) {
        const formattedData = data.map(p => {
          let imgs = [];
          if (Array.isArray(p.images)) {
            imgs = p.images;
          } else if (typeof p.images === 'string') {
            try {
              imgs = JSON.parse(p.images);
            } catch (e) {
              imgs = [p.images];
            }
          }
          return {
            ...p,
            images: imgs,
            img: imgs[0] || ''
          };
        });
        setProducts(formattedData);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("حدث خطأ أثناء جلب المنتجات. يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Hero />
      <CategorySection />
      
      {/* Featured Products */}
      <div className="py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 font-bold uppercase tracking-widest px-4">
            {error}
          </div>
        ) : (
          <ProductGrid products={products.slice(0, 8)} title="LATEST DROPS" />
        )}
      </div>
      
      {/* Abstract Banner Divider */}
      <section className="w-full h-[50vh] min-h-[400px] bg-[#111111] border-y border-[#2a2a2a] relative overflow-hidden flex flex-col items-center justify-center my-24 group">
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:10px_10px]" />
        </div>
        <h2 className="bebas-neue text-6xl md:text-8xl text-white relative z-10 text-center px-4 tracking-widest mix-blend-difference group-hover:scale-105 transition-transform duration-1000">
          BREAK THE MOLD
        </h2>
        <div className="w-[1px] h-24 bg-white mt-8 relative z-10 origin-bottom animate-[lineExpand_2s_ease-in-out_infinite_alternate]" />
      </section>
    </div>
  );
}
