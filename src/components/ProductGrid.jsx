import ProductCard from "./ProductCard";

export default function ProductGrid({ products, title }) {
  if (!products?.length) {
    return null;
  }

  return (
    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
      {title && (
        <div className="flex justify-between items-end mb-10">
          <h2 className="bebas-neue text-4xl md:text-5xl text-white">{title}</h2>
          <span className="dm-sans text-sm text-[#a0a0a0] uppercase tracking-widest hidden md:block">
            {products.length} {products.length === 1 ? 'ITEM' : 'ITEMS'}
          </span>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 gap-y-12">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
