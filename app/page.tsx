"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Headphones,
  Lock,
  Loader2,
  Sparkles,
  ChevronLeft,
  Zap,
} from "lucide-react";

const companies = [
  { name: "تكافل الراجحي", img: "/companies/company-1.png" },
  { name: "بروج للتأمين", img: "/companies/company-2.png" },
  { name: "الدرع العربي", img: "/companies/company-3.png" },
  { name: "أسيج", img: "/companies/company-4.png" },
  { name: "ميدغلف", img: "/companies/company-5.png" },
  { name: "الصقر للتأمين", img: "/companies/company-6.png" },
  { name: "AXA", img: "/companies/company-7.png" },
  { name: "التعاونية", img: "/companies/company-8.png" },
  { name: "سلامة", img: "/companies/company-9.png" },
  { name: "ولاء للتأمين", img: "/companies/company-10.png" },
  { name: "الأهلية", img: "/companies/company-11.png" },
];

const steps = [
  {
    num: "01",
    icon: <Car className="w-6 h-6" />,
    title: "أدخل بيانات المركبة",
    desc: "رقم الهوية ونوع المركبة فقط",
    color: "from-blue-500 to-blue-600",
  },
  {
    num: "02",
    icon: <FileSearch className="w-6 h-6" />,
    title: "قارن العروض",
    desc: "عروض فورية من أكثر من 20 شركة",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    num: "03",
    icon: <CreditCard className="w-6 h-6" />,
    title: "اشترِ وثيقتك",
    desc: "ادفع إلكترونيًا واستلم فورًا",
    color: "from-violet-500 to-violet-600",
  },
];

const features = [
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "شركات تأمين معتمدة",
    desc: "جميع الشركات مرخصة من البنك المركزي السعودي",
    accent: "bg-blue-500",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "إصدار فوري",
    desc: "وثيقتك جاهزة خلال دقائق بعد الدفع",
    accent: "bg-emerald-500",
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: "دفع آمن 100%",
    desc: "بوابة دفع مشفرة بأعلى معايير الأمان",
    accent: "bg-amber-500",
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: "أفضل الأسعار",
    desc: "خصومات حصرية تصل إلى 40%",
    accent: "bg-rose-500",
  },
  {
    icon: <Headphones className="w-5 h-5" />,
    title: "دعم فني متواصل",
    desc: "فريق دعم متخصص على مدار الساعة",
    accent: "bg-cyan-500",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "ربط مباشر مع أبشر",
    desc: "تحقق فوري من بيانات المركبة والمالك",
    accent: "bg-violet-500",
  },
];

