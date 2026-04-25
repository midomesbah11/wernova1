import { Link } from "react-router-dom";
import { Phone, Truck, Shield, Check, MessageSquare } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#050505] border-t border-[#1a1a1a] pt-16 pb-8 px-4 md:px-8 mt-24">
      {/* Features / Trust Badges Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
        <div className="flex flex-col items-center text-center group">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Phone className="w-7 h-7 text-blue-500" />
          </div>
          <h4 className="text-white font-bold text-sm mb-1">خدمة العملاء</h4>
          <p className="text-neutral-500 text-xs">متاحون 24/7 للرد عليك</p>
        </div>

        <div className="flex flex-col items-center text-center group">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
          </div>
          <h4 className="text-white font-bold text-sm mb-1">الدفع عند الاستلام</h4>
          <p className="text-neutral-500 text-xs">ادفع فقط عند استلام طلبك</p>
        </div>

        <div className="flex flex-col items-center text-center group">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Truck className="w-7 h-7 text-blue-500" />
          </div>
          <h4 className="text-white font-bold text-sm mb-1">توصيل سريع</h4>
          <p className="text-neutral-500 text-xs">لباب منزلك في أسرع وقت</p>
        </div>

        <div className="flex flex-col items-center text-center group">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Shield className="w-7 h-7 text-blue-500" />
          </div>
          <h4 className="text-white font-bold text-sm mb-1">ضمان الجودة</h4>
          <p className="text-neutral-500 text-xs">منتجات أصلية بجودة عالية</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-6 mb-16 border-t border-white/5 pt-16">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 100 100" fill="none" stroke="#3b82f6" strokeWidth="4">
            <path d="M 10 30 L 30 80 L 50 40 L 70 80 L 90 30" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 30 30 L 50 80 L 70 30" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="bebas-neue text-4xl text-white tracking-[0.15em] pt-1">WERNOVA</span>
        </Link>
        <p className="dm-sans text-neutral-500 text-sm leading-relaxed max-w-md">
          تعريف جديد لملابس الشارع التقنية. مصممة للبيئة الحضرية الحديثة، بلمسة عصرية تتحدى التقاليد.
        </p>
        <div className="flex gap-4 mt-2">
          <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-blue-500 hover:border-blue-500 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
          </a>
          <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-blue-500 hover:border-blue-500 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
          </a>
          <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-blue-500 hover:border-blue-500 transition-all font-bold">
            <span className="text-[10px] uppercase">TikTok</span>
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto border-t border-white/5 flex flex-col md:flex-row justify-between items-center pt-8 gap-4">
        <p className="text-neutral-600 text-xs uppercase tracking-widest text-center">
          &copy; {new Date().getFullYear()} WERNOVA STORE. All Rights Reserved.
        </p>
        <p className="text-neutral-500 text-xs">
          تم التطوير بواسطة <span className="text-blue-500 font-bold">MBH</span>
        </p>
      </div>
    </footer>
  );
}
