import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductGrid from "../components/ProductGrid";
import { products as localProducts } from "../data/products";
import { supabase } from "../lib/supabaseClient";

export default function Products() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const searchQueryParam = searchParams.get("search");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProducts();

    const subscription = supabase
      .channel('grid_products_channel')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, payload => {
        setProducts(prev => prev.map(p => {
          if (p.id === payload.new.id) {
            let imgs = [];
            if (Array.isArray(payload.new.images)) imgs = payload.new.images;
            else if (typeof payload.new.images === 'string') {
              try { imgs = JSON.parse(payload.new.images); } catch (e) { imgs = [payload.new.images]; }
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
  }, [category, searchQueryParam]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase.from('products').select('*');

      if (category) {
        query = query.ilike('category', category);
      }

      if (searchQueryParam) {
        query = query.or(`name.ilike.%${searchQueryParam}%,description.ilike.%${searchQueryParam}%`);
      }

      const { data, error: sbError } = await query.order('created_at', { ascending: false });

      if (sbError) throw sbError;

      if (data) {
        // Map images to handle array structure for components
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
      setError("حدث خطأ أثناء تحميل المنتجات.");
    } finally {
      setLoading(false);
    }
  };

  let title = "ALL PRODUCTS";
  if (searchQueryParam) {
    title = `SEARCH: "${searchQueryParam.toUpperCase()}"`;
  } else if (category) {
    title = `${category.toUpperCase()}S`;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-32 pb-24">
      {/* Header section with abstract design */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-16 border-l-4 border-white pl-6 animate-[slideRight_0.6s_var(--ease-smooth)_forwards] opacity-0" style={{ animationDelay: '0.1s' }}>
        <h1 className="bebas-neue text-6xl md:text-8xl text-white tracking-widest leading-none mb-4">{title}</h1>
        <p className="dm-sans text-[#a0a0a0] max-w-xl">
          {category === 'ensemble'
            ? "Complete looks designed to define your identity. Structural, bold, and entirely uncompromising."
            : category === 'hoodie'
              ? "Heavyweight comfort meets aggressive styling. The foundational pieces of your modern wardrobe."
              : "Explore the complete collection. Redefining the boundaries of modern technical streetwear."}
        </p>
      </div>

      <div className="border-t border-[#1a1a1a] pt-12 animate-[floatUp_0.8s_var(--ease-smooth)_forwards] opacity-0" style={{ animationDelay: '0.3s' }}>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 font-bold uppercase tracking-widest">
            {error}
          </div>
        ) : (
          <>
            <ProductGrid products={products} />
            {products.length === 0 && (
              <div className="flex justify-center py-20 text-[#a0a0a0] dm-sans tracking-widest uppercase">
                No products found in this category.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
