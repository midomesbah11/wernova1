import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, Briefcase, CheckCircle2, ChevronLeft, MapPin } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "../context/CartContext";
import { wilayasData, algeriaData, wilayasList, getShippingFee, shippingFees } from "../data/algeriaCities";

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();

  // States
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    wilaya: "",
    baladiya: "",
    address: "",
    addressType: "home", // home or office
  });

  // const [shippingRates, setShippingRates] = useState([]); // Removed as per request to use local data
  const [availableCommunes, setAvailableCommunes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Removed fetchShippingRates as per request to rely entirely on algeriaCities.js

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "wilaya") {
      // Find communes for this wilaya
      setAvailableCommunes(algeriaData[value] || []);
      // Reset commune when wilaya changes
      setFormData(prev => ({ ...prev, baladiya: "" }));
    }
  };

  const setAddressType = (type) => setFormData({ ...formData, addressType: type });

  // Calculate Product Price
  const productPrice = cartItems.length > 0 ? cartTotal : 4800;

  // Calculate Shipping Surcharge
  let deliverySurcharge = formData.addressType === 'home' ? 600 : 400; // Requested Defaults

  if (formData.wilaya) {
    const feeData = (shippingFees && shippingFees[formData.wilaya]) || null;
    if (feeData) {
      const fee = formData.addressType === 'home' ? feeData.home : feeData.office;
      if (fee !== null && fee !== undefined) {
        deliverySurcharge = fee;
      }
    }
  }

  const totalPrice = productPrice + deliverySurcharge;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderData = {
        full_name: formData.fullName,
        phone: formData.phone,
        wilaya: `${formData.wilaya} - ${wilayasData[formData.wilaya]}`,
        commune: formData.baladiya,
        address: formData.address,
        total: totalPrice,
        items: cartItems.length > 0 ? cartItems : [{ name: "Wearly Piece", size: "M", quantity: 1, price: 4800 }],
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
          `📦 *${item.name}*\n📏 الحجم: ${item.size}\n🔢 الكمية: ${item.quantity}\n💰 السعر: ${item.price} DA`
        ).join('\n\n');

        const message = `
🔔 *طلب جديد من Wernova!*

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

        // Get image from the first item
        const firstItemImage = orderData.items[0]?.images?.[0] || orderData.items[0]?.image_url || orderData.items[0]?.img || null;

        // Call our internal API instead of Telegram directly
        const apiResponse = await fetch('/api/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, image_url: firstItemImage })
        });

        if (!apiResponse.ok) {
          const errorData = await apiResponse.json();
          console.error("API Telegram Error:", errorData.error);
        }
      } catch (tgError) {
        console.error("Telegram API Request Failed:", tgError);
      }

      clearCart();
      setIsSuccess(true);

    } catch (error) {
      console.error("Error submitting order:", error);
      alert("حدث خطأ أثناء إرسال الطلب: " + (error?.message || "الرجاء المحاولة مجدداً."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-white text-center font-['Inter'] relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#38bdf8]/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="bg-[#111111] p-10 md:p-12 rounded-[40px] flex flex-col items-center max-w-md w-full border border-white/10 shadow-2xl relative z-10 animate-[floatUp_0.8s_var(--ease-smooth)]">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-[#38bdf8]/20 blur-2xl rounded-full animate-pulse"></div>
            <div className="relative bg-[#38bdf8] p-5 rounded-full shadow-[0_0_30px_rgba(56,189,248,0.4)]">
              <CheckCircle2 className="w-12 h-12 text-black stroke-[2.5px]" />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tighter">طلبك في الطريق! 🚀</h1>
          
          <p className="text-neutral-400 font-medium leading-relaxed mb-10 text-lg">
            تم تسجيل طلبك بنجاح في أنظمتنا. فريق <span className="text-[#38bdf8] font-bold">Wernova</span> سيتواصل معك هاتفياً خلال الساعات القادمة لتأكيد تفاصيل الشحن.
          </p>
          
          <div className="w-full flex flex-col gap-4">
            <Link
              to="/"
              className="w-full bg-[#38bdf8] text-black font-extrabold py-5 rounded-2xl hover:bg-[#7dd3fc] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_20px_-10px_rgba(56,189,248,0.5)]"
            >
              العودة للتسوق
            </Link>
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Wernova Premium Store</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-['Inter'] pt-20 md:pt-24 pb-24 px-4" dir="rtl">

      {/* Header */}
      <div className="max-w-md mx-auto flex items-center mb-8 w-full relative animate-[floatUp_0.6s_var(--ease-smooth)_forwards]">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute right-0 text-[#a0a0a0] hover:text-white transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-full"
        >
          <ChevronLeft className="w-5 h-5 rotate-180" />
        </button>
        <h1 className="text-xl md:text-2xl font-extrabold text-white text-center w-full uppercase tracking-widest pt-1">إتمام الطلب</h1>
      </div>

      <div className="max-w-md mx-auto w-full animate-[floatUp_0.8s_var(--ease-smooth)_forwards]">
        <div className="bg-[#111111] border border-white/10 rounded-[32px] p-5 md:p-8">
          <h2 className="text-xl md:text-2xl font-extrabold text-white mb-6 md:mb-8">بيانات الاستلام</h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 md:gap-6">

            {/* User Info Form */}
            <div className="bg-[#1a1a1a] rounded-[24px] p-5 md:p-6 border border-white/5 flex flex-col gap-4">
              <h3 className="text-white font-bold mb-1">المعلومات الشخصية</h3>

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
                  {(wilayasList || []).map(code => (
                    <option key={code} value={code}>{code} - {(wilayasData && wilayasData[code]) || "..."}</option>
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
                  className="w-full bg-white text-black font-semibold rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] appearance-none disabled:opacity-50 cursor-pointer"
                >
                  <option value="" disabled>البلدية</option>
                  {availableCommunes.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                  {/* Fallback if user wants to type or if no communes available */}
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
              className="w-full bg-white text-black font-semibold rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] placeholder:font-medium placeholder:text-neutral-500 resize-none"
            />

            <div className="flex gap-4 mt-2">
              <button
                type="button"
                onClick={() => setAddressType('home')}
                className={`flex-1 flex flex-col justify-center items-center gap-1 py-4 rounded-2xl font-bold transition-all ${formData.addressType === 'home'
                    ? 'bg-[#38bdf8] text-black border-2 border-[#38bdf8] shadow-[0_0_15px_rgba(56,189,248,0.3)]'
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
                    ? 'bg-[#38bdf8] text-black border-2 border-[#38bdf8] shadow-[0_0_15px_rgba(56,189,248,0.3)]'
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
                <span className="font-bold text-white" dir="ltr">{productPrice} DA</span>
              </div>
              <div className="flex justify-between items-center">
                <span>سعر التوصيل</span>
                <span className="font-bold text-white" dir="ltr">{deliverySurcharge} DA</span>
              </div>
            </div>

            <hr className="border-white/10 my-4" />

            <div className="flex justify-between items-center text-xl">
              <span className="font-extrabold text-white">المجموع الكلي</span>
              <span className="font-extrabold text-[#38bdf8]" dir="ltr">{totalPrice} DA</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#38bdf8] text-[#0a0a0a] font-extrabold text-xl py-5 rounded-[24px] hover:bg-[#7dd3fc] transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-black border-r-transparent rounded-full animate-spin"></div>
                <span>جاري الإرسال...</span>
              </div>
            ) : 'تأكيد الطلب الآن'}
          </button>

        </form>
      </div>
    </div>
  </div>
  );
}
