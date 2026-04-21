import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, Briefcase, CheckCircle2, ChevronLeft, MapPin } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function Checkout() {
  const navigate = useNavigate();
  
  // States
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    wilaya: "",
    baladiya: "",
    address: "",
    addressType: "home", // home or office
    size: "M"
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Mock product data for standard funnel checkouts
  const productPrice = 4800; // 4800 DA
  const deliverySurcharge = 600; // 600 DA
  const totalPrice = productPrice + deliverySurcharge;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setAddressType = (type) => setFormData({ ...formData, addressType: type });
  const setSize = (size) => setFormData({ ...formData, size });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
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
                name: "Wearly Piece",
                size: formData.size,
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
      
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("حدث خطأ أثناء إرسال الطلب: " + (error?.message || "الرجاء المحاولة مجدداً."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-white text-center font-['Inter']">
        <div className="bg-white/10 p-8 rounded-[32px] flex flex-col items-center max-w-sm w-full border border-white/10">
          <CheckCircle2 className="w-20 h-20 text-[#38bdf8] mb-6" />
          <h1 className="text-3xl font-extrabold mb-4">شكراً لطلبك!</h1>
          <p className="text-neutral-300 font-medium leading-relaxed mb-8">
            تم استلام طلبك بنجاح، فريقنا سيقوم بالاتصال بك لتأكيد الطلب قريباً.
          </p>
          <Link 
            to="/" 
            className="w-full bg-[#38bdf8] text-black font-extrabold py-4 rounded-2xl hover:bg-[#7dd3fc] transition-colors"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-['Inter'] pb-20 pt-8 px-4" dir="rtl">
      
      {/* Header */}
      <div className="max-w-md mx-auto flex items-center mb-10 w-full relative">
        <button onClick={() => navigate(-1)} className="absolute right-0 text-white p-2 bg-white/5 rounded-full">
          <ChevronLeft className="w-5 h-5 rotate-180" />
        </button>
        <h1 className="text-2xl font-extrabold text-white text-center w-full uppercase tracking-widest">إتمام الطلب</h1>
      </div>

      <div className="max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Sizes Selection */}
          <div className="bg-[#1a1a1a] rounded-[24px] p-6 border border-white/5">
            <h3 className="text-white font-bold mb-4 font-['Bebas_Neue'] tracking-wider text-xl uppercase text-left" dir="ltr">Select Size</h3>
            <div className="flex gap-4 justify-center" dir="ltr">
              {['S', 'M', 'L', 'XL'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`w-14 h-14 rounded-full font-bold text-lg transition-all border-2 ${
                    formData.size === s 
                      ? 'bg-[#f59e0b] border-[#f59e0b] text-black' 
                      : 'bg-transparent border-white/20 text-white hover:border-[#f59e0b]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

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

            <div className="flex gap-4">
              <div className="relative w-1/2">
                <select 
                  name="wilaya" 
                  value={formData.wilaya}
                  onChange={handleChange}
                  required
                  className="w-full bg-white text-black font-semibold rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] appearance-none"
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
                  className="w-full bg-white text-black font-semibold rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] appearance-none"
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
              className="w-full bg-white text-black font-semibold rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] placeholder:font-medium placeholder:text-neutral-500 resize-none"
            />

            <div className="flex gap-4 mt-2">
              <button
                type="button"
                onClick={() => setAddressType('home')}
                className={`flex-1 flex justify-center items-center gap-2 py-4 rounded-2xl font-bold transition-colors ${
                  formData.addressType === 'home' 
                    ? 'bg-[#38bdf8] text-black' 
                    : 'bg-transparent border-2 border-white/10 text-white'
                }`}
              >
                <Home className="w-4 h-4" /> المنزل
              </button>
              <button
                type="button"
                onClick={() => setAddressType('office')}
                className={`flex-1 flex justify-center items-center gap-2 py-4 rounded-2xl font-bold transition-colors ${
                  formData.addressType === 'office' 
                    ? 'bg-[#38bdf8] text-black' 
                    : 'bg-transparent border-2 border-white/10 text-white'
                }`}
              >
                <Briefcase className="w-4 h-4" /> المكتب
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
              <span className="font-extrabold text-white">المجموع الإجمالي</span>
              <span className="font-extrabold text-[#38bdf8]" dir="ltr">{totalPrice} DA</span>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#38bdf8] text-[#0a0a0a] font-extrabold text-xl py-5 rounded-[24px] hover:bg-[#7dd3fc] transition-colors mt-4 disabled:opacity-70 disabled:hover:bg-[#38bdf8]"
          >
            {isSubmitting ? 'جاري الإرسال (Processing)...' : 'إتمام الطلب الآن'}
          </button>
          
        </form>
      </div>

    </div>
  );
}
