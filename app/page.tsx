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
  BadgeCheck,
  TrendingUp,
  Users,
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
    gradient: "from-[#1976d2] to-[#42a5f5]",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    num: "02",
    icon: <FileSearch className="w-6 h-6" />,
    title: "قارن العروض",
    desc: "عروض فورية من أكثر من 20 شركة",
    gradient: "from-emerald-500 to-emerald-400",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    num: "03",
    icon: <CreditCard className="w-6 h-6" />,
    title: "اشترِ وثيقتك",
    desc: "ادفع إلكترونيًا واستلم فورًا",
    gradient: "from-violet-500 to-violet-400",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
];

const features = [
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "شركات تأمين معتمدة",
    desc: "جميع الشركات مرخصة من البنك المركزي السعودي",
    gradient: "from-blue-500 to-blue-600",
    light: "bg-blue-50",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "إصدار فوري",
    desc: "وثيقتك جاهزة خلال دقائق بعد الدفع",
    gradient: "from-emerald-500 to-emerald-600",
    light: "bg-emerald-50",
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: "دفع آمن 100%",
    desc: "بوابة دفع مشفرة بأعلى معايير الأمان",
    gradient: "from-amber-500 to-orange-500",
    light: "bg-amber-50",
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: "أفضل الأسعار",
    desc: "خصومات حصرية تصل إلى 40%",
    gradient: "from-rose-500 to-pink-500",
    light: "bg-rose-50",
  },
  {
    icon: <Headphones className="w-5 h-5" />,
    title: "دعم فني متواصل",
    desc: "فريق دعم متخصص على مدار الساعة",
    gradient: "from-cyan-500 to-teal-500",
    light: "bg-cyan-50",
  },
];

