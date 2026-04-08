"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FullPageLoader } from "@/components/loader";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Car,
  FileSearch,
  CreditCard,
  Star,
  Phone,
  Headphones,
  Lock,
  Loader2,
} from "lucide-react";

const companies = [
  { name: "تكافل الراجحي", img: "https://github.com/user-attachments/assets/d37d419c-08bf-4211-b20c-7c881c9086d0" },
  { name: "بروج للتأمين", img: "https://github.com/user-attachments/assets/5c2327a9-53e2-49e9-abb4-9c3e97133e70" },
  { name: "الدرع العربي", img: "https://github.com/user-attachments/assets/0fcd7bf3-faad-4244-bc40-e3e84e6b3483" },
  { name: "أسيج", img: "https://github.com/user-attachments/assets/a38f8c3f-da24-493f-9bb6-ad98f87bca2d" },
  { name: "ميدغلف", img: "https://github.com/user-attachments/assets/c1460f50-66f7-418f-8a41-0a71da6ebc48" },
  { name: "الصقر للتأمين", img: "https://github.com/user-attachments/assets/bb3e4fcf-9bca-429e-9c5b-e39e75fa94e0" },
  { name: "AXA", img: "https://github.com/user-attachments/assets/6ffa5f3d-c1d0-458a-b6cc-2b16b426f5e9" },
  { name: "التعاونية", img: "https://github.com/user-attachments/assets/ba6cba27-a213-4117-a7e3-cf00a1f2b1e4" },
  { name: "سلامة", img: "https://github.com/user-attachments/assets/c3a72e01-29b4-4f5e-ab22-9f21a3b44f25" },
  { name: "ولاء للتأمين", img: "https://github.com/user-attachments/assets/fb55a0a7-9ddd-4ce4-b46e-43e1439fe01a" },
];

const steps = [
  {
    icon: <Car className="w-7 h-7 text-[#1976d2]" />,
    title: "أدخل بيانات المركبة",
    desc: "رقم الهوية ونوع المركبة فقط",
  },
  {
    icon: <FileSearch className="w-7 h-7 text-[#1976d2]" />,
    title: "قارن العروض",
    desc: "عروض فورية من أكثر من 20 شركة",
  },
  {
    icon: <CreditCard className="w-7 h-7 text-[#1976d2]" />,
    title: "اشترِ وثيقتك",
    desc: "ادفع إلكترونيًا واستلم فورًا",
  },
];

