"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export function RouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent({ name: "page_view", properties: { path: pathname } });
  }, [pathname]);

  return null;
}
