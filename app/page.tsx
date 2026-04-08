"use client";

import Link from "next/link";
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
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* ── Header ──────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/tameeni-logo.webp" alt="تأميني" className="w-10 h-10 rounded-xl" />
            <span className="text-lg font-black text-[#1a2742]">تأميني</span>
          </div>
          <Link
            href="/home-new"
            className="bg-[#1976d2] hover:bg-[#1565c0] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
          >
            ابدأ الآن
          </Link>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-[#0d47a1] via-[#1565c0] to-[#1976d2] text-white">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative max-w-6xl mx-auto px-4 py-14 md:py-20">
          <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12">
            {/* Image — on left in RTL */}
            <div className="flex-1 flex justify-center md:justify-start">
              <img
                src="/motor-hero.webp"
                alt="تأمين المركبات"
                className="w-[280px] md:w-[400px] drop-shadow-2xl"
              />
            </div>

            {/* Text — on right in RTL */}
            <div className="flex-1 text-center md:text-right">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-medium text-blue-100">أكثر من 100,000 وثيقة صدرت هذا الشهر</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4">
                أمّن مركبتك بأفضل سعر<br />
                <span className="text-yellow-300">في أقل من 3 دقائق</span>
              </h1>
              <p className="text-base md:text-lg text-blue-100 max-w-xl mb-7 leading-relaxed">
                قارن عروض أكثر من 20 شركة تأمين معتمدة واحصل على وثيقتك فورًا.
                خصومات حصرية تصل إلى 40%.
              </p>
              <div className="flex flex-col sm:flex-row items-center md:items-start gap-3">
                <Link
                  href="/home-new"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#1565c0] font-black text-base px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-lg shadow-black/10"
                >
                  قارن الأسعار الآن
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-1.5 text-blue-200 text-sm py-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>مجاني بالكامل — بدون أي التزام</span>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-3 gap-4 max-w-sm md:max-w-md">
                {[
                  { val: "+20", label: "شركة تأمين" },
                  { val: "3 دقائق", label: "وقت المقارنة" },
                  { val: "40%", label: "خصم يصل إلى" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-2xl md:text-3xl font-black text-white">{s.val}</p>
                    <p className="text-xs text-blue-200 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
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
          <Link
            href="/home-new"
            className="inline-flex items-center gap-2 bg-white text-[#1565c0] font-black text-base px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-lg"
          >
            احصل على العرض
            <ArrowLeft className="w-5 h-5" />
          </Link>
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
          <Link
            href="/home-new"
            className="inline-flex items-center justify-center gap-2 w-full bg-[#1976d2] hover:bg-[#1565c0] text-white font-black text-base px-8 py-4 rounded-2xl transition-all shadow-lg shadow-blue-200/50"
          >
            ابدأ المقارنة مجانًا
            <ArrowLeft className="w-5 h-5" />
          </Link>
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