const features = [
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "شركات تأمين معتمدة",
    desc: "جميع الشركات مرخصة من البنك المركزي السعودي",
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "إصدار فوري",
    desc: "وثيقتك جاهزة خلال دقائق بعد الدفع",
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "دفع آمن 100%",
    desc: "بوابة دفع مشفرة بأعلى معايير الأمان",
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "أفضل الأسعار",
    desc: "خصومات حصرية تصل إلى 40%",
  },
  {
    icon: <Headphones className="w-6 h-6" />,
    title: "دعم فني متواصل",
    desc: "فريق دعم متخصص على مدار الساعة",
  },
  {
    icon: <Phone className="w-6 h-6" />,
    title: "ربط مباشر مع أبشر",
    desc: "تحقق فوري من بيانات المركبة والمالك",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  const goToForm = () => {
    setNavigating(true);
    router.push("/home-new");
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {navigating && <FullPageLoader />}
      {/* ── Header ──────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/tameeni-logo.webp" alt="تأميني" className="w-9 h-9 rounded-lg" />
            <span className="text-base font-black text-[#1a2742]">تأميني</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
            <span className="cursor-pointer hover:text-[#1976d2] transition-colors">تأمين السيارات</span>
            <span className="cursor-pointer hover:text-[#1976d2] transition-colors">تأمين المركبات</span>
            <span className="cursor-pointer hover:text-[#1976d2] transition-colors">غير ملزم بالشراء</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-400 cursor-pointer">EN</span>
            <button
              onClick={goToForm}
              disabled={navigating}
              className="bg-[#1976d2] hover:bg-[#1565c0] text-white text-xs font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-70"
            >
              {navigating ? <Loader2 className="w-4 h-4 animate-spin" /> : "ابدأ الآن"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────── */}
      <section className="bg-gradient-to-b from-[#f0f7ff] to-white">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
          <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-4">
            {/* Image — left side in RTL */}
            <div className="flex-1 flex justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[240px] h-[240px] md:w-[340px] md:h-[340px] rounded-3xl bg-[#e3f0fc] rotate-6" />
              </div>
              <img
                src="/motor-hero.webp"
                alt="تأمين المركبات"
                className="relative z-10 w-[260px] md:w-[380px]"
              />
            </div>

            {/* Text — right side in RTL */}
            <div className="flex-1 text-center md:text-right space-y-5">
              <h1 className="text-[26px] md:text-[38px] font-black text-[#1a2742] leading-[1.3]">
                أول منصة لتأمين السيارات في<br />السعودية
              </h1>
              <p className="text-[13px] md:text-[15px] text-[#7b8fa1] leading-relaxed max-w-[400px] md:mr-0 mx-auto">
                نوفر لك مقارنة بطاقات التأمين — غير ملزم بالشراء، المقارنة والشراء من الجوال
              </p>
              <div>
                <button
                  onClick={goToForm}
                  disabled={navigating}
                  className="inline-flex items-center justify-center gap-2 bg-[#43a047] hover:bg-[#388e3c] text-white font-bold text-[14px] px-10 py-3.5 rounded-full transition-all shadow-md shadow-green-200/50 disabled:opacity-70"
                >
                  ابدأ الآن
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1">
                {[
                  "غير ملزم بالشراء",
                  "المقارنة والشراء من الجوال",
                ].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 text-[11px] text-[#94a8b8]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#43a047]" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Partners ────────────────────────────── */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">شركاؤنا في التأمين</p>
          <div className="flex flex-wrap items-center justify-center gap-5 md:gap-8">
            {companies.map((c) => (
              <img key={c.name} src={c.img} alt={c.name} className="h-10 md:h-12 object-contain grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300" />
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────── */}
      <section className="py-16 bg-[#f4f6f9]">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a2742] text-center mb-2">كيف تعمل الخدمة؟</h2>
          <p className="text-gray-500 text-center mb-10">ثلاث خطوات بسيطة للحصول على تأمينك</p>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="relative bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="absolute -top-3 right-4 bg-[#1976d2] text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-black">{i + 1}</div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">{s.icon}</div>
                <h3 className="text-base font-bold text-[#1a2742] mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a2742] text-center mb-2">لماذا تأميني؟</h2>
          <p className="text-gray-500 text-center mb-10">منصة موثوقة ومعتمدة لتأمين المركبات في السعودية</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-blue-50 text-[#1976d2] flex items-center justify-center">{f.icon}</div>
                <div>
                  <h3 className="text-sm font-bold text-[#1a2742] mb-0.5">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Promo Banner ──────────────────────── */}
      <section className="py-14 bg-gradient-to-l from-[#1565c0] to-[#1976d2] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1 mb-4">
            <span className="text-yellow-300 font-black text-sm">عرض محدود</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black mb-2">خصم يصل إلى <span className="text-yellow-300">40%</span></h2>
          <p className="text-blue-100 mb-8 text-base">على جميع وثائق التأمين — لفترة محدودة فقط</p>
          <button
            onClick={goToForm}
            disabled={navigating}
            className="inline-flex items-center gap-2 bg-white text-[#1565c0] font-black text-base px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-lg disabled:opacity-70"
          >
            احصل على العرض
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ── Trust badges ────────────────────────── */}
      <section className="py-12 bg-[#f4f6f9]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              { img: "/nafad-logo-new.png", label: "النفاذ الوطني" },
              { img: "/NIC-logo.png", label: "هيئة التأمين" },
              { img: "/vision2030-grey.svg", label: "رؤية 2030" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow-sm border border-gray-100">
                <img src={b.img} alt={b.label} className="h-7 object-contain" />
                <span className="text-xs font-medium text-gray-500">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-lg mx-auto px-4 text-center">
          <h2 className="text-2xl font-black text-[#1a2742] mb-3">جاهز لتأمين مركبتك؟</h2>
          <p className="text-gray-500 text-sm mb-6">ابدأ الآن واحصل على أفضل سعر من أكثر من 20 شركة تأمين معتمدة</p>
          <button
            onClick={goToForm}
            disabled={navigating}
            className="inline-flex items-center justify-center gap-2 w-full bg-[#1976d2] hover:bg-[#1565c0] text-white font-black text-base px-8 py-4 rounded-2xl transition-all shadow-lg shadow-blue-200/50 disabled:opacity-70"
          >
            ابدأ المقارنة مجانًا
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> مجاني</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> بدون التزام</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> نتائج فورية</span>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────── */}
      <footer className="bg-[#1a2742] text-white py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <img src="/tameeni-logo.webp" alt="تأميني" className="w-9 h-9 rounded-xl" />
              <div>
                <span className="text-base font-black">تأميني</span>
                <p className="text-xs text-gray-400">منصة مقارنة التأمين الأولى في السعودية</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <img src="/mada.jpg" alt="مدى" className="h-6 rounded opacity-70" />
              <img src="/visa.svg" alt="فيزا" className="h-5 opacity-70" />
              <img src="/mas.svg" alt="ماستركارد" className="h-6 opacity-70" />
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-gray-500">© {new Date().getFullYear()} تأميني — جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