const stats = [
  { icon: <Users className="w-5 h-5" />, val: "+20", label: "شركة تأمين معتمدة", suffix: "" },
  { icon: <BadgeCheck className="w-5 h-5" />, val: "100", label: "وثيقة تم إصدارها", suffix: "K+" },
  { icon: <TrendingUp className="w-5 h-5" />, val: "40", label: "كاش باك يصل إلى", suffix: "%" },
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

      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-2xl border-b border-gray-100/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/tameeni-logo.webp" alt="تأميني" className="w-9 h-9 rounded-xl shadow-sm" />
            <span className="text-base font-black text-[#1a2742]">تأميني</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-gray-400">
            <span className="cursor-pointer hover:text-[#1976d2] transition-colors duration-200">تأمين السيارات</span>
            <span className="cursor-pointer hover:text-[#1976d2] transition-colors duration-200">تأمين المركبات</span>
            <span className="cursor-pointer hover:text-[#1976d2] transition-colors duration-200">غير ملزم بالشراء</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">EN</span>
            <button
              onClick={goToForm}
              disabled={navigating}
              className="bg-gradient-to-l from-[#1976d2] to-[#1565c0] hover:from-[#1565c0] hover:to-[#0d47a1] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-70 shadow-md shadow-blue-200/40"
            >
              {navigating ? <Loader2 className="w-4 h-4 animate-spin" /> : "ابدأ الآن"}
            </button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-bl from-[#eef5ff] via-[#f5f9ff] to-white" />
        <div className="absolute top-10 left-[10%] w-[500px] h-[500px] bg-blue-200/15 rounded-full blur-[100px] animate-glow-pulse" />
        <div className="absolute bottom-0 right-[5%] w-[400px] h-[400px] bg-indigo-200/10 rounded-full blur-[80px] animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-[40%] left-[50%] w-[200px] h-[200px] bg-cyan-200/10 rounded-full blur-[60px] animate-glow-pulse" style={{ animationDelay: "3s" }} />

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-8 w-full">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-8">
            <div className="flex-1 flex justify-center relative order-1 md:order-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[240px] h-[240px] md:w-[340px] md:h-[340px] rounded-[2.5rem] bg-gradient-to-br from-[#c5dcf7] to-[#dfeeff] rotate-6 shadow-2xl shadow-blue-200/30 animate-float-slow" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[210px] h-[210px] md:w-[300px] md:h-[300px] rounded-[2.5rem] bg-gradient-to-br from-[#dceeff]/80 to-[#edf5ff]/80 -rotate-3 backdrop-blur-sm" />
              </div>
              <img
                src="/motor-hero.webp"
                alt="تأمين المركبات"
                className="relative z-10 w-[260px] md:w-[400px] drop-shadow-2xl"
              />

              <div className="absolute z-20 -bottom-2 -right-2 md:bottom-4 md:right-0 bg-white rounded-2xl px-4 py-3 shadow-xl shadow-gray-200/50 border border-gray-100/50 animate-float" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">تم إصدار وثيقة</p>
                    <p className="text-[11px] font-black text-[#1a2742]">الآن</p>
                  </div>
                </div>
              </div>

              <div className="absolute z-20 top-4 -left-2 md:top-8 md:left-0 bg-white rounded-2xl px-4 py-3 shadow-xl shadow-gray-200/50 border border-gray-100/50 animate-float" style={{ animationDelay: "1.5s" }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">كاش باك</p>
                    <p className="text-[11px] font-black text-[#1976d2]">40% استرجاع</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 text-center md:text-right space-y-7">
              <div className="inline-flex items-center gap-2 bg-gradient-to-l from-blue-50 to-indigo-50 border border-blue-100/80 rounded-full px-5 py-2 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#1976d2]" />
                <span className="text-[12px] font-bold text-[#1976d2]">أسرع منصة تأمين في السعودية</span>
              </div>

              <h1 className="text-[30px] md:text-[46px] font-black text-[#1a2742] leading-[1.2] tracking-tight">
                أول منصة لتأمين
                <br />
                السيارات في{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-l from-[#1976d2] to-[#1565c0] bg-clip-text text-transparent">السعودية</span>
                  <span className="absolute bottom-0 right-0 left-0 h-3 md:h-4 bg-blue-100/60 rounded-sm" />
                </span>
              </h1>

              <p className="text-[14px] md:text-[16px] text-[#7b8fa1] leading-[1.9] max-w-[440px] md:mr-0 mx-auto">
                نوفر لك مقارنة شاملة لبطاقات التأمين من أفضل الشركات المعتمدة — غير ملزم بالشراء، المقارنة والشراء من الجوال بكل سهولة
              </p>

              <div className="flex flex-col sm:flex-row items-center md:items-start gap-4">
                <button
                  onClick={goToForm}
                  disabled={navigating}
                  className="group relative inline-flex items-center justify-center gap-2.5 bg-gradient-to-l from-[#1976d2] to-[#1565c0] hover:from-[#1565c0] hover:to-[#0d47a1] text-white font-bold text-[15px] px-12 py-4 rounded-2xl transition-all shadow-xl shadow-blue-300/30 hover:shadow-blue-400/40 hover:-translate-y-0.5 disabled:opacity-70 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-l from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative">ابدأ الآن</span>
                  <ChevronLeft className="w-4 h-4 relative transition-transform group-hover:-translate-x-1" />
                </button>
                <div className="flex items-center gap-1.5 text-[12px] text-[#94a8b8] py-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>مجاني بالكامل — بدون أي التزام</span>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-5 pt-1">
                {["غير ملزم بالشراء", "المقارنة من الجوال", "إصدار فوري"].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 text-[11px] text-[#8fa3b5] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-[11px] font-bold text-gray-300 uppercase tracking-[0.25em] mb-8">شركاؤنا في التأمين</p>
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-l from-transparent to-white z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-r from-transparent to-white z-10" />
            <div className="flex items-center gap-10 md:gap-14 animate-marquee whitespace-nowrap">
              {[...companies, ...companies].map((c, i) => (
                <img key={`${c.name}-${i}`} src={c.img} alt={c.name} className="h-8 md:h-11 object-contain opacity-60 hover:opacity-100 transition-all duration-300 shrink-0" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            {stats.map((s) => (
              <div key={s.label} className="relative text-center py-7 px-4 rounded-2xl bg-gradient-to-b from-[#f8faff] to-white border border-gray-100/60 hover:shadow-lg hover:shadow-blue-50/50 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3 text-[#1976d2] group-hover:scale-110 transition-transform">
                  {s.icon}
                </div>
                <p className="text-2xl md:text-3xl font-black bg-gradient-to-l from-[#1976d2] to-[#1565c0] bg-clip-text text-transparent">{s.val}<span className="text-lg">{s.suffix}</span></p>
                <p className="text-[11px] text-gray-400 mt-1 font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white via-[#f8fafc] to-[#f1f5f9]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#1976d2] bg-blue-50 rounded-full px-5 py-2 mb-5 tracking-wide border border-blue-100/50">
              <Sparkles className="w-3 h-3" />
              خطوات بسيطة
            </span>
            <h2 className="text-[26px] md:text-[34px] font-black text-[#1a2742]">كيف تعمل الخدمة؟</h2>
            <p className="text-[13px] text-gray-400 mt-3 max-w-sm mx-auto leading-relaxed">ثلاث خطوات بسيطة للحصول على تأمينك في أقل من 3 دقائق</p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-[60px] right-[16.5%] left-[16.5%] h-[2px] bg-gradient-to-l from-blue-200 via-emerald-200 to-violet-200 rounded-full" />

            <div className="grid md:grid-cols-3 gap-6">
              {steps.map((s, i) => (
                <div key={i} className="group relative">
                  <div className={`bg-white rounded-3xl p-8 text-center border ${s.border} hover:border-transparent hover:shadow-2xl hover:shadow-blue-100/40 transition-all duration-500 hover:-translate-y-2`}>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${s.gradient} text-white flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      {s.icon}
                    </div>
                    <span className="text-[10px] font-black text-gray-200 tracking-[0.3em] uppercase">الخطوة {s.num}</span>
                    <h3 className="text-[16px] font-bold text-[#1a2742] mt-2 mb-2">{s.title}</h3>
                    <p className="text-[13px] text-gray-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#1976d2] bg-blue-50 rounded-full px-5 py-2 mb-5 tracking-wide border border-blue-100/50">
              <BadgeCheck className="w-3 h-3" />
              المميزات
            </span>
            <h2 className="text-[26px] md:text-[34px] font-black text-[#1a2742]">لماذا تأميني؟</h2>
            <p className="text-[13px] text-gray-400 mt-3">منصة موثوقة ومعتمدة لتأمين المركبات في السعودية</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="group relative p-6 rounded-2xl bg-white border border-gray-100 hover:border-transparent hover:shadow-2xl hover:shadow-gray-100/60 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 ${f.light} rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 -translate-y-1/2 translate-x-1/3`} />
                <div className="relative flex gap-4">
                  <div className={`w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br ${f.gradient} text-white flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#1a2742] mb-1.5">{f.title}</h3>
                    <p className="text-[12px] text-gray-400 leading-[1.8]">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d47a1] via-[#1565c0] to-[#1976d2] animate-gradient" />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-300/5 rounded-full blur-[80px] translate-x-1/4 translate-y-1/4" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-2 mb-8 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span className="text-yellow-200/90 font-bold text-[12px] tracking-wide">كاش باك</span>
          </div>
          <h2 className="text-[28px] md:text-[44px] font-black text-white mb-4 leading-tight">
            كاش باك يصل إلى <span className="text-yellow-300">40%</span>
          </h2>
          <p className="text-blue-100/70 mb-12 text-[15px] max-w-md mx-auto leading-relaxed">على جميع وثائق تأمين المركبات — استرجع جزء من مبلغ التأمين فورًا</p>
          <button
            onClick={goToForm}
            disabled={navigating}
            className="group relative inline-flex items-center gap-2.5 bg-white text-[#1565c0] font-black text-[15px] px-12 py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-2xl shadow-black/15 disabled:opacity-70 hover:-translate-y-1 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-l from-white/0 via-blue-100/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <span className="relative">احصل على العرض</span>
            <ArrowLeft className="w-5 h-5 relative transition-transform group-hover:-translate-x-1" />
          </button>
        </div>
      </section>

      <section className="py-14 bg-gradient-to-b from-[#f8fafc] to-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { img: "/nafad-logo-new.png", label: "النفاذ الوطني" },
              { img: "/NIC-logo.png", label: "هيئة التأمين" },
              { img: "/vision2030-grey.svg", label: "رؤية 2030" },
            ].map((b) => (
              <div key={b.label} className="group flex items-center gap-3 bg-white rounded-2xl px-6 py-3.5 shadow-sm border border-gray-100/80 hover:shadow-lg hover:shadow-gray-100/40 hover:-translate-y-0.5 transition-all duration-300">
                <img src={b.img} alt={b.label} className="h-7 object-contain group-hover:scale-105 transition-transform" />
                <span className="text-[12px] font-semibold text-gray-500">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-50/40 rounded-full blur-[120px]" />
        <div className="relative max-w-lg mx-auto px-4 text-center">
          <div className="bg-gradient-to-b from-[#f8faff] to-white rounded-3xl p-10 border border-gray-100/60 shadow-xl shadow-gray-100/30">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1976d2] to-[#42a5f5] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200/30">
              <Car className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-[24px] md:text-[30px] font-black text-[#1a2742] mb-3">جاهز لتأمين مركبتك؟</h2>
            <p className="text-[13px] text-gray-400 mb-8 leading-relaxed">ابدأ الآن واحصل على أفضل سعر من أكثر من 20 شركة تأمين معتمدة</p>
            <button
              onClick={goToForm}
              disabled={navigating}
              className="group relative inline-flex items-center justify-center gap-2.5 w-full bg-gradient-to-l from-[#1976d2] to-[#1565c0] hover:from-[#1565c0] hover:to-[#0d47a1] text-white font-black text-[15px] px-8 py-4 rounded-2xl transition-all shadow-xl shadow-blue-200/40 hover:shadow-blue-300/50 hover:-translate-y-0.5 disabled:opacity-70 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-l from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative">ابدأ المقارنة مجانًا</span>
              <ArrowLeft className="w-5 h-5 relative transition-transform group-hover:-translate-x-1" />
            </button>
            <div className="flex items-center justify-center gap-5 mt-6 text-[11px] text-gray-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> مجاني</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> بدون التزام</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> نتائج فورية</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
