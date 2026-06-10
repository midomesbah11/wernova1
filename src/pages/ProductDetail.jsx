import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Home, Briefcase, MapPin, CheckCircle2, User, Phone as PhoneIcon } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { optimizeCloudinaryUrl } from "../utils/cloudinary";

// Import local products just for the fallback mock
import { products as localProducts } from "../data/products";
import { wilayasData, algeriaData, wilayasList, shippingFees } from "../data/algeriaCities";

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
  const [availableCommunes, setAvailableCommunes] = useState([]);
  const [selectedColor, setSelectedColor] = useState("");

  const wilayasListLocal = Object.keys(wilayasData || {}).sort();

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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "wilaya") {
      setAvailableCommunes(algeriaData[value] || []);
      setFormData(prev => ({ ...prev, baladiya: "" }));
    }
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
      const priceValue = typeof product.price === 'string' ? parseFloat(product.price.replace(/,/g, '')) : product.price;
      
      // Calculate Shipping Surcharge
      let deliverySurcharge = formData.addressType === 'home' ? 600 : 400; // Defaults
      if (formData.wilaya) {
        const feeData = shippingFees[formData.wilaya];
        if (feeData) {
          deliverySurcharge = formData.addressType === 'home' ? (feeData.home || 600) : (feeData.office || 400);
        }
      }

      const totalPrice = priceValue + deliverySurcharge;

      const orderData = {
        full_name: formData.fullName,
        phone: formData.phone,
        wilaya: `${formData.wilaya} - ${wilayasData[formData.wilaya]}`,
        commune: formData.baladiya,
        address: formData.address,
        total: totalPrice,
        items: [
          {
            id: product.id,
            name: product.name,
            size: selectedSize,
            color: selectedColor || (product.colors && product.colors[0]) || "",
            quantity: 1,
            price: priceValue
          }
        ],
        status: 'pending',
        shipping_fee: deliverySurcharge,
        delivery_type: formData.addressType
      };

      const { error } = await supabase
        .from('orders')
        .insert([orderData]);

      if (error) throw error;

      // --- Send Telegram Notification via Secure API ---
      try {
        const itemsText = orderData.items.map(item => 
          `📦 *${item.name}*\n📏 الحجم: ${item.size}${item.color ? `\n🎨 اللون: ${item.color}` : ''}\n🔢 الكمية: ${item.quantity}\n💰 السعر: ${item.price} DA`
        ).join('\n\n');

        const message = `
🔔 *طلب جديد من Wernova! (شراء سريع)*

👤 *العميل:* ${orderData.full_name}
📞 *الهاتف:* \`${orderData.phone}\`

📍 *العنوان:*
- الولاية: ${orderData.wilaya}
- البلدية: ${orderData.commune}
- العنوان: ${orderData.address}
- النوع: ${orderData.delivery_type === 'home' ? '🏠 للمنزل' : '🏢 للمكتب'}

🛒 *المنتجات:*
${itemsText}

----------------------------
🚚 التوصيل: ${orderData.shipping_fee} DA
💵 *المجموع الكلي: ${orderData.total} DA*
----------------------------
        `;

        // Get image from the product
        const productImage = optimizeCloudinaryUrl(product.images?.[0] || product.image_url || product.img || null);

        // Call our internal API
        const apiResponse = await fetch('/api/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, image_url: productImage })
        });

        if (!apiResponse.ok) {
          const errorData = await apiResponse.json();
          console.error("API Telegram Error:", errorData.error);
        }
      } catch (tgError) {
        console.error("Telegram API Request Failed:", tgError);
      }

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
  let deliverySurcharge = formData.addressType === 'home' ? 600 : 400; // Defaults
  if (formData.wilaya && shippingFees[formData.wilaya]) {
    deliverySurcharge = formData.addressType === 'home' 
      ? (shippingFees[formData.wilaya].home || 600) 
      : (shippingFees[formData.wilaya].office || 400);
  }
  const totalPrice = priceValue + deliverySurcharge;

  // Determine available sizes in standard order
  const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const availableSizes = product.sizes_stock 
    ? STANDARD_SIZES.filter(size => parseInt(product.sizes_stock[size] || 0) > 0)
    : STANDARD_SIZES; // Fallback to all if sizes_stock is missing

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 md:pt-24 pb-24 font-['Inter']">
      <div className="max-w-md mx-auto px-4 w-full">

        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[#a0a0a0] hover:text-[#38bdf8] mb-4 md:mb-10 transition-colors py-1 text-xs tracking-widest font-bold uppercase group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          العودة
        </button>

        {/* --- Product Detail Section --- */}
        <div className="flex flex-col animate-[floatUp_0.8s_var(--ease-smooth)_forwards] mb-6 md:mb-10">

          {/* Image Slider */}
          <div className="w-full aspect-square md:aspect-[4/5] max-h-[50vh] bg-[#1a1a1a] border border-white/10 relative overflow-hidden rounded-[24px] mb-4 md:mb-6 group">
            {product.images && product.images.length > 0 ? (
              <>
                <img
                  src={optimizeCloudinaryUrl(product.images[currentImageIndex])}
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
                src={optimizeCloudinaryUrl(product.image_url) || "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=500&q=80"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Product Data */}
          <div className="text-white flex flex-col" dir="rtl">
            <div className="flex justify-between items-center mb-1 md:mb-2">
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight uppercase" dir="ltr">
                {product.name}
              </h1>
              <span className="text-lg md:text-xl text-[#38bdf8] font-extrabold bg-[#38bdf8]/10 px-3 py-1 rounded-full" dir="ltr">
                {priceValue} DA
              </span>
            </div>

            <p className="text-neutral-400 text-xs md:text-sm leading-relaxed mt-0.5 md:mt-1">
              {product.description || "قطعة مميزة بتصميم Streetwear حصري وعصري، مصممة لتمنحك الراحة الكاملة والمظهر المتفرد. اطلبها الآن واستمتع بتجربة الجودة."}
            </p>
          </div>
        </div>

        {/* --- Embedded Checkout Form Component --- */}
        <div className="bg-[#111111] border border-white/10 rounded-[32px] p-4 md:p-8 w-full" dir="rtl">
          <h2 className="text-xl md:text-2xl font-extrabold text-white mb-5 md:mb-8">أكمل طلبك الآن</h2>
          
          <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4 md:gap-6">

            {/* User Info Form */}
            <div className="bg-[#1a1a1a] rounded-[24px] p-4 md:p-6 border border-white/5 flex flex-col gap-3 md:gap-4">
              <h3 className="text-white font-bold mb-1">معلومات التوصيل</h3>

              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  placeholder="الاسم الكامل"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-white text-black font-semibold rounded-[2rem] py-4 px-12 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] placeholder:font-medium placeholder:text-neutral-500"
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              </div>

              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  placeholder="رقم الهاتف"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-white text-black font-semibold rounded-[2rem] py-4 px-12 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] placeholder:font-medium placeholder:text-neutral-500 text-right"
                  dir="ltr"
                />
                <PhoneIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              </div>

                {/* Size Selection inside Checkout Form */}
                <div className="flex flex-col gap-3 mt-2">
                  <span className="text-white font-bold text-sm text-right w-full block">اختر المقاس:</span>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3" dir="ltr">
                    {availableSizes.length > 0 ? (
                      availableSizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`w-14 h-14 rounded-full font-bold text-lg transition-all border-2 flex items-center justify-center ${selectedSize === size
                              ? "bg-[#facc15] border-[#facc15] text-black shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-110"
                              : "bg-white/5 border-white/10 text-white hover:border-[#facc15]/50 hover:bg-white/10"
                            }`}
                        >
                          {size}
                        </button>
                      ))
                    ) : (
                      <div className="col-span-full text-red-400 text-center py-4 bg-red-400/10 rounded-xl font-bold border border-red-400/20" dir="rtl">
                        نفدت جميع المقاسات (SOLD OUT)
                      </div>
                    )}
                  </div>
                </div>

                {/* Color Selection */}
                {product.colors && product.colors.length > 0 && (
                  <div className="flex flex-col gap-4 mt-2">
                    <span className="text-white font-bold text-sm text-right w-full block">اختر اللون:</span>
                    <div className="flex flex-wrap gap-3 justify-end">
                      {(product.variants && product.variants.length > 0 
                        ? product.variants.filter(v => parseInt(v.stock || 0) > 0).map(v => v.color)
                        : (product.colors || [])
                      ).map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`w-10 h-10 rounded-full transition-all border-2 ${selectedColor === color
                              ? "border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                              : "border-white/10 hover:border-white/50"
                            }`}
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={color}
                        />
                      ))}
                    </div>

                    {selectedColor && (
                      <div className="flex flex-col items-center gap-3 mt-2 animate-fade-in">
                        <span className="text-white font-bold text-sm">
                          اللون المختار: اللون {selectedColor}
                        </span>
                        <div 
                          className="w-16 h-16 rounded-full border-4 border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-500"
                          style={{ backgroundColor: selectedColor.toLowerCase() }}
                        />
                      </div>
                    )}
                  </div>
                )}

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
                      {wilayasListLocal.map(code => (
                        <option key={code} value={code}>{code} - {wilayasData[code]}</option>
                      ))}
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
                      disabled={!formData.wilaya || availableCommunes.length === 0}
                      className="w-full bg-white text-black font-semibold rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] appearance-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="" disabled>البلدية</option>
                      {availableCommunes.map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                      ))}
                      {availableCommunes.length === 0 && formData.wilaya && (
                        <option value={wilayasData[formData.wilaya]}>المركز ({wilayasData[formData.wilaya]})</option>
                      )}
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
                    className={`flex-1 flex flex-col justify-center items-center gap-1 py-4 rounded-2xl font-bold transition-all ${formData.addressType === 'home'
                        ? 'bg-[#38bdf8] text-black border-2 border-[#38bdf8]'
                        : 'bg-transparent border-2 border-white/10 text-white hover:border-[#38bdf8]/50'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5" /> المنزل
                    </div>
                    <span className="text-xs opacity-80">
                      {formData.wilaya && shippingFees[formData.wilaya]?.home 
                        ? `${shippingFees[formData.wilaya].home} DA` 
                        : "600 DA"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddressType('office')}
                    className={`flex-1 flex flex-col justify-center items-center gap-1 py-4 rounded-2xl font-bold transition-all ${formData.addressType === 'office'
                        ? 'bg-[#38bdf8] text-black border-2 border-[#38bdf8]'
                        : 'bg-transparent border-2 border-white/10 text-white hover:border-[#38bdf8]/50'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" /> المكتب
                    </div>
                    <span className="text-xs opacity-80">
                      {formData.wilaya && shippingFees[formData.wilaya]?.office 
                        ? `${shippingFees[formData.wilaya].office} DA` 
                        : "400 DA"}
                    </span>
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
                disabled={isSubmitting || !selectedSize}
                className="w-full bg-[#38bdf8] text-[#0a0a0a] font-extrabold text-xl py-6 rounded-[2rem] hover:bg-[#7dd3fc] transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex justify-between items-center px-8 shadow-[0_10px_20px_rgba(56,189,248,0.2)] hover:shadow-[0_15px_30px_rgba(56,189,248,0.4)] active:scale-95"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2 w-full justify-center">
                    <div className="w-6 h-6 border-3 border-black border-r-transparent rounded-full animate-spin"></div>
                    <span>جاري إرسال الطلب...</span>
                  </div>
                ) : (
                  <>
                    <span className="text-lg opacity-80" dir="ltr">{totalPrice} DA</span>
                    <span className="flex-1 text-center">تأكيد الطلب الآن</span>
                    <ArrowLeft className="w-6 h-6 rotate-180" />
                  </>
                )}
              </button>

            </form>
          </div>

      </div>
    </div>
  );
}
