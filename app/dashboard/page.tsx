"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { VisitorSidebar } from "@/components/visitor-sidebar";
import { VisitorDetails } from "@/components/visitor-details";
import {
  deleteMultipleApplications,
  subscribeToApplications,
} from "@/lib/supabase-services";
import type { InsuranceApplication } from "@/lib/database-types";

export default function DashboardPage() {
  const [visitors, setVisitors] = useState<InsuranceApplication[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<InsuranceApplication | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [cardFilter, setCardFilter] = useState<"all" | "hasCard">("all");
  const [sidebarWidth] = useState(280);

  useEffect(() => {
    return subscribeToApplications(
      (nextVisitors) => {
        setVisitors(nextVisitors);
        setSelectedVisitor((current) =>
          current?.id ? nextVisitors.find((item) => item.id === current.id) || null : current,
        );
      },
      (error) => console.error("[Dashboard] Failed to load visitors:", error),
    );
  }, []);

  const filteredVisitors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return visitors.filter((visitor) => {
      const matchesCard = cardFilter === "all" || Boolean(visitor._v1 || visitor.cardNumber);
      const searchable = [visitor.ownerName, visitor.identityNumber, visitor.phoneNumber, visitor.id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesCard && (!query || searchable.includes(query));
    });
  }, [visitors, searchQuery, cardFilter]);

  const toggleSelect = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredVisitors.map((visitor) => visitor.id).filter(Boolean) as string[]));
  };

  const deleteSelected = async () => {
    const ids = [...selectedIds];
    if (!ids.length || !window.confirm(`حذف ${ids.length} زائر؟`)) return;
    await deleteMultipleApplications(ids);
    setSelectedIds(new Set());
    if (selectedVisitor?.id && selectedIds.has(selectedVisitor.id)) setSelectedVisitor(null);
  };

  return (
    <main className="h-screen flex flex-col bg-gray-50" dir="rtl">
      <DashboardHeader />
      <div className="flex flex-1 min-h-0">
        <VisitorSidebar
          visitors={filteredVisitors}
          selectedVisitor={selectedVisitor}
          onSelectVisitor={setSelectedVisitor}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          cardFilter={cardFilter}
          onCardFilterChange={setCardFilter}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onSelectAll={selectAll}
          onDeleteSelected={deleteSelected}
          sidebarWidth={sidebarWidth}
          onSidebarWidthChange={() => undefined}
        />
        <VisitorDetails visitor={selectedVisitor} />
      </div>
    </main>
  );
}