const stats = [
  { val: "+20", label: "شركة تأمين", suffix: "" },
  { val: "100", label: "وثيقة صدرت", suffix: "K+" },
  { val: "40", label: "خصم يصل إلى", suffix: "%" },
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

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100/80">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/tameeni-logo.webp" alt="تأميني" className="w-9 h-9 rounded-xl" />
            <span className="text-base font-black text-[#1a2742]">تأميني</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-gray-400">
            <span className="cursor-pointer hover:text-[#1976d2] transition-colors">تأمين السيارات</span>
            <span className="cursor-pointer hover:text-[#1976d2] transition-colors">تأمين المركبات</span>
            <span className="cursor-pointer hover:text-[#1976d2] transition-colors">غير ملزم بالشراء</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">EN</span>
            <button
              onClick={goToForm}
              disabled={navigating}
              className="bg-[#1976d2] hover:bg-[#1565c0] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-70 shadow-sm shadow-blue-200/50"
            >
              {navigating ? <Loader2 className="w-4 h-4 animate-spin" /> : "ابدأ الآن"}
            </button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-[#f0f7ff] via-[#f8fbff] to-white" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-indigo-200/15 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 py-14 md:py-24">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-6">
            <div className="flex-1 flex justify-center relative order-1 md:order-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[220px] h-[220px] md:w-[320px] md:h-[320px] rounded-[2rem] bg-gradient-to-br from-[#d6eaff] to-[#e8f4ff] rotate-6 shadow-lg shadow-blue-100/50" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[200px] h-[200px] md:w-[280px] md:h-[280px] rounded-[2rem] bg-gradient-to-br from-[#e0f0ff] to-[#f0f8ff] -rotate-3" />
              </div>
              <img
                src="/motor-hero.webp"
                alt="تأمين المركبات"
                className="relative z-10 w-[260px] md:w-[380px] drop-shadow-xl"
              />
            </div>

            <div className="flex-1 text-center md:text-right space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#1976d2]" />
                <span className="text-[12px] font-semibold text-[#1976d2]">أسرع منصة تأمين في السعودية</span>
              </div>

              <h1 className="text-[28px] md:text-[42px] font-black text-[#1a2742] leading-[1.25] tracking-tight">
                أول منصة لتأمين السيارات في
                <span className="relative">
                  <span className="relative z-10"> السعودية</span>
                  <span className="absolute bottom-1 right-0 left-0 h-3 bg-blue-200/40 rounded-sm -z-0" />
                </span>
              </h1>

              <p className="text-[14px] md:text-[15px] text-[#7b8fa1] leading-[1.8] max-w-[420px] md:mr-0 mx-auto">
                نوفر لك مقارنة شاملة لبطاقات التأمين من أفضل الشركات المعتمدة — غير ملزم بالشراء، المقارنة والشراء من الجوال بكل سهولة
              </p>

              <div className="flex flex-col sm:flex-row items-center md:items-start gap-3">
                <button
                  onClick={goToForm}
                  disabled={navigating}
                  className="group inline-flex items-center justify-center gap-2.5 bg-[#1976d2] hover:bg-[#1565c0] text-white font-bold text-[14px] px-10 py-4 rounded-xl transition-all shadow-lg shadow-blue-300/30 hover:shadow-blue-300/50 hover:-translate-y-0.5 disabled:opacity-70"
                >
                  ابدأ الآن
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </button>
                <div className="flex items-center gap-1.5 text-[12px] text-[#94a8b8] py-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>مجاني بالكامل — بدون أي التزام</span>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-5 pt-2">
                {["غير ملزم بالشراء", "المقارنة من الجوال", "إصدار فوري"].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 text-[11px] text-[#8fa3b5]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 bg-white relative">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-center text-[11px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-8">شركاؤنا في التأمين</p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {companies.map((c) => (
              <img key={c.name} src={c.img} alt={c.name} className="h-8 md:h-11 object-contain opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-105" />
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 bg-gradient-to-b from-white to-[#f8fafc]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center py-6">
                <p className="text-3xl md:text-4xl font-black text-[#1976d2]">{s.val}<span className="text-lg">{s.suffix}</span></p>
                <p className="text-[12px] text-gray-400 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block text-[11px] font-bold text-[#1976d2] bg-blue-50 rounded-full px-4 py-1.5 mb-4 tracking-wide">خطوات بسيطة</span>
            <h2 className="text-[24px] md:text-[32px] font-black text-[#1a2742]">كيف تعمل الخدمة؟</h2>
            <p className="text-[13px] text-gray-400 mt-2">ثلاث خطوات بسيطة للحصول على تأمينك</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="group relative bg-white rounded-2xl p-7 text-center border border-gray-100/80 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-200/20 group-hover:scale-110 transition-transform`}>
                  {s.icon}
                </div>
                <span className="text-[11px] font-black text-gray-300 tracking-widest">{s.num}</span>
                <h3 className="text-[15px] font-bold text-[#1a2742] mt-1 mb-2">{s.title}</h3>
                <p className="text-[13px] text-gray-400 leading-relaxed">{s.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <ChevronLeft className="w-5 h-5 text-gray-200" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block text-[11px] font-bold text-[#1976d2] bg-blue-50 rounded-full px-4 py-1.5 mb-4 tracking-wide">المميزات</span>
            <h2 className="text-[24px] md:text-[32px] font-black text-[#1a2742]">لماذا تأميني؟</h2>
            <p className="text-[13px] text-gray-400 mt-2">منصة موثوقة ومعتمدة لتأمين المركبات في السعودية</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="group flex gap-4 p-5 rounded-2xl border border-gray-100 hover:border-transparent hover:bg-white hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300">
                <div className={`w-10 h-10 shrink-0 rounded-xl ${f.accent} text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#1a2742] mb-1">{f.title}</h3>
                  <p className="text-[12px] text-gray-400 leading-[1.7]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1565c0] via-[#1976d2] to-[#2196f3]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-5 py-1.5 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span className="text-yellow-200 font-bold text-[12px]">عرض محدود</span>
          </div>
          <h2 className="text-[26px] md:text-[40px] font-black text-white mb-3 leading-tight">
            خصم يصل إلى <span className="text-yellow-300">40%</span>
          </h2>
          <p className="text-blue-100/80 mb-10 text-[14px] max-w-md mx-auto">على جميع وثائق التأمين — لفترة محدودة فقط</p>
          <button
            onClick={goToForm}
            disabled={navigating}
            className="group inline-flex items-center gap-2.5 bg-white text-[#1565c0] font-black text-[15px] px-10 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-xl shadow-black/10 disabled:opacity-70 hover:-translate-y-0.5"
          >
            احصل على العرض
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          </button>
        </div>
      </section>

      <section className="py-12 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-5">
            {[
              { img: "/nafad-logo-new.png", label: "النفاذ الوطني" },
              { img: "/NIC-logo.png", label: "هيئة التأمين" },
              { img: "/vision2030-grey.svg", label: "رؤية 2030" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100/80 hover:shadow-md transition-shadow">
                <img src={b.img} alt={b.label} className="h-7 object-contain" />
                <span className="text-[12px] font-semibold text-gray-500">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-lg mx-auto px-4 text-center">
          <h2 className="text-[24px] md:text-[30px] font-black text-[#1a2742] mb-3">جاهز لتأمين مركبتك؟</h2>
          <p className="text-[13px] text-gray-400 mb-8 leading-relaxed">ابدأ الآن واحصل على أفضل سعر من أكثر من 20 شركة تأمين معتمدة</p>
          <button
            onClick={goToForm}
            disabled={navigating}
            className="group inline-flex items-center justify-center gap-2.5 w-full bg-[#1976d2] hover:bg-[#1565c0] text-white font-black text-[15px] px-8 py-4.5 rounded-xl transition-all shadow-lg shadow-blue-200/40 hover:shadow-blue-300/50 hover:-translate-y-0.5 disabled:opacity-70"
          >
            ابدأ المقارنة مجانًا
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          </button>
          <div className="flex items-center justify-center gap-5 mt-5 text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> مجاني</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> بدون التزام</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> نتائج فورية</span>
          </div>
        </div>
      </section>
    </div>
  );
}
