import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Home, Briefcase, MapPin, CheckCircle2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

// Import local products just for the fallback mock
import { products as localProducts } from "../data/products";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Product States
  const [product, setProduct] = useState(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");

  // Checkout Form States
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    wilaya: "",
    baladiya: "",
    address: "",
    addressType: "home",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();

    // Subscribe to product updates (specifically stock changes)
    if (id) {
      const subscription = supabase
        .channel(`detail_product_${id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products', filter: `id=eq.${id}` }, payload => {
          setProduct(payload.new);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [id]);

  useEffect(() => {
    if (!product || !product.images || product.images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [product]);

  const fetchProduct = async () => {
    setIsLoadingProduct(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setProduct(data);
      if (data?.sizes && Object.keys(data.sizes).length > 0) {
        setSelectedSize(Object.keys(data.sizes)[0]);
      }

    } catch (error) {
      console.error("Error fetching product:", error);
      // Fallback to local data for demo if Supabase fails or record not found
      const found = localProducts.find(p => p.id === parseInt(id)) || localProducts[0];
      setProduct(found);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const setAddressType = (type) => setFormData({ ...formData, addressType: type });

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSize) {
      alert("الرجاء اختيار المقاس أولاً.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate derived total
      const priceValue = typeof product.price === 'string' ? parseFloat(product.price.replace(/,/g, '')) : product.price;
      const deliverySurcharge = 600;
      const totalPrice = priceValue + deliverySurcharge;

      const { error } = await supabase
        .from('orders')
        .insert([
          {
            full_name: formData.fullName,
            phone: formData.phone,
            wilaya: formData.wilaya,
            commune: formData.baladiya,
            address: formData.address,
            total: totalPrice,
            items: [
              {
                id: typeof product.id === 'string' ? product.id : null,
                name: product.name,
                size: selectedSize,
                quantity: 1
              }
            ],
            status: 'pending',
            shipping_fee: deliverySurcharge,
            delivery_type: formData.addressType
          }
        ]);

      if (error) throw error;

      setIsSuccess(true);
      window.scrollTo(0, 0);

    } catch (error) {
      console.error("Error submitting order:", error);
      alert("حدث خطأ أثناء إرسال الطلب: " + (error?.message || "الرجاء المحاولة مجدداً."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] pt-32 pb-24 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#38bdf8] border-r-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] pt-32 pb-24 flex flex-col items-center justify-center">
        <h2 className="bebas-neue text-4xl text-white mb-4">PRODUCT NOT FOUND</h2>
        <button onClick={() => navigate('/products')} className="text-[#a0a0a0] hover:text-white underline dm-sans">
          Return to Products
        </button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-white text-center font-['Inter'] pt-24" dir="rtl">
        <div className="bg-white/10 p-8 rounded-[32px] flex flex-col items-center max-w-sm w-full border border-white/10">
          <CheckCircle2 className="w-20 h-20 text-[#38bdf8] mb-6" />
          <h1 className="text-3xl font-extrabold mb-4">شكراً لطلبك!</h1>
          <p className="text-neutral-300 font-medium leading-relaxed mb-8">
            تم استلام طلبك لمنتج "{product.name}" بنجاح، وسنقوم بالاتصال بك للتأكيد.
          </p>
          <Link
            to="/products"
            className="w-full bg-[#38bdf8] text-black font-extrabold py-4 rounded-2xl hover:bg-[#7dd3fc] transition-colors"
          >
            تصفح المزيد من المنتجات
          </Link>
        </div>
      </div>
    );
  }

  // Derive price logic for presentation
  const priceValue = typeof product.price === 'string' ? parseFloat(product.price.replace(/,/g, '')) : product.price;
  const deliverySurcharge = 600;
  const totalPrice = priceValue + deliverySurcharge;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-24 font-['Inter']">
      <div className="max-w-md mx-auto px-4 w-full">

        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#a0a0a0] hover:text-[#38bdf8] mb-10 transition-colors py-2 text-sm tracking-widest font-bold uppercase group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          العودة
        </button>

        {/* --- Product Detail Section --- */}
        <div className="flex flex-col animate-[floatUp_0.8s_var(--ease-smooth)_forwards] mb-10">

          {/* Image Slider */}
          <div className="w-full aspect-[4/5] bg-[#1a1a1a] border border-white/10 relative overflow-hidden rounded-[24px] mb-6 group">
            {product.images && product.images.length > 0 ? (
              <>
                <img
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />

                {/* Navigation Dots */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                    {product.images.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`h-2 rounded-full transition-all ${currentImageIndex === idx ? "bg-[#38bdf8] w-6" : "bg-white/50 hover:bg-white w-2"
                          }`}
                      ></button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <img
                src={product.image_url || "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=500&q=80"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Product Data */}
          <div className="text-white flex flex-col" dir="rtl">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-extrabold tracking-tight uppercase" dir="ltr">
                {product.name}
              </h1>
              <span className="text-xl text-[#38bdf8] font-extrabold bg-[#38bdf8]/10 px-3 py-1 rounded-full" dir="ltr">
                {priceValue} DA
              </span>
            </div>

            <p className="text-neutral-400 text-sm leading-relaxed mt-1">
              {product.description || "قطعة مميزة بتصميم Streetwear حصري وعصري، مصممة لتمنحك الراحة الكاملة والمظهر المتفرد. اطلبها الآن واستمتع بتجربة الجودة."}
            </p>
          </div>
        </div>

        {/* --- Embedded Checkout Form Component --- */}
        <div className="bg-[#111111] border border-white/10 rounded-[32px] p-5 md:p-8 w-full" dir="rtl">
          <h2 className="text-2xl font-extrabold text-white mb-8">أكمل طلبك الآن</h2>
          
          <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-6">

            {/* User Info Form */}
            <div className="bg-[#1a1a1a] rounded-[24px] p-6 border border-white/5 flex flex-col gap-4">
              <h3 className="text-white font-bold mb-2">معلومات التوصيل</h3>

              <input
                type="text"
                  name="fullName"
                  placeholder="الاسم الكامل"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-white text-black font-semibold rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] placeholder:font-medium placeholder:text-neutral-500"
                />

                <input
                  type="tel"
                  name="phone"
                  placeholder="رقم الهاتف"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-white text-black font-semibold rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] placeholder:font-medium placeholder:text-neutral-500 text-right"
                />

                {/* Size Selection inside Checkout Form */}
                <div className="flex flex-col gap-3 mt-2">
                  <span className="text-white font-bold text-sm text-right w-full block">اختر المقاس:</span>
                  <div className="flex flex-wrap gap-3 justify-end">
                    {['XXL', 'XL', 'L', 'M', 'S'].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`w-14 h-14 rounded-xl font-bold text-lg transition-all border-2 flex items-center justify-center ${selectedSize === size
                            ? "bg-[#38bdf8] border-[#38bdf8] text-black shadow-[0_0_15px_rgba(56,189,248,0.5)]"
                            : "bg-white/5 border-white/10 text-white hover:border-[#38bdf8]/50 hover:bg-white/10"
                          }`}
                        dir="ltr"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="relative w-1/2">
                    <select
                      name="wilaya"
                      value={formData.wilaya}
                      onChange={handleChange}
                      required
                      className="w-full bg-white text-black font-semibold rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] appearance-none cursor-pointer"
                    >
                      <option value="" disabled>الولاية</option>
                      <option value="Alger">الجزائر (16)</option>
                      <option value="Oran">وهران (31)</option>
                      <option value="Blida">البليدة (09)</option>
                      <option value="Tipaza">تيبازة (42)</option>
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <MapPin className="w-5 h-5 text-neutral-400" />
                    </div>
                  </div>

                  <div className="relative w-1/2">
                    <select
                      name="baladiya"
                      value={formData.baladiya}
                      onChange={handleChange}
                      required
                      className="w-full bg-white text-black font-semibold rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] appearance-none cursor-pointer"
                    >
                      <option value="" disabled>البلدية</option>
                      <option value="Centre">المركز</option>
                      <option value="Est">الشرق</option>
                      <option value="Ouest">الغرب</option>
                    </select>
                  </div>
                </div>

                <textarea
                  name="address"
                  placeholder="العنوان بالتفصيل (الحي، الشارع...)"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  className="w-full bg-white text-black font-semibold rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] placeholder:font-medium placeholder:text-neutral-500 resize-none mt-2"
                />

                <div className="flex gap-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setAddressType('home')}
                    className={`flex-1 flex justify-center items-center gap-2 py-4 rounded-2xl font-bold transition-colors ${formData.addressType === 'home'
                        ? 'bg-[#38bdf8] text-black'
                        : 'bg-transparent border-2 border-white/10 text-white hover:border-[#38bdf8]/50'
                      }`}
                  >
                    <Home className="w-5 h-5" /> المنزل
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddressType('office')}
                    className={`flex-1 flex justify-center items-center gap-2 py-4 rounded-2xl font-bold transition-colors ${formData.addressType === 'office'
                        ? 'bg-[#38bdf8] text-black'
                        : 'bg-transparent border-2 border-white/10 text-white hover:border-[#38bdf8]/50'
                      }`}
                  >
                    <Briefcase className="w-5 h-5" /> المكتب
                  </button>
                </div>
              </div>

              {/* Cart Summary */}
              <div className="bg-[#1a1a1a] rounded-[24px] p-6 border border-white/5">
                <h3 className="text-white font-bold mb-4">ملخص الطلب</h3>
                <div className="flex flex-col gap-3 font-medium text-neutral-300">
                  <div className="flex justify-between items-center">
                    <span>سعر المنتج</span>
                    <span className="font-bold text-white" dir="ltr">{priceValue} DA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>سعر التوصيل</span>
                    <span className="font-bold text-white" dir="ltr">{deliverySurcharge} DA</span>
                  </div>
                </div>

                <hr className="border-white/10 my-4" />

                <div className="flex justify-between items-center text-xl">
                  <span className="font-extrabold text-white">المجموع الإجمالي</span>
                  <span className="font-extrabold text-[#38bdf8]" dir="ltr">{totalPrice} DA</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#38bdf8] text-[#0a0a0a] font-extrabold text-xl py-5 rounded-[24px] hover:bg-[#7dd3fc] transition-colors mt-4 disabled:opacity-70 flex justify-center items-center"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-black border-r-transparent rounded-full animate-spin"></div>
                    <span>جاري الإرسال...</span>
                  </div>
                ) : 'إتمام الطلب الآن'}
              </button>

            </form>
          </div>

      </div>
    </div>
  );
}
