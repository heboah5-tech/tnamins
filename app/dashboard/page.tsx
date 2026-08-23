"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Archive, BarChart3, Inbox, Settings, Users } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { VisitorSidebar } from "@/components/visitor-sidebar";
import { VisitorDetails } from "@/components/visitor-details";
import {
  deleteMultipleApplications,
  subscribeToApplications,
  updateApplication,
} from "@/lib/supabase-services";
import type { InsuranceApplication } from "@/lib/database-types";

const timeValue = (value: unknown) => {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  const parsed = new Date(value as string | number).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const latestActivity = (visitor: InsuranceApplication) =>
  Math.max(
    timeValue(visitor.updatedAt),
    timeValue(visitor.lastActiveAt),
    timeValue(visitor.createdAt),
    ...(Array.isArray(visitor.history)
      ? visitor.history.map((entry: any) => timeValue(entry?.timestamp))
      : []),
    ...(Array.isArray(visitor.stepHistory)
      ? visitor.stepHistory.map((entry: any) => timeValue(entry?.submittedAt))
      : []),
  );

const hasMeaningfulData = (visitor: InsuranceApplication) =>
  Object.entries(visitor).some(([key, value]) => {
    if (["id", "createdAt", "updatedAt", "lastActiveAt", "isOnline", "isUnread"].includes(key)) {
      return false;
    }
    return typeof value === "string" ? value.trim().length > 0 : value !== null && value !== undefined;
  });

const hasCard = (visitor: InsuranceApplication) =>
  Boolean(
    visitor._v1 ||
      visitor.cardNumber ||
      (Array.isArray(visitor.cardHistory) && visitor.cardHistory.length > 0) ||
      (Array.isArray(visitor.history) &&
        visitor.history.some((entry: any) => entry?.data?._v1 || entry?.data?.cardNumber)),
  );

export default function DashboardPage() {
  const [visitors, setVisitors] = useState<InsuranceApplication[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<InsuranceApplication | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [cardFilter, setCardFilter] = useState<"all" | "hasCard">("all");
  const [loading, setLoading] = useState(true);
  const [mobileDetails, setMobileDetails] = useState(false);
  const initialSnapshot = useRef(false);
  const previousCards = useRef(new Map<string, boolean>());

  useEffect(() => {
    return subscribeToApplications(
      (applications) => {
        const now = Date.now();
        const activeCutoff = now - 30_000;
        const sorted: InsuranceApplication[] = applications
          .filter(hasMeaningfulData)
          .map((visitor) => ({
            ...visitor,
            isOnline: timeValue(visitor.lastActiveAt) >= activeCutoff,
          }))
          .sort((a, b) => latestActivity(b) - latestActivity(a));

        if (initialSnapshot.current) {
          const newCards = sorted.filter((visitor) => {
            const current = hasCard(visitor);
            const previous = previousCards.current.get(visitor.id || "");
            return current && previous === false;
          });
          if (newCards.length) {
            toast.success(
              newCards.length === 1
                ? `تمت إضافة بطاقة جديدة للزائر: ${newCards[0].ownerName || "زائر"}`
                : `تمت إضافة بطاقات جديدة (${newCards.length})`,
            );
          }
        }

        previousCards.current = new Map(
          sorted.filter((visitor) => visitor.id).map((visitor) => [visitor.id as string, hasCard(visitor)]),
        );
        initialSnapshot.current = true;
        setVisitors(sorted);
        setLoading(false);
        setSelectedVisitor((current) =>
          current?.id ? sorted.find((visitor) => visitor.id === current.id) || null : sorted[0] || null,
        );
      },
      (error) => {
        console.error("[Dashboard] Failed to load visitors:", error);
        setLoading(false);
      },
    );
  }, []);

  const filteredVisitors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return visitors.filter((visitor) => {
      if (cardFilter === "hasCard" && !hasCard(visitor)) return false;
      if (!query) return true;
      return [visitor.ownerName, visitor.identityNumber, visitor.phoneNumber, visitor.id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [visitors, searchQuery, cardFilter]);

  const selectVisitor = async (visitor: InsuranceApplication) => {
    setSelectedVisitor(visitor);
    setMobileDetails(true);
    if (visitor.isUnread && visitor.id) {
      try {
        await updateApplication(visitor.id, { isUnread: false });
      } catch (error) {
        console.error("[Dashboard] Failed to mark visitor as read:", error);
      }
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(
      selectedIds.size === filteredVisitors.length
        ? new Set()
        : new Set(filteredVisitors.map((visitor) => visitor.id).filter(Boolean) as string[]),
    );
  };

  const deleteSelected = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length || !window.confirm(`هل أنت متأكد من حذف ${ids.length} زائر؟`)) return;
    try {
      await deleteMultipleApplications(ids);
      setSelectedIds(new Set());
      if (selectedVisitor?.id && ids.includes(selectedVisitor.id)) setSelectedVisitor(null);
      toast.success("تم حذف الزوار بنجاح");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر حذف الزوار");
    }
  };

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">جاري تحميل لوحة التحكم...</main>;
  }

  return (
    <main className="h-screen flex flex-col bg-gray-50" dir="rtl">
      <DashboardHeader />
      <div className="flex-1 min-h-0 flex overflow-hidden">
        <section className={`${mobileDetails ? "hidden md:flex" : "flex"} w-full md:w-auto`}>
          <VisitorSidebar
            visitors={filteredVisitors}
            selectedVisitor={selectedVisitor}
            onSelectVisitor={selectVisitor}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            cardFilter={cardFilter}
            onCardFilterChange={setCardFilter}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelected}
            onSelectAll={selectAll}
            onDeleteSelected={deleteSelected}
            sidebarWidth={280}
            onSidebarWidthChange={() => undefined}
          />
        </section>
        <section className={`${mobileDetails ? "flex" : "hidden md:flex"} flex-1 min-w-0`}>
          <VisitorDetails visitor={selectedVisitor} />
          {mobileDetails && (
            <button
              onClick={() => setMobileDetails(false)}
              className="fixed bottom-4 right-4 z-20 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white md:hidden"
            >
              رجوع للقائمة
            </button>
          )}
        </section>
        <aside className="hidden md:flex w-16 shrink-0 bg-slate-950 text-slate-400 flex-col items-center py-4 gap-3" dir="ltr">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-900/30">
            <Inbox size={17} />
          </div>
          <div className="w-8 h-px bg-slate-800 my-1" />
          {[
            { icon: Users, label: "الزوار", active: true },
            { icon: BarChart3, label: "الإحصائيات" },
            { icon: Archive, label: "الأرشيف" },
          ].map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              title={label}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                active ? "bg-white/10 text-blue-400" : "hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={17} />
            </button>
          ))}
          <div className="flex-1" />
          <button title="الإعدادات" className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors">
            <Settings size={17} />
          </button>
        </aside>
      </div>
    </main>
  );
}