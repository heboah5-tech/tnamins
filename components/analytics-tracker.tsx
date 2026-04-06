"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { logAnalyticsEvent } from "@/lib/firebase";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    logAnalyticsEvent("page_view", {
      page_path: pathname,
      page_location: typeof window !== "undefined" ? window.location.href : url,
      page_title: typeof document !== "undefined" ? document.title : pathname,
    });
  }, [pathname, searchParams]);

  return null;
}
