"use client";

import { useEffect } from "react";
import { recordView } from "@/lib/actions";

/** Counts one view per browser session. */
export function ViewTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("cv_viewed")) return;
      sessionStorage.setItem("cv_viewed", "1");
    } catch {}
    recordView().catch(() => {});
  }, []);
  return null;
}
